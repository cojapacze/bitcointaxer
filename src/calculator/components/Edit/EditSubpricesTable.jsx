import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Table,
  Popover,
  Checkbox,
  Button
} from 'antd';

import {PrintAsset, PrintExchangeSymbol, PrintTimestamp} from '../Print';
import EditSubpricesTableCellPrice from './EditSubpricesTableCellPrice';

import {operationQueue} from '../../services/taxCalc/index.js';


function addKeys(list, parent) {
  list.forEach((record, i) => {
    if (parent) {
      record.checked = parent.checked;
      record.parent = parent;
      record.isChild = true;
      record.key = `${parent.key}-${i}`;
    } else {
      record.key = String(i);
    }
    if (record.error) {
      return;
    }
    if (record.arguments) {
      record.children = record.arguments;
    }
    if (record.alternativesValid) {
      record.children = record.alternativesValid;
    }

    if (record.children) {
      addKeys(record.children, record);
    }

    record.children = record.arguments;
  });
}


class EditSubpricesTable extends React.Component {
  static propTypes = {
    sidePrice: PropTypes.object,
    operationValuation: PropTypes.object
  }
  state = {}

  static getDerivedStateFromProps(props) {
    const currentPrice = props.sidePrice;
    addKeys(currentPrice.alternatives, false);
    return {
      ...props,
      currentPrice: currentPrice,
      alternatives: currentPrice.alternatives || []
    };
  }
  constructor(props) {
    super();
    this.state = {...props};
    this.prices = operationQueue.prices;
  }
  isDisabled(record) {
    if (
      (record.parent && !record.parent.checked)
        ||
      (!record.parent && !record.checked)
    ) {
      return true;
    }
    return false;
  }
  render() {
    const {alternatives, operationValuation} = this.state;
    const alternativesStats = this.prices.getOperationValuationSidePriceAlternativesStats(alternatives);

    const columns = [
      {
        title: <div style={{paddingLeft: '25px'}}><Checkbox
          name={'checkboxAlternativesAll'}
          value={'checkboxAlternativesAll'}
          indeterminate={alternativesStats.total !== alternativesStats.checked}
          checked={alternativesStats.checked}
          onChange={e => {
            this.prices.setAllOperationValuationSidePriceAlternatives(
              operationValuation,
              alternatives,
              e.target.name,
              e.target.checked,
              e);
          }}
        ><FormattedMessage
            id="EditSubpricesTable.effectiveDate"
            defaultMessage="Effective date"
          /></Checkbox></div>,
        dataIndex: 'date',
        key: 'date',
        width: 220,
        render: (text, record) => {
          const date = record.effectiveDate || record.date;
          let adapterName = record.adapter;
          if (adapterName) {
            const adapterArr = adapterName.split('-');
            if (adapterArr[1]) {
              adapterName = adapterArr[1].replace('_', '+');
            }
          }
          let key =
            (record.results && record.results[1] && record.results[1].key === 'no' && record.results[1].value) ||
            adapterName ||
            record.key;
          if (record.link) {
            key =
              <Popover content={record.link} placement="right">
                <a target="_blank" rel="noopener noreferrer" href={record.link}>{key}</a>
              </Popover>;
          }
          const dateEl = <span
            className={(record.checked) ? 'enabled' : 'disabled'}
            style={{display: 'inline-block'}}>
            <div><small>{key}</small></div>
            <PrintTimestamp date={date} groupBy={'raw'} colors={true}/>
          </span>;
          if (record.isChild || record.error) {
            return dateEl;
          }
          return <Checkbox
            name={record.key}
            value={record.value}
            checked={record.checked}
            onChange={e => {
              this.prices.setOperationValuationSidePriceAlternative(
                alternatives,
                record,
                record.key,
                e.target.checked,
                operationValuation
              );
            }}
          >{dateEl}</Checkbox>;
        }
      },
      {
        title: <FormattedMessage
          id="EditSubpricesTable.symbol"
          defaultMessage="Symbol"
        />,
        dataIndex: 'symbol',
        key: 'symbol',
        width: 120,
        render: function renderPair(text, record) {
          return <PrintExchangeSymbol operation={record} />;
        }
      },
      {
        className: 'text-right',
        title: <FormattedMessage
          id="EditSubpricesTable.prices"
          defaultMessage="Prices"
        />,
        dataIndex: 'prices',
        key: 'prices',
        width: 480,
        render: EditSubpricesTableCellPrice.bind({operationValuation})
      },
      {
        className: 'text-right',
        title: <div style={{textAlign: 'right'}}><FormattedMessage
          id="EditSubpricesTable.price"
          defaultMessage="Price"
        /></div>,
        dataIndex: 'price',
        key: 'price',
        width: 140,
        render: function renderValue(text, record) {
          if (record.error) {
            return <div><Button disabled>Retry</Button></div>;
          }
          const colors = true;
          const value = record.price;
          const style = {textAlign: 'right'};
          let subStyle = <div><small>&nbsp;</small></div>;
          if (record.subtype === 'price-argument') {
            subStyle = false;
            style.textAlign = 'right';
            style.paddingRight = '8px';
          }
          return <div style={style} className={(record.checked) ? 'enabled' : 'disabled'}>
            {subStyle}
            <div>
              <PrintAsset
                mode={'text'}
                value={value}
                asset={record.toAsset}
                colors={colors}/>
            </div>
          </div>;
        }
      }
    ];

    return (
      <div>
        <Table
          className="prices-table-details-table"
          columns={columns}
          dataSource={alternatives}
          pagination={{position: 'none'}}
          width="1240"
          scroll={{x: 800}}
          bordered={false}
          size="middle"
        />
      </div>
    );
  }
}

export default EditSubpricesTable;
