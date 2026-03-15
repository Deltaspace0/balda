import './App.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import useLocalStorage from 'use-local-storage';
import Canvas from './components/Canvas';
import FieldsetRadio from './components/FieldsetRadio';
import LetterPanel from './components/LetterPanel';
import Slider from './components/Slider';
import WordList from './components/WordList';
import Game from './Game';

type WordPaths = [string, [number, number][]][];
type Theme = 'dark' | 'light';
type Language = 'en' | 'ru';
const languageLetters: Record<Language, string> = {
  'en': 'abcdefghijklmnopqrstuvwxyz',
  'ru': 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'
};

function useStorage<T>(
  key: string,
  value: T
): ReturnType<typeof useLocalStorage<T>> {
  return useLocalStorage<T>(key, value, { syncData: false });
}

function App() {
  const [theme, setTheme] = useStorage<Theme>(
    'theme',
    window.matchMedia?.("(prefers-color-scheme: dark)")?.matches
      ? 'dark'
      : 'light'
  );
  const [language, setLanguage] = useStorage<Language>('language', 'en');
  const [letter, setLetter] = useState(languageLetters[language][0]);
  const [editEnabled, setEditEnabled] = useState(false);
  const [twoPlayers, setTwoPlayers] = useStorage('two-players', false);
  const [showPossible, setShowPossible] = useStorage('show-possible', true);
  const [status, setStatus] = useState('add-letter');
  const [wordHistory, setWordHistory] = useState<WordPaths>([]);
  const [possibleWords, setPossibleWords] = useState<WordPaths>([]);
  const [rows, setRows] = useStorage('rows', 5);
  const [cols, setCols] = useStorage('cols', 5);
  const { t, i18n } = useTranslation('translation', { lng: language });
  const [wordHistory1, wordHistory2, score1, score2] = useMemo(() => {
    const wordHistory1: WordPaths = [];
    const wordHistory2: WordPaths = [];
    let score1 = 0;
    let score2 = 0;
    for (let i = 0; i < wordHistory.length; i++) {
      const [word, path] = wordHistory[i];
      if (i%2 === 0) {
        wordHistory1.push([word, path]);
        score1 += word.length;
      } else {
        wordHistory2.push([word, path]);
        score2 += word.length;
      }
    }
    return [wordHistory1, wordHistory2, score1, score2];
  }, [wordHistory]);
  const gameRef = useRef<Game>(null);
  if (gameRef.current === null) {
    const game = new Game(5, 5);
    game.addEventListener('status', (e) => {
      setStatus((e as CustomEvent).detail);
    });
    game.addEventListener('word-history', (e) => {
      setWordHistory((e as CustomEvent).detail);
    });
    game.addEventListener('possible-words', (e) => {
      setPossibleWords((e as CustomEvent).detail);
    });
    game.setLetter(letter);
    game.setLanguage(language);
    game.setDimensions(rows, cols);
    gameRef.current = game;
  }
  const game = gameRef.current;
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    game.render(ctx, theme === 'dark');
  }, [game, theme]);
  const handleLetter = useCallback((x: string) => {
    game.setLetter(x);
    setLetter(x);
  }, [game]);
  const handleLanguage = useCallback((x: Language) => {
    setLanguage(x);
    handleLetter(languageLetters[x][0]);
    game.setLanguage(x);
    i18n.changeLanguage(x);
  }, [game, i18n, setLanguage, handleLetter]);
  const handleEditEnabled = useCallback((x: boolean) => {
    game.setEditEnabled(x);
    setEditEnabled(x);
  }, [game]);
  const mouseHandlers = {
    onMouseMove: useCallback((e: MouseEvent) => {
      game.mouseMove(e.offsetX, e.offsetY);
    }, [game]),
    onMouseDown: useCallback((e: MouseEvent) => {
      game.mouseDown(e.offsetX, e.offsetY);
    }, [game]),
    onMouseUp: useCallback(() => {
      game.mouseUp();
    }, [game]),
    onMouseLeave: useCallback(() => {
      game.mouseLeave();
    }, [game])
  };
  useEffect(() => {
    document.documentElement.style.colorScheme = theme;
  }, [theme]);
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        game.cancelNewLetter();
      }
    };
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, [game]);
  useEffect(() => {
    const listener = (e: KeyboardEvent) => {
      if (languageLetters[language].includes(e.key)) {
        handleLetter(e.key);
        game.mouseDown();
        game.mouseUp();
      }
    };
    window.addEventListener('keypress', listener);
    return () => window.removeEventListener('keypress', listener);
  }, [game, language, handleLetter]);
  return (<div className='App'>
    <div className='flex-row' style={{alignItems: 'flex-start'}}>
      <div className='flex-column'>
        <FieldsetRadio
          name='theme'
          title={t('theme')}
          list={[['light', t('light-mode')], ['dark', t('dark-mode')]]}
          value={theme}
          setValue={setTheme}
        />
        <FieldsetRadio
          name='language'
          title={t('language')}
          list={[['en', 'English'], ['ru', 'Русский']]}
          value={language}
          setValue={handleLanguage}
        />
        <div className='flex-row'>
          <button onClick={() => game.setDimensions(rows, cols)}>
            {t('reset-game')}
          </button>
          <button
            disabled={wordHistory.length === 0}
            onClick={() => game.undo()}
          >
            {t('undo')}
          </button>
        </div>
        <Slider
          label={t('rows')}
          list={[3, 4, 5, 6, 7, 8, 9]}
          value={rows}
          setValue={setRows}
        />
        <Slider
          label={t('columns')}
          list={[3, 4, 5, 6, 7, 8, 9]}
          value={cols}
          setValue={setCols}
        />
        <label>
          <input
            type='checkbox'
            checked={editEnabled}
            onChange={(e) => handleEditEnabled(e.target.checked)}
          />
          <p>{t('edit-mode')}</p>
        </label>
        { editEnabled && <div className='flex-row'>
          <button onClick={() => game.clear()}>{t('clear')}</button>
        </div> }
        <label>
          <input
            type='checkbox'
            checked={twoPlayers}
            onChange={(e) => setTwoPlayers(e.target.checked)}
          />
          <p>{t('two-players')}</p>
        </label>
        <label>
          <input
            type='checkbox'
            checked={showPossible}
            onChange={(e) => setShowPossible(e.target.checked)}
          />
          <p>{t('show-possible-words')}</p>
        </label>
        { showPossible && <WordList
          label={t('possible-words')}
          wordPaths={possibleWords}
          setHighlightIndex={(i) => {
            if (status === 'add-letter') {
              game.setPossibleIndex(i);
            }
          }}
          onClick={(i) => {
            if (status === 'add-letter') {
              game.selectPossibleWord(i);
              game.setPossibleIndex();
            }
          }}
        /> }
      </div>
      <div className='flex-column'>
        <Canvas
          draw={draw}
          className='game-canvas'
          mouseHandlers={mouseHandlers}
        />
        <LetterPanel
          letters={languageLetters[language]}
          letter={letter}
          setLetter={handleLetter}/>
        <div className='flex-column' style={{height: '64px'}}>
          { status === 'add-letter' && <div className='flex-row'>
            <p className='status'>{t('add-letter')}</p>
          </div> }
          { status === 'select-path' && <div className='flex-row'>
            <p className='status'>{t('select-path')}</p>
            <button
              className='button-auto'
              onClick={() => game.cancelNewLetter()}
            >
              {t('cancel')}
            </button>
          </div> }
          { status === 'unknown-word' && <>
            <div className='flex-row'>
              <p className='status'>
                {t('unknown-word', { word: game.getUnknownWord() })}
              </p>
            </div>
            <div className='flex-row'>
              <button
                className='button-auto'
                onClick={() => game.resolveUnknownWord(true)}
              >
                {t('add')}
              </button>
              <button
                className='button-auto'
                onClick={() => game.resolveUnknownWord(false)}
              >
                {t('cancel')}
              </button>
            </div>
          </> }
        </div>
      </div>
      { twoPlayers ? (<>
        <div className='flex-column'>
          <WordList
            label={`${t('player')} 1: ${score1}`}
            wordPaths={wordHistory1}
            setHighlightIndex={(i) => {
              game.setHighlightIndex(i !== undefined ? i*2 : i);
            }}
            scrollToBottom={true}
            style={{userSelect: 'text'}}
          />
          <WordList
            label={`${t('player')} 2: ${score2}`}
            wordPaths={wordHistory2}
            setHighlightIndex={(i) => {
              game.setHighlightIndex(i !== undefined ? i*2+1 : i);
            }}
            scrollToBottom={true}
            style={{userSelect: 'text'}}
          />
        </div>
      </>) : (<div className='flex-column'>
        <WordList
          label={`${t('word-history')}: ${score1+score2}`}
          wordPaths={wordHistory}
          setHighlightIndex={(i) => game.setHighlightIndex(i)}
          scrollToBottom={true}
          style={{userSelect: 'text', height: '400px'}}
        />
      </div>) }
    </div>
  </div>);
}

export default App;
