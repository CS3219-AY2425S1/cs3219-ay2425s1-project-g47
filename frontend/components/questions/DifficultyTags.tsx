const DIFFICULTY_COLOURS: { [key: string]: string } = {
  easy: "text-green-600",
  medium: "text-yellow-600",
  hard: "text-red-600",
};

interface DifficultyTagProps {
  difficulty: string;
}

const DifficultyTags: React.FC<DifficultyTagProps> = ({ difficulty }) => {
  return (
    <p
      className={`text-semibold ${DIFFICULTY_COLOURS[difficulty.toLocaleLowerCase()]} capitalize`}
    >
      {difficulty}
    </p>
  );
};

export default DifficultyTags;
