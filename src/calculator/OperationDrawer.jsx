import React from 'react';

import {
  PrintTimestamp,
  PrintOperationExchangeRate,
  PrintOperationFilePointer,
  PrintOperation,
  PrintOperationNo
} from './components/Print';
import {operationQueue} from './services/taxCalc/index.js';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faArrowDown, faArrowUp, faBarcode} from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  Drawer
} from 'antd';
import OperationDetails from './components/OperationDetails/OperationDetails';

class OperationDrawer extends React.Component {
  state = {
    displayOperationDetailsDrawer: false,
    tabKey: 'valuation'
  }
  static getDerivedStateFromProps(props) {
    return props;
  }
  constructor(props) {
    super();
    Object.assign(this.state, props);
    operationQueue.on('close-drawer', () => {
      this.setState({
        displayOperationDetailsDrawer: false
      });
      operationQueue.drawerOpened = false;
    });
    operationQueue.on('change-currentOperation', currentOperation => {
      this.setState({
        currentOperation: currentOperation
      });
    });
    operationQueue.on('open-drawer', () => {
      this.setState({
        displayOperationDetailsDrawer: true
      });
      operationQueue.drawerOpened = true;
    });
    operationQueue.on('open-drawer-tab', (activeTab, focus) => {
      this.setState({
        displayOperationDetailsDrawer: true,
        tabKey: activeTab
      });
      operationQueue.drawerOpened = true;
      setTimeout(() => {
        const focusEl = document.getElementById(focus);
        if (focusEl && typeof focusEl.focus === 'function') {
          // console.log('Focus to element', focus);
          focusEl.focus();
          if (focusEl instanceof HTMLInputElement) {
            focusEl.select();
          }
        }
      }, 500);
    });
    // document.addEventListener('keydown', e => {
    //   if (e.keyCode === 27) {
    //     this.setState({
    //       displayOperationDetailsDrawer: false
    //     });
    //     operationQueue.drawerOpened = false;
    //   }
    // });
  }

  onOperationDetailsClose() {
    this.setState({
      displayOperationDetailsDrawer: false
    });
    operationQueue.drawerOpened = false;
    operationQueue.dispatch('drawer-closed');
  }

  render() {
    const {displayOperationDetailsDrawer, tabKey} = this.state;
    const currentOperation = operationQueue.getCurrent();
    const colors = true;
    let exRate = false;
    let source = false;
    if (!currentOperation || !currentOperation.from || !currentOperation.to) {
      return false;
    }
    if (currentOperation) {
      if ((currentOperation.from.asset !== currentOperation.to.asset)) {
        exRate = <PrintOperationExchangeRate operation={currentOperation} colors={colors}/>;
      }
      if (currentOperation.sourcefile && currentOperation.sourcefile.basename) {
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
    return <Drawer
      visible={displayOperationDetailsDrawer}
      maskClosable={true}
      title={<div style={{margin: '-4px'}}>
        <Button style={{margin: '0px 32px 0px 0px'}} type="dashed" shape="circle" onClick={() => {
          operationQueue.selectPrev();
        }}>
          <FontAwesomeIcon icon={faArrowUp} />
        </Button>
        <PrintOperationNo operation={currentOperation} colors={colors}/>
        <Button style={{margin: '0px 0px 0px 32px'}} type="dashed" shape="circle" onClick={() => {
          operationQueue.selectNext();
        }}>
          <FontAwesomeIcon icon={faArrowDown} />
        </Button>
        <div style={{float: 'right', marginRight: '32px'}}>
          <PrintTimestamp timestamp={currentOperation && currentOperation.timestamp} colors={colors}/>
          <Button
            style={{marginLeft: '16px'}}
            shape="circle"
            onClick={() => operationQueue.dispatch('open-stocktaking-drawer')}
          >
            <FontAwesomeIcon icon={faBarcode} />
          </Button>
        </div>
        {source}
      </div>}
      onClose={this.onOperationDetailsClose.bind(this)}
      width={990}
      placement={'right'}
    >
      <div style={{marginTop: '16px'}}>
        <center>
          <div><PrintOperation operation={currentOperation} colors={colors}/></div>
          {(exRate) ? <div style={{marginTop: '16px', fontStyle: 'italic'}}>({exRate})</div> : ''}
        </center>
      </div>
      <div style={{marginTop: '32px'}}>
        <OperationDetails operationQueue={operationQueue} currentOperation={currentOperation} tabKey={tabKey}/>
      </div>
    </Drawer>;
  }
}

export default OperationDrawer;
