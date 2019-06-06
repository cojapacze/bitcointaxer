import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {withRouter} from 'react-router-dom';
import {Spin} from 'antd';
import Uploader from './Uploader';
import {TableStocktaking} from './components/Tables';
import PriceLoadingProgress from './components/Loader/PriceLoadingProgress';
import OperationsGenesis from './OperationsGenesis';
import AnnualStatementCalculator from './components/Calculator/AnnualStatementCalculator';
import OperationsSummary from './OperationsSummary';
import OperationDrawer from './OperationDrawer';
import OperationStocktakingDrawer from './OperationStocktakingDrawer';
import {CONFIG
} from './services/taxCalc/libs/Utils';
import Download from './Download';

import {
  Affix,
  Button,
  Checkbox,
  Col,
  Divider,
  Row,
  notification
} from 'antd';

class MainCalculator extends React.Component {
  static propTypes = {
    operationQueue: PropTypes.object
  }
  state = {
    operationQueue: false,
    displayOperationDetailsDrawer: false,
    displayDevTools: false
  }
  static getDerivedStateFromProps(props) {
    return props;
  }

  constructor(props) {
    super();
    const {operationQueue} = props;

    this.operationQueue = operationQueue;

    this.state.operationQueue = operationQueue;

    operationQueue.after('drawer-closed', () => {
      operationQueue.recalculateIfModified();
    });
    operationQueue.on('recalculate-calculator-start', () => {
      this.setState({
        calculating: true
      });
    });
    operationQueue.after('calculators-finish', () => {
      this.redraw();
    });
    operationQueue.after('last-calculator-finish', operationQueueNew => {
      this.setState({
        operationQueue: operationQueueNew,
        calculating: false
      });
      this.redraw();
    });

    document.addEventListener('keydown', e => {
      if (e.keyCode === 27) {
        if (operationQueue.drawerStocktakingOpened) {
          operationQueue.dispatch('close-stocktaking-drawer');
        } else if (operationQueue.drawerOpened) {
          operationQueue.dispatch('close-drawer');
        }
      }
    });
  }

  redraw() {
    if (this.redrawPostponed) {
      clearTimeout(this.redrawPostponed);
      this.redrawPostponed = false;
    }
    this.redrawPostponed = setTimeout(() => this.forceUpdate(), 100);
  }
  recalculate() {
    this.operationQueue.recalculateOperations();
  }

