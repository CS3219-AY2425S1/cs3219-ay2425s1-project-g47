import { getAllQuestionCategories } from "../../utils/questions";

const COLORS = [
  "#ef9a9a",
  "#f48fb1",
  "#ce93d8",
  "#b39ddb",
  "#9fa8da",
  "#90caf9",
  "#81d4fa",
  "#80deea",
  "#80cbc4",
  "#a5d6a7",
  "#c5e1a5",
  "#e6ee9c",
  "#fff59d",
  "#ffe082",
  "#ffcc80",
  "#ffab91",
  "#bcaaa4",
  "#eeeeee",
  "#b0bec5",
];

export const assignColorsToCategories = (): { [key: string]: string } => {
  const categories = getAllQuestionCategories();
  const categoryColors: { [key: string]: string } = {};

  categories.forEach((category, index) => {
    categoryColors[category] = COLORS[index % COLORS.length];
  });

  return categoryColors;
};

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
  const categoryColors = assignColorsToCategories();

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
