import { useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { type editor } from "monaco-editor";
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import { WebsocketProvider } from "y-websocket";
import { useTheme } from "next-themes";

import axios from "@/utils/axios";

var randomColor = require("randomcolor"); // import the script

interface CodeEditorProps {
  setOutput: React.Dispatch<React.SetStateAction<string>>;
  roomId: string;
  language: string;
  onCodeChange: (code: string) => void;
  userName: string;
  userId: string;
  userEmail: string;
}

const LANGUAGE_MAP: Record<string, number> = {
  javascript: 63,
  python: 71,
  java: 62,
  cpp: 54,
  csharp: 51,
  // Add more mappings as needed
};

const CODE_EDITOR_LANGUAGE_MAP: { [language: string]: string } = {
  "c++": "cpp",
  "c#": "csharp",
  python: "python",
  js: "javascript",
  java: "java",
  ruby: "ruby",
  go: "go",
  php: "php",
  typescript: "typescript",
};

export default function CodeEditor({
  setOutput,
  roomId,
  language,
  userName,
  userEmail,
  userId,
  onCodeChange,
}: CodeEditorProps) {
  const codeEditorRef = useRef<editor.IStandaloneCodeEditor>();
  const { theme } = useTheme();
  const [userInput, setUserInput] = useState("");
  const executeCode = async () => {
    if (!codeEditorRef.current) return;
    const code = codeEditorRef.current.getValue();

    // Get the language from the Monaco editor
    const currentLanguage = codeEditorRef.current.getModel()?.getLanguageId();
    const languageId =
      currentLanguage && LANGUAGE_MAP[currentLanguage]
        ? LANGUAGE_MAP[currentLanguage]
        : 63;

    try {
      const response = await axios.post(`/collaboration-service/code-execute`, {
        source_code: code,
        language_id: languageId,
      });
      const token = response.data.token;

      const intervalId = setInterval(async () => {
        try {
          const { data } = await axios.get(
            `/collaboration-service/code-execute/${token}`,
            {
              params: { base64_encoded: "false", fields: "*" },
            },
          );

          if (data.status.id === 3) {
            clearInterval(intervalId);
            setOutput(data.stdout || data.stderr || "No output");
          } else if (data.status.id > 3) {
            clearInterval(intervalId);
            setOutput(data.stderr || "An error occurred");
          }
        } catch (error) {
          clearInterval(intervalId);
          console.error("Error fetching code execution result:", error);
          setOutput(
            "Something went wrong while fetching the code execution result.",
          );
        }
      }, 1000);
    } catch (error) {
      console.error("Error executing code:", error);
      setOutput("Something went wrong during code execution.");
    }
  };

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex justify-between px-[1.5] pt-1">
        <p className="bg-slate-200 text-black text-center rounded-md px-1 py-[2]">
          {language}
        </p>
        <button
          className="px-1 py-2 rounded-md"
          disabled={!userInput}
          style={{
            alignSelf: "end",
            backgroundColor: userInput ? "#007bff" : "#cccccc",
            color: "#fff",
            border: "none",
            cursor: userInput ? "pointer" : "not-allowed",
            opacity: userInput ? 1 : 0.6,
          }}
          onClick={executeCode}
        >
          Run Code
        </button>
      </div>
      <Editor
        height="80vh"
        language={CODE_EDITOR_LANGUAGE_MAP[language]}
        options={{
          scrollBeyondLastLine: false,
          fixedOverflowWidgets: true,
          fontSize: 14,
          padding: {
            top: 10,
          },
        }}
        theme={theme === "dark" ? "vs-dark" : "hc-light"}
        width="100%"
        onChange={(value) => {
          setUserInput(value || "");
          onCodeChange(value || "");
        }} // Update userInput in real-time
        onMount={(editor, monaco) => {
          codeEditorRef.current = editor;
          if (typeof window !== "undefined" && monaco) {
            const ydoc = new Y.Doc();
            const provider = new WebsocketProvider(
              process.env.NEXT_PUBLIC_COLLAB_SERVICE_Y_SERVER_PATH ||
                "ws://localhost:2501",
              roomId,
              ydoc,
            );
            const yAwareness = provider.awareness;
            const yDocTextMonaco = ydoc.getText("monaco");

            const editor = monaco.editor.getEditors()[0];
            const userColor = randomColor();

            yAwareness.setLocalStateField("user", {
              name: userName,
              userId: userId,
              email: userEmail,
              color: userColor,
            });

            yAwareness.on(
              "change",
              (changes: {
                added: number[];
                updated: number[];
                removed: number[];
              }) => {
                const awarenessStates = yAwareness.getStates();

                // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
                changes.added.forEach((clientId) => {
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                  const state = awarenessStates.get(clientId)?.user;
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
                  const color = state?.color;
                  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
                  const username = state?.name;
                  const cursorStyleElem = document.head.appendChild(
                    document.createElement("style"),
                  );

                  cursorStyleElem.innerHTML = `.yRemoteSelectionHead-${clientId} { border-left: ${color} solid 2px;}`;
                  const highlightStyleElem = document.head.appendChild(
                    document.createElement("style"),
                  );

                  highlightStyleElem.innerHTML = `.yRemoteSelection-${clientId} { background-color: ${color}9A;}`;
                  const styleElem = document.head.appendChild(
                    document.createElement("style"),
                  );

                  styleElem.innerHTML = `.yRemoteSelectionHead-${clientId}::after { transform: translateY(5); margin-left: 5px; border-radius: 5px; opacity: 80%; background-color: ${color}; color: black; content: '${username}'}`;
                });
              },
            );

            // create the monaco binding to the yjs doc
            new MonacoBinding(
              yDocTextMonaco,
              editor.getModel()!,
              // @ts-expect-error TODO: fix this
              new Set([editor]),
              yAwareness,
            );
          }
        }}
      />
    </div>
  );
}
