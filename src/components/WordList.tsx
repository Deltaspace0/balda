interface WordListProps {
  label: string;
  wordPaths: [string, [number, number][]][];
  setHighlightIndex: (index?: number) => void;
  onClick?: (index: number) => void;
}

function WordList(props: WordListProps) {
  const elements = [];
  for (let i = 0; i < props.wordPaths.length; i++) {
    elements.push(<li
      onMouseOver={() => props.setHighlightIndex(i)}
      onMouseLeave={() => props.setHighlightIndex()}
      onClick={() => props.onClick && props.onClick(i)}
    >
      {props.wordPaths[i][0]}
    </li>);
  }
  return (<fieldset>
    <legend>{props.label}</legend>
    <ol>{elements}</ol>
  </fieldset>);
}

export default WordList;
