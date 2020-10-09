/* eslint-disable no-use-before-define */

export type RecoilStore = Record<string, Record<string, CoreRecoilValue<any>>>;

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
    newValue: T
  ) => void;
};

export type RecoilValue<T> = Atom<T> | Selector<T>;

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

/**
 * Core functions require to pass the recoil id
 */
export type CoreGetRecoilValue = <T>(
  recoilId: string,
  recoilValue: RecoilValue<T>
) => T;
export type CoreGetAtomValue = <T>(recoilId: string, recoilValue: Atom<T>) => T;
export type CoreSetRecoilValue = <T>(
  recoilId: string,
  recoilValue: RecoilValue<T>,
  value: T
) => void;
export type CoreSetRecoilState = <T>(
  recoilId: string,
  recoilValue: RecoilValue<T>,
  value: T
) => void;

/**
 * Recoil id-free functions
 */
export type GetRecoilValue = <T>(recoilValue: RecoilValue<T>) => T;
export type SetRecoilValue = <T>(recoilValue: RecoilValue<T>, value: T) => void;

/**
 * Distinguish Atoms from Selectors
 */
export const isAtom = (
  recoilValue: RecoilValue<any>
): recoilValue is Atom<any> => {
  return Object.keys(recoilValue).includes("default");
};
