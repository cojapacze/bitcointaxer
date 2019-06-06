import React from 'react';
import {PrintAsset, PrintLocation, PrintOperationStocktaking} from '../../Print';

function TableOperationsCellFrom(text, operation) {
  const {expandedRows} = this.state;
  const expanded = expandedRows.includes(operation.key);
  if (expanded) {
    return false;
  }

  const colors = true;
  const operationQueue = operation.operationQueue;
  function onClick() {
    operationQueue.setCurrent(operation.key);
    operationQueue.dispatch('open-drawer-tab', 'operation');
  }
  switch (operation.type) {
    case 'stocktaking':
      return {
        children: <div
          key="stocktaking"
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
          }}>
          <PrintOperationStocktaking
            display={'small'}
            operation={operation}
            colors={colors}/>
        </div>,
        props: {
          colSpan: 8
        }
      };
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
      return (<div
        onClick={onClick}
        className={'from row-selected pointer'}
        style={{textAlign: 'right'}}
      >
        <div><small>
          <PrintLocation
            popover='left'
            // domain={operation.domain}
            asset={operation.from.asset}
            location={operation.from.loc}
            address={operation.from.address}
            colors={colors} />
        </small></div>
        <div>
          <PrintAsset
            asset={operation.from.asset}
            value={operation.from.amount}
            colors={colors} />
        </div>
      </div>);
  }
}
export default TableOperationsCellFrom;
