import { afterEach, describe, expect, it } from 'vitest';
import Balda from './Balda';
import nouns from './nouns.json' with { type: 'json' };

interface GenerationTest {
  grid: string[][];
  word: string;
  path: [number, number][];
  gridString: string;
}

const englishWords: string[] = [];
for (const word in nouns) {
  const lower = word.toLowerCase();
  if (/[a-z]/.test(lower)) {
    englishWords.push(lower);
  }
}
const generationTests: GenerationTest[] = [];
for (let i = 0; i < 1000; i++) {
  const grid: string[][] = [];
  const rows = Math.floor(Math.random()*7)+3;
  const cols = Math.floor(Math.random()*7)+3;
  for (let j = 0; j < rows; j++) {
    grid.push(Array(cols).fill(''));
  }
  let word: string = '';
  while (!word) {
    word = englishWords[Math.floor(Math.random()*englishWords.length)];
    if (word.length > rows*cols-5) {
      word = '';
    }
  }
  const path: [number, number][] = [];
  const startRow = Math.floor(Math.random()*rows);
  const startCol = Math.floor(Math.random()*cols);
  const cellStack: [number, number][][] = [[[startRow, startCol]]];
  while (path.length < word.length) {
    if (!cellStack.length) {
      throw new Error('Impossible to generate path for word: '+word);
    }
    const cell = cellStack[cellStack.length-1].pop();
    if (!cell) {
      cellStack.pop();
      const prevCell = path.pop();
      if (!prevCell) {
        throw new Error('No previous cell in path');
      }
      const [row, col] = prevCell;
      grid[row][col] = '';
      continue;
    }
    const [row, col] = cell;
    grid[row][col] = word[path.length];
    path.push(cell);
    const nextCells: [number, number][] = [];
    if (row > 0 && !grid[row-1][col]) {
      nextCells.push([row-1, col]);
    }
    if (row+1 < rows && !grid[row+1][col]) {
      nextCells.push([row+1, col]);
    }
    if (col > 0 && !grid[row][col-1]) {
      nextCells.push([row, col-1]);
    }
    if (col+1 < cols && !grid[row][col+1]) {
      nextCells.push([row, col+1]);
    }
    const shuffledCells = nextCells
      .map((value) => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort-b.sort)
      .map(({ value }) => value);
    cellStack.push(shuffledCells);
  }
  const emptyCells: [number, number][] = [];
  for (let j = 0; j < rows; j++) {
    for (let k = 0; k < cols; k++) {
      if (!grid[j][k]) {
        emptyCells.push([j, k]);
      }
    }
  }
  const shuffledEmptyCells = emptyCells
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort-b.sort)
    .map(({ value }) => value);
  const maxAdditions = rows*cols-word.length-3;
  const additions = Math.floor(Math.random()*maxAdditions);
  for (let j = 0; j < additions; j++) {
    const [row, col] = shuffledEmptyCells[j];
    const index = Math.floor(Math.random()*26);
    grid[row][col] = 'abcdefghijklmnopqrstuvwxyz'[index];
  }
  const index = Math.floor(Math.random()*path.length);
  const [holeRow, holeCol] = path[index];
  grid[holeRow][holeCol] = '';
  const gridString = grid
    .map((row) => row.map((x) => !x ? '.' : x).join(''))
    .join('\n');
  generationTests.push({ grid, word, path, gridString });
}
const balda = new Balda();
balda.loadDictionary(nouns);
afterEach(() => balda.reset());

