import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import moment from 'moment';
import {Spin} from 'antd';
import {PrintBadge} from './components/Print';
import {TableUnknownCosts} from './components/Tables';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheck, faExclamation} from '@fortawesome/free-solid-svg-icons';
class OperationsGenesis extends React.Component {
  static propTypes = {
    operationQueue: PropTypes.object
  };
  state = {
    currentDate: moment()
  }
  static getDerivedStateFromProps(props) {
    return props;
  }
  constructor(props) {
    super(props);
    const operationQueue = props.operationQueue;
    this.state = {
      colors: true,
      operationQueue: operationQueue
    };
  }
  componentDidMount() {
  }
  componentWillUnmount() {
  }
  render() {
    const {colors, operationQueue} = this.state;
    const calculatorStep = operationQueue && operationQueue.getLastCalculatorStep();
    if (!calculatorStep) {
      return <div className="empty-box"><Spin /></div>;
    }
    const unknownCostBasisFixed = calculatorStep.missingCostsGlobal && calculatorStep.missingCostsGlobal.reduce((prev, curr) => {
      if (curr.errorResolved) {
        return prev + 1;
      }
      return prev;
    }, 0);
    const unknownCostBasisTotal = calculatorStep.missingCostsGlobal && calculatorStep.missingCostsGlobal.length;
    let badgeContent = <FontAwesomeIcon icon={faCheck} />;
    let badgeType = 'default';
    if (unknownCostBasisFixed !== unknownCostBasisTotal) {
      badgeContent = <FontAwesomeIcon icon={faExclamation} />;
      badgeType = 'error';
    }
    return (
      <div>
        <TableUnknownCosts
          expandRowByClick={false}
          operationQueue={operationQueue}
          title={<span><FormattedMessage
            id="OperationsGenesis.titleSummary"
            defaultMessage="Unknown Cost Basis ({unknownCostBasisFixed}/{unknownCostBasisTotal})"
            values={{
              unknownCostBasisFixed,
              unknownCostBasisTotal
            }}
            description="title of genesis table"
          /><PrintBadge badgeContent={badgeContent} badgeType={badgeType}/></span>}
          costs={calculatorStep.missingCostsGlobal}
          calculatorStep={calculatorStep}
          colors={colors}/>
      </div>
    );
  }
}

export default OperationsGenesis;
