import {
  RecoilStore,
  AtomOptions,
  GetRecoilValue,
  isAtomOptions,
  SetRecoilValue,
  SelectorOptions,
  RecoilValueOptions,
  RecoilValueSubscriber,
  createRecoilIdFreeFunction
} from "./typings";

/**
 * Different RecoilRoots have different stores
 */
const recoilStores: RecoilStore = {};
const getRecoilStore = (recoilId: string) => {
  recoilStores[recoilId] = recoilStores[recoilId] || {};
  return recoilStores[recoilId];
};

/**
 * Create a new, unique, Recoil id
 */
let lastRecoilId = 0;
export const generateRecoilId = () => {
  return (lastRecoilId++).toString();
};

/**
 * Register a new Recoil Value, it is idempotent.
 * @private
 */
export const registerRecoilValue = <T>(
  recoilId: string,
  options: RecoilValueOptions<T>
) => {
  const { key } = options;
  const recoilStore = getRecoilStore(recoilId);

  if (recoilStore[key]) {
    return;
  }

  if (isAtomOptions(options)) {
    recoilStore[key] = {
      type: "atom",
      key,
      default: options.default,
      value: options.default,
      subscribers: []
    };
  } else {
    recoilStore[key] = {
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
export const subscribeToRecoilValue = (
  recoilId: string,
  key: string,
  callback: RecoilValueSubscriber
) => {
  const recoilValue = getRecoilStore(recoilId)[key];
  const { subscribers } = recoilValue;

  if (subscribers.includes(callback)) {
    throw new Error("Already subscribed to Recoil Value");
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
): T =>
  isAtomOptions(options)
    ? getAtomValue(recoilId, options)
    : getSelectorValue(recoilId, options);

/**
 * Create a function that gets the current Recoil Value' value without passing the recoil id
 * @private
 */
export const createRecoilIdFreeGetRecoilValue = (recoilId: string) =>
  createRecoilIdFreeFunction(recoilId, getRecoilValue);

/**
 * Get the current Recoil Atom' value
 * @private
 */
export const getAtomValue = <T>(
  recoilId: string,
  options: AtomOptions<T>
): T => {
  registerRecoilValue(recoilId, options);
  const recoilValue = getRecoilStore(recoilId)[options.key];

  if (recoilValue.type !== "atom") {
    throw new Error(`${recoilValue.key} is not an atom`);
  }

  return recoilValue.value;
};

/**
 * Get the current Recoil Selector' value
 * @private
 */
export const getSelectorValue = <T>(
  recoilId: string,
  options: SelectorOptions<T>
): T =>
  options.get({ get: createRecoilIdFreeFunction(recoilId, getRecoilValue) });

/**
 * Create a function thet Get the current Recoil Selector' value without passing the recoil id
 * @private
 */
export const getPreflightGetSelectorValue = <T>(recoilId: string) => (
  options: SelectorOptions<T>
): T =>
  options.get({ get: createRecoilIdFreeFunction(recoilId, getRecoilValue) });

/**
 * Create a function that sets the Recoil Atom and notify the subscribers without passing the recoil id
 * @private
 */
export const getPreflightSetAtomValue: SetRecoilValue = <T>(
  recoilId: string,
  options: RecoilValueOptions<T>
) => (value: T) => {
  const recoilValue = getRecoilStore(recoilId)[options.key];

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
    getPreflightSetAtomValue<T>(recoilId, options)(value);
  } else {
    setRecoilValue(recoilId, options, value);
  }
};

/**
 * Create a function that sets a Recoil' value without passing the recoil id
 * @private
 */
export const createRecoilIdFreeSetRecoilValue = (recoilId: string) =>
  createRecoilIdFreeFunction(recoilId, setRecoilValue);
