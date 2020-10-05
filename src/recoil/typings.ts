/* eslint-disable no-use-before-define */

export type RecoilStore = Record<string, Record<string, RecoilValue<any>>>;

export type AtomOptions<T> = { key: string; default: T };

export type SelectorOptions<T> = {
  key: string;
  get: ({ get }: { get: PreflightGetRecoilValue }) => T;
  set?: (
    {
      get,
      set
    }: {
      get: PreflightGetRecoilValue;
      set: PreflightSetRecoilValue;
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

export type GetRecoilValue = <T>(
  recoilId: string,
  options: RecoilValueOptions<T>
) => T;
export type GetAtomValue = <T>(recoilId: string, options: AtomOptions<T>) => T;
export type SetRecoilValue = <T>(
  recoilId: string,
  options: RecoilValueOptions<T>,
  value: T
) => void;
export type SetRecoilState = <T>(
  recoilId: string,
  options: RecoilValueOptions<T>,
  value: T
) => void;

/**
 * Preflight functions do not require to pass the recoil id
 */

export type PreflightGetRecoilValue = <T>(options: RecoilValueOptions<T>) => T;
export type PreflightSetRecoilValue = <T>(
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
