import { useState, useMemo, Key } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@nextui-org/dropdown";
import { Input } from "@nextui-org/input";
import { Selection } from "@nextui-org/table";

import { DownArrowIcon } from "../icons";
interface ItemProps {
  key: string | number;
  label: string;
  description?: string;
  className?: string;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
}
interface QuestionDifficultyProps {
  onSelect: (selectionItems: string[]) => void;
  isInvalid: boolean;
  errorMessage: string;
}
const QUESTION_DIFFICULTY_DROPDOWN: ItemProps[] = [
  {
    key: "easy",
    label: "easy",
    description: "For when you are taking it easy",
    className: "text-success capitalize",
    color: "success",
  },
  {
    key: "medium",
    label: "medium",
    description: "Okay, looks like you challenging yourself",
    className: "text-warning capitalize",
    color: "warning",
  },
  {
    key: "hard",
    label: "hard",
    description: "Good Luck Man! :)",
    className: "text-danger capitalize",
    color: "danger",
  },
];

export default function QuestionDifficultyDropDown({
  onSelect,
  isInvalid,
  errorMessage,
}: QuestionDifficultyProps) {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));

  const selectedValue = useMemo(() => {
    const selectedValues: Key[] = Array.from(selectedKeys);

    onSelect(selectedValues.map((value: Key) => value as string));
    const result = selectedValues.join(", ").replaceAll("_", " ");

    return result;
  }, [selectedKeys]);

  return (
    <Dropdown>
      <DropdownTrigger>
        <Input
          required
          classNames={{
            base: "w-9/12",
            label: "capitalize w-1/3",
            input: ["capitalize", "p-2", "text-left"],
            mainWrapper: "w-2/3",
          }}
          endContent={<DownArrowIcon />}
          errorMessage={errorMessage}
          isInvalid={isInvalid && selectedValue === ""}
          label={"Question Difficulty"}
          labelPlacement="outside-left"
          placeholder="Select A Difficulty"
          value={selectedValue === "" ? "Select A Difficulty" : selectedValue}
        />
      </DropdownTrigger>
      <DropdownMenu
        aria-label="Static Actions"
        closeOnSelect={false}
        items={QUESTION_DIFFICULTY_DROPDOWN}
        selectedKeys={selectedKeys}
        selectionMode="multiple"
        onSelectionChange={setSelectedKeys}
      >
        {(item) => (
          <DropdownItem
            key={item.key}
            className={item.className}
            color={item.color}
            description={item.description}
          >
            {item.label}
          </DropdownItem>
        )}
      </DropdownMenu>
    </Dropdown>
  );
}
