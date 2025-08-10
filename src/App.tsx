import './App.css';
import Canvas from './components/Canvas';
import Game from './Game';
import { useCallback, useRef } from 'react';

function App() {
  const gameRef = useRef<Game>(null);
  if (gameRef.current === null) {
    gameRef.current = new Game(5, 5);
  }
  const game = gameRef.current;
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    game.render(ctx);
  }, [game]);
  return (
    <div className='App'>
      <Canvas draw={draw} className='game-canvas'/>
      <div className='flex-column'>
        <button onClick={() => game.reset()}>Reset game</button>
      </div>
    </div>
  );
}

export default App;
