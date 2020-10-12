/* eslint-disable no-use-before-define */

// ----------------------------------------------
// Exposed types
// ----------------------------------------------

export type Atom<T> = { key: string; default: T };

export type Selector<T> = {
  key: string;
  get: ({ get }: { get: GetRecoilValue }) => T;
  set?: (
    {
      get,
      set
    }: {
      get: GetRecoilValue;
      set: SetRecoilValue;
    },
    nextValue: T
  ) => void;
};

export type RecoilValue<T> = Atom<T> | Selector<T>;

/**
 * Recoil id-free functions
 */
type GetRecoilValue = <T>(recoilValue: RecoilValue<T>) => T;
type SetRecoilValue = <T>(recoilValue: RecoilValue<T>, nextValue: T) => void;

/**
 * Distinguish Atoms from Selectors
 */
export const isAtom = (
  recoilValue: RecoilValue<any>
): recoilValue is Atom<any> => {
  return Object.keys(recoilValue).includes("default");
};

// ----------------------------------------------
// Core types
// ----------------------------------------------

export type RecoilStores = Record<
  string,
  Record<string, CoreRecoilValue<unknown>>
>;

/*
 * The internally stored Recoil values
 * @private
 */
export type CoreRecoilValue<T> = {
  key: string;
  subscribers: Subscriber[];
} & (
  | {
      type: "atom";
      default: T;
      value: T;
    }
  | {
      type: "selector";
    }
);

export type Subscriber = () => void;
