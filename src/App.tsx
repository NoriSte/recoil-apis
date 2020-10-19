/* eslint-disable no-use-before-define */

// types
import { ChangeEvent } from "react";

import * as React from "react";
import "./styles.css";

import { useEffect, useCallback, useState } from "react";
import { atom, selector, useRecoilState, useRecoilValue } from "./recoil";

const logRender = (componentName: string) =>
  console.log(`Render: ${componentName}`);

export default function App() {
  return (
    <div className="App">
      <h1>Re-implementing basic Recoil v0.11 API</h1>
      <h3>Check out the README</h3>
      <TextInput1 />
      <EchoInput />
      <br />
      <TextInput2AndEcho />
      <br />
      <TextState1CharacterCount />
      <TextState1CharCountStateByTwo />
      <br />
      <Texts />
      <br />
      <SetBothTexts />
    </div>
  );
}

// atom

// all the code comes from Recoil' Getting Started guide https://recoiljs.org/docs/introduction/getting-started
const textState1 = atom({
  key: "textState1",
  default: ""
});
const textState2 = atom({
  key: "textState2",
  default: ""
});

function TextInput1() {
  const [text, setText] = useRecoilState(textState1);

  useEffect(() => logRender("TextInput"));
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  return (
    <input
      type="text"
      value={text}
      onChange={onChange}
      placeholder="textState1"
    />
  );
}

function EchoInput() {
  const text = useRecoilValue(textState1);
  useEffect(() => logRender("EchoInput"));
  return <div>Echoing textState1: {text}</div>;
}

function TextInput2AndEcho() {
  const [text, setText] = useRecoilState(textState2);
  useEffect(() => logRender("TextInput2"));

  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
  };

  return (
    <div>
      <input
        type="text"
        value={text}
        onChange={onChange}
        placeholder="textState2"
      />
      <br />
      Echoing textState2: {text}
    </div>
  );
}

// selector

const charCountState = selector({
  key: "charCountState",
  get: ({ get }) => {
    const text = get(textState1);
    return text.length;
  }
});
const charCountStateByTwo = selector({
  key: "charCountStateByTwo",
  get: ({ get }) => {
    const length = get(charCountState);
    return length * 2;
  }
});

const bothTextsState = selector({
  key: "bothTextsState",
  get: ({ get }) => {
    return `${get(textState1)}-${get(textState2)}`;
  },
  set: ({ get, set }, nextValue: string) => {
    if (!nextValue.includes("-")) return;
    const strings = nextValue.split("-");
    if (strings.length !== 2) return;
    const [nextValue1, nextValue2] = strings;

    // useless, just to consume the `get` function
    get(textState1);
    get(textState2);

    set(textState1, nextValue1);
    set(textState2, nextValue2);
  }
});

function TextState1CharacterCount() {
  const count = useRecoilValue(charCountState);
  useEffect(() => logRender("TextState1CharacterCount"));
  return <div>textState1 contains {count} characters</div>;
}

function TextState1CharCountStateByTwo() {
  const count = useRecoilValue(charCountStateByTwo);
  useEffect(() => logRender("TextState1CharCountStateByTwo"));
  return <div>textState1 contains {count} characters (multiplied for two)</div>;
}

function Texts() {
  const texts = useRecoilValue(bothTextsState);
  useEffect(() => logRender("Texts"));
  return <div>Both texts, splitted by a dash: {texts}</div>;
}

function SetBothTexts() {
  const [, setTexts] = useRecoilState(bothTextsState);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => logRender("SetTexts"));
  const onChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleOnClick = useCallback(() => {
    setTexts(inputValue);
  }, [setTexts, inputValue]);

  return (
    <div>
      Set both the texts at once, split them with a dash
      <br />
      <input
        type="text"
        value={inputValue}
        onChange={onChange}
        placeholder="setTexts"
      />
      <button onClick={handleOnClick}>Set both texts</button>
    </div>
  );
}
