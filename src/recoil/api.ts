import {
  AtomOptions,
  isAtomOptions,
  SelectorOptions,
  RecoilValueOptions,
  RecoilIdFreeFunction
} from "./typings";
import { useReducer, useEffect, useCallback, useContext } from "react";
import { RecoilContext } from "./RecoilRoot";
import {
  getRecoilValue,
  registerRecoilValue,
  subscribeToRecoilValue,
  getPreflightSetAtomValue,
  createRecoilIdFreeSetRecoilValue,
  createRecoilIdFreeGetRecoilValue
} from "./core";

/**
 * Register a new atom.
 * Please note: it does nothing for the sake of this exercise
 */
export const atom = <T extends any = any>(atomOptions: AtomOptions<T>) => {
  return atomOptions;
};

/**
 * Register a new selector.
 * Please note: it does nothing for the sake of this exercise
 */
export const selector = <T extends any = any>(
  selectorOptions: SelectorOptions<T>
) => {
  return selectorOptions;
};

/**
 * Subscribe to all the Recoil Values updates and return the current value.
 */
export const useRecoilValue = <T>(options: RecoilValueOptions<T>) => {
  const recoilId = useRecoilId();
  const [, forceRender] = useReducer((s) => s + 1, 0);
  const subscriptionCallback = useCallback(() => {
    forceRender();
  }, [forceRender]);

  // registering a Recoil value requires the recoil id (stored in a React Context), that's why it can't be registered outside a component/hook code
  registerRecoilValue(recoilId, options);

  useSubscribeToRecoilValues(options, subscriptionCallback);
  return getRecoilValue(recoilId, options);
};

/**
 * Subscribe to all the Recoil Values updates and return both the current value and a setter.
 */
export const useRecoilState = <T>(options: RecoilValueOptions<T>) => {
  const recoilId = useRecoilId();
  const currentValue = useRecoilValue(options);

  // registering a Recoil value requires the recoil id (stored in a React Context), that's why it can't be registered outside a component/hook code
  registerRecoilValue(recoilId, options);

  if (isAtomOptions(options)) {
    const setter = getPreflightSetAtomValue(recoilId, options);
    return [currentValue, setter] as const;
  } else {
    const setter = (newValue: T) => {
      if (options.set)
        options.set(
          {
            get: createRecoilIdFreeGetRecoilValue(recoilId),
            set: createRecoilIdFreeSetRecoilValue(recoilId)
          },
          newValue
        );
    };
    return [currentValue, setter] as const;
  }
};

type Callback = () => void;
/**
 * Subscribe to all the uopdates from the involved Recoil Values
 */
const useSubscribeToRecoilValues = <T>(
  options: RecoilValueOptions<T>,
  callback: Callback
) => {
  const recoilId = useRecoilId();

  useEffect(() => {
    if (isAtomOptions(options)) {
      return subscribeToRecoilValue(recoilId, options.key, callback);
    } else {
      const dependencies: string[] = [];
      options.get({ get: createDependenciesSpy(recoilId, dependencies) });

      const unsubscribes: Callback[] = [];
      dependencies.forEach((key) =>
        unsubscribes.push(subscribeToRecoilValue(recoilId, key, callback))
      );

      return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
    }
  }, [recoilId, options, callback]);
};

/**
 * Figure out the dependencies tree of each selector
 */
const createDependenciesSpy = (recoilId: string, dependencies: string[]) => {
  const dependenciesSpy: RecoilIdFreeFunction<typeof getRecoilValue> = (
    options: RecoilValueOptions
  ) => {
    dependencies.push(options.key);

    if (isAtomOptions(options)) {
      return getRecoilValue(recoilId, options);
    } else {
      return options.get({ get: dependenciesSpy });
    }
  };

  return dependenciesSpy;
};

const useRecoilId = () => {
  const recoilId = useContext(RecoilContext);
  if (!recoilId) {
    throw new Error("Wrap your app with <RecoilRoot>");
  }

  return recoilId;
};
