import './App.css';
import Canvas from './components/Canvas';
import HistoryPanel from './components/HistoryPanel';
import LetterPanel from './components/LetterPanel';
import Game from './Game';
import { useCallback, useRef, useState } from 'react';

function App() {
  const [letter, setLetter] = useState('а');
  const [editEnabled, setEditEnabled] = useState(false);
  const [addingLetter, setAddingLetter] = useState(true);
  const [wordHistory, setWordHistory] = useState<[string, [number, number][]][]>([]);
  const gameRef = useRef<Game>(null);
  if (gameRef.current === null) {
    const callbacks = {
      setAddingLetter: setAddingLetter,
      setWordHistory: setWordHistory
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
        <LetterPanel letter={letter} setLetter={handleLetter}/>
      </div>
      <div className='flex-column'>
        <button onClick={() => game.reset()}>Reset game</button>
        <label>
          <button
            className='button-auto'
            disabled={addingLetter}
            onClick={() => game.cancelNewLetter()}>Cancel</button>
          <p>{addingLetter ? 'Add letter' : 'Select word path'}</p>
        </label>
        <label>
          <input type='checkbox' checked={editEnabled} onChange={handleEditEnabled}/>
          <p>Edit mode</p>
        </label>
        <HistoryPanel wordHistory={wordHistory} setHighlightIndex={(i) => game.setHighlightIndex(i)}/>
      </div>
    </div>
  );
}

export default App;
