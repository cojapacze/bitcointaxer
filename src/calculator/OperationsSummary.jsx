import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import moment from 'moment';

import {TableBalancesBasic} from './components/Tables';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCalculator} from '@fortawesome/free-solid-svg-icons';

class OperationsSummary extends React.Component {
  static propTypes = {
    operationQueue: PropTypes.object
  };
  state = {
    currentDate: moment()
  }
  constructor(props) {
    super(props);
    const operationQueue = props.operationQueue;
    this.state = {
      colors: true,
      operationQueue: operationQueue
    };
  }
  render() {
    const {colors, operationQueue} = this.state;
    const calculatorStep = operationQueue && operationQueue.getLastCalculatorStep();
    if (!calculatorStep) {
      return <div>unknown calculator step</div>;
    }
    return (
      <div>
        <TableBalancesBasic
          operationQueue={operationQueue}
          title={<span>
            <FontAwesomeIcon icon={faCalculator} style={{marginRight: '4px'}} />
            <FormattedMessage id="OperationsSummary.balances" defaultMessage="Balances"/>
          </span>}
          balances={(calculatorStep && calculatorStep.locBalances) || 'off-calculatorStep'}
          colors={colors}/>
      </div>
    );
  }
}

export default OperationsSummary;
