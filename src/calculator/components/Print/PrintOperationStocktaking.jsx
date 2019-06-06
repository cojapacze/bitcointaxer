import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Button} from 'antd';
import PrintAsset from './PrintAsset';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import {faExclamationTriangle, faBarcode} from '@fortawesome/free-solid-svg-icons';

function PrintOperationStocktaking(props) {
  const {operation, colors} = props;
  if (!operation || !operation.operationStocktaking) {
    return <div>
      <h1><FontAwesomeIcon icon={faExclamationTriangle} /></h1>
      <FormattedMessage id="PrintOperationStocktaking.operationNotFound" defaultMessage="Operation not found"/>
    </div>;
  }
  const stocktaking = operation.operationStocktaking;
  let stocktakingType = '';
  if (operation.subtype === 'open') {
    stocktakingType = <FormattedMessage
      id="PrintOperationStocktaking.type.open"
      defaultMessage="{year} open"
      values={{
        year: operation.calculator.year
      }}
    />;
  }
  if (operation.subtype === 'close') {
    stocktakingType = <FormattedMessage
      id="PrintOperationStocktaking.type.close"
      defaultMessage="{year} close"
      values={{
        year: operation.calculator.year
      }}
    />;
  }
  const stocktakingButton = <span
    style={{
      display: 'inline-block',
      verticalAlign: 'text-bottom',
      marginRight: '24px'
    }}

  ><Button
      // type="primary"
      style={{marginLeft: '16px'}}
      shape="circle"
      onClick={() => {
        operation.operationQueue.setCurrent(operation.key);
        operation.operationQueue.dispatch('open-drawer');
        operation.operationQueue.dispatch('open-stocktaking-drawer');
        setTimeout(() => operation.operationQueue.dispatch('close-drawer'), 100);
      }}
    >
      <FontAwesomeIcon icon={faBarcode} />
    </Button></span>;

  const stocktakingMessage = <span
    style={{
      display: 'inline-block'
    }}
  >
    <div><small><strong>{stocktakingType}</strong></small></div>
    <div><FormattedMessage
      id="PrintOperationStocktaking.summary"
      defaultMessage="Last no {lastNo}, cost basis valuation {stocktakingCostBasis}, market valuation {stocktakingMarketValuation}"
      values={{
        lastNo: stocktaking.inventory.length,
        stocktakingCostBasis: <PrintAsset
          mode={'text'}
          disableBlink={true}
          asset={stocktaking.operationResidenceCurrency}
          value={stocktaking.stocktakingCostBasis}
          colors={colors} />,
        stocktakingMarketValuation: <PrintAsset
          mode={'text'}
          disableBlink={true}
          asset={stocktaking.operationResidenceCurrency}
          value={stocktaking.stocktakingMarketValuation}
          colors={colors} />
      }}
    /></div>
  </span>;
  return <div>
    {stocktakingButton}
    {stocktakingMessage}
  </div>;
}
PrintOperationStocktaking.propTypes = {
  colors: PropTypes.bool,
  operation: PropTypes.object
};
export default PrintOperationStocktaking;
