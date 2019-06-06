import React from 'react';
import {FormattedMessage} from 'react-intl';

import {PrintAsset} from '../../Print';

function TableOperationsCellIncome(text, operation) {
  const operationQueue = operation.operationQueue;
  function onClick() {
    operationQueue.setCurrent(operation.key);
    operationQueue.dispatch('open-drawer-tab', 'valuation');
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
  const operationIncome = (calculatorStep && calculatorStep.operationIncome);
  if (!operationIncome) {
    return <center>-</center>;
  }
  return <div onClick={onClick} className={'pointer'} style={{textAlign: 'right'}}>
    <div><small><FormattedMessage id="TableOperations.income" defaultMessage="Income"/></small></div>
    <PrintAsset mode={'text'} value={operationIncome} asset={operationResidenceCurrency} colors={true}/>
  </div>;
}
export default TableOperationsCellIncome;
