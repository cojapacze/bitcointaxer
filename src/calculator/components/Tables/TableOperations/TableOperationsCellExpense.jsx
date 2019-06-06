import React from 'react';
import {FormattedMessage} from 'react-intl';

import {PrintAsset} from '../../Print';

function TableOperationsCellCost(text, operation) {
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
  }
  if (!operation) {
    return '-';
  }
  const calculatorStep = operation.calculatorStep;
  if (!calculatorStep) {
    return 'err';
  }
  const operationResidenceCurrency = (calculatorStep && calculatorStep.operationResidenceCurrency);
  const operationExpenses = (calculatorStep && calculatorStep.operationExpenses);
  if (!operationExpenses) {
    return <center>-</center>;
  }
  return <div onClick={onClick} className={'pointer'} style={{textAlign: 'right'}}>
    <div><small><FormattedMessage id="TableOperations.expenses" defaultMessage="Expenses"/></small></div>
    <PrintAsset mode={'text'} value={operationExpenses} asset={operationResidenceCurrency} colors={true}/>
  </div>;
}
export default TableOperationsCellCost;
