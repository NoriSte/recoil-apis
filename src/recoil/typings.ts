/* eslint-disable no-use-before-define */

export type RecoilStore = Record<string, Record<string, RecoilValue<any>>>;

export type AtomOptions<T> = { key: string; default: T };

export type SelectorOptions<T> = {
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

export type RecoilValueOptions<T> = AtomOptions<T> | SelectorOptions<T>;

export type RecoilValue<T> = {
  key: string;
  subscribers: RecoilValueSubscriber[];
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

export type RecoilValueSubscriber = () => void;

/**
 * Core functions require to pass the recoil id
 */
export type CoreGetRecoilValue = <T>(
  recoilId: string,
  options: RecoilValueOptions<T>
) => T;
export type CoreGetAtomValue = <T>(
  recoilId: string,
  options: AtomOptions<T>
) => T;
export type CoreSetRecoilValue = <T>(
  recoilId: string,
  options: RecoilValueOptions<T>,
  value: T
) => void;
export type CoreSetRecoilState = <T>(
  recoilId: string,
  options: RecoilValueOptions<T>,
  value: T
) => void;

/**
 * Recoil id-free functions
 */
export type GetRecoilValue = <T>(options: RecoilValueOptions<T>) => T;
export type SetRecoilValue = <T>(
  options: RecoilValueOptions<T>,
  value: T
) => void;

/**
 * Distinguish Atom options from Selector options
 */
export const isAtomOptions = (
  options: RecoilValueOptions<any>
): options is AtomOptions<any> => {
  return Object.keys(options).includes("default");
};
