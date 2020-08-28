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

/**
 * Different RecoilRoots have different stores
 */
const recoilStores: Record<string, Record<string, RecoilValue>> = {};
const getRecoilValues = (recoilId: string) => {
  recoilStores[recoilId] = recoilStores[recoilId] || {};
  return recoilStores[recoilId];
};

/**
 * Creates a new, unique, Recoil id
 */
let lastRecoilId = 0;
export const generateRecoilId = () => {
  return (lastRecoilId++).toString();
};

/**
 * Register a new Recoil Value.
 * @private
 */
export const registerRecoilValue = <T>(
  recoilId: string,
  options: RecoilValueOptions<T>
) => {
  const key = options.key;
  console.log(recoilId);
  const recoilValues = getRecoilValues(recoilId);

  if (recoilValues[key]) {
    return;
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
  recoilId: string,
  key: string,
  callback: RecoilValueSubscriber
) => {
  const recoilValues = getRecoilValues(recoilId);
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
  recoilId: string,
  options: RecoilValueOptions<T>
): T => {
  return isAtomOptions(options)
    ? getAtomValueHoc(recoilId)(options)
    : getSelectorValue(options);
};

/**
 * Get the current Recoil Value' value
 * @private
 */
export const getRecoilValueHoc = <T>(recoilId: string) => (
  options: RecoilValueOptions<T>
): T => {
  return isAtomOptions(options) ? getAtomValueHoc(recoilId) : getSelectorValue;
};

/**
 * Get the current Recoil Atom' value
 * @private
 */
export const getAtomValueHoc = <T>(recoilId: string) => (
  options: AtomOptions<T>
): T => {
  registerRecoilValue(recoilId, options);
  const recoilValues = getRecoilValues(recoilId);
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
  recoilId: string,
  options: RecoilValueOptions<T>
) => (value: T) => {
  const recoilValues = getRecoilValues(recoilId);
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
export const setRecoilValue = <T>(
  recoilId: string,
  options: RecoilValueOptions<T>,
  value: T
) => {
  if (isAtomOptions(options)) {
    setAtomValue<T>(recoilId, options)(value);
  } else {
    setRecoilValue(recoilId, options, value);
  }
};
