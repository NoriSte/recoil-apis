import {
  AtomOptions,
  SelectorOptions,
  RecoilValueOptions,
  isAtomOptions
} from "./typings";
import { useState, useEffect, useCallback } from "react";
import {
  setAtomValue,
  getRecoilValue,
  createRecoilValue,
  subscribeToRecoilValue,
  getAtomValue
} from "./core";

export const atom = <T>(atomOptions: AtomOptions<T>) => {
  createRecoilValue(atomOptions);
  return atomOptions;
};

export const selector = <T>(s: SelectorOptions<T>) => {
  createRecoilValue(s);
  return s;
};

export const useRecoilState = <T>(recoilValue: AtomOptions<T>) => {
  return [useRecoilValue(recoilValue), setAtomValue(recoilValue)];
};

export const useRecoilValue = <T>(options: RecoilValueOptions<T>) => {
  const [, forceRefresh] = useState({});
  const subscriptionCallback = useCallback(() => {
    forceRefresh({});
  }, [forceRefresh]);

  useEffect(() => {
    if (isAtomOptions(options)) {
      return subscribeToRecoilValue(options.key, subscriptionCallback);
    } else {
      const keys: string[] = [];
      const spy: typeof getRecoilValue = (...params) => {
        keys.push(params[0].key);
        const recoilValueOptions = params[0];
        if (isAtomOptions(recoilValueOptions)) {
          return getRecoilValue(...params);
        } else {
          return recoilValueOptions.get({ get: spy });
        }
      };
      options.get({ get: spy });
      type GenericFunction = () => void;
      const unsubscribes: GenericFunction[] = [];
      keys.forEach((key) => {
        const unsubscribe = subscribeToRecoilValue(key, subscriptionCallback);
        if (unsubscribe) unsubscribes.push(unsubscribe);
      });

      return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
    }
  }, [options, subscriptionCallback]);

  return getRecoilValue(options);
};
