interface LetterPanelProps {
  letter: string;
  setLetter: (letter: string) => void;
}

function LetterPanel({ letter, setLetter }: LetterPanelProps) {
  const letters = 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя';
  const letterRows = [];
  for (let i = 0; i < 3; i++) {
    const row = [];
    for (let j = 0; j < 11; j++) {
      const l = letters[i*11+j];
      const className = l === letter ? 'letter-selected' : 'letter';
      row.push(<button
        onClick={() => setLetter(l)}
        className={className}>{l}</button>);
    }
    letterRows.push(<div className='letter-row'>{row}</div>);
  }
  return (
    <div className='flex-column'>
      {letterRows}
    </div>
  );
}

export default LetterPanel;
