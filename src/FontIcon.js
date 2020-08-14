import React, { Fragment } from "react";
import styled from "styled-components";
import PropTypes from "prop-types";

// visually hidden but read by screen readers
const IconAltText = styled.span`
  clip: rect(0 0 0 0);
  @supports (clip-path: polygon(0 0, 0 0, 0 0, 0 0)) {
    clip-path: polygon(0 0, 0 0, 0 0, 0 0);
  }
  overflow: hidden;
  position: absolute;
  height: 1px;
  width: 1px;
`;

const FontIcon = ({ altText, titleText, className, light, ...iProps }) => {
  const title = titleText ? titleText : altText;
  return (
    <Fragment>
      <i title={title} className={className} aria-hidden="true" {...iProps} />
      {altText && <IconAltText>{altText}</IconAltText>}
    </Fragment>
  );
};

FontIcon.propTypes = {
  className: PropTypes.string.isRequired,
  altText: PropTypes.string,
  titleText: PropTypes.string,
};

export default FontIcon;
