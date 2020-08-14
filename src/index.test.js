import React from "react";
import {
  render,
  getByPlaceholderText,
  fireEvent,
  getNodeText,
} from "@testing-library/react";
import MultiSelect from "./index";

describe("<MultiSelect />", () => {
  const onChange = jest.fn();
  const options = [
    { value: "de", label: "german" },
    { value: "pt", label: "portuguese" },
    { value: "en", label: "english" },
    { value: "sp", label: "spanish" },
    { value: "ar", label: "arabic" },
    { value: "ar-ym", label: "arabic - yemen" },
  ];

  it("should mount properly and render placeholder prop, onchange shouldnt be called", () => {
    const utils = render(
      <MultiSelect
        options={options}
        onChange={onChange}
        placeholder="Placeholder"
      />
    );
    expect(onChange).toHaveBeenCalledTimes(0);
    expect(
      getByPlaceholderText(utils.container, "Placeholder")
    ).toBeInTheDocument();
  });

  it("menu should render with relevant options based on value input", () => {
    const utils = render(
      <MultiSelect
        options={options}
        onChange={onChange}
        placeholder="Placeholder"
      />
    );
    const input = utils.getByLabelText("multi-select-input");

    fireEvent.change(input, { target: { value: "arabic" } });
    expect(utils.getByLabelText("multi-select-menu")).toBeInTheDocument();
    expect(utils.getByLabelText("option-arabic - yemen")).toBeInTheDocument();
    expect(utils.getByLabelText("option-arabic")).toBeInTheDocument();
  });

  it("options list should not display items that are already selected", () => {
    const utils = render(
      <MultiSelect
        initialValues={[{ value: "en", label: "english" }]}
        options={options}
        onChange={onChange}
        placeholder="Placeholder"
      />
    );
    const input = utils.getByLabelText("multi-select-input");

    fireEvent.change(input, { target: { value: "english" } });
    expect(utils.getByLabelText("multi-select-menu")).toBeInTheDocument();
    expect(utils.container.querySelector(`[aria-label="english"]`)).toBeNull();
  });

  it("onChange should be called if input value changes", () => {
    const utils = render(
      <MultiSelect
        options={options}
        onChange={onChange}
        placeholder="Placeholder"
      />
    );
    const input = utils.getByLabelText("multi-select-input");
    fireEvent.change(input, { target: { value: "arabic" } });
    fireEvent.keyDown(input, { key: "Enter", code: 13 });

    expect(onChange).toHaveBeenCalled();
  });

  it("single initial value should be rendered properly", () => {
    const utils = render(
      <MultiSelect
        initialValues={[{ value: "en", label: "english" }]}
        options={options}
        onChange={onChange}
        placeholder="Placeholder"
      />
    );
    const summarycount = utils.getByLabelText("selected-summary");
    expect(summarycount).toBeInTheDocument();
    expect(getNodeText(summarycount)).toEqual("english "); // extra space here is added during component for appending + sign
  });

  it("multiple initial values should be rendered as a summary", () => {
    const utils = render(
      <MultiSelect
        initialValues={[
          { value: "en", label: "english" },
          { value: "pt", label: "portuguese" },
        ]}
        options={options}
        onChange={onChange}
        placeholder="Placeholder"
      />
    );
    const summarycount = utils.getByLabelText("selected-summary");
    expect(summarycount).toBeInTheDocument();
    expect(getNodeText(summarycount)).toEqual("english +1");
  });
});
