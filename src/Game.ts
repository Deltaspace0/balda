import Balda from './Balda';
import { GAME_WIDTH, GAME_HEIGHT } from './gameConfig';

interface GameCallbacks {
  setAddingLetter: (status: boolean) => void;
  setWordHistory: (wordHistory: [string, [number, number][]][]) => void;
  setPossibleWords: (possibleWords: [string, [number, number][]][]) => void;
}

function drawArrow(ctx: CanvasRenderingContext2D, x1: number, y1: number, x2: number, y2: number) {
  const a = Math.atan2(y2-y1, x2-x1);
  ctx.moveTo(x1, y1);
  ctx.lineTo(x2, y2);
  ctx.lineTo(x2-10*Math.cos(a-Math.PI/6), y2-10*Math.sin(a-Math.PI/6));
  ctx.moveTo(x2, y2);
  ctx.lineTo(x2-10*Math.cos(a+Math.PI/6), y2-10*Math.sin(a+Math.PI/6));
}

function drawPathArrows(ctx: CanvasRenderingContext2D, path: [number, number][], dw: number, dh: number) {
  for (let i = 0; i < path.length-1; i++) {
    const [row1, col1] = path[i];
    const [row2, col2] = path[i+1];
    let x1, y1, x2, y2;
    if (row1 === row2) {
      y1 = dh*(row1+0.5);
      y2 = dh*(row2+0.5);
      x1 = dw*(col1+(col1 > col2 ? 0.2 : 0.8));
      x2 = dw*(col2+(col1 > col2 ? 0.8 : 0.2));
    } else {
      y1 = dh*(row1+(row1 > row2 ? 0.2 : 0.8));
      y2 = dh*(row2+(row1 > row2 ? 0.8 : 0.2));
      x1 = dw*(col1+0.5);
      x2 = dw*(col2+0.5);
    }
    ctx.beginPath();
    drawArrow(ctx, x1, y1, x2, y2);
    ctx.stroke();
  }
}

class Game {
  private rows: number;
  private cols: number;
  private callbacks: GameCallbacks;
  private balda: Balda;
  private letter: string = 'а';
  private editEnabled: boolean = false;
  private selectingPath: boolean = false;
  private hoveredCell: [number, number] | null = null;
  private newCell: [number, number] | null = null;
  private wordPath: [number, number][] = [];
  private wordHistory: [string, [number, number][]][] = [];
  private highlightIndex: number | null = null;
  private possibleIndex: number | null = null;

  constructor(rows: number, cols: number, callbacks: GameCallbacks) {
    this.rows = rows;
    this.cols = cols;
    this.callbacks = callbacks;
    const savedGrid = localStorage.getItem('balda-grid');
    const wordHistory = localStorage.getItem('word-history');
    if (savedGrid) {
      this.balda = new Balda(rows, cols, JSON.parse(savedGrid));
    } else {
      this.balda = new Balda(rows, cols);
    }
    if (wordHistory) {
      this.wordHistory = JSON.parse(wordHistory);
    }
    this.callbacks.setAddingLetter(true);
    this.callbacks.setWordHistory([...this.wordHistory]);
    setTimeout(() => this.update(), 100);
  }

  private getGridCoordinates(x: number, y: number) {
    const row = Math.floor(y/GAME_HEIGHT*this.rows);
    const col = Math.floor(x/GAME_WIDTH*this.cols);
    return [row, col];
  }

  private saveState() {
    localStorage.setItem('balda-grid', JSON.stringify(this.balda.grid));
    localStorage.setItem('word-history', JSON.stringify(this.wordHistory));
  }

  private update() {
    this.saveState();
    this.balda.update();
    const possibleWords = this.balda.possibleWords
      .filter((x) => this.checkWord(x[0]))
      .sort(([word1], [word2]) => word2.length-word1.length);
    this.balda.possibleWords = possibleWords;
    this.callbacks.setPossibleWords([...possibleWords]);
  }

  private checkWord(word: string): boolean {
    if (word === this.balda.getInitWord()) {
      return false;
    }
    for (const [prevWord] of this.wordHistory) {
      if (prevWord === word) {
        return false;
      }
    }
    return this.balda.checkWord(word);
  }

  private checkPath() {
    if (!this.newCell) {
      return;
    }
    const [newRow, newCol] = this.newCell;
    let includesNewCell = false;
    for (const [row, col] of this.wordPath) {
      if (row === newRow && col === newCol) {
        includesNewCell = true;
        break;
      }
    }
    if (!includesNewCell) {
      this.wordPath = [];
      return;
    }
    const word = this.balda.getWordFromPath(this.wordPath);
    if (!this.checkWord(word)) {
      this.wordPath = [];
      return;
    }
    this.addWord(word);
    this.setNewCell();
    this.update();
  }

  private setNewCell(newCell?: [number, number]) {
    if (newCell) {
      this.newCell = newCell;
      this.callbacks.setAddingLetter(false);
      return;
    }
    this.callbacks.setAddingLetter(true);
    this.newCell = null;
    this.wordPath = [];
    this.selectingPath = false;
  }

