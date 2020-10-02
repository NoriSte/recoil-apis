import * as React from "react";
import { render } from "react-dom";

import App from "./App";
import { RecoilRoot } from "./recoil";

const rootElement = document.getElementById("root");
render(
  <RecoilRoot>
    <App />
  </RecoilRoot>,
  rootElement
);
