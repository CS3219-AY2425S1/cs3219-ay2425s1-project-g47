import { getCategoriesWithColors } from "@/utils/questions";
interface CategoryTagsProps {
  questionId: string;
  categories: string[];
}

// React component to display the colored category tags
const CategoryTags: React.FC<CategoryTagsProps> = ({
  questionId,
  categories,
}) => {
  // Assign colors to categories
  const categoryColors = getCategoriesWithColors();

  return (
    <ul className="flex gap-3 justify-left flex-wrap">
      {categories.map((category) => (
        <li
          key={questionId + category}
          className="py-1 px-2 rounded-md text-black"
          style={{ backgroundColor: categoryColors[category] }} // Dynamically set background color
        >
          <p className="capitalize">{category}</p>
        </li>
      ))}
    </ul>
  );
};

export default CategoryTags;
