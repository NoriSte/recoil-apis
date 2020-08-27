import * as React from "react";
import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

describe("Smoke tests", () => {
  test("The app should work", () => {
    render(<App />);
  });

  test("The components should render in the expected order", () => {
    const consoleMock = jest.fn();
    console.log = consoleMock;
    render(<App />);
    expect(consoleMock.mock.calls[0][0]).toBe("Render: TextInput");
    expect(consoleMock.mock.calls[1][0]).toBe("Render: EchoInput");
    expect(consoleMock.mock.calls[2][0]).toBe("Render: TextInput2");
    expect(consoleMock.mock.calls[3][0]).toBe(
      "Render: TextState1CharacterCount"
    );
    expect(consoleMock.mock.calls[4][0]).toBe(
      "Render: TextState1CharCountStateForTwo"
    );
    expect(consoleMock.mock.calls[5][0]).toBe("Render: Texts");
    expect(consoleMock.mock.calls[6][0]).toBe("Render: SetTexts");
  });
});

describe("Recoil API", () => {
  test("Updating the atom should force the subscribed components to re-render", async () => {
    render(<App />);

    const consoleMock = jest.fn();

    // typing a letter in the first input field
    console.log = consoleMock;
    await userEvent.type(screen.getByPlaceholderText("textState1"), "a");

    expect(consoleMock.mock.calls[0][0]).toBe("Render: TextInput");
    expect(consoleMock.mock.calls[1][0]).toBe("Render: EchoInput");
    expect(consoleMock.mock.calls[2][0]).toBe(
      "Render: TextState1CharacterCount"
    );
    expect(consoleMock.mock.calls[3][0]).toBe(
      "Render: TextState1CharCountStateForTwo"
    );
    expect(consoleMock.mock.calls[4][0]).toBe("Render: Texts");
    expect(consoleMock.mock.calls[5][0]).toBe("Render: SetTexts");

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

    expect(consoleMock.mock.calls[0][0]).toBe("Render: TextInput");
    expect(consoleMock.mock.calls[1][0]).toBe("Render: EchoInput");
    expect(consoleMock.mock.calls[2][0]).toBe(
      "Render: TextState1CharacterCount"
    );
    expect(consoleMock.mock.calls[3][0]).toBe(
      "Render: TextState1CharCountStateForTwo"
    );
    expect(consoleMock.mock.calls[4][0]).toBe("Render: Texts");
    expect(consoleMock.mock.calls[5][0]).toBe("Render: SetTexts");

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
    expect(consoleMock.mock.calls[0][0]).toBe("Render: TextInput2");
    expect(consoleMock.mock.calls[1][0]).toBe("Render: Texts");
    expect(consoleMock.mock.calls[2][0]).toBe("Render: SetTexts");
    expect(
      screen.getByText("Both texts, splitted by a dash: ab-c")
    ).toBeInTheDocument();

    // typing another in the second input field
    consoleMock.mockClear();
    await userEvent.type(screen.getByPlaceholderText("textState2"), "d");
    expect(consoleMock.mock.calls[0][0]).toBe("Render: TextInput2");
    expect(consoleMock.mock.calls[1][0]).toBe("Render: Texts");
    expect(consoleMock.mock.calls[2][0]).toBe("Render: SetTexts");
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
    expect(consoleMock.mock.calls[0][0]).toBe("Render: TextInput");
    expect(consoleMock.mock.calls[1][0]).toBe("Render: EchoInput");
    expect(consoleMock.mock.calls[2][0]).toBe("Render: TextInput2");
    expect(consoleMock.mock.calls[3][0]).toBe(
      "Render: TextState1CharacterCount"
    );
    expect(consoleMock.mock.calls[4][0]).toBe(
      "Render: TextState1CharCountStateForTwo"
    );
    expect(consoleMock.mock.calls[5][0]).toBe("Render: Texts");
    expect(consoleMock.mock.calls[6][0]).toBe("Render: SetTexts");

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
    expect(consoleMock.mock.calls[0][0]).toBe("Render: TextInput2");
    expect(consoleMock.mock.calls[1][0]).toBe("Render: Texts");
    expect(consoleMock.mock.calls[2][0]).toBe("Render: SetTexts");
  });
});
