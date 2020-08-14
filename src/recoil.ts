import { useState } from "react";

type Atom<T extends any> = { key: string; default: T };

export const atom = <T extends any>(a: Atom<T>): Atom<T> => {
  // TODO:
  return a;
};

export const selector = () => {
  // TODO:
};

export const useRecoilState = <T extends any>(
  a: Atom<T>
): [T, (value: T) => void] => {
  const [value, setValue] = useState(a.default);
  return [value, setValue];
};

export const useRecoilValue = <T extends any>(a: Atom<T>) => {};
