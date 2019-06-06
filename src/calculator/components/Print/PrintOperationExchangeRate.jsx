import React from 'react';
import PropTypes from 'prop-types';

import PrintAsset from './PrintAsset';

import {getAssetConfig} from '../../services/taxCalc/libs/Utils';

class PrintOperationExchangeRate extends React.Component {
  state = {
    colors: true,
    operation: false
  }
  static propTypes = {
    operation: PropTypes.object,
    colors: PropTypes.bool
  }
  static getDerivedStateFromProps(props) {
    return props;
  }
  render() {
    const {operation, colors} = this.state;
    let result = 'err';
    if (operation) {
      if (operation.from.asset === operation.to.asset) {
        result = 'transfer';
      } else {
        operation.from.assetConfig = getAssetConfig(operation.from.asset);
        operation.to.assetConfig = getAssetConfig(operation.to.asset);
        const usedAssets = [operation.from, operation.to].sort((a, b) => b.assetConfig.weight - a.assetConfig.weight);
        result = <span>
          <PrintAsset
            mode={'text'}
            value={1}
            asset={usedAssets[0].asset}
            decimalPlaces={0}
            colors={colors}
          />
            &nbsp;=&nbsp;
          <PrintAsset
            mode={'text'}
            value={usedAssets[1].amount / usedAssets[0].amount}
            asset={usedAssets[1].asset}
            colors={colors}
          />
        </span>;
      }
    }
    return result;
  }
}

export default PrintOperationExchangeRate;
