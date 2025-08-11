import './App.css';
import Canvas from './components/Canvas';
import LetterPanel from './components/LetterPanel';
import Game from './Game';
import { useCallback, useRef, useState } from 'react';

function App() {
  const [letter, setLetter] = useState('а');
  const gameRef = useRef<Game>(null);
  if (gameRef.current === null) {
    gameRef.current = new Game(5, 5);
  }
  const game = gameRef.current;
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    game.render(ctx);
  }, [game]);
  const handleLetter = useCallback((x: string) => {
    game.setLetter(x);
    setLetter(x);
  }, [game]);
  const mouseHandlers = {
    onMouseMove: useCallback((e: MouseEvent) => {
      game.mouseMove(e.offsetX, e.offsetY);
    }, [game]),
    onMouseDown: useCallback((e: MouseEvent) => {
      game.mouseDown(e.offsetX, e.offsetY);
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
      </div>
    </div>
  );
}

export default App;
