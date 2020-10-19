/* eslint-disable @typescript-eslint/no-use-before-define */

import { Atom, isAtom, Selector, RecoilValue } from "./typings";
import { useReducer, useEffect, useContext } from "react";
import { RecoilContext } from "./RecoilRoot";
import {
  coreGetRecoilValue,
  registerRecoilValue,
  createPublicSetAtomValue,
  createPublicGetRecoilValue,
  createPublicSetRecoilValue,
  subscribeToRecoilValueUpdates
} from "./core";

/**
 * Recoil-like atom creation.
 */
export const atom = <T>(atom: Atom<T>) => {
  // ...
  return atom;
};

/**
 * Recoil-like selector creation.
 */
export const selector = <T>(selector: Selector<T>) => {
  // ...
  return selector;
};

/**
 * Subscribe to all the Recoil Values updates and return the current value.
 */
export const useRecoilValue = <T>(recoilValue: RecoilValue<T>) => {
  const recoilId = useRecoilId();
  const [, forceRender] = useReducer((s) => s + 1, 0);

  // registering a Recoil value requires the recoil id (stored in a React Context),
  // That's why it can't be registered outside a component/hook code. `registerRecoilValue`
  // must be idempotent
  registerRecoilValue(recoilId, recoilValue);

  useSubscribeToRecoilValues(recoilValue, forceRender);
  return coreGetRecoilValue(recoilId, recoilValue);
};

/**
 * Subscribe to all the Recoil Values updates and return both the current value and a setter.
 */
export const useRecoilState = <T>(recoilValue: RecoilValue<T>) => {
  const recoilId = useRecoilId();
  const currentValue = useRecoilValue(recoilValue);

  if (isAtom(recoilValue)) {
    const setter = createPublicSetAtomValue(recoilId, recoilValue);
    return [currentValue, setter] as const;
  } else {
    const setter = (nextValue: T) => {
      if (recoilValue.set)
        recoilValue.set(
          {
            get: createPublicGetRecoilValue(recoilId),
            set: createPublicSetRecoilValue(recoilId)
          },
          nextValue
        );
    };
    return [currentValue, setter] as const;
  }
};

type Callback = () => void;
/**
 * Subscribe/unsubscribe to all the updates of the involved Recoil Values
 */
const useSubscribeToRecoilValues = <T>(
  recoilValue: RecoilValue<T>,
  callback: Callback
) => {
  const recoilId = useRecoilId();

  useEffect(() => {
    if (isAtom(recoilValue)) {
      return subscribeToRecoilValueUpdates(recoilId, recoilValue.key, callback);
    } else {
      const dependencies: string[] = [];
      recoilValue.get({ get: createDependenciesSpy(recoilId, dependencies) });

      const unsubscribes: Callback[] = [];
      dependencies.forEach((key) =>
        unsubscribes.push(
          subscribeToRecoilValueUpdates(recoilId, key, callback)
        )
      );

      return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
    }
  }, [recoilId, recoilValue, callback]);
};

/**
 * Figure out the dependencies tree of each selector.
 * Please note: it doesn't support condition-based dependencies tree.
 */
const createDependenciesSpy = (recoilId: string, dependencies: string[]) => {
  const dependenciesSpy = (recoilValue: RecoilValue<any>) => {
    dependencies.push(recoilValue.key);

    if (isAtom(recoilValue)) {
      return coreGetRecoilValue(recoilId, recoilValue);
    } else {
      return recoilValue.get({ get: dependenciesSpy });
    }
  };

  return dependenciesSpy;
};

/**
 * Get the Recoil id of the current components tree.
 */
const useRecoilId = () => {
  const recoilId = useContext(RecoilContext);
  if (!recoilId) {
    throw new Error("Wrap your app with <RecoilRoot>");
  }

  return recoilId;
};
