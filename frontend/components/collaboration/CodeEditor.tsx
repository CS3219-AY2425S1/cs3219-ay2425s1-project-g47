import { useRef, useEffect } from "react";
import Editor, { useMonaco } from "@monaco-editor/react";
import { type editor } from "monaco-editor";
// import { WebsocketProvider } from 'y-websocket';
import * as Y from "yjs";
import { MonacoBinding } from "y-monaco";
import { WebsocketProvider } from "y-websocket";

var randomColor = require("randomcolor"); // import the script
const RandomColor = randomColor(); // a hex code for an attractive color

export default function CodeEditor() {
  const codeEditorRef = useRef<editor.IStandaloneCodeEditor>();
  const monaco = useMonaco();

  // read room Id here:

  // read userContext here

  // Runs once when the component mounts to set the initial language.
  useEffect(() => {
    if (typeof window !== "undefined") {
      if (monaco) {
        // create a yew yjs doc
        const ydoc = new Y.Doc();
        // establish partykit as your websocket provider
        const provider = new WebsocketProvider(
          "ws://localhost:1234",
          "temp",
          ydoc,
        );
        // awareness for collaborative features
        const yAwareness = provider.awareness;
        // get the text from the monaco editor
        const yDocTextMonaco = ydoc.getText("monaco");
        // get the monaco editor
        const editor = monaco.editor.getEditors()[0];
        // const userColor = RandomColor();

        // awareness.setLocalStateField("user", {
        //   name: user?.username,
        //   userId: user?.id,
        //   email: user?.email,
        //   color,
        // });

        // yAwareness.on(
        //   "change",
        //   (changes: {
        //     added: number[];
        //     updated: number[];
        //     removed: number[];
        //   }) => {
        //     const awarenessStates = yAwareness.getStates();

        //     dispatch(setAwareness(awareness as AwarenessUser));
        //     // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        //     changes.added.forEach((clientId) => {
        //       // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        //       const state = awarenessStates.get(clientId)?.user;
        //       // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        //       const color = state?.color;
        //       // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        //       const username = state?.name;
        //       const cursorStyleElem = document.head.appendChild(
        //         document.createElement("style"),
        //       );

        //       cursorStyleElem.innerHTML = `.yRemoteSelectionHead-${clientId} { border-left: ${color} solid 2px;}`;
        //       const highlightStyleElem = document.head.appendChild(
        //         document.createElement("style"),
        //       );

        //       highlightStyleElem.innerHTML = `.yRemoteSelection-${clientId} { background-color: ${color}9A;}`;
        //       const styleElem = document.head.appendChild(
        //         document.createElement("style"),
        //       );

        //       styleElem.innerHTML = `.yRemoteSelectionHead-${clientId}::after { background-color: ${color}; color: black; content: '${username}'}`;
        //     });
        //   },
        // );

        // create the monaco binding to the yjs doc
        new MonacoBinding(
          yDocTextMonaco,
          editor.getModel()!,
          // @ts-expect-error TODO: fix this
          new Set([editor]),
          provider.awareness,
        );
      }
    }
  }, [monaco]);

  return (
    <Editor
      height="100vh"
      language="javascript"
      options={{
        scrollBeyondLastLine: false,
        fixedOverflowWidgets: true,
        fontSize: 14,
      }}
      theme="vs-dark"
      width="50vw"
    />
  );
}