interface WordListProps {
  label: string;
  wordPaths: [string, [number, number][]][];
  setHighlightIndex: (index?: number) => void;
  onClick?: (index: number) => void;
}

function WordList({ label, wordPaths: wordPaths, setHighlightIndex, onClick }: WordListProps) {
  const elements = [];
  for (let i = 0; i < wordPaths.length; i++) {
    elements.push(<li
      onMouseOver={() => setHighlightIndex(i)}
      onMouseLeave={() => setHighlightIndex()}
      onClick={() => onClick && onClick(i)}>
        {wordPaths[i][0]}
    </li>);
  }
  return (
    <fieldset>
      <legend>{label}</legend>
      <ol>{elements}</ol>
    </fieldset>
  );
}

export default WordList;
