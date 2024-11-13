import { useState } from "react";
import { Select, SelectItem, SelectedItems } from "@nextui-org/select";
import { Selection } from "@nextui-org/table";

import {
  getCategoriesWithColors,
  getAllQuestionCategories,
} from "@/utils/questions";

interface Category {
  key: string | number;
  label: string;
}
interface TopicSelectionProps {
  onSelect: (selectedItems: string[]) => void;
  isInvalid: boolean;
  errorMessage: string;
}

const CATEGORIES: Category[] = getAllQuestionCategories().map((category) => ({
  key: category,
  label: category,
}));
const CATEGORY_COLORS: { [key: string]: string } = getCategoriesWithColors();

export default function TopicSelection({
  onSelect,
  isInvalid,
  errorMessage,
}: TopicSelectionProps) {
  const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
  const onSelectionChange = (selectedItems: Selection) => {
    onSelect(Array.from(selectedItems).map((value) => value as string));
    setSelectedKeys(selectedItems);
  };

  return (
    <Select
      classNames={{
        base: "w-9/12",
        label: "w-1/3 pl-2",
        mainWrapper: "w-2/3",
        trigger: "flex h-30 p-2 items-center",
        value:
          "flex-wrap flex gap-y-2 gap-x-2 text-center items-center justify-stretch",
      }}
      errorMessage={errorMessage}
      isInvalid={isInvalid && Array.from(selectedKeys).length < 1}
      items={CATEGORIES}
      label="Topics"
      labelPlacement="outside-left"
      placeholder="Select Topics"
      renderValue={(items: SelectedItems<Category>) => {
        return (
          <>
            {items.map((item) => {
              const category: Category | undefined = CATEGORIES.find(
                (category) => category.key === item.textValue,
              );

              return (
                <div
                  key={item.key}
                  className="p-1 rounded-md text-black"
                  style={{ backgroundColor: CATEGORY_COLORS[category!.key] }}
                >
                  <p>{item.textValue}</p>
                </div>
              );
            })}
          </>
        );
      }}
      selectedKeys={selectedKeys}
      selectionMode="multiple"
      onSelectionChange={onSelectionChange}
    >
      {(item) => <SelectItem key={item.key} title={item.label} />}
    </Select>
  );
}
