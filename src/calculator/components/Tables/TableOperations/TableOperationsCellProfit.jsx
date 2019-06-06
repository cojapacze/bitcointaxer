import React from 'react';
import {FormattedMessage} from 'react-intl';

import {PrintAsset} from '../../Print';

// import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
// import {
//   faBalanceScale,
//   faBalanceScaleLeft,
//   faBalanceScaleRight
// } from '@fortawesome/free-regular-svg-icons';

function TableOperationsCellProfit(text, operation) {
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
  const taxable = calculatorStep.taxableEvent;
  const colors = true;
  let result = <center>-</center>;
  if (operation.taxable) {
    if (calculatorStep.operationGainLoss > 0) {
      result = <span key={'trade&&(calculatorStep.operationGainLoss > 0)'} style={{display: 'inline-block'}}>
        <div><small><strong>
          {/* <FontAwesomeIcon style={{marginRight: '4px', color: 'green'}} icon={faBalanceScaleLeft} /> */}
          <FormattedMessage id="TableOperations.gain" defaultMessage="Gain"/>
        </strong></small></div>
        <div>
          <PrintAsset
            mode={'text'}
            asset={calculatorStep.residenceCurrency}
            value={calculatorStep.operationGainLoss}
            colors={colors} />
        </div>
      </span>;
    } else if (calculatorStep.operationGainLoss < 0) {
      result = <span key={'trade&&(calculatorStep.operationGainLoss < 0)'} style={{display: 'inline-block'}}>
        <div><small><strong>
          {/* <FontAwesomeIcon style={{marginRight: '4px', color: 'red'}} icon={faBalanceScaleRight} /> */}
          <FormattedMessage id="TableOperations.loss" defaultMessage="Loss"/>
        </strong></small></div>
        <div>
          <PrintAsset
            mode={'text'}
            asset={calculatorStep.residenceCurrency}
            value={calculatorStep.operationGainLoss}
            colors={colors} />
        </div>
      </span>;
    } else {
      result = <span key={'trade&&default'} style={{display: 'inline-block'}}>
        <div><small><strong>
          {/* <FontAwesomeIcon style={{marginRight: '4px'}} icon={faBalanceScale} /> */}
          <FormattedMessage id="TableOperations.equal" defaultMessage="Equal"/>
        </strong></small></div>
        <div>
          <PrintAsset
            mode={'text'}
            asset={calculatorStep.residenceCurrency}
            value={calculatorStep.operationGainLoss}
            colors={colors} />
        </div>
      </span>;
    }
  }
  let className = 'pointer';
  if (!taxable) {
    className += ' disabled';
  }
  return <div style={{textAlign: 'right'}} onClick={onClick} className={className}>{result}</div>;
}
export default TableOperationsCellProfit;
