import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {getOperationSymbol} from '../../services/taxCalc/libs/Utils';
import PrintAsset from './PrintAsset';
import PrintLocation from './PrintLocation';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faExclamationTriangle} from '@fortawesome/free-solid-svg-icons';

function PrintOperation(props) {
  const {operation, colors} = props;
  if (!operation || !operation.from || !operation.to) {
    return <div>
      <h1><FontAwesomeIcon icon={faExclamationTriangle} /></h1>
      <FormattedMessage id="PrintOperation.operationNotFound" defaultMessage="Operation not found"/>
    </div>;
  }
  return <div>
    <span style={{display: 'inline-block'}}>
      <div style={{textAlign: 'right'}}><small>
        <PrintLocation
          popover='left'
          asset={operation.from.asset}
          location={operation.from.loc}
          address={operation.from.address}
          colors={colors} />
      </small></div>
      <div><PrintAsset asset={operation.from.asset} value={operation.from.amount} colors={colors}/></div>
    </span>
    <span
      style={{
        margin: '0 20px'
      }}
    >
      {getOperationSymbol(operation)}
    </span>
    <span style={{display: 'inline-block'}}>
      <div style={{textAlign: 'right'}}><small>
        <PrintLocation
          popover='left'
          asset={operation.to.asset}
          location={operation.to.loc}
          address={operation.to.address}
          colors={colors} />
      </small></div>
      <div><PrintAsset asset={operation.to.asset} value={operation.to.amount} colors={colors}/></div>
    </span>
  </div>;
}
PrintOperation.propTypes = {
  colors: PropTypes.bool,
  operation: PropTypes.object
};
export default PrintOperation;
