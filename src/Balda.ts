export type Language = 'en' | 'ru';

interface BaldaOptions {
  dimensions?: [number, number];
  language?: Language;
  grid?: string[][]
}

interface Dictionary {
  [key: string]: Dictionary
}

function addWord(dictionary: Dictionary, word: string) {
  for (const letter of word) {
    if (!(letter in dictionary)) {
      dictionary[letter] = {};
    }
    dictionary = dictionary[letter];
  }
  dictionary[''] = {};
}

class Balda {
  grid: string[][] = [];
  possibleWords: [string, [number, number][]][] = [];
  possibleWordsAll: [string, [number, number][]][] = [];
  private rows: number;
  private cols: number;
  private language: Language;
  private dictionaries: Record<Language, Dictionary>;
  private possibleInitWords: Record<string, string[][]> = {};
  private initWord = '';

  constructor(options?: BaldaOptions) {
    const [rows, cols] = options?.dimensions ?? [5, 5];
    this.rows = rows;
    this.cols = cols;
    this.language = options?.language ?? 'en';
    this.dictionaries = { en: {}, ru: {} };
    if (options?.grid) {
      this.grid = options.grid;
    } else {
      this.clearGrid();
    }
  }

  private addPossibleWord(word: string, path: [number, number][]) {
    this.possibleWordsAll.push([word, path]);
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

  private generateFromPath(
    path: [number, number][],
    dictionary: Dictionary,
    addedNewLetter: boolean
  ) {
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
        this.generateFromPath([...path], dictionary[nextLetter], true);
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
      const l = this.grid[row][col];
      if (l === '' && addedNewLetter || l !== '' && !(l in dictionary)) {
        continue;
      }
      const nextPath: [number, number][] = [...path, [row, col]];
      const nextDictionary = l === '' ? dictionary : dictionary[l];
      this.generateFromPath(nextPath, nextDictionary, addedNewLetter);
    }
  }

  private generatePossibleWords() {
    const dictionary = this.dictionaries[this.language];
    this.possibleWords = [];
    this.possibleWordsAll = [];
    for (let i = 0; i < this.rows; i++) {
      for (let j = 0; j < this.cols; j++) {
        const l = this.grid[i][j];
        if (l !== '' && !(l in dictionary)) {
          continue;
        }
        const subDictionary = l === '' ? dictionary : dictionary[l];
        this.generateFromPath([[i, j]], subDictionary, false);
      }
    }
  }

  loadDictionary(nouns: object) {
    const languageWords: Record<Language, string[]> = { en: [], ru: [] };
    for (const word in nouns) {
      const lower = word.toLowerCase();
      const language = /[a-z]/.test(lower) ? 'en' : 'ru';
      languageWords[language].push(lower);
      addWord(this.dictionaries[language], lower);
    }
    for (const language in languageWords) {
      const initWords: string[][] = [];
      for (const word of languageWords[language as Language]) {
        if (initWords[word.length] === undefined) {
          initWords[word.length] = [];
        }
        initWords[word.length].push(word);
      }
      this.possibleInitWords[language] = initWords;
    }
  }

  clearGrid() {
    this.grid = [];
    for (let i = 0; i < this.rows; i++) {
      this.grid.push(Array(this.cols).fill(''));
    }
  }

  reset(language?: Language, initWord?: string) {
    if (language) {
      this.language = language;
    }
    this.clearGrid();
    if (!initWord) {
      const initWords = this.possibleInitWords[this.language][this.cols];
      if (initWords.length === 0) {
        return;
      }
      initWord = initWords[Math.floor(Math.random()*initWords.length)];
    }
    const y = Math.floor(this.rows/2);
    for (let i = 0; i < this.cols; i++) {
      this.grid[y][i] = initWord[i];
    }
  }

  setDimensions(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
    this.reset();
  }

  setOptions(options: BaldaOptions) {
    const [rows, cols] = options.dimensions ?? [this.rows, this.cols];
    this.rows = rows;
    this.cols = cols;
    this.reset(options.language);
  }

  setGrid(grid: string[][]) {
    if (!this.grid.length || !this.grid[0].length) {
      throw new Error('Invalid grid');
    }
    this.grid = grid;
    this.rows = this.grid.length;
    this.cols = this.grid[0].length;
  }

  update() {
    this.initWord = '';
    const y = Math.floor(this.rows/2);
    for (let i = 0; i < this.cols; i++) {
      if (this.grid[y][i] === '') {
        this.initWord = '';
        break;
      }
      this.initWord += this.grid[y][i];
    }
    this.generatePossibleWords();
  }

  getInitWord(): string {
    return this.initWord;
  }

  checkWord(word: string): boolean {
    let dictionary = this.dictionaries[this.language];
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
