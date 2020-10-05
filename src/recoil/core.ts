import {
  RecoilStore,
  AtomOptions,
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
): T => coreGetRecoilValue(recoilId, options);
/**
 * Create a function that get the current Recoil Value' value
 * @private
 */
export const createPreflightGetRecoilValue = <T>(recoilId: string) => (
  options: RecoilValueOptions<T>
): T => coreGetRecoilValue(recoilId, options);
/**
 * Get the current Recoil Value' value
 * @private
 */
const coreGetRecoilValue: GetRecoilValue = <T>(
  recoilId: string,
  options: RecoilValueOptions<T>
): T =>
  isAtomOptions(options)
    ? getAtomValue(recoilId, options)
    : getSelectorValue(recoilId, options);

/**
 * Get the current Recoil Atom' value
 * @private
 */
export const getAtomValue = <T>(recoilId: string, options: AtomOptions<T>): T =>
  coreGetAtomValue(recoilId, options);
/**
 * Create a function that get the current Recoil Atom' value
 * @private
 */
export const createPreflightGetAtomValue = <T>(recoilId: string) => (
  options: RecoilValueOptions<T>
): T => coreGetAtomValue(recoilId, options);
/**
 * Get the current Recoil Atom' value
 * @private
 */
const coreGetAtomValue = <T>(
  recoilId: string,
  options: RecoilValueOptions<T>
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
): T => options.get({ get: createPreflightGetRecoilValue(recoilId) });

/**
 * Create a function that sets the Recoil Atom and notify the subscribers without passing the recoil id
 * @private
 */
export const createPreflightSetAtomValue = <T>(
  recoilId: string,
  options: RecoilValueOptions<T>
) => (value: T) => coreSetAtomValue(recoilId, options, value);
/**
 * Set the Recoil Atom and notify the subscribers without passing the recoil id
 * @private
 */
const coreSetAtomValue: SetRecoilValue = <T>(
  recoilId: string,
  options: RecoilValueOptions<T>,
  value: T
) => {
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
) => coreSetRecoilValue(recoilId, options, value);

/**
 * Create a function that provide a Recoil Value setter
 * @private
 */
export const createPreflightSetRecoilValue = <T>(recoilId: string) => (
  options: RecoilValueOptions<T>,
  value: T
) => coreSetRecoilValue(recoilId, options, value);
/**
 * Provide a Recoil Value setter
 * @private
 */
const coreSetRecoilValue = <T>(
  recoilId: string,
  options: RecoilValueOptions<T>,
  value: T
) => {
  if (isAtomOptions(options)) {
    createPreflightSetAtomValue<T>(recoilId, options)(value);
  } else {
    setRecoilValue(recoilId, options, value);
  }
};
