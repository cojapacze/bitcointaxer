import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Table} from 'antd';

import {PrintAsset} from '../Print';
import {sortArrByAsset} from '../../services/taxCalc/libs/Utils';
import {operationQueue} from '../../services/taxCalc';

const arrayUnique = require('array-unique');

class TableBalancesBasic extends React.Component {
  static propTypes = {
    balances: PropTypes.object,
    colors: PropTypes.bool,
    title: PropTypes.node
  };
  static getDerivedStateFromProps(props) {
    return props;
  }
  state = {
    expandedRows: {}
  }
  render() {
    const {balances, colors, title} = this.state;
    const dataArr = [];
    let expandedRows = [];
    function getRecordByKey(list, key) {
      const result = [];
      let i;
      for (i = 0; i < list.length; i += 1) {
        if (list[i].key === key) {
          result.push(list[i]);
        }
      }
      if (!result.length) {
        return false;
      }
      if (result.length === 1) {
        return result[0];
      }
      return result;
    }
    function addRecord(list, record, onChild) {
      if (!record.key) {
        console.error(record);
        Error('Record without key!');
      }

      const existingEntry = getRecordByKey(list, record.key);

      if (existingEntry) {
        if (!existingEntry.children) {
          // make self as child
          existingEntry.children = [Object.assign(Object.assign({}, existingEntry), {
            key: `${existingEntry.asset}-${existingEntry.loc}`
            // asset: false,
          })];
          existingEntry.loc = [existingEntry.loc];
        }
        // record.asset = existingEntry.asset;
        existingEntry.children.push(record);
        existingEntry.loc.push(record.loc);
        // expandedRows.push(record.key);
        if (typeof onChild === 'function') {
          onChild(existingEntry, record);
        }
      } else {
        list.push(record);
      }
      return list;
    }
    Object.keys(balances).forEach(loc => {
      Object.keys(balances[loc]).forEach(asset => {
        if (balances[loc][asset]) {
          addRecord(
            dataArr,
            {
              key: asset,
              loc: loc,
              asset: asset,
              amount: balances[loc][asset]
            },
            (parent, child) => {
              // child.asset = false;
              child.key = `${asset}-${child.loc}`;
              parent.amount += child.amount;
            }
          );
        }
      });
    });
    const dataSource = dataArr;
    window.dataSource = dataSource;
    window.sortArrByAsset = sortArrByAsset;
    function sortBalanceChildren(childA, childB) {
      if (childA.amount < 0 && childB.amount > 0) {
        return -100;
      }
      if (childA.amount > 0 && childB.amount < 0) {
        return 100;
      }
      return childB.amount - childA.amount;
    }
    dataSource.sort(sortArrByAsset);
    dataSource.forEach(balance => balance.children && balance.children.sort(sortBalanceChildren));

    const columns = [{
      title: <FormattedMessage
        id="TableBalancesBasic.asset"
        defaultMessage="Asset"
      />,
      dataIndex: 'asset',
      key: 'asset',
      width: '100px',
      render: function renderAsset(text) {
        return <span className={'level-2-hide'}>{text}</span>;
      }
    }, {
      title: <FormattedMessage
        id="TableBalancesBasic.location"
        defaultMessage="Location"
      />,
      dataIndex: 'loc',
      key: 'loc',
      render: (text, record) => {
        let result = false;
        const expanded = expandedRows.includes(record.key);
        if (expanded) {
          result = '';
        } else if (record.loc instanceof Array) {
          result = <div>
            {arrayUnique(record.loc).sort().join(', ')}
          </div>;
        } else {
          result = <div>
            {text}
          </div>;
        }
        return result;
      }
    }, {
      title: <div style={{textAlign: 'right'}}>
        <FormattedMessage
          id="TableBalancesBasic.amount"
          defaultMessage="Amount"
        />
      </div>,
      dataIndex: 'amount',
      key: 'amount',
      width: '150px',
      render: (text, record) => {
        let result = '';
        const expanded = expandedRows.includes(record.key);
        if (expanded) {
          result = '';
        } else if (record.operationKey) {
          result = <div
            className={'pointer'}
            onClick={() => {
              operationQueue.setCurrent(record.operationKey);
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
              disableBlink={true}
              asset={record.asset}
              value={record.amount}
              colors={colors} />
          </div>;
        }
        return result;
      }
    }];
    return (
      <div>
        <Table
          defaultExpandedRowKeys={expandedRows}
          onExpandedRowsChange={newExpandedRows => {
            expandedRows = newExpandedRows;
          }}
          title={() => title}
          scroll={{x: '530px'}}
          dataSource={dataSource}
          columns={columns}
          size="small"
          bordered={true}
          pagination={{position: 'none'}}
        />
      </div>
    );
  }
}
export default TableBalancesBasic;
