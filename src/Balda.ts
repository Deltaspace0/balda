interface Dictionary {
  [key: string]: Dictionary
}

class Balda {
  grid: string[][];
  possibleWords: [string, [number, number][]][] = [];
  private rows: number;
  private cols: number;
  private dictionary: Dictionary = {};
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
        const words = text.split(/\r?\n/).map(x => x.trim().toLowerCase());
        for (const word of words) {
          if (word.length === this.cols) {
            this.initWords.push(word);
          }
          this.addWord(word);
        }
      });
  }

  private addWord(word: string) {
    let dictionary = this.dictionary;
    for (const letter of word) {
      if (!(letter in dictionary)) {
        dictionary[letter] = {};
      }
      dictionary = dictionary[letter];
    }
    dictionary[''] = {};
  }

  private addPossibleWord(word: string, path: [number, number][]) {
    for (const x of this.possibleWords) {
      if (x[0] === word) {
        return;
      }
    }
    this.possibleWords.push([word, path]);
  }

  private getNeighborCells(row: number, col: number): [number, number][] {
    const neighborCells: [number, number][] = [];
    if (col > 0) {
      neighborCells.push([row, col-1]);
    }
    if (col < this.cols-1) {
      neighborCells.push([row, col+1]);
    }
    if (row > 0) {
      neighborCells.push([row-1, col]);
    }
    if (row < this.rows-1) {
      neighborCells.push([row+1, col]);
    }
    return neighborCells;
  }

  private generatePossibleWordsFromPath(path: [number, number][], dictionary: Dictionary, addedNewLetter: boolean) {
    const [lastRow, lastCol] = path[path.length-1];
    if (addedNewLetter && ('' in dictionary)) {
      this.addPossibleWord(this.getWordFromPath(path), path);
    }
    const lastLetter = this.grid[lastRow][lastCol];
    if (lastLetter === '') {
      for (const nextLetter in dictionary) {
        if (nextLetter === '') {
          continue;
        }
        this.grid[lastRow][lastCol] = nextLetter;
        this.generatePossibleWordsFromPath([...path], dictionary[nextLetter], true);
      }
      this.grid[lastRow][lastCol] = '';
      return;
    }
    for (const [row, col] of this.getNeighborCells(lastRow, lastCol)) {
      let visited = false;
      for (const [prevRow, prevCol] of path) {
        if (row === prevRow && col === prevCol) {
          visited = true;
          break;
        }
      }
      if (visited) {
        continue;
      }
      const letter = this.grid[row][col];
      if (letter === '' && addedNewLetter) {
        continue;
      }
      if (letter !== '' && !(letter in dictionary)) {
        continue;
      }
      const nextPath: [number, number][] = [...path, [row, col]];
      const nextDictionary = letter === '' ? dictionary : dictionary[letter];
      this.generatePossibleWordsFromPath(nextPath, nextDictionary, addedNewLetter);
    }
  }

  private generatePossibleWords() {
    this.possibleWords = [];
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const l = this.grid[i][j];
        if (l !== '' && !(l in this.dictionary)) {
          continue;
        }
        const dictionary = l === '' ? this.dictionary : this.dictionary[l];
        this.generatePossibleWordsFromPath([[i, j]], dictionary, false);
      }
    }
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
    this.generatePossibleWords();
  }

  getInitWord(): string {
    return this.initWord;
  }

  checkWord(word: string): boolean {
    let dictionary = this.dictionary;
    for (const letter of word) {
      if (!(letter in dictionary)) {
        return false;
      }
      dictionary = dictionary[letter];
    }
    return ('' in dictionary);
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
