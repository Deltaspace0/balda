import './App.css';
import Canvas from './components/Canvas';
import LetterPanel from './components/LetterPanel';
import { useListSlider, Slider } from './components/Slider';
import WordList from './components/WordList';
import Game from './Game';
import { useCallback, useRef, useState } from 'react';

type WordPaths = [string, [number, number][]][];

function App() {
  const [letter, setLetter] = useState('а');
  const [editEnabled, setEditEnabled] = useState(false);
  const [twoPlayersMode, setTwoPlayersMode] = useState(false);
  const [showPossible, setShowPossible] = useState(true);
  const [addingLetter, setAddingLetter] = useState(true);
  const [wordHistory, setWordHistory] = useState<WordPaths>([]);
  const [wordHistory1, setWordHistory1] = useState<WordPaths>([]);
  const [wordHistory2, setWordHistory2] = useState<WordPaths>([]);
  const [score1, setScore1] = useState(0);
  const [score2, setScore2] = useState(0);
  const [possibleWords, setPossibleWords] = useState<WordPaths>([]);
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);
  const rowProps = useListSlider({
    label: 'Rows',
    initialValue: 5,
    list: [3, 4, 5, 6, 7, 8, 9],
    callback: setRows
  });
  const colProps = useListSlider({
    label: 'Columns',
    initialValue: 5,
    list: [3, 4, 5, 6, 7, 8, 9],
    callback: setCols
  });
  const handleWordHistory = (newWordHistory: WordPaths) => {
    setWordHistory(newWordHistory);
    const newWordHistory1: WordPaths = [];
    const newWordHistory2: WordPaths = [];
    let newScore1 = 0;
    let newScore2 = 0;
    for (let i = 0; i < newWordHistory.length; i++) {
      const [word, path] = newWordHistory[i];
      if (i%2 === 0) {
        newWordHistory1.push([word, path]);
        newScore1 += word.length;
      } else {
        newWordHistory2.push([word, path]);
        newScore2 += word.length;
      }
    }
    setWordHistory1(newWordHistory1);
    setWordHistory2(newWordHistory2);
    setScore1(newScore1);
    setScore2(newScore2);
  };
  const gameRef = useRef<Game>(null);
  if (gameRef.current === null) {
    const callbacks = {
      setAddingLetter: setAddingLetter,
      setWordHistory: handleWordHistory,
      setPossibleWords: setPossibleWords
    };
    gameRef.current = new Game(5, 5, callbacks);
  }
  const game = gameRef.current;
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    game.render(ctx);
  }, [game]);
  const handleLetter = useCallback((x: string) => {
    game.setLetter(x);
    setLetter(x);
  }, [game]);
  const handleEditEnabled = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    game.setEditEnabled(e.target.checked);
    setEditEnabled(e.target.checked);
  }, [game]);
  const mouseHandlers = {
    onMouseMove: useCallback((e: MouseEvent) => {
      game.mouseMove(e.offsetX, e.offsetY);
    }, [game]),
    onMouseDown: useCallback((e: MouseEvent) => {
      game.mouseDown(e.offsetX, e.offsetY);
    }, [game]),
    onMouseUp: useCallback(() => {
      game.mouseUp();
    }, [game]),
    onMouseLeave: useCallback(() => {
      game.mouseLeave();
    }, [game])
  };
  return (
    <div className='App'>
      <div className='flex-column'>
        <Canvas draw={draw} className='game-canvas' mouseHandlers={mouseHandlers}/>
        <label>
          <button
            className='button-auto'
            disabled={addingLetter}
            onClick={() => game.cancelNewLetter()}>Cancel</button>
          <p>{addingLetter ? 'Add letter' : 'Select word path'}</p>
        </label>
        <LetterPanel letter={letter} setLetter={handleLetter}/>
      </div>
      <div className='flex-column'>
        <button onClick={() => game.reset(rows, cols)}>Reset game</button>
        <Slider {...rowProps}/>
        <Slider {...colProps}/>
        <label>
          <input type='checkbox' checked={editEnabled} onChange={handleEditEnabled}/>
          <p>Edit mode</p>
        </label>
        <label>
          <input type='checkbox' checked={twoPlayersMode} onChange={(e) => setTwoPlayersMode(e.target.checked)}/>
          <p>Two players</p>
        </label>
        <label>
          <input type='checkbox' checked={showPossible} onChange={(e) => setShowPossible(e.target.checked)}/>
          <p>Show possible words</p>
        </label>
        {showPossible && <WordList
          label='Possible words'
          wordPaths={possibleWords}
          setHighlightIndex={(i) => game.setPossibleIndex(i)}
          onClick={(i) => {
            game.selectPossibleWord(i);
            game.setPossibleIndex();
          }}
        />}
      </div>
      {twoPlayersMode ? (
        <>
          <WordList
            label={`Player 1: ${score1}`}
            wordPaths={wordHistory1}
            setHighlightIndex={(i) => {
              game.setHighlightIndex(i !== undefined ? i*2 : i);
            }}
          />
          <WordList
            label={`Player 2: ${score2}`}
            wordPaths={wordHistory2}
            setHighlightIndex={(i) => {
              game.setHighlightIndex(i !== undefined ? i*2+1 : i);
            }}
          />
        </>
      ) : (
        <WordList
          label='Word history'
          wordPaths={wordHistory}
          setHighlightIndex={(i) => game.setHighlightIndex(i)}
        />
      )}
    </div>
  );
}

export default App;