describe('Balda', () => {
  describe('dimension update', () => {
    it('should add new empty rows evenly', () => {
      balda.setGrid([
        ['', '', ''],
        ['b', 'o', 'x'],
        ['', '', '']
      ]);
      balda.updateDimensions([4, 0]);
      expect(balda.grid).toEqual([
        ['', '', ''],
        ['b', 'o', 'x'],
        ['', '', ''],
        ['', '', '']
      ]);
      balda.updateDimensions([5, 0]);
      expect(balda.grid).toEqual([
        ['', '', ''],
        ['', '', ''],
        ['b', 'o', 'x'],
        ['', '', ''],
        ['', '', '']
      ]);
      balda.setGrid([
        ['', 't', ''],
        ['b', 'o', 'x'],
        ['', '', '']
      ]);
      balda.updateDimensions([4, 0]);
      expect(balda.grid).toEqual([
        ['', '', ''],
        ['', 't', ''],
        ['b', 'o', 'x'],
        ['', '', ''],
      ]);
      balda.setGrid([
        ['a', '', ''],
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
      ]);
      balda.updateDimensions([6, 0]);
      expect(balda.grid).toEqual([
        ['', '', ''],
        ['a', '', ''],
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
      ]);
      balda.updateDimensions([7, 0]);
      expect(balda.grid).toEqual([
        ['', '', ''],
        ['', '', ''],
        ['a', '', ''],
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
      ]);
    });

    it('should add new empty columns evenly', () => {
      balda.setGrid([
        ['', '', ''],
        ['b', 'o', 'x'],
        ['', '', '']
      ]);
      balda.updateDimensions([0, 4]);
      expect(balda.grid).toEqual([
        ['', '', '', ''],
        ['b', 'o', 'x', ''],
        ['', '', '', ''],
      ]);
      balda.updateDimensions([0, 5]);
      expect(balda.grid).toEqual([
        ['', '', '', '', ''],
        ['', 'b', 'o', 'x', ''],
        ['', '', '', '', ''],
      ]);
      balda.setGrid([
        ['a', '', '', '', ''],
        ['', '', '', '', ''],
        ['', '', '', '', ''],
      ]);
      balda.updateDimensions([0, 6]);
      expect(balda.grid).toEqual([
        ['', 'a', '', '', '', ''],
        ['', '', '', '', '', ''],
        ['', '', '', '', '', ''],
      ]);
      balda.updateDimensions([0, 7]);
      expect(balda.grid).toEqual([
        ['', '', 'a', '', '', '', ''],
        ['', '', '', '', '', '', ''],
        ['', '', '', '', '', '', ''],
      ]);
    });

    it('should remove empty rows evenly', () => {
      balda.setGrid([
        ['', '', ''],
        ['', '', ''],
        ['b', 'o', 'x'],
        ['', '', ''],
        ['', '', '']
      ]);
      balda.updateDimensions([4, 0]);
      expect(balda.grid).toEqual([
        ['', '', ''],
        ['b', 'o', 'x'],
        ['', '', ''],
        ['', '', '']
      ]);
      balda.updateDimensions([3, 0]);
      expect(balda.grid).toEqual([
        ['', '', ''],
        ['b', 'o', 'x'],
        ['', '', '']
      ]);
      balda.setGrid([
        ['', 't', ''],
        ['b', 'o', 'x'],
        ['', '', '']
      ]);
      balda.updateDimensions([2, 0]);
      expect(balda.grid).toEqual([
        ['', 't', ''],
        ['b', 'o', 'x'],
      ]);
    });

    it('should remove empty columns evenly', () => {
      balda.setGrid([
        ['', '', '', '', ''],
        ['', 'b', 'o', 'x', ''],
        ['', '', '', '', ''],
      ]);
      balda.updateDimensions([0, 4]);
      expect(balda.grid).toEqual([
        ['', '', '', ''],
        ['b', 'o', 'x', ''],
        ['', '', '', ''],
      ]);
      balda.updateDimensions([0, 3]);
      expect(balda.grid).toEqual([
        ['', '', ''],
        ['b', 'o', 'x'],
        ['', '', '']
      ]);
    });

    it('should not remove rows with letters', () => {
      balda.setGrid([
        ['', 't', ''],
        ['b', 'o', 'x'],
        ['', 'a', ''],
        ['', 'd', '']
      ]);
      balda.updateDimensions([3, 0]);
      expect(balda.grid).toEqual([
        ['', 't', ''],
        ['b', 'o', 'x'],
        ['', 'a', ''],
        ['', 'd', '']
      ]);
    });

    it('should not remove columns with letters', () => {
      balda.setGrid([
        ['', 't', ''],
        ['b', 'o', 'x'],
        ['', 'a', ''],
        ['', 'd', '']
      ]);
      balda.updateDimensions([0, 2]);
      expect(balda.grid).toEqual([
        ['', 't', ''],
        ['b', 'o', 'x'],
        ['', 'a', ''],
        ['', 'd', '']
      ]);
    });

    it('should update dimensions of empty grid', () => {
      balda.setGrid([
        ['', '', ''],
        ['', '', ''],
        ['', '', ''],
        ['', '', '']
      ]);
      balda.updateDimensions([5, 2]);
      expect(balda.grid).toEqual([
        ['', ''],
        ['', ''],
        ['', ''],
        ['', ''],
        ['', '']
      ]);
      balda.updateDimensions([3, 4]);
      expect(balda.grid).toEqual([
        ['', '', '', ''],
        ['', '', '', ''],
        ['', '', '', ''],
      ]);
    });
  });

  describe('check', () => {
    it('should return false for a made-up word', () => {
      expect(balda.checkWord('notaword')).toBe(false);
    });

    it('should return true for a real word', () => {
      expect(balda.checkWord('word')).toBe(true);
    });
  });

  describe('generation', () => {
    it.each(generationTests)('$gridString -> $word', (x) => {
      const { grid, word, path } = x;
      balda.setGrid(grid);
      balda.update();
      let success = false;
      for (const [possibleWord, possiblePath] of balda.possibleWordsAll) {
        if (possibleWord !== word) {
          continue;
        }
        success = true;
        for (let i = 0; i < path.length; i++) {
          const [row, col] = possiblePath[i];
          if (row !== path[i][0] || col !== path[i][1]) {
            success = false;
            break;
          }
        }
        if (success) {
          break;
        }
      }
      expect(success).toBe(true);
    });
  });
});
