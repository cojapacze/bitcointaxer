import React from 'react';
import PropTypes from 'prop-types';
import {
  PrintTimestamp,
  PrintOperationFilePointer,
  PrintOperationNo
} from './components/Print';
import {
  TableStocktaking,
  TableBalances
} from './components/Tables';

import {operationQueue} from './services/taxCalc/index.js';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faArrowDown, faArrowUp} from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  Drawer
} from 'antd';

class OperationStocktakingDrawer extends React.Component {
  static propTypes = {
    colors: PropTypes.bool
  }
  static getDerivedStateFromProps(props) {
    return props;
  }
  constructor(props) {
    super(props);
    this.autoUpdate = operation => {
      if (!operation) {
        return;
      }
      operation.calculator.stocktaking(operation);
      this.operation = operation;
      this.forceUpdate();
    };
    this.state = {
    };
    operationQueue.on('open-stocktaking-drawer', () => {
      const operation = operationQueue.getCurrent();
      this.autoUpdate(operation);
      this.setState({
        currentOperation: this.operation,
        displayOperationStocktakingDrawer: true
      });
      operationQueue.drawerStocktakingOpened = true;
    });
    operationQueue.on('change-currentOperation', currentOperation => {
      this.autoUpdate(currentOperation);
      this.setState({
        currentOperation: this.operation
      });
    });
    operationQueue.on('close-stocktaking-drawer', () => {
      this.setState({
        displayOperationStocktakingDrawer: false
      });
      operationQueue.drawerStocktakingOpened = false;
    });
  }

  onOperationStocktakingClose() {
    this.setState({
      displayOperationStocktakingDrawer: false
    });
    operationQueue.drawerStocktakingOpened = false;
    operationQueue.dispatch('drawer-stocktaking-closed');
  }

  render() {
    const {displayOperationStocktakingDrawer, colors} = this.state;
    const currentOperation = operationQueue.getCurrent();
    let source = false;
    if (currentOperation) {
      if (currentOperation.sourcefile && currentOperation.sourcefile.basename && currentOperation.REM) {
        source = <span
          style={{
            fontSize: '90%',
            fontWeight: 'lighter',
            marginLeft: '32px',
            opacity: 0.5
          }}
        ><PrintOperationFilePointer operation={currentOperation} colors={colors} /></span>;
      }
    }
    let tableBalances = false;
    if (currentOperation && currentOperation.calculatorStep && currentOperation.calculatorStep.setup && currentOperation.calculatorStep.setup.trackLocations) {
      tableBalances = <TableBalances
        key="table-balances"
        operationQueue={operationQueue}
        balances={(currentOperation && currentOperation.calculatorStep && currentOperation.calculatorStep.locBalances) || 'off-calculatorStep'}
        colors={colors}/>;
    }
    return <Drawer
      visible={displayOperationStocktakingDrawer}
      placement={'right'}
      maskClosable={true}
      width={'100%'}
      title={<div style={{margin: '-4px'}}>
        <Button style={{margin: '0px 32px 0px 0px'}} type="dashed" shape="circle" onClick={() => {
          operationQueue.selectPrev();
          // operationQueue.dispatch('open-drawer');
        }}>
          <FontAwesomeIcon icon={faArrowUp} />
        </Button>
        <PrintOperationNo operation={currentOperation} colors={colors}/>
        <Button style={{margin: '0px 0px 0px 32px'}} type="dashed" shape="circle" onClick={() => {
          operationQueue.selectNext();
          // operationQueue.dispatch('open-drawer');
        }}>
          <FontAwesomeIcon icon={faArrowDown} />
        </Button>
        <div style={{float: 'right', marginTop: '6px', marginRight: '32px'}}>
          <PrintTimestamp timestamp={currentOperation && currentOperation.timestamp} colors={colors}/>
        </div>
        {source}
      </div>}
      // mask={false}
      onClose={this.onOperationStocktakingClose.bind(this)}
    >
      <div style={{marginTop: '16px'}}></div>
      <TableStocktaking
        colors={colors}
        operation={currentOperation}
      />
      <div style={{height: '32px'}}/>
      {tableBalances}
    </Drawer>;
  }
}

export default OperationStocktakingDrawer;
