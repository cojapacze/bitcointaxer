import React from 'react';
import PropTypes from 'prop-types';

function PrintBadge(props) {
  const {
    // colors,
    badgeContent,
    badgeType
  } = props;

  const badgeIconStyle = {
    color: 'blue',
    border: '1px solid black',
    borderRadius: '50%',
    display: 'inline-block',
    width: '16px',
    height: '16px',
    fontSize: '10px',
    textAlign: 'center',
    position: 'relative',
    top: '-4px'
  };
  switch (badgeType) {
    case 'error':
      badgeIconStyle.color = '#f5222d';
      badgeIconStyle.borderColor = '#f5222d';
      break;
    default:
      badgeIconStyle.color = '#1890ff';
      badgeIconStyle.borderColor = '#1890ff';
  }

  return <div style={badgeIconStyle}>
    {badgeContent}
  </div>;
}

PrintBadge.propTypes = {
  badgeContent: PropTypes.node,
  badgeType: PropTypes.string,
  colors: PropTypes.bool
};

export default PrintBadge;
