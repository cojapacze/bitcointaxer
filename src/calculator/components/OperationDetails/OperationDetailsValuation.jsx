import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Button} from 'antd';

import {EditOperationValuation} from '../Edit';

class OperationDetailsValuation extends React.Component {
  static propTypes = {
    operation: PropTypes.object
  }
  state = {}

  static getDerivedStateFromProps(props) {
    return props;
  }

  constructor(props) {
    super(props);
    const operation = props.operation;
    if (!operation.operationQueue) {
      throw new Error('operation.operationQueue required!');
    }
    this.state = {
      operation: operation
    };
  }

  render() {
    const {operation, colors} = this.state;
    const {calculator, operationQueue} = operation;
    if (!operation.operationQueue) {
      throw new Error('operation.operationQueue required!');
    }
    const evaluateBtn = <div
      style={{
        marginTop: '32px',
        textAlign: 'center'
      }}
    >
      <h3><FormattedMessage
        id="OperationDetailsValuation.evaluate.title"
        defaultMessage="Check price"
      /></h3>
      <Button
        type={'primary'}
        onClick={() => calculator.evaluateOperation(operation)}>
        <FormattedMessage
          id="OperationDetailsValuation.evaluate"
          defaultMessage="Evaluate"
        />
      </Button>
    </div>;

    if (!operation) {
      return <div>Unknown operation</div>;
    }
    if (!operation.valuation || !operation.valuation.resolved) {
      return <div>{evaluateBtn}</div>;
    }
    return <div style={{marginTop: '40px'}}>
      <EditOperationValuation
        operation={operation}
        operationQueue={operationQueue}
        colors={colors}
      />
    </div>;
  }
}


export default OperationDetailsValuation;