  private addWord(word?: string) {
    if (word) {
      this.wordHistory.push([word, [...this.wordPath]]);
    } else {
      this.wordHistory = [];
    }
    this.callbacks.setWordHistory([...this.wordHistory]);
  }

  reset() {
    this.balda.reset();
    this.hoveredCell = null;
    this.setNewCell();
    this.addWord();
    this.update();
  }

  setLetter(letter: string) {
    this.letter = letter;
  }

  setEditEnabled(enabled: boolean) {
    this.editEnabled = enabled;
    this.setNewCell();
  }

  setHighlightIndex(index?: number) {
    if (index !== undefined) {
      this.highlightIndex = index;
      return;
    }
    this.highlightIndex = null;
  }

  setPossibleIndex(index?: number) {
    if (index !== undefined) {
      this.possibleIndex = index;
      return;
    }
    this.possibleIndex = null;
  }

  selectPossibleWord(index: number) {
    const [word, path] = this.balda.possibleWords[index];
    for (let i = 0; i < word.length; i++) {
      const [row, col] = path[i];
      this.balda.grid[row][col] = word[i];
    }
    this.wordHistory.push([word, path]);
    this.callbacks.setWordHistory([...this.wordHistory]);
    this.update();
  }

  cancelNewLetter() {
    if (!this.newCell) {
      return;
    }
    const [newRow, newCol] = this.newCell;
    this.balda.grid[newRow][newCol] = '';
    this.setNewCell();
  }

  mouseMove(x: number, y: number) {
    const [row, col] = this.getGridCoordinates(x, y);
    if (this.selectingPath) {
      if (this.balda.grid[row][col] === '') {
        return;
      }
      for (let i = this.wordPath.length-1; i >= 0; i--) {
        const [cellRow, cellCol] = this.wordPath[i];
        if (row === cellRow && col === cellCol) {
          if (i === this.wordPath.length-2) {
            this.wordPath.pop();
          }
          return;
        }
      }
      const [lastRow, lastCol] = this.wordPath[this.wordPath.length-1];
      const dr = Math.abs(lastRow-row);
      const dc = Math.abs(lastCol-col);
      if (dr === 1 && dc === 0 || dr === 0 && dc === 1) {
        this.wordPath.push([row, col]);
      }
      return;
    }
    this.hoveredCell = [row, col];
  }

  mouseDown(x: number, y: number) {
    const [row, col] = this.getGridCoordinates(x, y);
    const currentLetter = this.balda.grid[row][col];
    if (this.editEnabled) {
      if (currentLetter === '') {
        this.balda.grid[row][col] = this.letter;
      } else {
        this.balda.grid[row][col] = '';
      }
      this.update();
      return;
    }
    if (this.newCell) {
      if (currentLetter === '') {
        return;
      }
      this.selectingPath = true;
      this.wordPath = [[row, col]];
      return;
    }
    if (currentLetter === '') {
      this.balda.grid[row][col] = this.letter;
      this.setNewCell([row, col]);
    }
  }

  mouseUp() {
    if (!this.selectingPath) {
      return;
    }
    this.selectingPath = false;
    this.checkPath();
  }

  mouseLeave() {
    if (this.selectingPath) {
      this.selectingPath = false;
      this.checkPath();
    }
    this.hoveredCell = null;
  }

  render(ctx: CanvasRenderingContext2D) {
    ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    const dw = Math.floor(GAME_WIDTH/this.cols);
    const dh = Math.floor(GAME_HEIGHT/this.rows);
    ctx.font = `${Math.floor(Math.min(dw, dh)*0.6)}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.strokeStyle = this.editEnabled ? '#cef411' : '#ffffff';
    if (this.hoveredCell) {
      const [row, col] = this.hoveredCell;
      ctx.fillStyle = '#323035';
      ctx.fillRect(dw*col, dh*row, dw, dh);
    }
    if (this.newCell) {
      const [row, col] = this.newCell;
      ctx.fillStyle = '#36335d';
      ctx.fillRect(dw*col, dh*row, dw, dh);
    }
    for (const [row, col] of this.wordPath) {
      ctx.fillStyle = '#4d4e08';
      ctx.fillRect(dw*col, dh*row, dw, dh);
    }
    ctx.fillStyle = '#ffffff';
    drawPathArrows(ctx, this.wordPath, dw, dh);
    if (this.highlightIndex !== null) {
      drawPathArrows(ctx, this.wordHistory[this.highlightIndex][1], dw, dh);
    }
    if (this.possibleIndex !== null) {
      if (this.possibleIndex < this.balda.possibleWords.length) {
        const [word, path] = this.balda.possibleWords[this.possibleIndex];
        for (let i = 0; i < word.length; i++) {
          const [row, col] = path[i];
          if (this.balda.grid[row][col] === '') {
            ctx.fillText(word[i], dw*(col+0.5), dh*(row+0.5));
            break;
          }
        }
        drawPathArrows(ctx, path, dw, dh);
      }
    }
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
