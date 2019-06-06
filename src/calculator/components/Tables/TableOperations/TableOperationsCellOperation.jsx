import React from 'react';
import {Popover} from 'antd';
import {PrintOperationExchangeRate, PrintOperationTransaction} from '../../Print';
import {
  // CONFIG,
  // colorOfHash,
  getAssetConfig,
  getOperationSymbol
} from '../../../services/taxCalc/libs/Utils.js';

function TableOperationsCellOperation(text, operation) {
  switch (operation.type) {
    case 'stocktaking':
    case 'config':
    case 'setup':
    case 'summary':
      return {
        props: {
          colSpan: 0
        }
      };
    case 'error':
      console.error('operation.error', operation);
      return operation.type;
    default:
  }
  const {expandedRows} = this.state;
  const expanded = expandedRows.includes(operation.key);
  if (expanded) {
    return false;
  }

  const colors = true;
  const operationQueue = operation.operationQueue;
  let exRate = false;
  if (operation) {
    if ((operation.from.asset !== operation.to.asset)) {
      exRate = <PrintOperationExchangeRate operation={operation} colors={colors}/>;
    }
  }

  operation.from.assetConfig = getAssetConfig(operation.from.asset);
  operation.to.assetConfig = getAssetConfig(operation.to.asset);
  let symbolEl = getOperationSymbol(operation);
  if (exRate) {
    symbolEl = <Popover placement={'bottom'} content={exRate}>{symbolEl}</Popover>;
  }
  const color = '';
  // if (operation.domain) {
  //   color = colorOfHash(operation.domain, CONFIG.seed);
  // }

  return (
    <div
      style={{
        cursor: 'pointer',
        color: color
      }}
      onClick={() => {
        operationQueue.setCurrent(operation.key);
        operationQueue.dispatch('open-drawer-tab', 'operation');
      }}
      className={operation.type}
    >
      <div><small><PrintOperationTransaction
        operation={operation}
        colors={colors}/></small></div>
      <div>
        {symbolEl}
      </div>
    </div>
  );
}
export default TableOperationsCellOperation;
