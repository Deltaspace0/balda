interface LetterPanelProps {
  letters: string;
  letter: string;
  setLetter: (letter: string) => void;
}

function LetterPanel({ letters, letter, setLetter }: LetterPanelProps) {
  const letterRows = [];
  let counter = 0;
  for (let i = 0; i < 3; i++) {
    const row = [];
    const rowSize = Math.floor((letters.length-counter)/(3-i));
    for (let j = 0; j < rowSize; j++) {
      const l = letters[counter+j];
      const className = l === letter ? 'letter-selected' : 'letter';
      row.push(<button
        onClick={() => setLetter(l)}
        className={className}
        style={{fontSize: '24px'}}
      >
        {l}
      </button>);
    }
    letterRows.push(<div className='letter-row'>{row}</div>);
    counter += rowSize;
  }
  return (<div className='flex-column' style={{alignItems: 'center'}}>
    {letterRows}
  </div>);
}

export default LetterPanel;
