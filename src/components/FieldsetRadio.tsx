import type { JSX } from 'react';

interface FieldsetRadioProps<T> {
  name: string;
  title: string;
  list: [T, string][];
  value: T;
  setValue: (value: T) => void;
}

function FieldsetRadio<T>(props: FieldsetRadioProps<T>) {
  const elements: JSX.Element[] = [];
  for (const [value, title] of props.list) {
    elements.push(<label>
      <input
        type='radio'
        name={props.name}
        checked={props.value === value}
        onChange={() => props.setValue(value)}
      />
      <p>{title}</p>
    </label>);
  }
  return (<fieldset style={{height: 'auto'}}>
    <legend>{props.title}</legend>
    {elements}
  </fieldset>);
}

export default FieldsetRadio;
