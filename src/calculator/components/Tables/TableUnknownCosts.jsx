import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Table, Spin} from 'antd';

import {PrintAsset, PrintBadge, PrintButton, PrintOperationNoAndTimestamp} from '../Print';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCheck, faExclamation} from '@fortawesome/free-solid-svg-icons';

import {operationQueue} from '../../services/taxCalc';
import {sortArrByAsset, CONFIG} from '../../services/taxCalc/libs/Utils';

const arrayUnique = require('array-unique');

class TableUnknownCosts extends React.Component {
  static propTypes = {
    costs: PropTypes.array,
    calculatorStep: PropTypes.object,
    colors: PropTypes.bool,
    title: PropTypes.node,
    expandRowByClick: PropTypes.bool
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
    const {costs, colors, expandRowByClick, calculatorStep} = this.props;
    const sortedArr = [];
    const groups = {};
    let expandedRows = [];
    const element = this;
    let assetGroup;
    costs.forEach((cost, i) => {
      assetGroup = groups[cost.asset];
      if (!assetGroup) {
        assetGroup = {
          amount: 0,
          asset: cost.asset,
          children: [],
          costBasis: 0,
          dateMax: false,
          dateMin: false,
          group: true,
          key: cost.asset,
          locs: [],
          max: 0,
          min: 0,
          penalty: 0
        };
        groups[cost.asset] = assetGroup;
        sortedArr.push(assetGroup);
      }
      if (!assetGroup.dateMin || cost.date < assetGroup.dateMin) {
        assetGroup.dateMin = cost.date;
      }
      if (!assetGroup.dateMax || cost.date > assetGroup.dateMax) {
        assetGroup.dateMax = cost.date;
      }
      assetGroup.amount += cost.amount;
      assetGroup.costBasis += cost.costBasis;
      assetGroup.penalty += cost.penalty;
      //tags?
      //notes?
      //status?

      assetGroup.locs.push({
        date: cost.date,
        loc: cost.loc
      });
      assetGroup.rate = assetGroup.expense / assetGroup.amount;
      assetGroup.children.push(Object.assign({}, cost, {key: i}));
    });
    const dataSource = sortedArr.sort(sortArrByAsset);
    const columns = [];
    columns.push({
      title: <FormattedMessage
        id="TableUnknownCosts.asset"
        defaultMessage="Asset"
        description="title for asset name or currency"
      />,
      dataIndex: 'asset',
      key: 'asset',
      render: text => <span className={'level-2-hide level-3-hide'}>{text}</span>
    });
    columns.push({
      title: <FormattedMessage
        id="TableUnknownCosts.loc"
        defaultMessage="Used"
        description="location and date when usage appears"
      />,
      dataIndex: 'loc',
      key: 'loc',
      render: (text, record) => {
        let result = '';
        const expanded = expandedRows.includes(record.key) || !record.createOperationKey;
        if (expanded) {
          result = '';
        } else if (record.groupLoc && (record.loc instanceof Array)) {
          result = <span>
            {record.groupLoc} ({record.loc.length})
          </span>;
        } else if (record.locs instanceof Array) {
          result = <span>
            {arrayUnique(record.locs.map(loc => loc.loc)).sort().join(', ')}
          </span>;
        } else {
          const operation = operationQueue.getOperationByKey(record.createOperationKey);
          result = <span
            className={'pointer'}
            onClick={() => {
              operationQueue.setCurrent(record.createOperationKey);
              operationQueue.dispatch('open-drawer-tab', 'errors');
            }}>
            <PrintOperationNoAndTimestamp
              // suffix={<strong style={{padding: '0 16px'}}>{text}</strong>}
              features={['last_location_akcent']}
              operation={operation}
              colors={colors}/>
          </span>;
        }
        return result;
      }
    });
    columns.push({
      className: 'text-right',
      title: <div style={{textAlign: 'right'}}><FormattedMessage
        id="TableUnknownCosts.amount"
        defaultMessage="Missing amount"
        description="missing amount"
      /></div>,
      dataIndex: 'amount',
      key: 'amount',
      render: (text, record) => {
        let result = '';
        const expanded = expandedRows.includes(record.key);
        if (expanded) {
          result = '';
        } else if (record.createOperationKey) {
          result = <div
            className={'pointer'}
            onClick={() => {
              operationQueue.setCurrent(record.createOperationKey);
              operationQueue.dispatch('open-drawer-tab', 'errors');
            }}
            style={{textAlign: 'right'}}>
            <PrintAsset
              disableBlink={true}
              asset={record.asset}
              value={record.amount}
              colors={colors} />
          </div>;
        } else {
          result = <div
            style={{textAlign: 'right'}}>
            <PrintAsset
              mode={'text'}
              disableBlink={true}
              asset={record.asset}
              value={record.amount}
              colors={colors} />
          </div>;
        }
        return <div
          style={{textAlign: 'right'}}
        >
          {result}
        </div>;
      }
    });
    columns.push({
      className: 'text-right',
      title: <div style={{textAlign: 'right'}}><FormattedMessage
        id="TableUnknownCosts.costBasis"
        defaultMessage="Cost Basis"
        description="const basis"
      /></div>,
      dataIndex: 'costBasis',
      key: 'costBasis',
      render: (text, record) => {
        let result = '';
        const expanded = expandedRows.includes(record.key);
        if (expanded) {
          result = '';
        } else if (record.group && record.costBasis) {
          result = <div>
            <PrintAsset
              mode={'text'}
              disableBlink={true}
              asset={calculatorStep.residenceCurrency}
              value={record.costBasis}
              colors={colors}
            />
          </div>;
        } else if (record.costBasis || record.errorResolved) {
          result = <div>
            <PrintAsset
              style={{textDecoration: 'underline'}}
              mode={'text'}
              disableBlink={true}
              asset={calculatorStep.residenceCurrency}
              value={record.costBasis}
              colors={colors}
            />
          </div>;
        } else if (record.group) {
          result = <div>
            <PrintAsset
              mode={'text'}
              disableBlink={true}
              asset={calculatorStep.residenceCurrency}
              value={0}
              colors={colors}
            />
          </div>;
        } else {
          result = <div>
            <PrintAsset
              style={{textDecoration: 'underline'}}
              mode={'text'}
              disableBlink={true}
              asset={calculatorStep.residenceCurrency}
              value={0}
              colors={colors}
            />
          </div>;
        }
        if (record.group) {
          return <div
            style={{
              textAlign: 'right'
            }}
          >
            {result}
          </div>;
        }
        return <div
          style={{
            textAlign: 'right',
            cursor: 'pointer'}}
          onClick={() => {
            operationQueue.setCurrent(record.createOperationKey);
            operationQueue.dispatch('open-drawer-tab', 'errors', 'drawer-error-costBasis');
          }}
        >
          {result}
        </div>;
      }
    });
    if (CONFIG.calculatorFeatures.showFine) {
      columns.push({
        className: 'text-right',
        title: <div style={{textAlign: 'right'}}><FormattedMessage
          id="TableUnknownCosts.fine"
          defaultMessage="Fine"
          description="fine"
        /></div>,
        dataIndex: 'penalty',
        key: 'penalty',
        render: (text, record) => {
          let result = '';
          const expanded = expandedRows.includes(record.key);
          if (expanded) {
            result = '';
          } else if (record.group && record.penalty) {
            result = <div>
              <PrintAsset
                mode={'text'}
                disableBlink={true}
                asset={calculatorStep.residenceCurrency}
                value={record.penalty}
                colors={colors} />
            </div>;
          } else if (record.penalty) {
            result = <div>
              <PrintAsset
                style={{textDecoration: 'underline'}}
                mode={'text'}
                disableBlink={true}
                asset={calculatorStep.residenceCurrency}
                value={record.penalty}
                colors={colors} />
            </div>;
          } else {
            result = '-';
          }
          if (record.group) {
            return <div
              style={{
                textAlign: 'right'
              }}
            >
              {result}
            </div>;
          }
          return <div
            style={{textAlign: 'right', cursor: 'pointer'}}
            onClick={() => {
              operationQueue.setCurrent(record.createOperationKey);
              operationQueue.dispatch('open-drawer-tab', 'errors', 'drawer-error-penalty');
            }}
          >
            {result}
          </div>;
        }
      });
    }
    columns.push({
      className: 'text-center',
      title: <div style={{textAlign: 'center'}}><FormattedMessage
        id="TableUnknownCosts.notes"
        defaultMessage="Notes"
        description="fine"
      /></div>,
      dataIndex: 'notes',
      key: 'notes',
      render: (text, record) => {
        let result = '';
        const expanded = expandedRows.includes(record.key);

        if (expanded) {
          result = '';
        } else if (record.children) {
          const notes = record.children.reduce((last, item) => {
            if (item.notes) {
              return 1 + last;
            }
            return last;
          }, 0);
          result = <center>{notes}</center>;
        } else if (record.notes) {
          result = <center>
            <PrintButton
              type={'notes'}
              onClick={() => {
                operationQueue.setCurrent(record.operationKey);
                operationQueue.dispatch('open-drawer-tab', 'errors', 'drawer-error-notes');
              }}
              colors={colors}
            />
          </center>;
        } else {
          result = '';
        }
        return <div style={{textAlign: 'center'}}>{result}</div>;
      }
    });
    columns.push({
      className: 'text-center',
      title: <div style={{textAlign: 'center'}}><FormattedMessage
        id="TableUnknownCosts.status"
        defaultMessage="Status"
        description="status"
      /></div>,
      dataIndex: 'status',
      key: 'status',
      render: (text, record) => {
        let result = '';
        let type = 'forward';
        if (record.errorResolved) {
          type = 'resolved';
        } else {
          type = 'error';
        }
        function changeStatus() {
          operationQueue.setMissingCost(record, {
            errorResolved: !record.errorResolved
          });
          element.forceUpdate();
          operationQueue.recalculateIfModified();
        }
        const expanded = expandedRows.includes(record.key);
        if (expanded) {
          result = '';
        } else if (record.children) {
          const fixed = record.children.reduce((last, item) => {
            if (item.errorResolved) {
              return 1 + last;
            }
            return last;
          }, 0);
          const total = record.children.length;
          result = <center>{fixed}/{total}</center>;
        } else {
          result = <center>
            <PrintButton
              type={type}
              onClick={changeStatus}
              colors={colors}
            />
          </center>;
        }
        return result;
      }
    });
    const title = this.props.title || this.getDefaultTitle();
    return (
      <Table
        expandRowByClick={expandRowByClick}
        defaultExpandedRowKeys={expandedRows}
        onExpandedRowsChange={newExpandedRows => {
          expandedRows = newExpandedRows;
        }}
        title={() => title}
        scroll={{x: '830px'}}
        dataSource={dataSource}
        columns={columns}
        size="small"
        pagination={{position: 'none'}}
        // bordered={true}
      />
    );
  }
}

export default TableUnknownCosts;
