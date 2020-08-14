import React from "react";
import PropTypes from "prop-types";

import { Pill } from "./Styled";
import FontIcon from "./FontIcon";

export const ItemsList = ({
  stateCallback,
  onDelete,
  selectedItems,
  onClick,
}) => {
  return selectedItems.map((item) => (
    <Pill
      title={item.label}
      key={`${item.value}-${item.label}`}
      aria-label={`selected-item-${item.label}`}
      onClick={(e) => onClick(e, item, stateCallback)}
    >
      {item.label}
      <FontIcon
        className="fa fa-times"
        marginLeft={5}
        role="button"
        type="button"
        aria-label="remove option"
        onClick={(e) => onDelete(e, item)}
      />
    </Pill>
  ));
};

ItemsList.propTypes = {
  stateCallback: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  selectedItems: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    })
  ).isRequired,
  onClick: PropTypes.func.isRequired,
};
