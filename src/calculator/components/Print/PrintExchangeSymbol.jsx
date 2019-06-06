import React from 'react';
import PropTypes from 'prop-types';

import {getAssetConfig} from '../../services/taxCalc/libs/Utils.js';

function PrintExchangeSymbol(props) {
  const {
    operation
  } = props;

  let symbolOrderList = [operation.fromAsset, operation.toAsset];
  if (operation.symbolOrderList) {
    symbolOrderList = operation.symbolOrderList;
  }
  const output = [];
  symbolOrderList.forEach((asset, i) => {
    const assetConfig = getAssetConfig(asset);
    output.push(<span key={`${i}-${asset}`} style={{color: assetConfig.color}}>{asset}</span>);
  });
  let i;
  for (i = 1; i < output.length; i += 2) {
    output.splice(i, 0, '/');
  }

  return <span className={(operation.checked) ? 'enabled' : 'disabled'}>
    {output}
  </span>;
}

PrintExchangeSymbol.propTypes = {
  operation: PropTypes.object,
  colors: PropTypes.bool
};

export default PrintExchangeSymbol;
