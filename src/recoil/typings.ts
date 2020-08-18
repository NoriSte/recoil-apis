export type AtomOptions<T> = { key: string; default: T };

export type SelectorOptions<T> = {
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

export const isAtomOptions = (options: any): options is AtomOptions<any> => {
  const atomOptions = options as AtomOptions<any>;
  return (
    typeof atomOptions.key === "string" &&
    Object.keys(options).includes("default")
  );
};

export type RecoilValueOptions<T> = AtomOptions<T> | SelectorOptions<T>;

export type RecoilValue<T = any> = {
  key: string;
  subscribers: RecoilValueSubscriber<T>[];
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

export type RecoilValueSubscriber<T> = () => void;

export type GetRecoilValue = <T>(options: RecoilValueOptions<T>) => T;
export type GetAtomValue = <T>(options: AtomOptions<T>) => T;
export type SetRecoilValue = <T>(
  options: RecoilValueOptions<T>
) => (value: T) => void;
export type SetRecoilState = <T>(options: RecoilValueOptions<T>, value: T) => T;
