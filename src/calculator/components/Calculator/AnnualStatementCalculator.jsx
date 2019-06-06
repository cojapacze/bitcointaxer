import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {TableOperations,
  TableUnknownCosts
} from '../Tables';
import {PrintBadge} from '../Print';
import CalculatorCharts from './CalculatorCharts';
import CalculatorSummaryPersonal from './CalculatorSummaryPersonal';
import CalculatorSummaryBusiness from './CalculatorSummaryBusiness';
import CalculatorSummaryBusinessTotal from './CalculatorSummaryBusinessTotal';
import CalculatorSetup from './CalculatorSetup';
import {
  Button,
  Col,
  Row,
  Spin
} from 'antd';

import {CONFIG} from '../../services/taxCalc/libs/Utils';
import {reports} from '../../services/taxCalc/reports';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSave} from '@fortawesome/free-regular-svg-icons';
import {faLockOpen, faCheck, faExclamation} from '@fortawesome/free-solid-svg-icons';

class AnnualStatementCalculator extends React.Component {
  static propTypes = {
    calculator: PropTypes.object,
    calculatorStep: PropTypes.object,
    colors: PropTypes.bool
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
  }
  applySetups() {
    const {calculator} = this.state;
    calculator.reevaluateOperations();
    calculator.markSetupAsDefault();
    this.forceUpdate();
  }
  getDefaultTitle() {
    const calculatorStep = this.props.calculatorStep;
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

    return <span><FormattedMessage
      id="OperationsGenesis.titleSummary"
      defaultMessage="Unknown Cost Basis ({unknownCostBasisFixed}/{unknownCostBasisTotal})"
      values={{
        unknownCostBasisFixed,
        unknownCostBasisTotal
      }}
      description="title of genesis table"
    /><PrintBadge badgeContent={badgeContent} badgeType={badgeType}/></span>;
  }
  render() {
    const {calculator, colors} = this.state;
    if (!calculator) {
      return <div className="empty-box"><Spin /></div>;
    }
    if (calculator.uncalculatedOperations) {
      return <div className="empty-box"><Spin tip={<FormattedMessage
        id="AnnualStatementCalculator.calculating"
        defaultMessage="Calculating..."
      />} /></div>;
    }

    const elements = [];

    const calculatorStep = calculator.getSummaryOperation().calculatorStep;
    if (CONFIG.features.annualUnknownAssets) {
      elements.push(<Row key="unknownAssets">
        <Col
          xs={{span: 24, offset: 0}}
          sm={{span: 24, offset: 0}}
          md={{span: 24, offset: 0}}
          lg={{span: 22, offset: 1}}
          xl={{span: 18, offset: 3}}
          xxl={{span: 16, offset: 4}}
        >
          <TableUnknownCosts
            key="unknown-costs"
            expandRowByClick={false}
            operationQueue={calculator.operationQueue}
            costs={calculator.missingCosts}
            calculatorStep={calculatorStep}
            colors={colors}/>
          <div style={{height: '3vw'}}/>
        </Col>
      </Row>);
    }

    const setup = calculator.getSetup();
    let downloadBtn = '';
    if (setup.activityType === 'business') {
      downloadBtn = <Button
        size="small"
        onClick={() => {
          reports.kpir(calculator);
        }}
      ><FontAwesomeIcon style={{marginRight: '8px'}} icon={faSave} /> <FormattedMessage
          id="AnnualStatementCalculator.saveAsPDF"
          defaultMessage="Save as PDF"
        /></Button>;
    }
    if (setup.activityType === 'personal') {
      downloadBtn = <Button
        size="small"
        onClick={() => {
          reports.personal(calculator);
        }}
      ><FontAwesomeIcon style={{marginRight: '8px'}} icon={faSave} /> <FormattedMessage
          id="AnnualStatementCalculator.saveAsCSV"
          defaultMessage="Save as CSV"
        /></Button>;
    }
    const tableFooter = <Row>
      <Col span={12}>
        {downloadBtn}
      </Col>
      <Col span={12} style={{textAlign: 'right', opacity: 0.5}}>
        <FormattedMessage
          id="AnnualStatementCalculator.checksum"
          defaultMessage="Checksum hash: {hash}"
          values={{
            hash: calculator.getCalculatorHash()
          }}
        /><FontAwesomeIcon style={{marginLeft: '8px'}} icon={faLockOpen} />
      </Col>
    </Row>;
    if (CONFIG.features.operationTable) {
      elements.push(<TableOperations
        key="table"
        title={<CalculatorSetup calculator={calculator}/>}
        footer={tableFooter}
        operationQueue={calculator.operationQueue}
        calculator={calculator}
        data={calculator.operationQueue.getOperations({year: calculator.year})}
        year={calculator.year}
      />);
      elements.push(<Row
        key="charts"
      >
        <Col
          xs={{span: 24, offset: 0}}
          sm={{span: 24, offset: 0}}
          md={{span: 22, offset: 1}}
          lg={{span: 20, offset: 2}}
          xl={{span: 18, offset: 3}}
        >
          <CalculatorCharts calculator={calculator} colors={colors}/>
        </Col>
      </Row>);
    }
    if (setup.activityType === 'business') {
      if (CONFIG.features.summary) {
        elements.push(<Row
          key="summary-business"
        >
          <Col
            xs={{span: 24, offset: 0}}
            sm={{span: 24, offset: 0}}
            md={{span: 22, offset: 1}}
            lg={{span: 20, offset: 2}}
            xl={{span: 18, offset: 3}}
          >
            <CalculatorSummaryBusiness calculator={calculator} colors={colors}/>
          </Col>
        </Row>);
      }
    } else if (CONFIG.features.summary) {
      elements.push(<Row
        key="summary-personal"
      >
        <Col
          xs={{span: 24, offset: 0}}
          sm={{span: 24, offset: 0}}
          md={{span: 22, offset: 1}}
          lg={{span: 20, offset: 2}}
          xl={{span: 18, offset: 3}}
        >
          <CalculatorSummaryPersonal calculator={calculator} colors={colors}/>
        </Col>
      </Row>);
    }

    if (setup.activityType === 'business') {
      elements.push(<Row
        key="summary-business-total"
      >
        <Col
          xs={{span: 24, offset: 0}}
          sm={{span: 24, offset: 0}}
          md={{span: 22, offset: 1}}
          lg={{span: 20, offset: 2}}
          xl={{span: 18, offset: 3}}
        >
          <CalculatorSummaryBusinessTotal calculator={calculator} colors={colors}/>
        </Col>
      </Row>);
    }

    return <div>
      {elements}
      <div style={{height: '12vw'}}/>
    </div>;
  }
}

export default AnnualStatementCalculator;
