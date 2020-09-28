import * as React from "react";
import "@testing-library/jest-dom";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import { RecoilRoot } from "./recoil/RecoilRoot";

describe("Smoke tests", () => {
  test("The app should work", () => {
    render(
      <RecoilRoot>
        <App />
      </RecoilRoot>
    );
  });

  test("The components should render in the expected order", () => {
    const consoleMock = jest.fn();
    console.log = consoleMock;
    render(
      <RecoilRoot>
        <App />
      </RecoilRoot>
    );
    expect(extractLog(consoleMock)).toEqual([
      "Render: TextInput",
      "Render: EchoInput",
      "Render: TextInput2",
      "Render: TextState1CharacterCount",
      "Render: TextState1CharCountStateForTwo",
      "Render: Texts",
      "Render: SetTexts"
    ]);
  });
});

describe("Recoil API", () => {
  test("Updating the textState1 atom should force the subscribed components to re-render", async () => {
    render(
      <RecoilRoot>
        <App />
      </RecoilRoot>
    );
    const consoleMock = jest.fn();
    console.log = consoleMock;

    // typing a letter
    await userEvent.type(screen.getByPlaceholderText("textState1"), "a");

    expect(extractLog(consoleMock)).toEqual([
      "Render: TextInput",
      "Render: EchoInput",
      "Render: TextState1CharacterCount",
      "Render: TextState1CharCountStateForTwo",
      "Render: Texts",
      "Render: SetTexts"
    ]);
    expect(screen.getByText("Echoing textState1: a")).toBeInTheDocument();
    expect(
      screen.getByText("textState1 contains 1 characters")
    ).toBeInTheDocument();
    expect(
      screen.getByText("textState1 contains 2 characters (multiplied for two)")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Both texts, splitted by a dash: a-")
    ).toBeInTheDocument();

    // typing a second letter
    consoleMock.mockClear();
    await userEvent.type(screen.getByPlaceholderText("textState1"), "b");

    expect(extractLog(consoleMock)).toEqual([
      "Render: TextInput",
      "Render: EchoInput",
      "Render: TextState1CharacterCount",
      "Render: TextState1CharCountStateForTwo",
      "Render: Texts",
      "Render: SetTexts"
    ]);

    expect(screen.getByText("Echoing textState1: ab")).toBeInTheDocument();
    expect(
      screen.getByText("textState1 contains 2 characters")
    ).toBeInTheDocument();
    expect(
      screen.getByText("textState1 contains 4 characters (multiplied for two)")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Both texts, splitted by a dash: ab-")
    ).toBeInTheDocument();
  });

  test("Updating the textState2 atom should force the subscribed components to re-render", async () => {
    render(
      <RecoilRoot>
        <App />
      </RecoilRoot>
    );
    const consoleMock = jest.fn();
    console.log = consoleMock;

    // typing a letter
    await userEvent.type(screen.getByPlaceholderText("textState2"), "c");

    expect(extractLog(consoleMock)).toEqual([
      "Render: TextInput2",
      "Render: Texts",
      "Render: SetTexts"
    ]);
    expect(
      screen.getByText("Both texts, splitted by a dash: -c")
    ).toBeInTheDocument();

    // typing another letter
    consoleMock.mockClear();
    await userEvent.type(screen.getByPlaceholderText("textState2"), "d");

    expect(extractLog(consoleMock)).toEqual([
      "Render: TextInput2",
      "Render: Texts",
      "Render: SetTexts"
    ]);
    expect(
      screen.getByText("Both texts, splitted by a dash: -cd")
    ).toBeInTheDocument();
  });

  test("Updating the atom should force the subscribed components to re-render", async () => {
    render(
      <RecoilRoot>
        <App />
      </RecoilRoot>
    );

    const consoleMock = jest.fn();

    // typing a letter in the first input field
    console.log = consoleMock;
    await userEvent.type(screen.getByPlaceholderText("textState1"), "a");

    expect(extractLog(consoleMock)).toEqual([
      "Render: TextInput",
      "Render: EchoInput",
      "Render: TextState1CharacterCount",
      "Render: TextState1CharCountStateForTwo",
      "Render: Texts",
      "Render: SetTexts"
    ]);
    expect(screen.getByText("Echoing textState1: a")).toBeInTheDocument();
    expect(
      screen.getByText("textState1 contains 1 characters")
    ).toBeInTheDocument();
    expect(
      screen.getByText("textState1 contains 2 characters (multiplied for two)")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Both texts, splitted by a dash: a-")
    ).toBeInTheDocument();

    // typing another letter in the first input field
    consoleMock.mockClear();
    await userEvent.type(screen.getByPlaceholderText("textState1"), "b");

    expect(extractLog(consoleMock)).toEqual([
      "Render: TextInput",
      "Render: EchoInput",
      "Render: TextState1CharacterCount",
      "Render: TextState1CharCountStateForTwo",
      "Render: Texts",
      "Render: SetTexts"
    ]);

    expect(screen.getByText("Echoing textState1: ab")).toBeInTheDocument();
    expect(
      screen.getByText("textState1 contains 2 characters")
    ).toBeInTheDocument();
    expect(
      screen.getByText("textState1 contains 4 characters (multiplied for two)")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Both texts, splitted by a dash: ab-")
    ).toBeInTheDocument();

    // typing a letter in the second input field
    consoleMock.mockClear();
    await userEvent.type(screen.getByPlaceholderText("textState2"), "c");
    expect(extractLog(consoleMock)).toEqual([
      "Render: TextInput2",
      "Render: Texts",
      "Render: SetTexts"
    ]);
    expect(
      screen.getByText("Both texts, splitted by a dash: ab-c")
    ).toBeInTheDocument();

    // typing another in the second input field
    consoleMock.mockClear();
    await userEvent.type(screen.getByPlaceholderText("textState2"), "d");
    expect(extractLog(consoleMock)).toEqual([
      "Render: TextInput2",
      "Render: Texts",
      "Render: SetTexts"
    ]);
    expect(
      screen.getByText("Both texts, splitted by a dash: ab-cd")
    ).toBeInTheDocument();

    // setting both the atoms at once
    await userEvent.type(screen.getByPlaceholderText("setTexts"), "ef-gh");
    consoleMock.mockClear();
    await userEvent.click(
      screen.getByRole("button", { name: "Set both texts" })
    );
    expect(screen.getByPlaceholderText("textState1")).toHaveValue("ef");
    expect(screen.getByText("Echoing textState1: ef")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("textState2")).toHaveValue("gh");
    expect(screen.getByText("Echoing textState2: gh")).toBeInTheDocument();
    expect(extractLog(consoleMock)).toEqual([
      "Render: TextInput",
      "Render: EchoInput",
      "Render: TextInput2",
      "Render: TextState1CharacterCount",
      "Render: TextState1CharCountStateForTwo",
      "Render: Texts",
      "Render: SetTexts"
    ]);

    // setting the second atom only
    await userEvent.clear(screen.getByPlaceholderText("setTexts"));
    await userEvent.type(screen.getByPlaceholderText("setTexts"), "ef-jk");
    consoleMock.mockClear();
    await userEvent.click(
      screen.getByRole("button", { name: "Set both texts" })
    );
    expect(screen.getByPlaceholderText("textState1")).toHaveValue("ef");
    expect(screen.getByText("Echoing textState1: ef")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("textState2")).toHaveValue("jk");
    expect(screen.getByText("Echoing textState2: jk")).toBeInTheDocument();
    expect(extractLog(consoleMock)).toEqual([
      "Render: TextInput2",
      "Render: Texts",
      "Render: SetTexts"
    ]);
  });
});

const extractLog = (logMock) => logMock.mock.calls.map((params) => params[0]);
