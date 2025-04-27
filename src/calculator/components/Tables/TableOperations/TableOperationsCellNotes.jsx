import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Divider} from 'antd';
import {PrintAsset} from '../../Print';
import {EditTagsQuick} from '../../Edit';
import {operationQueue} from '../../../services/taxCalc/index.js';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheckCircle, faExclamationCircle} from '@fortawesome/free-solid-svg-icons';
import {CONFIG} from '../../../services/taxCalc/libs/Utils';

function PrintUnknownAssetTitle(props) {
  //eslint-disable-next-line
  const {missingCostPart} = props;
  let result = <span style={{color: 'red'}}><FontAwesomeIcon icon={faExclamationCircle} style={{marginRight: '4px'}} /> <FormattedMessage id="TableOperations.unknownAsset" defaultMessage="unknown asset"/></span>;
  //eslint-disable-next-line
  if (missingCostPart.errorResolved) {
    result = <span style={{color: 'green'}}><FontAwesomeIcon icon={faCheckCircle} style={{marginRight: '4px'}} /> <FormattedMessage id="TableOperations.newAsset" defaultMessage="new asset"/></span>;
  }
  return result;
}
function TableOperationsCellNotes(text, operation) {
  const colors = true;
  const {calculatorStep} = operation;
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
  if (!operation.calculatorStep) {
    return <h1 color='red'>error</h1>;
  }

  const elements = [];

  if (calculatorStep.operationMissingCostPart) {
    elements.push(<span
      key={'operationMissingCostPart'}
      style={{display: 'inline-block', cursor: 'pointer'}}
      onClick={() => {
        operationQueue.setCurrent(operation.key);
        operationQueue.dispatch('open-drawer-tab', 'errors', 'drawer-error-costBasis');
        // operationQueue.selectDetailsPage();
      }}>
      <div><small><strong>
        <PrintUnknownAssetTitle missingCostPart={calculatorStep.operationMissingCostPart} />
      </strong></small></div>
      <div>
        <PrintAsset
          asset={calculatorStep.operationMissingCostPart.asset}
          value={calculatorStep.operationMissingCostPart.amount}
          colors={colors} />
      </div>
    </span>);
  }
  if (CONFIG.features.trackCoins) {
    elements.push(<span key={'operationQuickNote'} style={{display: 'inline-block'}}>
      <div><small><strong><FormattedMessage id="TableOperations.trackCoins" defaultMessage="track coins"/></strong></small></div>
      <div>
        <EditTagsQuick operationQueue={operationQueue} operation={operation}/>
      </div>
    </span>);
  }

  let i = 0;
  for (i = 1; i < elements.length; i += 2) {
    elements.splice(i, 0, <Divider key={`sep-${i}`} type="vertical"/>);
  }
  const result = (<div className='to' style={{textAlign: 'right'}}>
    <div onClick={e => e.stopPropagation()}>
      {elements}
    </div>
  </div>);

  return result;
}
export default TableOperationsCellNotes;
