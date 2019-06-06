import React from 'react';
import {FormattedMessage} from 'react-intl';

import {PrintAsset} from '../../Print';

function TableOperationsCellCost(text, operation) {
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
  const operationQueue = operation.operationQueue;
  const calculatorStep = operation.calculatorStep;
  if (!calculatorStep) {
    return 'err';
  }

  function onClick() {
    if (calculatorStep.operationMissingCostPart) {
      operationQueue.setCurrent(operation.key);
      operationQueue.dispatch('open-drawer-tab', 'errors', 'drawer-error-costBasis');
      return;
    }
    operationQueue.setCurrent(operation.key);
    operationQueue.dispatch('open-drawer-tab', 'operation');
  }

  let costStyle = {};
  if (calculatorStep.operationMissingCostPart && !calculatorStep.operationMissingCostPart.errorResolved) {
    costStyle = {
      color: 'red',
      fontWeight: 'bold'
    };
  }

  const operationResidenceCurrency = (calculatorStep && calculatorStep.operationResidenceCurrency);
  const operationCostBasis = (calculatorStep && calculatorStep.operationCostBasis);
  return <div onClick={onClick} className={'pointer'} style={{textAlign: 'right'}}>
    <div style={costStyle}><small><FormattedMessage id="TableOperations.costBasis" defaultMessage="Cost Basis"/></small></div>
    <PrintAsset mode={'text'} value={operationCostBasis} asset={operationResidenceCurrency} colors={true}/>
  </div>;
}
export default TableOperationsCellCost;
