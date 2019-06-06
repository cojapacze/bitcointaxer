import React from 'react';

import {PrintOperationNoAndTimestamp} from '../../Print';


function TableOperationsCellDate(text, operation) {
  const colors = true;
  switch (operation.type) {
    default:
      return <span
        style={{
          display: 'inline-block',
          verticalAlign: 'middle',
          cursor: 'pointer'
        }}
        onClick={() => {
          operation.operationQueue.setCurrent(operation.key);
          operation.operationQueue.dispatch('open-drawer');
          operation.operationQueue.dispatch('open-stocktaking-drawer');
          setTimeout(() => operation.operationQueue.dispatch('close-drawer'), 100);
        }}
      >
        <PrintOperationNoAndTimestamp
          features={['last_location_akcent']}
          operation={operation}
          colors={colors}/>
      </span>;
  }
}
export default TableOperationsCellDate;
