import { useState, useEffect, useCallback } from "react";

// APIs

type Atom<T extends any> = { key: string; default: T };

export const atom = <T extends any>(a: Atom<T>): Atom<T> => {
  createAtom(a);
  return a;
};

export const selector = () => {
  // TODO:
};

export const useRecoilState = <T extends any>(
  atom: Atom<T>
): [T, (value: T) => void] => {
  const [, forceRefresh] = useState({});
  const atomCallback = useCallback(() => {
    forceRefresh({});
  }, [forceRefresh]);

  useEffect(() => {
    return subscribeToAtom(atom, atomCallback);
  }, [atom, atomCallback]);

  return [getAtomValue(atom), setAtomValue(atom)];
};

export const useRecoilValue = <T extends any>(atom: Atom<T>): T => {
  const [, forceRefresh] = useState({});
  const atomCallback = useCallback(() => {
    forceRefresh({});
  }, [forceRefresh]);

  useEffect(() => {
    return subscribeToAtom(atom, atomCallback);
  }, [atom, atomCallback]);

  return getAtomValue(atom);
};

// core

type Atoms = Record<string, CoreAtom>;
type CoreAtom<T extends any = any> = {
  key: string;
  default: T;
  value: T;
  subscribers: any[]; // TODO: add types
};

const atoms: Atoms = {};
const createAtom = <T extends any>(atom: Atom<T>) => {
  const key = atom.key;
  if (atoms[key]) {
    throw new Error(`Atom ${atom.key} already exists`);
  }

  atoms[key] = {
    key,
    default: atom.default,
    value: atom.default,
    subscribers: []
  };
};

const subscribeToAtom = <T extends any>(
  atom: Atom<T>,
  callback: any /* TODO */
) => {
  const coreAtom = atoms[atom.key];
  if (coreAtom.subscribers.indexOf(callback) !== -1) return;

  coreAtom.subscribers.push(callback);
  return () => {
    coreAtom.subscribers.splice(coreAtom.subscribers.indexOf(callback), 1);
  };
};

const setAtomValue = <T extends any>(atom: Atom<T>) => (value: T) => {
  const coreAtom = atoms[atom.key];
  coreAtom.value = value;
  coreAtom.subscribers.forEach((callback) => callback());
};

const getAtomValue = <T extends any>(atom: Atom<T>): T => {
  return atoms[atom.key].value;
};
