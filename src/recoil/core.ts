import {
  RecoilValue,
  RecoilValueOptions,
  RecoilValueSubscriber,
  GetRecoilValue,
  SetRecoilValue,
  isAtomOptions,
  GetAtomValue,
  AtomOptions
} from "./typings";

const recoilValues: Record<string, RecoilValue> = {};

/**
 * @private
 */
export const createRecoilValue = <T>(options: RecoilValueOptions<T>) => {
  const key = options.key;
  if (recoilValues[key]) {
    throw new Error(`Recoil value ${options.key} already exists`);
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
 * @private
 */
export const subscribeToRecoilValue = <T>(
  key: string,
  callback: RecoilValueSubscriber<T>
) => {
  const recoilValue = recoilValues[key];
  if (recoilValue.subscribers.indexOf(callback) !== -1) {
    console.log("Already subscribed to Recoil value");
    return;
  }

  recoilValue.subscribers.push(callback);
  return () => {
    recoilValue.subscribers.splice(
      recoilValue.subscribers.indexOf(callback),
      1
    );
  };
};

/**
 * @private
 */
export const getRecoilValue: GetRecoilValue = <T>(
  options: RecoilValueOptions<T>
): T => {
  if (isAtomOptions(options)) {
    return getAtomValue(options);
  } else {
    return options.get({ get: getRecoilValue });
  }
};

/**
 * @private
 */
export const getAtomValue: GetAtomValue = <T>(options: AtomOptions<T>): T => {
  return recoilValues[options.key].value;
};

/**
 * @private
 */
export const setAtomValue: SetRecoilValue = <T>(
  options: RecoilValueOptions<T>
) => (value: T) => {
  const recoilValue = recoilValues[options.key];

  if (recoilValue.type === "atom") {
    recoilValue.value = value;
    recoilValue.subscribers.forEach((callback) => callback());
  } else {
    // TODO:
    console.log("Selector set not implemented yet");
  }
};
