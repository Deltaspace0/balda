import i18n from "i18next";
import { initReactI18next } from "react-i18next";

const resources = {
  en: {
    translation: {
      'theme': 'Theme',
      'light-mode': 'Light',
      'dark-mode': 'Dark',
      'language': 'Language',
      'reset-game': 'Reset game',
      'undo': 'Undo word',
      'rows': 'Rows',
      'columns': 'Columns',
      'edit-mode': 'Edit mode',
      'two-players': 'Two players',
      'show-possible-words': 'Show possible words',
      'possible-words': 'Possible words',
      'word-history': 'Word history',
      'player': 'Player',
      'add-letter': 'Add letter',
      'select-path': 'Select path',
      'unknown-word': 'Unknown word: {{word}}. Add it anyway?',
      'add': 'Add',
      'cancel': 'Cancel'
    }
  },
  ru: {
    translation: {
      'theme': 'Тема',
      'light-mode': 'Светлая',
      'dark-mode': 'Тёмная',
      'language': 'Язык',
      'reset-game': 'Сбросить',
      'undo': 'Отменить',
      'rows': 'Строки',
      'columns': 'Столбцы',
      'edit-mode': 'Редактирование',
      'two-players': 'Два игрока',
      'show-possible-words': 'Возможные слова',
      'possible-words': 'Возможные слова',
      'word-history': 'История',
      'player': 'Игрок',
      'add-letter': 'Добавьте букву',
      'select-path': 'Покажите слово',
      'unknown-word': 'Неизвестное слово: {{word}}. Всё равно добавить?',
      'add': 'Добавить',
      'cancel': 'Отмена'
    }
  }
};

i18n.use(initReactI18next).init({
  resources,
  lng: "en",
  interpolation: {
    escapeValue: false
  }
});

export default i18n;
