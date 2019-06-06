import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Spin, Button} from 'antd';
import {PrintAsset} from '../../Print';

function TableOperationsCellValuation(text, operation) {
  const colors = true;
  const {calculator, operationQueue} = operation;
  function onClick() {
    operationQueue.setCurrent(operation.key);
    operationQueue.dispatch('open-drawer-tab', 'valuation');
  }
  let result = '-';
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
      return operation.type;
    default:
  }
  if (operation) {
    if (operation && operation.valuation) {
      const targetAsset = (
        operation &&
        operation.calculator &&
        operation.calculator.setup &&
        operation.calculator.setup.residenceCurrency);
      if (!targetAsset) {
        result = <div>err: unknow target asset</div>;
      } else {
        const loading = (operation && operation.valuation && operation.valuation.loading);
        if (loading) {
          result = <div style={{textAlign: 'center'}}><Spin/></div>;
        } else {
          let smallLabelTxt = <FormattedMessage id="TableOperations.marketValue" defaultMessage="Market Value"/>;
          let value = parseFloat(operation && operation.valuation && operation.valuation.value); //parseFloat - should be not needed
          let valueTxt = <PrintAsset mode={'text'} value={value} asset={targetAsset} colors={colors}/>;
          if (operation.taxable) {
            smallLabelTxt = <FormattedMessage id="TableOperations.proceeds" defaultMessage="Proceeds"/>;
            value = parseFloat(operation && operation.calculatorStep && operation.calculatorStep.operationProceeds);
            valueTxt = <PrintAsset mode={'text'} value={value} asset={targetAsset} colors={colors}/>;
          }
          if (operation.valuation && operation.valuation.resolved) {
            result = <div style={{textAlign: 'right'}}>
              <div><small>{smallLabelTxt}</small></div>
              {valueTxt}
            </div>;
          } else {
            result = '-';
          }
        }
      }
    } else {
      result = <div style={{textAlign: 'right'}}><Button
        onClick={e => {
          e.stopPropagation();
          calculator.evaluateOperation(operation);
        }}>
        <FormattedMessage id="TableOperations.evaluate" defaultMessage="Evaluate"/>
      </Button></div>;
    }
  }
  return <div
    onClick={onClick}
    className="pointer"
  >
    {result}
  </div>;
}
export default TableOperationsCellValuation;
