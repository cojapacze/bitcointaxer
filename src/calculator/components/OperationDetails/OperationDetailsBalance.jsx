import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import InfoItem from '../Misc/InfoItem';
import {
  PrintAsset,
  PrintGainLossLabel,
  PrintInventoryMethod
} from '../Print';
import {
  TableAssetsTurnover,
  TableBalances,
  TableInventory
} from '../Tables';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faSyncAlt,
  faBoxes
} from '@fortawesome/free-solid-svg-icons';
import {faCalculator} from '@fortawesome/free-solid-svg-icons';


class OperationDetailsBalance extends React.Component {
  state = {};
  static propTypes = {
    operationQueue: PropTypes.object
  }
  static getDerivedStateFromProps(props) {
    return props;
  }

  renderStart() {
    return <div>...</div>;
  }

  renderProgress() {
    return <div>Progress...</div>;
  }

  renderFinish() {
    const formItemLayout = {
      labelCol: {span: 12},
      wrapperCol: {span: 12}
    };
    const {operationQueue, colors} = this.state;
    const operation = operationQueue.getCurrent();
    const calculatorStep = operation.calculatorStep;
    const calculator = calculatorStep.calculator;
    const elements = [];
    elements.push(<TableInventory
      key="table-inventory"
      operationQueue={operationQueue}
      title={<span>
        <FontAwesomeIcon icon={faBoxes} style={{marginRight: '4px'}} />
        <FormattedMessage
          id="OperationDetailsBalance.sortedInventory"
          defaultMessage="Inventory sorted by Asset, {method}"
          values={{
            method: <PrintInventoryMethod setup={calculator.setup} />
          }}
        /></span>}
      trackLocations={calculator.setup.trackLocations}
      // groupByLoc={calculator.setup.trackLocations}
      calculatorStep={calculatorStep}
      costs={calculatorStep.unusedCosts}
      colors={colors}/>);
    elements.push(<TableBalances
      key="table-balances"
      operationQueue={operationQueue}
      title={<span>
        <FontAwesomeIcon icon={faCalculator} style={{marginRight: '4px'}} />
        <FormattedMessage
          id="OperationDetailsBalance.balance"
          defaultMessage="Balance"
        /></span>}
      balances={(calculatorStep && calculatorStep.locBalances) || 'off-calculatorStep'}
      colors={colors}/>);
    elements.push(<TableAssetsTurnover
      key="table-turnover"
      title={<span>
        <FontAwesomeIcon icon={faSyncAlt} style={{marginRight: '4px'}} />
        <FormattedMessage
          id="OperationDetailsBalance.turnover"
          defaultMessage="Turnover"
        /></span>}
      assetsTurnover={calculatorStep.assetsTurnover}
      colors={colors}/>);
    elements.push(<div
      key="summary"
      style={{
        marginBottom: '56px'
      }}
    >
      <InfoItem
        {...formItemLayout}
        label={<FormattedMessage
          id="OperationDetailsBalance.proceeds"
          defaultMessage="Proceeds"
        />}
      >
        <PrintAsset
          mode={'text'}
          value={calculatorStep.sumProceeds}
          asset={calculatorStep.residenceCurrency}
          colors={colors}/>
      </InfoItem>
      <InfoItem
        {...formItemLayout}
        label={<FormattedMessage
          id="OperationDetailsBalance.costBasis"
          defaultMessage="Cost Basis"
        />}
      >
        <PrintAsset
          mode={'text'}
          value={calculatorStep.sumCostBasis}
          asset={calculatorStep.residenceCurrency}
          colors={colors}/>
      </InfoItem>
      <InfoItem
        {...formItemLayout}
        label={(<PrintGainLossLabel gainLoss={calculatorStep.sumGainLoss}/>)}
      >
        <strong>
          <PrintAsset
            mode={'text'}
            value={calculatorStep.sumGainLoss}
            asset={calculatorStep.residenceCurrency}
            colors={colors}/>
        </strong>
      </InfoItem>
    </div>);
    elements.reverse();
    return (
      <div style={{
        marginTop: '48px'
      }}>
        {elements}
        <div style={{marginBottom: '48px'}}></div>
      </div>
    );
  }
  render() {
    const {operationQueue} = this.state;
    const operation = operationQueue.getCurrent();
    const calculatorStep = operation.calculatorStep;
    if (calculatorStep) {
      return this.renderFinish();
    }

    return this.renderStart();
  }
}

export default OperationDetailsBalance;
