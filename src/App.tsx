// types
import { ChangeEvent } from "react";

import * as React from "react";
import "./styles.css";

import { atom, selector, useRecoilState, useRecoilValue } from "./recoil";

export default function App() {
  return (
    <div className="App">
      <h1>TODO: explanation</h1>
      <CharacterCounter />
    </div>
  );
}

// atom

// all the code comes from Recoil' Getting Started giude https://recoiljs.org/docs/introduction/getting-started
const textState = atom<string>({
  key: "textState", // unique ID (with respect to other atoms/selectors)
  default: "" // default value (aka initial value)
});

function CharacterCounter() {
  return (
    <div>
      <TextInput />
      {/* <CharacterCount /> */}
    </div>
  );
}

function TextInput() {
  const [text, setText] = useRecoilState(textState);

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  return (
    <div>
      <input type="text" value={text} onChange={onChange} />
      <br />
      Echo: {text}
    </div>
  );
}

// selector
/*
const charCountState = selector({
  key: "charCountState", // unique ID (with respect to other atoms/selectors)
  get: ({ get }) => {
    const text = get(textState);

    return text.length;
  }
});

function CharacterCount() {
  const count = useRecoilValue(charCountState);

  return <>Character Count: {count}</>;
}
*/
