import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

function PrintInventoryMethod(props) {
  const {
    // colors,
    setup
  } = props;
  const result = [];
  if (setup.trackLocations) {
    result.push(<FormattedMessage
      key="PrintInventoryMethod.location"
      id="PrintInventoryMethod.location"
      defaultMessage="Location and "
    />);
  }
  result.push(<FormattedMessage
    key="PrintInventoryMethod.queueMethod"
    id={`PrintInventoryMethod.${setup.queueMethod}`}
    defaultMessage={setup.queueMethod}
  />);
  return <span>{result}</span>;
}

PrintInventoryMethod.propTypes = {
  setup: PropTypes.object,
  colors: PropTypes.bool
};

export default PrintInventoryMethod;
