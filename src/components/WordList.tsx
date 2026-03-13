import { useLayoutEffect, useRef, type CSSProperties } from 'react';

interface WordListProps {
  label: string;
  wordPaths: [string, [number, number][]][];
  setHighlightIndex: (index?: number) => void;
  onClick?: (index: number) => void;
  scrollToBottom?: boolean;
  style?: CSSProperties;
}

function WordList(props: WordListProps) {
  const lastElement = useRef<HTMLLIElement>(null);
  useLayoutEffect(() => {
    if (lastElement.current && props.scrollToBottom) {
      lastElement.current.scrollIntoView();
    }
  }, [props.wordPaths, props.scrollToBottom]);
  const elements = [];
  for (let i = 0; i < props.wordPaths.length; i++) {
    elements.push(<li
      ref={i === props.wordPaths.length-1 ? lastElement : undefined}
      onMouseOver={() => props.setHighlightIndex(i)}
      onMouseLeave={() => props.setHighlightIndex()}
      onClick={() => props.onClick && props.onClick(i)}
    >
      {props.wordPaths[i][0]}
    </li>);
  }
  return (<fieldset style={props.style}>
    <legend>{props.label}</legend>
    <ol>{elements}</ol>
  </fieldset>);
}

export default WordList;
