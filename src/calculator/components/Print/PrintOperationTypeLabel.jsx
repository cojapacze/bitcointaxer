import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

function PrintOperationTypeLabel(props) {
  const {operation, mode} = props;
  let result = 'operation';
  if (operation) {
    // const typeLabel = operation.type[0].toUpperCase() + operation.type.slice(1);
    const style = {};
    switch (mode) {
      case 'fcuppercase':
        style.textTransform = 'capitalize';
        break;
      default:
    }
    result = <div style={style}><FormattedMessage
      id={`PrintOperationTypeLabel.${operation.type}`}
      defaultMessage={operation.type}
    /></div>;
  }
  return result;
}
PrintOperationTypeLabel.propTypes = {
  operation: PropTypes.object,
  mode: PropTypes.string,
  colors: PropTypes.bool
};

export default PrintOperationTypeLabel;
