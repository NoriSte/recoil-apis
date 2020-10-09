import { Atom, isAtom, Selector, RecoilValue } from "./typings";
import { useReducer, useEffect, useContext } from "react";
import { RecoilContext } from "./RecoilRoot";
import {
  getRecoilValue,
  registerRecoilValue,
  subscribeToRecoilValue,
  createPreflightSetAtomValue,
  createPreflightGetRecoilValue,
  createPreflightSetRecoilValue
} from "./core";

/**
 * Register a new atom.
 * Please note: it does nothing for the sake of this exercise
 */
export const atom = <T>(atom: Atom<T>) => {
  return atom;
};

/**
 * Register a new selector.
 * Please note: it does nothing for the sake of this exercise
 */
export const selector = <T>(selector: Selector<T>) => {
  return selector;
};

/**
 * Subscribe to all the Recoil Values updates and return the current value.
 */
export const useRecoilValue = <T>(recoilValue: RecoilValue<T>) => {
  const recoilId = useRecoilId();
  const [, forceRender] = useReducer((s) => s + 1, 0);

  // registering a Recoil value requires the recoil id (stored in a React Context), that's why it can't be registered outside a component/hook code
  registerRecoilValue(recoilId, recoilValue);

  useSubscribeToRecoilValues(recoilValue, forceRender);
  return getRecoilValue(recoilId, recoilValue);
};

/**
 * Subscribe to all the Recoil Values updates and return both the current value and a setter.
 */
export const useRecoilState = <T>(recoilValue: RecoilValue<T>) => {
  const recoilId = useRecoilId();
  const currentValue = useRecoilValue(recoilValue);

  // registering a Recoil value requires the recoil id (stored in a React Context), that's why it can't be registered outside a component/hook code
  registerRecoilValue(recoilId, recoilValue);

  if (isAtom(recoilValue)) {
    const setter = createPreflightSetAtomValue(recoilId, recoilValue);
    return [currentValue, setter] as const;
  } else {
    const setter = (newValue: T) => {
      if (recoilValue.set)
        recoilValue.set(
          {
            get: createPreflightGetRecoilValue(recoilId),
            set: createPreflightSetRecoilValue(recoilId)
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
  recoilValue: RecoilValue<T>,
  callback: Callback
) => {
  const recoilId = useRecoilId();

  useEffect(() => {
    if (isAtom(recoilValue)) {
      return subscribeToRecoilValue(recoilId, recoilValue.key, callback);
    } else {
      const dependencies: string[] = [];
      recoilValue.get({ get: createDependenciesSpy(recoilId, dependencies) });

      const unsubscribes: Callback[] = [];
      dependencies.forEach((key) =>
        unsubscribes.push(subscribeToRecoilValue(recoilId, key, callback))
      );

      return () => unsubscribes.forEach((unsubscribe) => unsubscribe());
    }
  }, [recoilId, recoilValue, callback]);
};

/**
 * Figure out the dependencies tree of each selector
 */
const createDependenciesSpy = (recoilId: string, dependencies: string[]) => {
  const dependenciesSpy = (recoilValue: RecoilValue<any>) => {
    dependencies.push(recoilValue.key);

    if (isAtom(recoilValue)) {
      return getRecoilValue(recoilId, recoilValue);
    } else {
      return recoilValue.get({ get: dependenciesSpy });
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
