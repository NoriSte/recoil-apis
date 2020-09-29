/* eslint-disable no-use-before-define */

export type RecoilStore = Record<string, Record<string, RecoilValue>>;

export type AtomOptions<T extends any = any> = { key: string; default: T };

export type SelectorOptions<T extends any = any> = {
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

export type RecoilValueOptions<T extends any = any> =
  | AtomOptions<T>
  | SelectorOptions<T>;

export type RecoilValue<T extends any = any> = {
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

export type GetRecoilValue = <T extends any = any>(
  recoilId: string,
  options: RecoilValueOptions<T>
) => T;
export type GetAtomValue = <T extends any = any>(
  recoilId: string,
  options: AtomOptions<T>
) => T;
export type SetRecoilValue = <T extends any = any>(
  recoilId: string,
  options: RecoilValueOptions<T>
) => (value: T) => void;
export type SetRecoilState = <T extends any = any>(
  recoilId: string,
  options: RecoilValueOptions<T>,
  value: T
) => void;

/**
 * Preflight functions do not require to pass the recoil id
 */
export type PreflightGetRecoilValue = <T extends any = any>(
  options: RecoilValueOptions<T>
) => T;
export type PreflightSetRecoilValue = <T extends any = any>(
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
