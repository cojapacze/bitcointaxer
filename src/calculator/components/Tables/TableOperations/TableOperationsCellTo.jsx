import React from 'react';
import {PrintAsset, PrintLocation} from '../../Print';

function TableOperationsCellTo(text, operation) {
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
        className={'to row-selected pointer'}
        style={{textAlign: 'left'}
        }>
        <div><small>
          <PrintLocation
            popover='left'
            // domain={operation.domain}
            asset={operation.to.asset}
            location={operation.to.loc}
            address={operation.to.address}
            colors={colors} />
        </small></div>
        <div>
          <PrintAsset
            asset={operation.to.asset}
            value={operation.to.amount}
            colors={colors} />
        </div>
      </div>);
  }
}
export default TableOperationsCellTo;
