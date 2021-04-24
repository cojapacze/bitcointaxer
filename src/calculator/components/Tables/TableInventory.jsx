import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';

import {Table} from 'antd';

import {PrintAsset, PrintButton, PrintOperationNoAndTimestamp} from '../Print';

import {operationQueue} from '../../services/taxCalc';
import {getSortCostsFunction} from '../../services/taxCalc/libs/Utils';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';

import {faTimes, faEquals} from '@fortawesome/free-solid-svg-icons';

class TableInventory extends React.Component {
  static propTypes = {
    colors: PropTypes.bool,
    costs: PropTypes.array,
    title: PropTypes.node,
    trackLocations: PropTypes.bool,
    calculatorStep: PropTypes.object,
  }
  render() {
    const props = this.props;
    const {
      calculatorStep,
      colors,
      costs,
      title,
      trackLocations
    } = props;
    const groups = {};
    let assetGroup;
    let expandedRows = [];
    const sortedArr = [];
    const currentOperation = operationQueue.getCurrent();
    const currentOperationKey = currentOperation.key;
    const currentSetup = currentOperation.calculatorStep.setup;
    costs.sort(getSortCostsFunction(currentSetup));
    costs.forEach((cost, i) => {
      assetGroup = groups[cost.asset];
      if (!assetGroup) {
        assetGroup = {
          key: cost.asset,
          asset: cost.asset,
          amount: 0,
          loc: [],
          costBasis: 0,
          min: 0,
          dateMin: false,
          dateMax: false,
          max: 0,
          children: []
        };
        groups[cost.asset] = assetGroup;
        // expandedRows.push(assetGroup.key);
        sortedArr.push(assetGroup);
      }
      // update group stats
      if (!assetGroup.dateMin || cost.date < assetGroup.dateMin) {
        assetGroup.dateMin = cost.date;
      }
      if (!assetGroup.dateMax || cost.date > assetGroup.dateMax) {
        assetGroup.dateMax = cost.date;
      }
      assetGroup.amount += cost.amount;
      assetGroup.costBasis += cost.costBasis;
      assetGroup.rate = (assetGroup.amount) ? (assetGroup.costBasis / assetGroup.amount) : '-';
      assetGroup.children.push(Object.assign(
        {},
        cost,
        {
          key: `${cost.asset}-${i}`,
          prevOperation: operationQueue.getOperationByKey(cost.operationKey)
        }
      ));
    });

    const dataSource = sortedArr;
    const columns = [];

    columns.push({
      title: <FormattedMessage
        id="TableInventory.asset"
        defaultMessage="Asset"
      />,
      dataIndex: 'asset',
      key: 'asset',
      render: (text, record) => {
        if (record.children) {
          return <span>{text}</span>;
        }
        return false;
      }
    });
    columns.push({
      className: 'text-center',
      title: <div style={{textAlign: 'center'}}><FormattedMessage
        id="TableInventory.goTo"
        defaultMessage="Go to"
      /></div>,
      dataIndex: 'goto',
      key: 'goto',
      render: function renderGoto(text, record) {
        let result = false;
        if (record.children) {
          result = false;
        } else if (record.operationKey === currentOperationKey) {
          result = <PrintButton
            key={'back-current'}
            type={'left'}
            onClick={() => {
              operationQueue.dispatch('open-drawer-tab', 'operation');
            }}
            colors={colors}
          />;
          // }
        } else {
          result = <PrintButton
            type={'back'}
            onClick={() => {
              operationQueue.setCurrent(record.operationKey);
              operationQueue.dispatch('open-drawer-tab', 'operation');
            }}
            colors={colors}
          />;
        }

        return <center>{result}</center>;
      }
    });
    if (trackLocations) {
      columns.push({
        title: <div><FormattedMessage
          id="TableInventory.location"
          defaultMessage="Location"
        /></div>,
        dataIndex: 'loc',
        key: 'loc',
        render: (text, record) => {
          if (record.children) {
            return false;
          }
          return <span><strong>{text}</strong></span>;
        }
      });
    }
    columns.push({
      title: <div><FormattedMessage
        id="TableInventory.purchase"
        defaultMessage="Purchase"
      /></div>,
      dataIndex: 'date',
      key: 'date',
      render: function renderGoto(text, record) {
        const result = [];
        if (record.children) {
          return false;
        }
        result.push(<span key={'prev-operation'}>
          <PrintOperationNoAndTimestamp operation={record.prevOperation} colors={colors}/>
        </span>);
        return result;
      }
    });
    columns.push({
      className: 'text-right',
      title: <div style={{textAlign: 'right'}}><FormattedMessage
        id="TableInventory.amount"
        defaultMessage="Amount"
      /></div>,
      dataIndex: 'amount',
      key: 'amount',
      render: (text, record) => {
        const expanded = expandedRows.includes(record.key);
        if (expanded) {
          return false;
        }
        return <div
          style={{textAlign: 'right'}}>
          <PrintAsset
            disableBlink={true}
            asset={record.asset}
            value={record.amount}
            colors={colors} />
        </div>;
      }
    });
    columns.push({
      title: '',
      dataIndex: 'times',
      key: 'times',
      render: function renderTimes(text, record) {
        const expanded = expandedRows.includes(record.key);
        if (expanded) {
          return false;
        }
        return <div style={{textAlign: 'right'}}><FontAwesomeIcon icon={faTimes} /></div>;
      }
    });
    columns.push({
      className: 'text-right',
      title: <div style={{textAlign: 'right'}}><FormattedMessage
        id="TableInventory.rate"
        defaultMessage="Rate"
      /></div>,
      dataIndex: 'rate',
      key: 'rate',
      render: (text, record) => {
        const expanded = expandedRows.includes(record.key);
        if (expanded) {
          return false;
        }
        const costCurrency =
          (
            record.prevOperation &&
            record.prevOperation.calculatorStep &&
            record.prevOperation.calculatorStep.operationResidenceCurrency
          ) || currentOperation.calculatorStep.operationResidenceCurrency;
        return <div style={{textAlign: 'right'}}>
          <PrintAsset
            disableBlink={true}
            mode={'text'}
            asset={costCurrency}
            value={record.rate}
            colors={colors} />
        </div>;
      }
    });
    columns.push({
      title: '',
      dataIndex: 'equals',
      key: 'equals',
      render: function renderEquals(text, record) {
        const expanded = expandedRows.includes(record.key);
        if (expanded) {
          return false;
        }
        return <div style={{textAlign: 'right'}}><FontAwesomeIcon icon={faEquals} /></div>;
      }
    });
    columns.push({
      className: 'text-right',
      title: <div style={{textAlign: 'right'}}><FormattedMessage
        id="TableInventory.costBasis"
        defaultMessage="Cost Basis"
      /></div>,
      dataIndex: 'costBasis',
      key: 'value',
      render: (text, record) => {
        const expanded = expandedRows.includes(record.key);
        if (expanded) {
          return false;
        }
        const costCurrency =
          (
            record.prevOperation &&
            record.prevOperation.calculatorStep &&
            record.prevOperation.calculatorStep.operationResidenceCurrency
          ) || currentOperation.calculatorStep.operationResidenceCurrency;
        let result = '';
        result = <PrintAsset
          mode={'text'}
          disableBlink={true}
          asset={costCurrency}
          value={record.costBasis}
          colors={colors} />;
        return <div style={{textAlign: 'right'}}>
          {result}
        </div>;
      }
    });
    function footerRenderer() {
      return <div style={{textAlign: 'right'}}>
        <FormattedMessage
          id="TableInventory.footer"
          defaultMessage="Last no {lastNo}, total value {valuation}"
          values={{
            lastNo: costs.length,
            valuation: <PrintAsset
              mode={'text'}
              disableBlink={true}
              asset={calculatorStep.operationResidenceCurrency}
              value={calculatorStep.unusedCostBasis}
              colors={colors} />
          }}
        />
      </div>;
    }
    return (
      <Table
        defaultExpandedRowKeys={expandedRows}
        onExpandedRowsChange={newExpandedRows => {
          expandedRows = newExpandedRows;
        }}
        title={() => title}
        footer={footerRenderer}
        scroll={{x: '830px'}}
        dataSource={dataSource}
        columns={columns}
        size="small"
        pagination={{position: 'bottom'}}
        // bordered={true}
      />
    );
  }
}

export default TableInventory;
