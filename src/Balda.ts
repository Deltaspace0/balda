class Balda {
  grid: string[][];
  private rows: number;
  private cols: number;
  private words: string[] = [];
  private initWords: string[] = [];
  private initWord: string = '';

  constructor(rows: number, cols: number, grid?: string[][]) {
    this.rows = rows;
    this.cols = cols;
    if (grid) {
      this.grid = grid;
    } else {
      this.grid = [];
      for (let i = 0; i < rows; i++) {
        this.grid.push(Array(cols).fill(''));
      }
    }
    fetch('/nouns.txt')
      .then(response => response.text())
      .then(text => {
        this.words = text.split(/\r?\n/).map(x => x.trim().toLowerCase());
        for (const word of this.words) {
          if (word.length === this.cols) {
            this.initWords.push(word);
          }
        }
      });
  }

  reset() {
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        this.grid[i][j] = '';
      }
    }
    const word = this.initWords[Math.floor(Math.random()*this.initWords.length)];
    const y = Math.floor(this.rows/2);
    for (let i = 0; i < this.cols; i++) {
      this.grid[y][i] = word[i];
    }
  }

  update() {
    this.initWord = '';
    const y = Math.floor(this.rows/2);
    for (let i = 0; i < this.cols; i++) {
      this.initWord += this.grid[y][i];
    }
  }

  getInitWord(): string {
    return this.initWord;
  }

  checkWord(word: string): boolean {
    for (const x of this.words) {
      if (word === x) {
        return true;
      }
    }
    return false;
  }

  getWordFromPath(path: [number, number][]): string {
    let word = '';
    for (const [row, col] of path) {
      word += this.grid[row][col];
    }
    return word;
  }

  checkPath(path: [number, number][]): boolean {
    return this.checkWord(this.getWordFromPath(path));
  }
}

export default Balda;
