import {
  AtomOptions,
  SelectorOptions,
  RecoilValueOptions,
  isAtomOptions
} from "./typings";
import { useReducer, useEffect, useCallback } from "react";
import {
  setAtomValue,
  getRecoilValue,
  createRecoilValue,
  subscribeToRecoilValue
} from "./core";

/**
 * Register a new atom.
 */
export const atom = <T extends any = any>(atomOptions: AtomOptions<T>) => {
  createRecoilValue(atomOptions);
  return atomOptions;
};

/**
 * Register a new selector.
 */
export const selector = <T extends any = any>(
  selectorOptions: SelectorOptions<T>
) => {
  createRecoilValue(selectorOptions);
  return selectorOptions;
};

export const useRecoilState = <T>(recoilValue: AtomOptions<T>) => {
  // TODO: add seelctor' set
  return [useRecoilValue(recoilValue), setAtomValue(recoilValue)];
};

/**
 * Subscribe to all the Recoil Values updaters. Returns the current value and a setter
 */
export const useRecoilValue = <T>(options: RecoilValueOptions<T>) => {
  const [, forceRender] = useReducer((s) => s + 1, 0);
  const subscriptionCallback = useCallback(() => {
    forceRender();
  }, [forceRender]);

  useSubscribeToRecoilValues(options, subscriptionCallback);

  return getRecoilValue(options);
};

type GenericFunction = () => void;

/**
 * Subscribe to all the uopdates from the involved Recoil Values
 */
export const useSubscribeToRecoilValues = <T>(
  options: RecoilValueOptions<T>,
  callback: GenericFunction
) => {
  useEffect(() => {
    if (isAtomOptions(options)) {
      return subscribeToRecoilValue(options.key, callback);
    } else {
      const dependencies: string[] = [];

      options.get({ get: createDependenciesSpy(dependencies) });
      const unsubscribes: GenericFunction[] = [];
      dependencies.forEach((key) => {
        const unsubscribe = subscribeToRecoilValue(key, callback);
        if (unsubscribe) unsubscribes.push(unsubscribe);
      });

      return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
    }
  }, [options, callback]);
};

/**
 * Figure out the dependencies tree of each selector
 */
const createDependenciesSpy = (dependencies: string[]) => {
  const dependenciesSpy: typeof getRecoilValue = (...params) => {
    const recoilValueOptions = params[0];
    dependencies.push(recoilValueOptions.key);

    if (isAtomOptions(recoilValueOptions)) {
      return getRecoilValue(...params);
    } else {
      return recoilValueOptions.get({ get: dependenciesSpy });
    }
  };

  return dependenciesSpy;
};
