import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import OperationDetailsValuation from './OperationDetailsValuation';
import OperationDetailsOperation from './OperationDetailsOperation';
import OperationDetailsBalance from './OperationDetailsBalance';
import OperationDetailsError from './OperationDetailsError';
// import OperationDetailsExtra from './OperationDetailsExtra';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheck, faExclamation} from '@fortawesome/free-solid-svg-icons';
import {Tabs} from 'antd';
import {PrintAssetLabel, PrintOperationTypeLabel} from '../Print';

class OperationDetails extends React.Component {
  static propTypes = {
    operationQueue: PropTypes.object,
    currentOperation: PropTypes.object,
    tabKey: PropTypes.string,
    colors: PropTypes.bool
  }
  state = {}
  static getDerivedStateFromProps(props) {
    return props;
  }
  constructor(props) {
    super(props);
    const {operationQueue, tabKey} = props;
    this.state = {
      operationQueue,
      tabKey
    };
    if (!operationQueue) {
      throw new Error('operationQueue required');
    }
    this.operationQueue = operationQueue;
    this.autoUpdate = () => this.forceUpdate();
  }
  componentDidMount() {
    this.operationQueue.after('change-currentOperation', this.autoUpdate);
    this.operationQueue.after('change', this.autoUpdate);
    this.operationQueue.after('operation-changed', this.autoUpdate);
    this.operationQueue.prices.after('operation-valuation-finish', this.autoUpdate);
  }
  componentWillUnmount() {
    this.operationQueue.removeListener('change-currentOperation', this.autoUpdate);
    this.operationQueue.removeListener('change', this.autoUpdate);
    this.operationQueue.removeListener('operation-changed', this.autoUpdate);
    this.operationQueue.prices.removeListener('operation-valuation-finish', this.autoUpdate);
  }

  renderOperation() {
    const {tabKey, operationQueue} = this.state;
    const operation = operationQueue.getCurrent();
    const residenceCurrency = (operation && operation.calculatorStep && operation.calculatorStep.residenceCurrency) || 'ERR';
    if (residenceCurrency === 'ERR') {
      return <div>loading calculator...</div>;
    }
    const tabs = [];
    // Errors
    if (operation.currentErrors && operation.currentErrors.length) {
      let badgeIcon = operation.currentErrors.length;
      const badgeIconStyle = {
        color: 'blue',
        border: '1px solid black',
        borderRadius: '50%',
        display: 'inline-block',
        width: '16px',
        height: '16px',
        fontSize: '10px',
        textAlign: 'center',
        position: 'relative',
        top: '-4px'
      };
      if (operation.currentErrors.length) {
        badgeIconStyle.color = '#f5222d';
        badgeIconStyle.borderColor = '#f5222d';
        badgeIcon = <div style={badgeIconStyle}>
          <FontAwesomeIcon icon={faExclamation} />
        </div>;
      }
      if (
        operation.calculatorStep.operationMissingCostPart &&
        operation.calculatorStep.operationMissingCostPart.errorResolved
      ) {
        badgeIconStyle.color = 'unset';
        badgeIconStyle.borderColor = 'unset';
        badgeIcon = <div style={badgeIconStyle}>
          <FontAwesomeIcon icon={faCheck} />
        </div>;
      }
      // if (operation.calculatorStep.operationMissingCostPart.notes) {
      //   // badgeIconStyle.color = 'unset';
      //   // badgeIconStyle.borderColor = 'green';
      //   badgeIcon = <div style={badgeIconStyle}>
      //     <FontAwesomeIcon icon={faStickyNote} />
      //   </div>;
      // }
      tabs.push(
        <Tabs.TabPane tab={<div><FormattedMessage
          id="OperationDetails.errors"
          defaultMessage="Errors"
        />{badgeIcon}</div>} key="errors">
          <div style={{textAlign: 'left'}}>
            <OperationDetailsError operationQueue={operationQueue} colors={true}/>
          </div>
        </Tabs.TabPane>
      );
    }

    // Operation
    tabs.push(
      <Tabs.TabPane tab={<PrintOperationTypeLabel operation={operation} mode={'fcuppercase'}/>} key="operation">
        <div style={{textAlign: 'left'}}>
          <OperationDetailsOperation operationQueue={operationQueue} colors={true}/>
        </div>
      </Tabs.TabPane>
    );
    // Valuation
    tabs.push(
      <Tabs.TabPane tab={<div><FormattedMessage
        id="OperationDetails.valuation"
        defaultMessage="{asset} Valuation"
        values={{
          asset: <PrintAssetLabel asset={residenceCurrency} />
        }}
      /></div>} key="valuation">
        <div style={{textAlign: 'left'}}>
          <OperationDetailsValuation
            operation={operation}
            operationQueue={operationQueue}
            colors={true}
          />
        </div>
      </Tabs.TabPane>
    );
    // Balance
    tabs.push(
      <Tabs.TabPane tab={<FormattedMessage
        id="OperationDetails.balance"
        defaultMessage="Balance"
      />} key="balance">
        <div style={{textAlign: 'left'}}>
          <OperationDetailsBalance operationQueue={operationQueue} colors={true}/>
        </div>
      </Tabs.TabPane>
    );

    // tabs.push(
    //   <Tabs.TabPane tab={<FormattedMessage
    //     id="OperationDetails.extra"
    //     defaultMessage="Extra"
    //   />} key="extra">
    //     <div style={{textAlign: 'left'}}>
    //       <OperationDetailsExtra operation={operation} colors={true}/>
    //     </div>
    //   </Tabs.TabPane>
    // );

    return (
      <div style={{textAlign: 'center'}}>
        <Tabs
          activeKey={tabKey}
          onChange={activeKey => {
            operationQueue.dispatch('open-drawer-tab', activeKey);
          }}
        >
          {tabs}
        </Tabs>
      </div>
    );
  }
  render() {
    const {
      operationQueue
    } = this.state;
    const currentOperation = operationQueue.getCurrent();
    const recordType = (currentOperation && currentOperation.type) || 'unknown';
    switch (recordType) {
      case 'unknown':
        return <div style={{textAlign: 'center'}}>
          {/* <h1><FontAwesomeIcon icon={faExclamationSquare} /></h1> */}
        </div>;
      default:
        return this.renderOperation(currentOperation);
    }
  }
}
export default OperationDetails;
