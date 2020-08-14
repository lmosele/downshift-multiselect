import React, { useState, useRef, useCallback } from "react";
import PropTypes from "prop-types";

import Downshift from "downshift";
import useOnKeyDown from "hooks/useOnKeyDown";
import {
  MenuWrapper,
  SelectWrapper,
  StyledInput,
  Pill,
  Menu,
  StyledLi,
} from "./Styles";
import { ItemsList } from "./ItemsList";

const BACKSPACE = 8;

const MultiSelect = ({
  onChange,
  options,
  allowCustomValues,
  initialValues,
  placeholder,
  ...rest
}) => {
  const inputEl = useRef();
  const [selectedItems, setSelectedItems] = useState(initialValues);
  const [isActive, setActiveState] = useState(false);

  const setToActive = useCallback(() => setActiveState(true), []);

  const filterItem = (current, value) =>
    current.filter((item) => item.value.toLowerCase() !== value.toLowerCase());

  const itemToString = (item) => (item ? item.label : "");

  /**
   * Our main change handler, takes in the event item and filters
   * the options list based on the current input
   */
  const handleSelect = useCallback(
    (item) => {
      setSelectedItems((currentItems) => {
        const newItems = item ? [...currentItems, item] : currentItems;
        const filteredNewItems = newItems.filter(
          (newItem, index, self) =>
            index ===
            self.findIndex(
              (it) => it.value === newItem.value && it.label === newItem.label
            )
        );
        onChange(filteredNewItems);
        return filteredNewItems;
      });
    },
    [onChange]
  );

  /**
   * If a user backspaces while there is no text we should assume
   * that they want to delete the last "pill" item select
   */
  const handleBackspace = (e) => {
    if (e.keyCode === BACKSPACE && e.target.value.length < 1) {
      setSelectedItems((currentItems) => {
        const slicedItems = currentItems.slice(0, -1);
        onChange(slicedItems);
        return slicedItems;
      });
    }
  };

  /**
   * We force blur behavior via the built in stateCallback to avoid Downshift bugs
   */
  const handleBlur = (e, stateCallback) => {
    stateCallback({ isOpen: false, inputValue: "", selectedItem: null });
  };

  /**
   * When a pill is clicked we enter an "edit" state, allowing the user
   * to modify or delete the inputed value
   */
  const handleItemClick = (e, item, stateCallback) => {
    e.stopPropagation();
    const value = item.value;
    const label = item.label;
    stateCallback({ inputValue: label });
    setSelectedItems((currentItems) => filterItem(currentItems, value));
    inputEl.current.focus();
  };

  /**
   * Remove the item from the list of selected items
   */
  const handleDelete = (e, item) => {
    e.stopPropagation();
    setActiveState(true);
    setSelectedItems((currentItems) => {
      const filteredItems = filterItem(currentItems, item.value);
      onChange(filteredItems);
      return filteredItems;
    });
  };

  const filterSelectedItems = (value) =>
    !selectedItems.some((selectedItem) => selectedItem.value === value);

  /**
   * While value is being inputted we should consistently
   * update the options list to reflect only what matches
   */
  const filterOptions = (opts, inputValue) => {
    if (inputValue.length < 1) {
      return opts;
    }

    const filteredOpts = opts.filter(
      (item) =>
        !inputValue ||
        item.label.toLowerCase().includes(inputValue.toLowerCase())
    );

    if (filteredOpts.length < 1 && allowCustomValues) {
      const submitOpt = {
        value: inputValue,
        label: inputValue,
        customOptionLabel: `Add "${inputValue}"`,
      };
      return [submitOpt];
    }

    return selectedItems.length > 0
      ? filteredOpts.filter((item) => filterSelectedItems(item.value))
      : filteredOpts;
  };

  /**
   * Downshift exposes a "state" handler that makes it easier to force behavior
   * for built-in events.
   */
  const stateReducer = (state, changes) => {
    switch (changes.type) {
      case Downshift.stateChangeTypes.changeInput:
        return {
          ...changes,
          highlightedIndex: 0,
        };
      case Downshift.stateChangeTypes.keyDownEnter:
      case Downshift.stateChangeTypes.clickItem:
        return {
          ...changes,
          inputValue: "",
        };
      case Downshift.stateChangeTypes.keyDownArrowDown:
        return {
          ...changes,
          highlightedIndex: state.highlightedIndex + 1,
        };
      case Downshift.stateChangeTypes.keyDownArrowUp:
        return {
          ...changes,
          highlightedIndex: state.highlightedIndex - 1,
        };
      default:
        return changes;
    }
  };

  const hasItems = selectedItems.length > 0;
  const itemsCount = `${hasItems && selectedItems[0].label} ${
    selectedItems.length > 1 ? `+${selectedItems.length - 1}` : ""
  }`;

  /**
   * If backspace is clicked - run the backspace logic
   */
  useOnKeyDown(BACKSPACE, handleBackspace);

  return (
    <Downshift
      onSelect={handleSelect}
      itemToString={itemToString}
      stateReducer={stateReducer}
      initialHighlightedIndex={0}
    >
      {({
        getItemProps,
        getInputProps,
        isOpen,
        inputValue,
        getMenuProps,
        highlightedIndex,
        setState,
        getRootProps,
      }) => (
        <MenuWrapper {...rest} {...getRootProps({ refKey: "innerRef" })}>
          <SelectWrapper isActive={isActive}>
            {isActive && hasItems && (
              <ItemsList
                stateCallback={setState}
                selectedItems={selectedItems}
                onClick={handleItemClick}
                onDelete={handleDelete}
              />
            )}

            {!isActive && hasItems && (
              <Pill
                aria-label={`selected-summary`}
                title={itemsCount}
                onClick={setToActive}
              >
                {itemsCount}
              </Pill>
            )}

            <StyledInput
              {...getInputProps({
                "aria-label": "multi-select-input",
                innerRef: inputEl,
                onBlur: (e) => handleBlur(e, setState),
                onFocus: !isActive ? setToActive : null,
                placeholder: !hasItems ? placeholder : "Add More",
              })}
            />
          </SelectWrapper>

          {isOpen && (
            <Menu
              {...getMenuProps({
                "aria-label": "multi-select-menu",
              })}
            >
              {filterOptions(options, inputValue).map((item, index) => (
                <StyledLi
                  title={item.customOptionLabel || item.label}
                  isActive={highlightedIndex === index}
                  key={`${index}-${item.label}`}
                  {...getItemProps({
                    "aria-label": `option-${item.label}`,
                    item: item,
                  })}
                >
                  {item.customOptionLabel || item.label}
                </StyledLi>
              ))}
            </Menu>
          )}
        </MenuWrapper>
      )}
    </Downshift>
  );
};

MultiSelect.defaultProps = {
  onChange: () => {},
  options: [],
  allowCustomValues: true,
  initialValues: [],
  placeholder: "select an option",
};

MultiSelect.propTypes = {
  onChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    })
  ),
  allowCustomValues: PropTypes.bool,
  initialValues: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    })
  ),
  placeholder: PropTypes.string,
};

export default MultiSelect;
