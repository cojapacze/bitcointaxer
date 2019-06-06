import React from 'react';
import PropTypes from 'prop-types';
import {PrintTimestamp, PrintAsset, PrintAssetLabel, PrintExchangeSymbol} from '../../Print/';
import tablePricesCellPrices from './tablePricesCellPrices';
import {EditAsset} from '../../Edit/';
import {Table, Row, Col,
  Checkbox,
  Popover
} from 'antd';

function addKeys(list, parentRecord, tablePriceRecord) {
  list.forEach((record, i) => {
    record.tablePriceRecord = tablePriceRecord;
    if (parentRecord) {
      record.checked = parentRecord.checked;
      record.parentRecord = parentRecord;
      record.isChild = true;
      record.key = `${tablePriceRecord.key}-${parentRecord.key}-${i}`;
    } else {
      record.key = `${tablePriceRecord.key}-${i}`;
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
      addKeys(record.children, record, tablePriceRecord);
    }
    record.children = record.arguments;
  });
}

class TablePrices extends React.Component {
  static propTypes = {
    operationQueue: PropTypes.object
  }

  constructor(props) {
    super(props);
    this.operationQueue = props.operationQueue;
    this.prices = this.operationQueue.prices;
    const pricesList = this.prices.cachedPrices;
    this.state = {
      data: pricesList,
      editingKey: '',
      groupBy: 'day'
    };
    this.autoUpdate = () => this.setState({
      data: pricesList
    });
  }
  componentDidMount() {
    this.prices.after('price-alternative-results-changed', this.autoUpdate);
    this.prices.after('price-alternative-changed', this.autoUpdate);
  }
  componentWillUnmount() {
    this.prices.removeListener('price-alternative-results-changed', this.autoUpdate);
    this.prices.removeListener('price-alternative-changed', this.autoUpdate);
  }
  renderTablePricesTitle() {
    return (
      <Row>
        <Col span={12}>
        </Col>
        <Col span={12} style={{textAlign: 'right'}}>
        </Col>
      </Row>
    );
  }

  render() {
    const columns = [
      {
        title: 'Date',
        dataIndex: 'date',
        render: (text, record) => {
          const colors = true;
          if (!record.isPriceRecord) {
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
                  record.tablePriceRecord.priceResponse.alternatives,
                  record,
                  record.key,
                  e.target.checked,
                  false,
                  record.tablePriceRecord.priceResponse
                );
              }}
            >{dateEl}</Checkbox>;
          }
          return <span>
            <PrintTimestamp date={record.priceQuery.date} groupBy={'day'} colors={colors}/>
          </span>;
        }
      },
      {
        title: 'Symbol',
        dataIndex: 'symbol',
        render: function (text, record) {
          const colors = true;
          if (!record.isPriceRecord) {
            return <PrintExchangeSymbol operation={record} />;
          }
          return <div>
            <PrintAssetLabel asset={record.priceQuery.fromAsset} colors={colors}/>/ <PrintAssetLabel asset={record.priceQuery.toAsset} colors={colors}/>
          </div>;
        }
      },
      {
        title: 'Rates',
        dataIndex: 'rates',
        render: function (text, record, rowI) {
          const colors = true;
          if (!record.isPriceRecord) {
            return tablePricesCellPrices(text, record, rowI, record.tablePriceRecord.priceResponse);
          }
          const elements = [];
          record.priceResponse.alternativesSelected.forEach(alternative => {
            elements.push(<PrintAsset
              colors={colors}
              key={alternative.key}
              mode={'text'}
              value={alternative.price}
              asset={alternative.toAsset}
            />);
            elements.push(<span
              key={`${alternative.key}-add`}
            >+</span>);
          });
          elements.splice(-1);
          if (elements.length > 1) {
            elements.unshift(<span key={'open'}>(</span>);
            elements.push(<span key={'close'}>) / {elements.length / 2}</span>);
          }
          return <div>
            {elements}
          </div>;
        }
      },
      {
        title: <div style={{textAlign: 'right'}}>Price</div>,
        dataIndex: 'price',
        editable: true,
        render: function renderPrice(text, record) {
          const colors = true;
          if (!record.isPriceRecord) {
            if (record.error) {
              return 'error';
            }
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
          const value = record.priceResponse.price;

          return <div style={{textAlign: 'right'}}>
            <EditAsset
              mode="text"
              value={value}
              asset={record.priceQuery.toAsset}
              colors={colors}
              onChange={console.log}
            />
          </div>;
        }
      }
    ];

    const dataSource = this.state.data.map(rec => {
      const currentPrice = rec.priceResponse;
      rec.isPriceRecord = true;
      rec.key = rec.cbKey;
      if (currentPrice) {
        rec.children = currentPrice.alternatives;
        addKeys(rec.children, false, rec);
      }
      // rec.rowKey = rec.cbKey;
      return rec;
    });
    return (
      <Table
        title={this.renderTablePricesTitle.bind(this)}
        pagination={{
          defaultPageSize: 100,
          hideOnSinglePage: true,
          showQuickJumper: true,
          simple: true
        }}
        className="prices-table"
        // components={components}
        dataSource={dataSource}
        columns={columns}
        bordered={false}
        expandRowByClick={false}
        rowClassName={() => 'editable-row'}
      />
    );
  }
}

export default TablePrices;
