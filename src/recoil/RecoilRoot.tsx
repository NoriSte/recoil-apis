import { FC } from "react";
import * as React from "react";
import { createContext } from "react";
import { generateRecoilId } from "./core";

export const RecoilContext = createContext("");

export const RecoilRoot: FC = (props) => {
  const recoilId = generateRecoilId();
  return (
    <RecoilContext.Provider value={recoilId}>
      {props.children}
    </RecoilContext.Provider>
  );
};
