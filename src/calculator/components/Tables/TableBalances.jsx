import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {sortArrByAsset} from '../../services/taxCalc/libs/Utils';

import {Table} from 'antd';

import {PrintAsset} from '../Print';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faCalculator} from '@fortawesome/free-solid-svg-icons';


function TableBalances(props) {
  const {
    balances,
    colors
  } = props;
  let {title} = props;
  if (!title) {
    title = <span>
      <FontAwesomeIcon icon={faCalculator} style={{marginRight: '4px'}} />
      <FormattedMessage
        id="TableBalances.title"
        defaultMessage="Balance"
      /></span>;
  }
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
          key: `${existingEntry.key}-${existingEntry.loc}`,
          isChild: true
        })];
        existingEntry.loc = [existingEntry.loc];
        // expandedRows.push(record.key);
      }
      record.key = `${existingEntry.key}-${record.loc}`;
      record.isChild = true;
      existingEntry.children.push(record);
      existingEntry.loc.push(record.loc);
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
            parent.amount += child.amount;
          }
        );
      }
    });
  });
  const dataSource = dataArr;
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
      id="TableBalances.asset"
      defaultMessage="Asset"
    />,
    dataIndex: 'asset',
    key: 'asset',
    render: function renderAsset(text, record) {
      if (record.isChild) {
        return false;
      }
      return <span>{text}</span>;
    }
  }, {
    title: <FormattedMessage
      id="TableBalances.location"
      defaultMessage="Location"
    />,
    dataIndex: 'loc',
    key: 'loc',
    render: function renderLocations(text, record) {
      const expanded = expandedRows.includes(record.key);
      if (expanded) {
        return false;
      }
      if (record.loc instanceof Array) {
        return <div>{record.loc.join(', ')}</div>;
      }
      return <div>{text}</div>;
    }
  }, {
    className: 'text-right',
    title: <div style={{textAlign: 'right'}}><FormattedMessage
      id="TableBalances.amount"
      defaultMessage="Amount"
    /></div>,
    dataIndex: 'amount',
    key: 'amount',
    render: function renderAmount(text, record) {
      const expanded = expandedRows.includes(record.key);
      if (expanded) {
        return false;
      }
      return (
        <div style={{textAlign: 'right'}} className={'asset'}>
          <PrintAsset asset={record.asset} value={record.amount} colors={colors} />
        </div>
      );
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
        bordered={true}
        size="small"
        pagination={{position: 'bottom'}}
      />
    </div>
  );
}
TableBalances.propTypes = {
  balances: PropTypes.object,
  colors: PropTypes.bool,
  title: PropTypes.node
};
export default TableBalances;
