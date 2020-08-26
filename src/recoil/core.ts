import {
  RecoilValue,
  AtomOptions,
  GetAtomValue,
  GetRecoilValue,
  isAtomOptions,
  SetRecoilValue,
  SelectorOptions,
  RecoilValueOptions,
  RecoilValueSubscriber
} from "./typings";

const recoilValues: Record<string, RecoilValue> = {};

/**
 * Register a new Recoil Value.
 * @private
 */
export const createRecoilValue = <T>(options: RecoilValueOptions<T>) => {
  const key = options.key;
  if (recoilValues[key]) {
    throw new Error(`Recoil Value ${options.key} already exists`);
  }

  if (isAtomOptions(options)) {
    recoilValues[key] = {
      type: "atom",
      key,
      default: options.default,
      value: options.default,
      subscribers: []
    };
  } else {
    recoilValues[key] = {
      type: "selector",
      key,
      subscribers: []
    };
  }
};

/**
 * Subscribe to all the updates of a Recoil Value.
 * @private
 */
export const subscribeToRecoilValue = <T>(
  key: string,
  callback: RecoilValueSubscriber
) => {
  const recoilValue = recoilValues[key];
  const { subscribers } = recoilValue;
  if (subscribers.indexOf(callback) !== -1) {
    console.log("Already subscribed to Recoil Value");
    return;
  }

  subscribers.push(callback);

  const unsubscribe = () => {
    subscribers.splice(subscribers.indexOf(callback), 1);
  };

  return unsubscribe;
};

/**
 * Get the current Recoil Value' value
 * @private
 */
export const getRecoilValue: GetRecoilValue = <T>(
  options: RecoilValueOptions<T>
): T =>
  isAtomOptions(options) ? getAtomValue(options) : getSelectorValue(options);

/**
 * Get the current Recoil Atom' value
 * @private
 */
export const getAtomValue: GetAtomValue = <T>(options: AtomOptions<T>): T => {
  const recoilValue = recoilValues[options.key];
  if (recoilValue.type !== "atom") {
    throw new Error(`${recoilValue.key} is not an atom`);
  }

  return recoilValue.value;
};

/**
 * Get the current Recoil Selector' value
 * @private
 */
export const getSelectorValue = <T>(options: SelectorOptions<T>): T =>
  options.get({ get: getRecoilValue });

/**
 * Set the Recoil Atom and notify the subscribers
 * @private
 */
export const setAtomValue: SetRecoilValue = <T>(
  options: RecoilValueOptions<T>
) => (value: T) => {
  const recoilValue = recoilValues[options.key];

  if (recoilValue.type !== "atom") {
    throw new Error(`${recoilValue.key} is not an atom`);
  }

  if (value === recoilValue.value) {
    return;
  }

  recoilValue.value = value;
  recoilValue.subscribers.forEach((callback) => callback());
};

/**
 * Provide a Recoil Value setter
 * @private
 */
export const setRecoilValue = <T>(options: RecoilValueOptions<T>, value: T) => {
  if (isAtomOptions(options)) {
    setAtomValue<T>(options)(value);
  } else {
    setRecoilValue(options, value);
  }
};
