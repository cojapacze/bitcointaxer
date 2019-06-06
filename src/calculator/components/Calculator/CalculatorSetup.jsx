import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {
  EditSetupCalculator,
  EditSetupCalculatorTaxResidence,
  EditSetupValuation
} from '../Edit';
import {
  Button,
  Collapse,
  Spin
} from 'antd';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faMagic} from '@fortawesome/free-solid-svg-icons';

class CalculatorSetup extends React.Component {
  static propTypes = {
    calculator: PropTypes.object
  }
  static getDerivedStateFromProps(props) {
    return props;
  }

  constructor(props) {
    super(props);
    const {calculator} = props;
    this.state = {
      calculator: calculator
    };
    this.calculator = calculator;
    if (!calculator) {
      console.error('AnnualStatementCalculator:constructor - no calculator in props');
      return;
    }
    this.operationQueue = calculator.operationQueue;
    this.year = calculator.year;
    this.autoUpdate = () => this.forceUpdate();
  }
  componentDidMount() {
    this.calculator.after('setup-modified', this.autoUpdate);
  }
  componentWillUnmount() {
    this.calculator.removeListener('setup-modified', this.autoUpdate);
  }
  applySetups() {
    const {calculator} = this.state;
    calculator.operationsSplitedIntoContractsUpToValue = false;
    calculator.setupCalculatorOperations();
    calculator.setupDefaultOperations();
    calculator.reevaluateOperations();
    calculator.recalculateCalculatorOperations();
    calculator.markSetupAsDefault();
    this.forceUpdate();
  }
  render() {
    const {calculator} = this.state;
    if (!calculator) {
      return <div className="empty-box"><Spin /></div>;
    }
    const isSetupModified = calculator.setupModified;
    const customPanelStyle = {
      border: 0
    };
    return <div>
      <h2><FormattedMessage
        id="AnnualStatementCalculator.title"
        defaultMessage="{year} Annual Report"
        values={{
          year: calculator.year
        }}
      /></h2>
      <EditSetupCalculatorTaxResidence
        calculator={calculator}
      />
      <Collapse bordered={false} defaultActiveKey={['calculator']}>
        <Collapse.Panel style={customPanelStyle} header={<FormattedMessage
          id="AnnualStatementCalculator.calculationSetupTitle"
          defaultMessage="Calculation"
        />} key="calculator">
          <EditSetupCalculator
            calculator={calculator}
          />
        </Collapse.Panel>
        <Collapse.Panel style={customPanelStyle} header={<FormattedMessage
          id="AnnualStatementCalculator.valuationSetupTitle"
          defaultMessage="Valuation"
        />} key="valuation">
          <EditSetupValuation
            calculator={calculator}
          />
        </Collapse.Panel>
      </Collapse>
      <div style={{textAlign: 'right'}}>
        <Button
          type="danger"
          disabled={!isSetupModified}
          onClick={this.applySetups.bind(this)}
        ><FontAwesomeIcon icon={faMagic} style={{marginRight: '4px'}} /><FormattedMessage
            id="AnnualStatementCalculator.applySetups"
            defaultMessage="Apply"
          /></Button>
      </div>
    </div>;
  }
}

export default CalculatorSetup;
