import './App.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Canvas from './components/Canvas';
import LetterPanel from './components/LetterPanel';
import { useListSlider, Slider } from './components/Slider';
import WordList from './components/WordList';
import Game from './Game';

type WordPaths = [string, [number, number][]][];
type Language = 'en' | 'ru';
const languageLetters: Record<Language, string> = {
  'en': 'abcdefghijklmnopqrstuvwxyz',
  'ru': 'абвгдеёжзийклмнопрстуфхцчшщъыьэюя'
};

function App() {
  const { t, i18n } = useTranslation();
  const [language, setLanguage] = useState<Language>('en');
  const [letter, setLetter] = useState('a');
  const [editEnabled, setEditEnabled] = useState(false);
  const [twoPlayersMode, setTwoPlayersMode] = useState(false);
  const [showPossible, setShowPossible] = useState(true);
  const [status, setStatus] = useState('add-letter');
  const [wordHistory, setWordHistory] = useState<WordPaths>([]);
  const [possibleWords, setPossibleWords] = useState<WordPaths>([]);
  const [rows, setRows] = useState(5);
  const [cols, setCols] = useState(5);
  const rowProps = useListSlider({
    label: t('rows'),
    initialValue: 5,
    list: [3, 4, 5, 6, 7, 8, 9],
    callback: setRows
  });
  const colProps = useListSlider({
    label: t('columns'),
    initialValue: 5,
    list: [3, 4, 5, 6, 7, 8, 9],
    callback: setCols
  });
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
    game.reset();
    gameRef.current = game;
  }
  const game = gameRef.current;
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    game.render(ctx);
  }, [game]);
  const handleLetter = useCallback((x: string) => {
    game.setLetter(x);
    setLetter(x);
  }, [game]);
  const handleEditEnabled = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    game.setEditEnabled(e.target.checked);
    setEditEnabled(e.target.checked);
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
  const handleLanguage = (language: Language) => {
    setLanguage(language);
    setLetter(languageLetters[language][0]);
    game.setLanguage(language);
    i18n.changeLanguage(language);
  };
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
    <div className='flex-column'>
      <fieldset style={{height: 'auto'}}>
        <legend>{t('language')}</legend>
        <label>
          <input
            type='radio'
            name='language'
            value='English'
            checked={language === 'en'}
            onChange={() => handleLanguage('en')}
          />
          <p>English</p>
        </label>
        <label>
          <input
            type='radio'
            name='language'
            value='Russian'
            checked={language === 'ru'}
            onChange={() => handleLanguage('ru')}
          />
          <p>Русский</p>
        </label>
      </fieldset>
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
      <Slider {...rowProps}/>
      <Slider {...colProps}/>
      <label>
        <input
          type='checkbox'
          checked={editEnabled}
          onChange={handleEditEnabled}
        />
        <p>{t('edit-mode')}</p>
      </label>
      <label>
        <input
          type='checkbox'
          checked={twoPlayersMode}
          onChange={(e) => setTwoPlayersMode(e.target.checked)}
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
      {showPossible && <WordList
        label={t('possible-words')}
        wordPaths={possibleWords}
        setHighlightIndex={(i) => game.setPossibleIndex(i)}
        onClick={(i) => {
          if (status !== 'add-letter') {
            return;
          }
          game.selectPossibleWord(i);
          game.setPossibleIndex();
        }}
      />}
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
      { status === 'add-letter' && <p className='status'>
        {t('add-letter')}
      </p> }
      { status === 'select-path' && <label>
        <button
          className='button-auto'
          onClick={() => game.cancelNewLetter()}
        >
          {t('cancel')}
        </button>
        <p>{t('select-path')}</p>
      </label> }
      { status === 'unknown-word' && <div>
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
        <p className='status'>
          {t('unknown-word')}: {game.getUnknownWord()}. {t('add-it-anyway')}
        </p>
      </div> }
    </div>
    { twoPlayersMode ? (<>
      <div className='flex-column'>
        <WordList
          label={`${t('player')} 1: ${score1}`}
          wordPaths={wordHistory1}
          setHighlightIndex={(i) => {
            game.setHighlightIndex(i !== undefined ? i*2 : i);
          }}
        />
      </div>
      <WordList
        label={`${t('player')} 2: ${score2}`}
        wordPaths={wordHistory2}
        setHighlightIndex={(i) => {
          game.setHighlightIndex(i !== undefined ? i*2+1 : i);
        }}
      />
    </>) : (<div className='flex-column'>
      <WordList
        label={t('word-history')}
        wordPaths={wordHistory}
        setHighlightIndex={(i) => game.setHighlightIndex(i)}
        style={{userSelect: 'text'}}
      />
    </div>) }
  </div>);
}

export default App;