  render() {
    const {displayDevTools, operationQueue, calculating, colors} = this.state;
    const annualYears = operationQueue.getAnnualStatementYears();
    const annualYearsEls = annualYears.map(year => {
      const calculator = operationQueue.getAnnualYearCalculator(year);
      return <AnnualStatementCalculator
        calculator={calculator}
        colors={colors}
        key={`annual-statement-calculator-${year}`}
      />;
    });
    const devtoolsEl = <div style={{textAlign: 'right', opacity: 0.4}}>
      <h4><Checkbox onClick={e => this.setState({displayDevTools: e.target.checked})}/></h4>
      {(displayDevTools) ? <div>
        <Checkbox
          checked={operationQueue.console.config.displayMessages}
          onClick={e => {
            operationQueue.console.setConfig({
              displayMessages: e.target.checked
            });
            this.redraw();
          }}
        ><FormattedMessage
            id="MainCalculator.displayMessages"
            defaultMessage="Display messages"
          /></Checkbox>
        <Divider type="vertical" />
        <Checkbox
          checked={operationQueue.console.config.displayErrors}
          onClick={e => {
            operationQueue.console.setConfig({
              displayErrors: e.target.checked
            });
            this.redraw();
          }}
        ><FormattedMessage
            id="MainCalculator.displayErrors"
            defaultMessage="Display errors"
          /></Checkbox>
        <Divider type="vertical" />
        <Button onClick={() => notification.destroy()}><FormattedMessage
          id="MainCalculator.dismissAllErrors"
          defaultMessage="Dismiss all errors"
        ></FormattedMessage></Button>
        <Divider type="vertical" />
        <Button onClick={this.redraw.bind(this)}><FormattedMessage
          id="MainCalculator.redraw"
          defaultMessage="Redraw"
        ></FormattedMessage></Button>
        <Divider type="vertical" />
        <Button onClick={this.recalculate.bind(this)}><FormattedMessage
          id="MainCalculator.recalculate"
          defaultMessage="Recalculate"
        ></FormattedMessage></Button>
      </div> : ''}
    </div>;

    const elements = [];
    elements.push(
      <Row key="uploader">
        <Col
          xs={{span: 24, offset: 0}}
          sm={{span: 24, offset: 0}}
          md={{span: 20, offset: 2}}
          lg={{span: 16, offset: 4}}
          xl={{span: 12, offset: 6}}
          xxl={{span: 10, offset: 7}}
        >
          <Uploader />
          {/* <Uploader /> */}
        </Col>
      </Row>
    );
    if (CONFIG.features.priceLoader) {
      if (annualYearsEls.length) {
        elements.push(<Row key="priceLoader">
          <Col
            xs={{span: 24, offset: 0}}
            sm={{span: 24, offset: 0}}
            md={{span: 24, offset: 0}}
            lg={{span: 22, offset: 1}}
            xl={{span: 18, offset: 3}}
            xxl={{span: 16, offset: 4}}
          >
            <div style={{height: '64px'}}/>
            <PriceLoadingProgress prices={operationQueue.prices}/>
            <div style={{height: '96px'}}/>
          </Col>
        </Row>);
      }
    }
    if (CONFIG.features.unknownAssets) {
      if (annualYearsEls.length) {
        elements.push(<Row key="unknownAssets">
          <Col
            xs={{span: 24, offset: 0}}
            sm={{span: 24, offset: 0}}
            md={{span: 24, offset: 0}}
            lg={{span: 22, offset: 1}}
            xl={{span: 18, offset: 3}}
            xxl={{span: 16, offset: 4}}
          >
            <div style={{height: '6vw'}}/>
            <OperationsGenesis operationQueue={operationQueue}/>
          </Col>
        </Row>);
      }
    }
    // elements.push(<OperationsCalendar key="calendar"/>);
    if (CONFIG.features.devTools) {
      elements.push(<div key="devtools">
        <div style={{height: '6vw'}}/>
        {devtoolsEl}
        <div style={{height: '3vw'}}/>
      </div>);
    }
    if (annualYearsEls.length) {
      elements.push(<div key="annual-tables">{annualYearsEls}</div>);
      elements.push(<Row key="summary">
        <Col
          xs={{span: 24, offset: 0}}
          sm={{span: 24, offset: 0}}
          md={{span: 24, offset: 0}}
          lg={{span: 22, offset: 1}}
          xl={{span: 18, offset: 3}}
          xxl={{span: 16, offset: 4}}
        >
          <OperationsSummary operationQueue={operationQueue}/>
        </Col>
      </Row>);

      if (CONFIG.features.stocktakingNOW) {
        const stocktaking = operationQueue.currentStocktakingOperation;
        elements.push(<div
          key="stocktaking-now"
          style={{marginTop: '36px'}}><TableStocktaking
            colors={colors}
            operation={stocktaking}
          /></div>);
      }
    }
    // elements.push(<div>
    //   <div style={{height: '6vw'}}/>
    //   <Pay />
    // </div>);
    elements.push(<div
      hidden
      key={'download'}
    >
      <div style={{height: '6vw'}}/>
      <Download
        operationQueue={operationQueue}
      />
    </div>);
    let affix = false;
    if (CONFIG.features.demoSeal) {
      affix = <Affix
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          margin: '112px 48px',
          zIndex: 999999999
        }}>
        <div style={{
          opacity: 0.9,
          background: 'rgba(255,0,0,.7)',
          // border: '1px solid rgba(255,0,0,.5)',
          color: 'white',
          padding: '8px 16px',
          borderRadius: '1px',
          fontSize: '12px',
          fontWeight: 300,
          transform: 'rotate(-20deg)',
          marginLeft: '-27px'
        }}><FormattedMessage
            id="MainCalculator.seal"
            defaultMessage="Demo Purpose Only"
            description="demo seal: Demo Purpose Only"
          ></FormattedMessage></div>
      </Affix>;
    }
    let calculatingEl = false;
    if (calculating) {
      calculatingEl = <Spin
        size="large"
        tip={<FormattedMessage id="MainCalculator.calculating" defaultMessage="Calculating..." />}
        style={{
          position: 'fixed',
          bottom: '32px',
          left: '32px'
        }}
      />;
    }
    return <div>
      {/* <TablePrices operationQueue={operationQueue}/> */}
      <OperationDrawer key="operation-drawer" />
      <div key="separator-top" style={{height: '6vw'}}/>
      {elements}
      <div style={{height: '12vw'}}/>
      {affix}
      <OperationStocktakingDrawer
        colors={colors}
        key="operation-stocktaking-drawer"
      />
      {calculatingEl}
    </div>;
  }
}

export default withRouter(MainCalculator);
