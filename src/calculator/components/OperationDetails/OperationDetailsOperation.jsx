import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {
  PrintAsset,
  PrintGainLossLabel
} from '../Print';
import {
  TableCostBasis
} from '../Tables';

import {Checkbox, Form} from 'antd';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faBox} from '@fortawesome/free-solid-svg-icons';


class OperationDetailsOperation extends React.Component {
  state = {}

  static propTypes = {
    operationQueue: PropTypes.object
  }
  static getDerivedStateFromProps(props) {
    return props;
  }
  recordChanged(currentRecord) {
    if (!currentRecord) {
      return;
    }
    if (currentRecord.calculatorStep) {
      this.setState({
        mode: 'finish',
        calculatorStep: currentRecord.calculatorStep,
        operation: currentRecord
      });
    }
  }

  constructor(props) {
    super(props);
    this.operationQueue = props.operationQueue;
    this.recordChanged = currentRecord => {
      if (!currentRecord) {
        return;
      }
      if (currentRecord.calculatorStep) {
        this.setState({
          mode: 'finish',
          calculatorStep: currentRecord.calculatorStep,
          operation: currentRecord
        });
      }
    };
  }
  componentDidMount() {
    this.recordChanged(this.operationQueue.getCurrent());
    this.operationQueue.after('change-currentOperation', this.recordChanged);
  }
  componentWillUnmount() {
    this.operationQueue.removeListener('change-currentOperation', this.recordChanged);
  }

  changeTaxable = e => {
    const checked = e.target.checked;
    const operation = this.operationQueue.getCurrent();
    operation.taxable = checked;
    operation.calculator.updateOperation(operation);
  }
  render() {
    const formItemLayout = {
      labelCol: {span: 12},
      wrapperCol: {span: 12},
      className: 'compact-form-item',
      layout: 'inline'
    };
    const {operation, colors} = this.state;
    if (!operation) {
      return <div>Unknown record</div>;
    }
    const calculatorStep = operation.calculatorStep;
    const operationQueue = this.operationQueue;

    const output = [];
    output.push(<Form.Item
      key={'o-taxable'}
      {...formItemLayout}
      label={<FormattedMessage
        id="OperationDetailsOperation.taxable"
        defaultMessage="Taxable"
      />}
    >
      <Checkbox
        checked={calculatorStep.taxableEvent}
        onChange={this.changeTaxable}
        onClick={e => e.stopPropagation()}
      />
    </Form.Item>);

    if (operation.taxable) {
      output.push(<Form.Item
        key={'o-cost'}
        {...formItemLayout}
        label={<FormattedMessage
          id="OperationDetailsOperation.costBasis"
          defaultMessage="Cost Basis"
        />}
      >
        <PrintAsset
          mode={'text'}
          value={calculatorStep.operationCostBasis}
          asset={calculatorStep.operationResidenceCurrency}
          colors={colors}/>
      </Form.Item>);

      output.push(<Form.Item
        key={'o-proceeds'}
        {...formItemLayout}
        label={<FormattedMessage
          id="OperationDetailsOperation.proceeds"
          defaultMessage="Proceeds"
        />}
      >
        <PrintAsset
          mode={'text'}
          value={calculatorStep.operationProceeds}
          asset={calculatorStep.operationResidenceCurrency}
          colors={colors}/>
      </Form.Item>);

      output.push(<Form.Item
        key={'o-gain_loss'}
        {...formItemLayout}
        label={<PrintGainLossLabel gainLoss={calculatorStep.operationGainLoss}/>}
      >
        <PrintAsset
          mode={'text'}
          value={calculatorStep.operationGainLoss}
          asset={calculatorStep.operationResidenceCurrency}
          colors={colors}/>
      </Form.Item>);
    } else {
      output.push(<Form.Item
        key={'o-cost'}
        {...formItemLayout}
        label={<FormattedMessage
          id="OperationDetailsOperation.costBasis"
          defaultMessage="Cost Basis"
        />}
      >
        <PrintAsset
          mode={'text'}
          value={calculatorStep.operationCostBasis}
          asset={calculatorStep.operationResidenceCurrency}
          colors={colors}/>
      </Form.Item>);
    }
    output.push(<div key={'used-assets'} style={{marginTop: '56px'}}>
      <TableCostBasis
        key={'o-used-costs'}
        title={<span>
          <FontAwesomeIcon icon={faBox} style={{marginRight: '4px'}} />
          <FormattedMessage
            id="OperationDetailsOperation.TableCostBasis"
            defaultMessage="Cost Basis Details"
          /></span>}
        operation={operation}
        operationQueue={operationQueue}
        trackLocations={operation.calculatorStep.setup.trackLocations}
        currentOperationKey={operation.key}
        expenseList={(calculatorStep.operationCostsTaken && calculatorStep.operationCostsTaken.usedCosts) || []}
        asset={operation.from.asset}
        colors={colors}
      />
    </div>);
    return (
      <Form>
        <div style={{marginTop: '32px'}}>
          {output}
        </div>
      </Form>
    );
  }
}

export default OperationDetailsOperation;
