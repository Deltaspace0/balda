interface HistoryPanelProps {
  wordHistory: [string, [number, number][]][];
  setHighlightIndex: (index?: number) => void;
}

function HistoryPanel({ wordHistory, setHighlightIndex }: HistoryPanelProps) {
  const elements = [];
  for (let i = 0; i < wordHistory.length; i++) {
    elements.push(<li
      onMouseOver={() => setHighlightIndex(i)}
      onMouseLeave={() => setHighlightIndex()}>
        {wordHistory[i][0]}
    </li>);
  }
  return (
    <fieldset>
      <legend>Word history</legend>
      <ol>{elements}</ol>
    </fieldset>
  );
}

export default HistoryPanel;
