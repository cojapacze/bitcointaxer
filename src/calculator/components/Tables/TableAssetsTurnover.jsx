import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {PrintAsset} from '../Print';
import {Table} from 'antd';

class TableAssetsTurnover extends React.Component {
  static propTypes = {
    assetsTurnover: PropTypes.object,
    colors: PropTypes.bool,
    title: PropTypes.node
  }
  render() {
    const {assetsTurnover, colors} = this.props;
    const sortedArr = [];
    Object.keys(assetsTurnover).forEach(asset => {
      sortedArr.push({
        ...assetsTurnover[asset],
        asset: asset,
        key: asset
      });
    });
    const dataSource = sortedArr;
    const columns = [{
      title: <FormattedMessage
        id="TableAssetsTurnover.asset"
        defaultMessage="Asset"
      />,
      dataIndex: 'asset',
      key: 'asset',
      width: '100px',
      fixed: 'left',
      render: text => <span className={'level-2-hide level-3-hide'}>{text}</span>
    }, {
      className: 'text-right',
      title: <div style={{textAlign: 'right'}}><FormattedMessage
        id="TableAssetsTurnover.buy"
        defaultMessage="Buy"
      /></div>,
      dataIndex: 'buy',
      key: 'buy',
      render: (text, record) => (
        <div style={{textAlign: 'right'}}>
          {(record.buy) ? <PrintAsset mode={'text'} asset={record.asset} value={record.buy} colors={colors} /> : <center>-</center>}
        </div>
      )
    }, {
      className: 'text-right',
      title: <div style={{textAlign: 'right'}}><FormattedMessage
        id="TableAssetsTurnover.sell"
        defaultMessage="Sell"
      /></div>,
      dataIndex: 'sell',
      key: 'sell',
      render: (text, record) => (
        <div style={{textAlign: 'right'}}>
          {(record.sell) ? <PrintAsset mode={'text'} asset={record.asset} value={record.sell} colors={colors} /> : <center>-</center>}
        </div>
      )
    }, {
      className: 'text-right',
      title: <div style={{textAlign: 'right'}}><FormattedMessage
        id="TableAssetsTurnover.transfered"
        defaultMessage="Transfered"
      /></div>,
      dataIndex: 'transfered',
      key: 'transfered',
      render: (text, record) => (
        <div style={{textAlign: 'right'}}>
          {(record.transfer) ? <PrintAsset mode={'text'} asset={record.asset} value={record.transfer} colors={colors} /> : <center>-</center>}
        </div>
      )
    }];

    return (
      <Table
        defaultExpandAllRows={true}
        title={() => this.props.title}
        bordered={true}
        dataSource={dataSource}
        columns={columns}
        size="small"
        pagination={{position: 'bottom'}}
      />
    );
  }
}

export default TableAssetsTurnover;
