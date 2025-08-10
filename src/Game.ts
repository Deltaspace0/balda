import { GAME_WIDTH, GAME_HEIGHT } from './gameConfig';

class Game {
  private rows: number;
  private columns: number;
  private grid: string[][];
  private words: string[] = [];
  private initWords: string[] = [];

  constructor(rows: number, columns: number) {
    this.rows = rows;
    this.columns = columns;
    this.grid = [];
    for (let i = 0; i < rows; i++) {
      this.grid.push(Array(columns).fill(''));
    }
    fetch('/nouns.txt')
      .then(response => response.text())
      .then(text => {
        this.words = text.split(/\r?\n/).map(x => x.trim().toLowerCase());
        for (const word of this.words) {
          if (word.length === this.columns) {
            this.initWords.push(word);
          }
        }
      })
      .then(() => this.reset());
  }

  reset() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        this.grid[i][j] = '';
      }
    }
    const word = this.initWords[Math.floor(Math.random()*this.initWords.length)];
    const y = Math.floor(this.rows/2);
    for (let i = 0; i < this.columns; i++) {
      this.grid[y][i] = word[i];
    }
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    const dw = Math.floor(GAME_WIDTH/this.columns);
    const dh = Math.floor(GAME_HEIGHT/this.rows);
    ctx.font = `${Math.floor(Math.min(dw, dh)*0.6)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#FFFFFF';
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
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.columns; j++) {
        ctx.fillText(this.grid[i][j], dw*(j+0.5), dh*(i+0.5));
      }
    }
  }
}

export default Game;
