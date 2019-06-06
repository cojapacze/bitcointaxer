import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Checkbox} from 'antd';

function TableOperationsCellTaxable(text, operation) {
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
  function changeTaxable(e) {
    const checked = e.target.checked;
    operation.taxable = checked;
    switch (operation.type) {
      case 'contract':
        operation.calculator.updateContract(operation);
        break;
      default:
        operation.calculator.updateOperation(operation);
    }
  }
  if (!operation) {
    return 'no-operation';
  }
  const calculatorStep = operation.calculatorStepFromContracts || operation.calculatorStep;
  if (!calculatorStep) {
    return 'no-calculator-step';
  }
  const special = [];
  if (operation.cryptoToCryptoTrade) {
    special.push(<span style={{color: 'red'}} key="crypto-to-crypto"><FormattedMessage id="TableOperations.cryptoToCrypto" defaultMessage="crypto-to-crypto"/></span>);
  }
  const style = {};
  if ((operation.type === 'transfer')) {
    style.opacity = 0.5;
  }

  return (<div className='to' style={{textAlign: 'center'}}>
    <div><small>{special}</small></div>
    <div
      style={style}
    >
      <Checkbox
        checked={calculatorStep.taxableEvent}
        onChange={changeTaxable}
        indeterminate={calculatorStep.taxableIndeterminate}
        onClick={e => e.stopPropagation()}
      />
    </div>
  </div>);
}
export default TableOperationsCellTaxable;
