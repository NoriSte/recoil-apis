import {
  Atom,
  isAtom,
  Selector,
  Subscriber,
  RecoilValue,
  RecoilStore,
  CoreGetRecoilValue,
  CoreSetRecoilValue
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
 * Register a new Recoil Value, it' i's idempotent.
 * @private
 */
export const registerRecoilValue = <T>(
  recoilId: string,
  recoilValue: RecoilValue<T>
) => {
  const { key } = recoilValue;
  const recoilStore = getRecoilStore(recoilId);

  if (recoilStore[key]) {
    return;
  }

  if (isAtom(recoilValue)) {
    recoilStore[key] = {
      type: "atom",
      key,
      default: recoilValue.default,
      value: recoilValue.default,
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
  callback: Subscriber
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
export const getRecoilValue: CoreGetRecoilValue = <T>(
  recoilId: string,
  recoilValue: RecoilValue<T>
): T => coreGetRecoilValue(recoilId, recoilValue);
/**
 * Create a function that get the current Recoil Value' value
 * @private
 */
export const createPreflightGetRecoilValue = <T>(recoilId: string) => (
  recoilValue: RecoilValue<T>
): T => coreGetRecoilValue(recoilId, recoilValue);
/**
 * Get the current Recoil Value' value
 * @private
 */
const coreGetRecoilValue: CoreGetRecoilValue = <T>(
  recoilId: string,
  recoilValue: RecoilValue<T>
): T =>
  isAtom(recoilValue)
    ? getAtomValue(recoilId, recoilValue)
    : getSelectorValue(recoilId, recoilValue);

/**
 * Get the current Recoil Atom' value
 * @private
 */
export const getAtomValue = <T>(recoilId: string, recoilAtom: Atom<T>): T =>
  coreGetAtomValue(recoilId, recoilAtom);
/**
 * Create a function that get the current Recoil Atom' value
 * @private
 */
export const createPreflightGetAtomValue = <T>(recoilId: string) => (
  recoilValue: RecoilValue<T>
): T => coreGetAtomValue(recoilId, recoilValue);
/**
 * Get the current Recoil Atom' value
 * @private
 */
const coreGetAtomValue = <T>(
  recoilId: string,
  recoilValue: RecoilValue<T>
): T => {
  registerRecoilValue(recoilId, recoilValue);
  const coreRecoilValue = getRecoilStore(recoilId)[recoilValue.key];

  if (coreRecoilValue.type !== "atom") {
    throw new Error(`${coreRecoilValue.key} is not an atom`);
  }

  return coreRecoilValue.value;
};

/**
 * Get the current Recoil Selector' value
 * @private
 */
export const getSelectorValue = <T>(
  recoilId: string,
  selector: Selector<T>
): T => selector.get({ get: createPreflightGetRecoilValue(recoilId) });

/**
 * Create a function that sets the Recoil Atom and notify the subscribers without passing the recoil id
 * @private
 */
export const createPreflightSetAtomValue = <T>(
  recoilId: string,
  recoilValue: RecoilValue<T>
) => (value: T) => coreSetAtomValue(recoilId, recoilValue, value);
/**
 * Set the Recoil Atom and notify the subscribers without passing the recoil id
 * @private
 */
const coreSetAtomValue: CoreSetRecoilValue = <T>(
  recoilId: string,
  recoilValue: RecoilValue<T>,
  value: T
) => {
  const coreRecoilValue = getRecoilStore(recoilId)[recoilValue.key];

  if (coreRecoilValue.type !== "atom") {
    throw new Error(`${coreRecoilValue.key} is not an atom`);
  }

  if (value !== coreRecoilValue.value) {
    coreRecoilValue.value = value;
    coreRecoilValue.subscribers.forEach((callback) => callback());
  }
};

/**
 * Provide a Recoil Value setter
 * @private
 */
export const setRecoilValue = <T>(
  recoilId: string,
  recoilValue: RecoilValue<T>,
  value: T
) => coreSetRecoilValue(recoilId, recoilValue, value);

/**
 * Create a function that provide a Recoil Value setter
 * @private
 */
export const createPreflightSetRecoilValue = <T>(recoilId: string) => (
  recoilValue: RecoilValue<T>,
  value: T
) => coreSetRecoilValue(recoilId, recoilValue, value);
/**
 * Provide a Recoil Value setter
 * @private
 */
const coreSetRecoilValue = <T>(
  recoilId: string,
  recoilValue: RecoilValue<T>,
  value: T
) => {
  if (isAtom(recoilValue)) {
    createPreflightSetAtomValue<T>(recoilId, recoilValue)(value);
  } else {
    setRecoilValue(recoilId, recoilValue, value);
  }
};
