// types
import { ChangeEvent } from "react";

import * as React from "react";
import "./styles.css";

import { useEffect } from "react";

import { atom, selector, useRecoilState, useRecoilValue } from "./recoil";

export default function App() {
  return (
    <div className="App">
      <h1>TODO: explanation</h1>
      <CharacterCounter />
      <TextInput2 />
      <CharacterCount />
      <CharCountStateForTwo />
      <Texts />
    </div>
  );
}

// atom

// all the code comes from Recoil' Getting Started giude https://recoiljs.org/docs/introduction/getting-started
const textState = atom<string>({
  key: "textState", // unique ID (with respect to other atoms/selectors)
  default: "" // default value (aka initial value)
});
const textState2 = atom<string>({
  key: "textState2", // unique ID (with respect to other atoms/selectors)
  default: "" // default value (aka initial value)
});

function CharacterCounter() {
  return (
    <div>
      <TextInput />
      <EchoInput />
    </div>
  );
}

function TextInput() {
  const [text, setText] = useRecoilState(textState);

  useEffect(() => {
    console.log("Render: TextInput");
  });
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  return (
    <div>
      <input type="text" value={text} onChange={onChange} />
    </div>
  );
}

function EchoInput() {
  const text = useRecoilValue(textState);

  useEffect(() => {
    console.log("Render: EchoInput");
  });

  return <div>Echo: {text}</div>;
}

function TextInput2() {
  const [text, setText] = useRecoilState(textState2);
  useEffect(() => {
    console.log("Render: TextInput2");
  });
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

const charCountState = selector({
  key: "charCountState", // unique ID (with respect to other atoms/selectors)
  get: ({ get }) => {
    const text = get(textState);
    return text.length;
  }
});
const charCountStateForTwo = selector({
  key: "charCountStateForTwo", // unique ID (with respect to other atoms/selectors)
  get: ({ get }) => {
    const length = get(charCountState);
    return length * 2;
  }
});

const textsState = selector({
  key: "textsState", // unique ID (with respect to other atoms/selectors)
  get: ({ get }) => {
    return `${get(textState)}-${get(textState2)}`;
  }
});

function CharacterCount() {
  const count = useRecoilValue(charCountState);

  useEffect(() => {
    console.log("Render: CharacterCount");
  });
  return <div>Character Count: {count}</div>;
}

function CharCountStateForTwo() {
  const count = useRecoilValue(charCountStateForTwo);

  useEffect(() => {
    console.log("Render: CharCountStateForTwo");
  });
  return <div>Character Count * 2: {count}</div>;
}

function Texts() {
  const texts = useRecoilValue(textsState);

  useEffect(() => {
    console.log("Render: Texts");
  });
  return <div>Texts: {texts}</div>;
}
