import Balda from './Balda';
import { GAME_WIDTH, GAME_HEIGHT } from './gameConfig';

class Game {
  private rows: number;
  private cols: number;
  private balda: Balda;
  private letter: string = 'а';
  private hoveredCell: [number, number] | null = null;

  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
    const savedGrid = localStorage.getItem('balda-grid');
    if (savedGrid) {
      this.balda = new Balda(rows, cols, JSON.parse(savedGrid));
    } else {
      this.balda = new Balda(rows, cols);
    }
  }

  private getGridCoordinates(x: number, y: number) {
    const row = Math.floor(y/GAME_HEIGHT*this.rows);
    const col = Math.floor(x/GAME_WIDTH*this.cols);
    return [row, col];
  }

  private saveGrid() {
    localStorage.setItem('balda-grid', JSON.stringify(this.balda.grid));
  }

  reset() {
    this.balda.reset();
    this.saveGrid();
  }

  setLetter(letter: string) {
    this.letter = letter;
  }

  mouseMove(x: number, y: number) {
    const [row, col] = this.getGridCoordinates(x, y);
    this.hoveredCell = [row, col];
  }

  mouseDown(x: number, y: number) {
    const [row, col] = this.getGridCoordinates(x, y);
    if (this.balda.grid[row][col] === '') {
      this.balda.grid[row][col] = this.letter;
    } else {
      this.balda.grid[row][col] = '';
    }
    this.saveGrid();
  }

  mouseLeave() {
    this.hoveredCell = null;
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    const dw = Math.floor(GAME_WIDTH/this.cols);
    const dh = Math.floor(GAME_HEIGHT/this.rows);
    ctx.font = `${Math.floor(Math.min(dw, dh)*0.6)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = '#FFFFFF';
    if (this.hoveredCell) {
      const [row, col] = this.hoveredCell;
      ctx.fillStyle = '#323035';
      ctx.fillRect(dw*col, dh*row, dw, dh);
    }
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < this.rows+1; i++) {
      ctx.beginPath();
      ctx.moveTo(0, dh*i);
      ctx.lineTo(GAME_WIDTH, dh*i);
      ctx.stroke();
    }
    for (let i = 0; i < this.cols+1; i++) {
      ctx.beginPath();
      ctx.moveTo(dw*i, 0);
      ctx.lineTo(dw*i, GAME_HEIGHT);
      ctx.stroke();
    }
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        ctx.fillText(this.balda.grid[i][j], dw*(j+0.5), dh*(i+0.5));
      }
    }
  }
}

export default Game;
