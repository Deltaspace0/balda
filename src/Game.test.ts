import { afterEach, describe, expect, it } from 'vitest';
import Game from './Game';
import { GAME_WIDTH, GAME_HEIGHT } from './gameConfig';

const ROWS = 5;
const COLS = 5;
let status = '';
let wordHistory: [string, [number, number][]][] = [];
let possibleWords: [string, [number, number][]][] = [];
const game = new Game({ dimensions: [ROWS, COLS] });
game.addEventListener('status', (e) => {
  status = (e as CustomEvent).detail;
});
game.addEventListener('word-history', (e) => {
  wordHistory = (e as CustomEvent).detail;
});
game.addEventListener('possible-words', (e) => {
  possibleWords = (e as CustomEvent).detail;
});
game.reset();
afterEach(() => {
  game.setEditEnabled(false);
  game.reset();
});

function getScreenCoordinates(row: number, col: number) {
  const x = (col+Math.random())/COLS*GAME_WIDTH;
  const y = (row+Math.random())/ROWS*GAME_HEIGHT;
  return [x, y];
}

function mouseMove(row: number, col: number) {
  const [x, y] = getScreenCoordinates(row, col);
  game.mouseMove(x, y);
}

function mouseDown(row: number, col: number) {
  const [x, y] = getScreenCoordinates(row, col);
  game.mouseDown(x, y);
}

function mouseClick(row: number, col: number) {
  mouseDown(row, col);
  game.mouseUp();
}

describe('Game', () => {
  describe('edit mode', () => {
    it('should remove letter from the cell', () => {
      game.setEditEnabled(true);
      mouseDown(2, 3);
      expect(game.getLetterOnGrid(2, 3)).toBe('');
    });

    it('should replace letter in the cell with a new one', () => {
      game.setEditEnabled(true);
      game.setLetter('q');
      mouseDown(2, 3);
      mouseDown(2, 3);
      expect(game.getLetterOnGrid(2, 3)).toBe('q');
    });
  });

  describe('letter addition', () => {
    it('should add new letter and set status to select-path', () => {
      mouseClick(3, 2);
      expect(status).toBe('select-path');
    });

    it('should cancel new letter and set status to add-letter', () => {
      mouseClick(3, 2);
      game.cancelNewLetter();
      expect(status).toBe('add-letter');
    });
  });

  describe('path selection', () => {
    it('should keep select-path status on path over empty cell', () => {
      mouseClick(3, 2);
      mouseDown(3, 2);
      mouseMove(3, 3);
      game.mouseUp();
      expect(status).toBe('select-path');
      expect(wordHistory).toEqual([]);
    });

    it('should keep select-path status on path of length 1', () => {
      mouseClick(3, 2);
      mouseDown(3, 2);
      mouseMove(2, 2);
      mouseMove(2, 3);
      mouseMove(2, 2);
      mouseMove(3, 2);
      game.mouseUp();
      expect(status).toBe('select-path');
      expect(wordHistory).toEqual([]);
    });
  });

  describe('word check', () => {
    it('should set status to unknown-word on a made-up word', () => {
      game.reset('toast');
      game.setLetter('m');
      mouseClick(1, 3);
      mouseDown(1, 3);
      mouseMove(2, 3);
      mouseMove(2, 2);
      mouseMove(2, 1);
      game.mouseUp();
      expect(game.getUnknownWord()).toBe('msao');
      expect(status).toBe('unknown-word');
      expect(wordHistory).toEqual([]);
    });

    it('should set status to select-path after denying unknown word', () => {
      game.reset('toast');
      game.setLetter('m');
      mouseClick(1, 3);
      mouseDown(1, 3);
      mouseMove(2, 3);
      mouseMove(2, 2);
      mouseMove(2, 1);
      game.mouseUp();
      game.resolveUnknownWord(false);
      expect(status).toBe('select-path');
    });

    it('should set status to add-letter after accepting unknown word', () => {
      game.reset('toast');
      game.setLetter('m');
      mouseClick(1, 3);
      mouseDown(1, 3);
      mouseMove(2, 3);
      mouseMove(2, 2);
      mouseMove(2, 1);
      game.mouseUp();
      game.resolveUnknownWord(true);
      expect(status).toBe('add-letter');
      expect(wordHistory).toEqual([[
        'msao',
        [[1, 3], [2, 3], [2, 2], [2, 1]]
      ]]);
    });

    it('should set status to add-letter and accept a real word', () => {
      game.reset('toast');
      game.setLetter('c');
      mouseClick(1, 1);
      mouseDown(1, 1);
      mouseMove(2, 1);
      mouseMove(2, 2);
      mouseMove(2, 3);
      mouseMove(2, 4);
      game.mouseUp();
      expect(status).toBe('add-letter');
      expect(wordHistory).toEqual([[
        'coast',
        [[1, 1], [2, 1], [2, 2], [2, 3], [2, 4]]
      ]]);
    });

    it('should give all possible words', () => {
      game.reset('toast');
      let foundWord = false;
      for (const [word] of possibleWords) {
        if (word === 'coast') {
          foundWord = true;
          break;
        }
      }
      expect(foundWord).toBe(true);
    });
  });
});
