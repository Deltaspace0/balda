import { GAME_WIDTH, GAME_HEIGHT } from './gameConfig';

class Game {
  private rows: number;
  private columns: number;
  private grid: string[][];

  constructor(rows: number, columns: number) {
    this.rows = rows;
    this.columns = columns;
    this.grid = [];
    for (let i = 0; i < rows; i++) {
      this.grid.push(Array(columns).fill(''));
    }
    this.reset();
  }

  reset() {
    
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    ctx.strokeStyle = '#FFFFFF';
    const dw = Math.floor(GAME_WIDTH/this.columns);
    const dh = Math.floor(GAME_HEIGHT/this.rows);
    for (let i = 1; i < this.rows; i++) {
      ctx.beginPath();
      ctx.moveTo(0, dh*i);
      ctx.lineTo(GAME_WIDTH, dh*i);
      ctx.stroke();
    }
    for (let i = 1; i < this.columns; i++) {
      ctx.beginPath();
      ctx.moveTo(dw*i, 0);
      ctx.lineTo(dw*i, GAME_HEIGHT);
      ctx.stroke();
    }
  }
}

export default Game;
