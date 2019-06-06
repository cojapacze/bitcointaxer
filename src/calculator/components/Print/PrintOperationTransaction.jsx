import React from 'react';
import PropTypes from 'prop-types';
import {getAssetConfig} from '../../services/taxCalc/libs/Utils.js';
import {Popover} from 'antd';
import PrintOperationTypeLabel from './PrintOperationTypeLabel.jsx';


function PrintOperationTransaction(props) {
  const {operation} = props;

  operation.from.assetConfig = getAssetConfig(operation.from.asset);
  operation.to.assetConfig = getAssetConfig(operation.to.asset);

  const
    blockchain = `${(operation.from.assetConfig.blockchain || operation.to.assetConfig.blockchain || 'unknown blockchain')}`,
    fromAsset = operation.from.asset,
    toAsset = operation.to.asset,
    txid = operation.txid;

  const asset = fromAsset || toAsset;
  const assetConfig = getAssetConfig(asset);
  let blockchainLinkEl = <div>{txid}</div>;
  let transactionTypeEl = <PrintOperationTypeLabel operation={operation} colors={true}/>;

  if (assetConfig.blockchainTxPrelink && txid) {
    blockchainLinkEl = <div><a target="_blank" rel="noopener noreferrer" className="blockchain-link" href={`${assetConfig.blockchainTxPrelink}${txid}`}>{txid}</a></div>;
    transactionTypeEl = <a target="_blank" rel="noopener noreferrer" className="blockchain-link" href={`${assetConfig.blockchainTxPrelink}${txid}`}>
      {transactionTypeEl}
    </a>;
  }
  // {type}
  if (txid) {
    return (
      <Popover placement={'top'} content={blockchainLinkEl} title={blockchain}>
        <span className={`location ${asset}`}>
          {transactionTypeEl}
        </span>
      </Popover>
    );
  }
  return <span className={`location ${asset}`}>{transactionTypeEl}</span>;
}
PrintOperationTransaction.propTypes = {
  operation: PropTypes.object,
  colors: PropTypes.bool
};
export default PrintOperationTransaction;

