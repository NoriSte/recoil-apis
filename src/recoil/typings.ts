export type AtomOptions<T extends any = any> = { key: string; default: T };

export type SelectorOptions<T extends any = any> = {
  key: string;
  get: ({ get }: { get: GetRecoilValue }) => T;
  set?: (
    {
      get,
      set
    }: {
      get: GetRecoilValue;
      set: SetRecoilState;
    },
    newValue: T
  ) => void;
};

export const isAtomOptions = (options: any): options is AtomOptions<any> => {
  const atomOptions = options as AtomOptions<any>;
  return (
    typeof atomOptions.key === "string" &&
    Object.keys(options).includes("default")
  );
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
  options: RecoilValueOptions<T>
) => T;
export type GetAtomValue = <T extends any = any>(options: AtomOptions<T>) => T;
export type SetRecoilValue = <T extends any = any>(
  options: RecoilValueOptions<T>
) => (value: T) => void;
export type SetRecoilState = <T extends any = any>(
  options: RecoilValueOptions<T>,
  value: T
) => void;
