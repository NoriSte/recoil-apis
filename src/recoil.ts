import { useState, useEffect, useCallback } from "react";

// APIs

type AtomOptions<T> = { key: string; default: T };

export const atom = <T>(atomOptions: AtomOptions<T>) => {
  createRecoilValue(atomOptions);
  return atomOptions;
};

type SelectorOptions<T> = {
  key: string;

  get: ({ get }: { get: GetRecoilValue }) => T;

  /*
  set?: (
    {get,set}:{
      get: GetRecoilValue,
      set: SetRecoilState,
    },
    newValue: T,
  ) => void,
  */
};
export const selector = <T>(s: SelectorOptions<T>) => {
  createRecoilValue(s);
  return s;
};

export const useRecoilState = <T>(atom: AtomOptions<T>) => {
  const [, forceRefresh] = useState({});
  const atomCallback = useCallback(() => {
    forceRefresh({});
  }, [forceRefresh]);

  useEffect(() => {
    return subscribeToRecoilValue(atom, atomCallback);
  }, [atom, atomCallback]);

  return [getRecoilValue(atom), setAtomValue(atom)];
};

export const useRecoilValue = <T>(atom: AtomOptions<T>) => {
  const [, forceRefresh] = useState({});
  const atomCallback = useCallback(() => {
    forceRefresh({});
  }, [forceRefresh]);

  useEffect(() => {
    return subscribeToRecoilValue(atom, atomCallback);
  }, [atom, atomCallback]);

  return getRecoilValue(atom);
};

// core

type RecoilValues = Record<string, RecoilValue>;
type RecoilValue<T = any> = {
  key: string;
  default: T;
  value: T;
  subscribers: RecoilValueSubscriber<T>[];
};
type RecoilValueSubscriber<T> = () => void;

const recoilValues: RecoilValues = {};
const createRecoilValue = <T>(options: AtomOptions<T> | Selector<T>) => {
  const key = options.key;
  if (recoilValues[key]) {
    throw new Error(`Recoil value ${options.key} already exists`);
  }

  recoilValues[key] = {
    key,
    default: options.default,
    value: options.default,
    subscribers: []
  };
};

const subscribeToRecoilValue = <T>(
  options: AtomOptions<T>,
  callback: RecoilValueSubscriber<T>
) => {
  const recoilValue = recoilValues[options.key];
  if (recoilValue.subscribers.indexOf(callback) !== -1) {
    console.log("Already subscribed to Recoil value");
    return;
  }

  recoilValue.subscribers.push(callback);
  return () => {
    recoilValue.subscribers.splice(
      recoilValue.subscribers.indexOf(callback),
      1
    );
  };
};

type GetRecoilValue = <T>(options: AtomOptions<T>) => T;
const getRecoilValue: GetRecoilValue = <T>(options: AtomOptions<T>): T =>
  recoilValues[options.key].value;

type SetRecoilValue = <T>(options: AtomOptions<T>) => (value: T) => void;
type SetRecoilState = <T>(options: AtomOptions<T>, value: T) => T;
const setAtomValue: SetRecoilValue = <T>(options: AtomOptions<T>) => (
  value: T
) => {
  const recoilValue = recoilValues[options.key];
  recoilValue.value = value;
  recoilValue.subscribers.forEach((callback) => callback());
};
