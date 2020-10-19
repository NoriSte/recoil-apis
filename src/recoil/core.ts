/* eslint-disable @typescript-eslint/no-use-before-define */

import {
  Atom,
  isAtom,
  Selector,
  Subscriber,
  RecoilValue,
  RecoilStores
} from "./typings";

// --------------------------------------------------
// GETTERS
// --------------------------------------------------

/**
 * Get the current Recoil Atom' value
 */
const coreGetAtomValue = <T>(recoilId: string, atom: Atom<T>): T => {
  const coreRecoilValue = getRecoilStore(recoilId)[atom.key];

  // TS-related error, it can't happen at runtime
  if (coreRecoilValue.type !== "atom") {
    throw new Error(`${coreRecoilValue.key} is not an atom`);
  }

  return (coreRecoilValue.value as any) as T;
};

/**
 * Get the current Recoil Selector' value
 */
const coreGetSelectorValue = <T>(recoilId: string, selector: Selector<T>): T =>
  selector.get({ get: createPublicGetRecoilValue(recoilId) });

/**
 *  Get the current Recoil Value' value
 * @private
 */
export const coreGetRecoilValue = <T>(
  recoilId: string,
  recoilValue: RecoilValue<T>
): T =>
  isAtom(recoilValue)
    ? coreGetAtomValue(recoilId, recoilValue)
    : coreGetSelectorValue(recoilId, recoilValue);

/**
 * Create a function that get the current Recoil Value' value
 * @private
 */
export const createPublicGetRecoilValue = <T>(recoilId: string) => (
  recoilValue: RecoilValue<T>
): T => coreGetRecoilValue(recoilId, recoilValue);

// --------------------------------------------------
// SETTERS
// --------------------------------------------------

/**
 * Create a function that sets the Recoil Atom and notify the subscribers without passing the recoil id
 * @private
 */
export const createPublicSetAtomValue = <T>(
  recoilId: string,
  recoilValue: RecoilValue<T>
) => (nextValue: T) => coreSetAtomValue(recoilId, recoilValue, nextValue);

/**
 * Set the Recoil Atom and notify the subscribers without passing the recoil id
 */
const coreSetAtomValue = <T>(
  recoilId: string,
  recoilValue: RecoilValue<T>,
  nextValue: T
) => {
  const coreRecoilValue = getRecoilStore(recoilId)[recoilValue.key];

  if (coreRecoilValue.type !== "atom") {
    throw new Error(`${coreRecoilValue.key} is not an atom`);
  }

  if (nextValue !== coreRecoilValue.value) {
    coreRecoilValue.value = nextValue;
    coreRecoilValue.subscribers.forEach((callback) => callback());
  }
};

/**
 * Create a function that provide a Recoil Value setter
 * @private
 */
export const createPublicSetRecoilValue = <T>(recoilId: string) => (
  recoilValue: RecoilValue<T>,
  nextValue: T
) => coreSetRecoilValue(recoilId, recoilValue, nextValue);

/**
 * Provide a Recoil Value setter
 * @private
 */
const coreSetRecoilValue = <T>(
  recoilId: string,
  recoilValue: RecoilValue<T>,
  nextValue: T
) => {
  if (isAtom(recoilValue)) {
    coreSetAtomValue(recoilId, recoilValue, nextValue);
  } else if (recoilValue.set) {
    recoilValue.set(
      {
        get: createPublicGetRecoilValue(recoilId),
        set: createPublicSetRecoilValue(recoilId)
      },
      nextValue
    );
  }
};

// --------------------------------------------------
// REGISTRATION AND SUBCRIPTIONS
// --------------------------------------------------

/**
 * Register a new Recoil Value idempotently.
 * @private
 */
export const registerRecoilValue = <T>(
  recoilId: string,
  recoilValue: RecoilValue<T>
) => {
  const { key } = recoilValue;
  const recoilStore = getRecoilStore(recoilId);

  // the Recoil values must be registered at runtime because of the Recoil id
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
export const subscribeToRecoilValueUpdates = (
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

// --------------------------------------------------
// MULTIPLE RECOIL STORES MANAGEMENT
// --------------------------------------------------

/**
 * Different RecoilRoots have different stores
 */
const recoilStores: RecoilStores = {};
const getRecoilStore = (recoilId: string) => {
  recoilStores[recoilId] = recoilStores[recoilId] || {};
  return recoilStores[recoilId];
};

/**
 * Create a new, unique, Recoil id
 */
let currentRecoilId = 0;
export const generateRecoilId = () => {
  return (currentRecoilId++).toString();
};
