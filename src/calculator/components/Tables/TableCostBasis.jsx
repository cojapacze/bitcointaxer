import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Table} from 'antd';

import {PrintAsset, PrintButton, PrintOperationNoAndTimestamp} from '../Print';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes, faEquals} from '@fortawesome/free-solid-svg-icons';
function TableCostBasis(props) {
  const {
    colors,
    currentOperationKey,
    expenseList,
    operationQueue,
    title,
    trackLocations
  } = props;
  const sortedArr = [];
  Object.keys(expenseList).forEach((key, i) => {
    expenseList[key].key = i;
    expenseList[key].prevOperation = operationQueue.getOperationByKey(expenseList[key].operationKey);
    if (expenseList[key]) {
      sortedArr.push(expenseList[key]);
    }
  });
  const dataSource = expenseList;
  const columns = [];
  const operation = operationQueue.getOperationByKey(currentOperationKey);
  columns.push({
    title: <FormattedMessage id="TableCostBasis.goto" defaultMessage="Go to"/>,
    dataIndex: 'goback',
    key: 'goback',
    render: function renderGoto(text, record) {
      if (record.operationKey !== currentOperationKey) {
        return <PrintButton
          type={'back'}
          onClick={() => {
            operationQueue.setCurrent(record.operationKey);
            operationQueue.dispatch('open-drawer');
          }}
          colors={colors}
        />;
      }
      let btnType = 'error';
      if (record.errorResolved) {
        btnType = 'resolved';
      }
      return <PrintButton
        key={'prev-operation-source'}
        type={btnType}
        onClick={() => {
          operationQueue.dispatch('open-drawer-tab', 'errors', 'drawer-error-status');
        }}
        colors={colors}
      />;
    }
  });
  columns.push({
    title: <FormattedMessage id="TableCostBasis.date" defaultMessage="Date of purchase"/>,
    dataIndex: 'date',
    key: 'date',
    render: function renderBought(text, record) {
      const result = [];
      if (record.createOperationKey === currentOperationKey) {
        let btnText = 'Unknown';
        if (record.errorResolved) {
          btnText = 'Resolved';
        }
        result.push(btnText);
      } else {
        result.push(<span key={'prev-operation'}>
          <PrintOperationNoAndTimestamp
            operation={record.prevOperation}
            colors={colors}
          />
        </span>);
      }
      return result;
    }
  });
  if (trackLocations) {
    columns.push({
      title: <FormattedMessage id="TableCostBasis.location" defaultMessage="Location"/>,
      dataIndex: 'loc',
      key: 'loc'
    });
  }
  columns.push({
    className: 'text-right',
    title: <div style={{textAlign: 'right'}}><FormattedMessage id="TableCostBasis.amount" defaultMessage="Ilość"/></div>,
    dataIndex: 'amount',
    key: 'amount',
    render: function renderAmount(text, record) {
      return (
        <div style={{textAlign: 'right'}} className={'asset'}>
          <PrintAsset
            asset={record.asset}
            value={record.amount}
            colors={colors} />
        </div>
      );
    }
  });
  columns.push({
    title: '',
    dataIndex: 'times',
    key: 'times',
    render: function renderTimes() {
      return <div style={{textAlign: 'right'}}><FontAwesomeIcon icon={faTimes} /></div>;
    }
  });
  columns.push({
    className: 'text-right',
    title: <div style={{textAlign: 'right'}}><FormattedMessage id="TableCostBasis.rate" defaultMessage="Buy rate"/></div>,
    dataIndex: 'rate',
    key: 'rate',
    render: function renderRate(text, record) {
      return (
        <div style={{textAlign: 'right'}}>
          <PrintAsset
            mode={'text'}
            asset={record.prevOperation.calculatorStep && // why is it rendered without calculatorStep (aftef file removed form loader)?
              record.prevOperation.calculatorStep.operationResidenceCurrency}
            value={record.rate}
            colors={colors}
          />
        </div>
      );
    }
  });
  columns.push({
    title: '',
    dataIndex: 'equals',
    key: 'equals',
    render: function renderEquals() {
      return <div style={{textAlign: 'right'}}><FontAwesomeIcon icon={faEquals} /></div>;
    }
  });
  columns.push({
    className: 'text-right',
    title: <div style={{textAlign: 'right'}}><FormattedMessage id="TableCostBasis.costBasis" defaultMessage="Cost Basis"/></div>,
    dataIndex: 'costBasis',
    key: 'value',
    render: function renderValue(text, record) {
      let result = false;
      if (record.createOperationKey === currentOperationKey) {
        result =
          <div
            onClick={() => {
              operationQueue.dispatch('open-drawer-tab', 'errors', 'drawer-error-costBasis');
            }}
            style={{textAlign: 'right'}}
          >
            <PrintAsset
              asset={operation.calculatorStep.operationResidenceCurrency}
              colors={colors}
              mode={'text'}
              style={{textDecoration: 'underline', cursor: 'pointer'}}
              value={record.costBasis}
            />
          </div>;
      } else {
        result =
          <div style={{textAlign: 'right'}}>
            <PrintAsset
              asset={operation.calculatorStep.operationResidenceCurrency}
              colors={colors}
              mode={'text'}
              value={record.costBasis}
            />
          </div>;
      }
      return result;
    }
  });

  return (
    <div>
      <Table
        columns={columns}
        dataSource={dataSource}
        pagination={{position: 'bottom'}}
        scroll={{x: '730px'}}
        size="small"
        title={() => title}
        // bordered={true}
      />
    </div>
  );
}
TableCostBasis.propTypes = {
  colors: PropTypes.bool,
  currentOperationKey: PropTypes.string,
  expenseList: PropTypes.array,
  operationQueue: PropTypes.object,
  title: PropTypes.node,
  trackLocations: PropTypes.bool
};

export default TableCostBasis;
