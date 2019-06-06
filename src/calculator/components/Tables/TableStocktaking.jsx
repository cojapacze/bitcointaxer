import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import {reports} from '../../services/taxCalc/reports';

import {
  Row,
  Col,
  Button,
  Table,
  Spin} from 'antd';

import {PrintAsset,
  PrintTimestamp
  , PrintOperationNoAndTimestamp
} from '../Print';

import {EditAsset
} from '../Edit';

import {operationQueue} from '../../services/taxCalc';
import {
  getSortCostsFunction} from '../../services/taxCalc/libs/Utils';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faSave} from '@fortawesome/free-regular-svg-icons';
import {faTimes, faEquals, faExclamationTriangle, faPiggyBank} from '@fortawesome/free-solid-svg-icons';


class TableStocktaking extends React.Component {
  static propTypes = {
    colors: PropTypes.bool,
    title: PropTypes.node,
    operation: PropTypes.object
  }
  constructor(props) {
    super(props);
    this.operation = props.operation;
    this.autoUpdate = () => {//operation
      // if (this.operation === operation) {
      this.forceUpdate();
      // }
    };
  }
  componentWillUnmount() {
    operationQueue.removeListener('stocktaking-finished', this.autoUpdate);
  }
  componentDidMount() {
    operationQueue.on('stocktaking-finish', this.autoUpdate);
  }
  render() {
    const props = this.props;
    const {colors, operation} = props;

    if (!operation || !operation.operationStocktaking || !operation.operationStocktaking.inventory || !operation.calculator) {
      return <div className="empty-box"><Spin /></div>;
    }
    const stocktaking = operation.operationStocktaking;
    const costs = stocktaking.inventory;
    const groups = {};
    let assetGroup;
    let expandedRows = [];

    const dataSource = [];
    const currentOperation = operation;//operationQueue.getCurrent();
    if (!currentOperation) {
      return 'no-current-operation';
    }
    const currentSetup = currentOperation.calculator.getSetup();

    costs.sort(getSortCostsFunction(currentSetup));
    costs.forEach((cost, i) => {
      assetGroup = groups[cost.asset];
      if (!assetGroup) {
        assetGroup = {
          isGroup: true,
          key: cost.asset,
          asset: cost.asset,
          price: cost.price,
          amount: 0,

          stocktakingCostBasisAmount: 0,
          stocktakingCostBasis: 0,
          stocktakingCostBasisRate: 0,

          stocktakingMarketAmount: 0,
          stocktakingMarketValue: 0,
          stocktakingMarketRate: 0,

          stocktakingAmount: 0,
          stocktakingRate: 0,
          stocktakingValue: 0,

          residenceCurrency: 'ERR',
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
        dataSource.push(assetGroup);
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

      assetGroup.stocktakingCostBasisAmount += cost.stocktakingCostBasisAmount;
      assetGroup.stocktakingCostBasis += cost.stocktakingCostBasis;
      assetGroup.stocktakingCostBasisRate = (assetGroup.stocktakingCostBasisAmount)
        ? assetGroup.stocktakingCostBasis / assetGroup.stocktakingCostBasisAmount
        : 0;

      assetGroup.stocktakingMarketAmount += cost.stocktakingMarketAmount;
      assetGroup.stocktakingMarketValue += cost.stocktakingMarketValue;
      assetGroup.stocktakingMarketRate = (assetGroup.stocktakingMarketAmount)
        ? assetGroup.stocktakingMarketValue / assetGroup.stocktakingMarketAmount
        : 0;

      assetGroup.stocktakingAmount += cost.stocktakingAmount;
      assetGroup.stocktakingValue += cost.stocktakingValue;
      assetGroup.stocktakingRate = (assetGroup.stocktakingAmount)
        ? assetGroup.stocktakingValue / assetGroup.stocktakingAmount
        : 0;

      assetGroup.residenceCurrency = cost.residenceCurrency;
      // assetGroup.stocktakingValue += cost.stocktakingValue;
      assetGroup.assetValuation = cost.assetValuation;
      assetGroup.children.push(Object.assign(
        {isChild: true},
        cost,
        {
          key: `${cost.asset}-${i}`,
          prevOperation: operationQueue.getOperationByKey(cost.operationKey)
        }
      ));
      // stocktakingCostBasis
    });
    dataSource.sort((a, b) => {
      const result = b.stocktakingCostBasis - a.stocktakingCostBasis;
      return result;
    });
    const columns = [];

    columns.push({
      title: <FormattedMessage
        id="TableStocktaking.asset"
        defaultMessage="Asset"
      />,
      dataIndex: 'asset',
      key: 'asset',
      render: (text, record) => {
        let result = false;
        if (record.children) {
          result = <span>{text}</span>;
        } else {
          result = <span style={{display: 'inline-block'}}>
          </span>;
        }
        return result;
      }
    });
    columns.push({
      title: <div style={{textAlign: 'right'}}><FormattedMessage
        id="TableStocktaking.no"
        defaultMessage="No"
      /></div>,
      dataIndex: 'no',
      key: 'no',
      render: (text, record) => {
        let result = false;
        if (record.isChild) {
          result = <div style={{textAlign: 'right'}}>{text}.</div>;
        }
        return result;
      }
    });
    columns.push({
      title: <FormattedMessage
        id="TableStocktaking.index"
        defaultMessage="Index"
      />,
      dataIndex: 'goto',
      key: 'goto',
      width: 200,
      render: (text, record) => {
        let result = false;
        const costOperation = operationQueue.getOperationByKey(record.operationKey);
        if (!costOperation) {
          return '';
        }
        if (record.isChild) {
          result = <div
            style={{
              cursor: 'pointer'
            }}
            onClick={() => {
              operationQueue.dispatch('close-stocktaking-drawer');
              operationQueue.setCurrent(record.operationKey);
              operationQueue.dispatch('open-drawer');
            }}
          ><PrintOperationNoAndTimestamp
            // operationKey={record.operationKey}
              features={['last_location_akcent']}
              operation={costOperation}
              colors={colors}
            /></div>;
        }

        return result;
      }
    });
    columns.push({
      title: '',
      className: 'table-space',
      width: 1,
      dataIndex: 'spacer-1',
      key: 'spacer-1',
      render: () => <div style={{width: '1px'}} />
    });
    const costBasisColumn = {
      title: <FormattedMessage
        id="TableStocktaking.stocktakingCostBasisColumn"
        defaultMessage="Cost Basis"
      />,
      children: []
    };
    costBasisColumn.children.push({
      className: 'text-right',
      title: <div style={{textAlign: 'right'}}><FormattedMessage
        id="TableStocktaking.stocktakingCostBasisAmount"
        defaultMessage="Purchased Amount"
      /></div>,
      dataIndex: 'stocktakingCostBasisAmount',
      key: 'stocktakingCostBasisAmount',
      width: '300px',
      render: (text, record) => {
        const expanded = expandedRows.includes(record.key);
        if (expanded) {
          return false;
        }
        return <div
          style={{textAlign: 'right'}}>
          <PrintAsset
            asset={record.asset}
            value={record.stocktakingCostBasisAmount}
            colors={colors} />
        </div>;
      }
    });
    costBasisColumn.children.push({
      title: '',
      dataIndex: 'stocktakingCostBasisAmountTimes',
      key: 'stocktakingCostBasisAmountTimes',
      render: function (text, record) {
        const expanded = expandedRows.includes(record.key);
        if (expanded) {
          return false;
        }
        return <div style={{textAlign: 'center'}}><FontAwesomeIcon icon={faTimes} /></div>;
      }
    });
    costBasisColumn.children.push({
      className: 'text-right',
      title: <div style={{textAlign: 'right'}}><FormattedMessage
        id="TableStocktaking.stocktakingCostBasisRate"
        defaultMessage="Purchase price"
      /></div>,
      dataIndex: 'stocktakingCostBasisRate',
      key: 'stocktakingCostBasisRate',
      render: (text, record) => {
        const expanded = expandedRows.includes(record.key);
        if (expanded) {
          return false;
        }
        const costCurrency = record.residenceCurrency;
        return <div style={{textAlign: 'right'}}><PrintAsset
          mode={'text'}
          disableBlink={true}
          asset={costCurrency}
          value={record.stocktakingCostBasisRate}
          colors={colors} /></div>;
      }
    });
    costBasisColumn.children.push({
      title: '',
      dataIndex: 'stocktakingCostBasisAmountEquals',
      key: 'stocktakingCostBasisAmountEquals',
      render: function renderEquals(text, record) {
        const expanded = expandedRows.includes(record.key);
        if (expanded) {
          return false;
        }
        return <div style={{textAlign: 'center'}}><FontAwesomeIcon icon={faEquals} /></div>;
      }
    });
    costBasisColumn.children.push({
      className: 'text-right',
      title: <div style={{textAlign: 'right'}}><FormattedMessage
        id="TableStocktaking.stocktakingCostBasis"
        defaultMessage="Cost Basis"
      /></div>,
      dataIndex: 'stocktakingCostBasis',
      key: 'stocktakingCostBasis',
      render: (text, record) => {
        const expanded = expandedRows.includes(record.key);
        if (expanded) {
          return false;
        }
        const costCurrency = record.residenceCurrency;
        let result = '';
        result = <PrintAsset
          mode={'text'}
          disableBlink={true}
          asset={costCurrency}
          value={record.stocktakingCostBasis}
          colors={colors} />;
        return <div style={{textAlign: 'right'}}>
          {result}
        </div>;
      }
    });
    columns.push(costBasisColumn);
    columns.push({
      title: '',
      className: 'table-space',
      width: 1,
      dataIndex: 'spacer-2',
      key: 'spacer-2',
      render: () => <div style={{width: '1px'}} />
    });

    const marketColumn = {
      title: <FormattedMessage
        id="TableStocktaking.stocktakingMarketColumn"
        defaultMessage="Market"
      />,
      children: []
    };
    marketColumn.children.push({
      className: 'text-right',
      title: <div style={{textAlign: 'right'}}><FormattedMessage
        id="TableStocktaking.stocktakingMarketAmount"
        defaultMessage="Real Amount"
      /></div>,
      dataIndex: 'stocktakingMarketAmount',
      key: 'stocktakingMarketAmount',
      width: '300px',
      // fixed: 'right',
      render: (text, record) => {
        const expanded = expandedRows.includes(record.key);
        if (expanded) {
          return false;
        }
        if (record.isGroup) {
          return <div
            style={{textAlign: 'right'}}>
            <PrintAsset
              disableBlink={true}
              asset={record.asset}
              value={record.stocktakingAmount}
              colors={colors} />
          </div>;
        }
        if (!record.stocktakingAmount) {
          return 'loading...';
        }
        return <div
          style={{textAlign: 'right'}}>
          <EditAsset
            onChange={console.log}
            disableBlink={true}
            asset={record.asset}
            value={record.stocktakingAmount}
            colors={colors} />
        </div>;
      }
    });
    marketColumn.children.push({
      title: '',
      dataIndex: 'stocktakingMarketTimes',
      key: 'stocktakingMarketTimes',
      render: function renderTimes(text, record) {
        const expanded = expandedRows.includes(record.key);
        if (expanded) {
          return false;
        }
        return <div style={{textAlign: 'center'}}><FontAwesomeIcon icon={faTimes} /></div>;
      }
    });
    marketColumn.children.push({
      className: 'text-right',
      title: <div style={{textAlign: 'right'}}><FormattedMessage
        id="TableStocktaking.stocktakingMarketRate"
        defaultMessage="Market price"
      /></div>,
      dataIndex: 'stocktakingMarketPrice',
      key: 'stocktakingMarketPrice',
      render: (text, record) => {
        const costCurrency = record.residenceCurrency;
        if (record.isChild) {
          return <div style={{textAlign: 'right'}}><PrintAsset
            mode={'text'}
            disableBlink={true}
            asset={costCurrency}
            value={record.stocktakingMarketRate}
            colors={colors} /></div>;
        }

        // console.log('REK', record);
        let warn = '';
        if (!record.stocktakingMarketRate) {
          record.stocktakingMarketRate = 0;
          warn = <span style={{
            display: 'inline-block',
            color: 'red',
            marginLeft: '8px',
            marginRight: '8px'}}><FontAwesomeIcon icon={faExclamationTriangle}/></span>;
        }
        return <div style={{textAlign: 'right'}}>
          {warn}
          <EditAsset
            onChange={console.log}
            disableBlink={true}
            mode={'text'}
            asset={costCurrency}
            value={record.stocktakingMarketRate}
            colors={colors} />
          <span style={{display: 'inline-block', width: '4px'}}></span>
        </div>;
      }
    });
    marketColumn.children.push({
      title: '',
      dataIndex: 'stocktakingMarketEquals',
      key: 'stocktakingMarketEquals',
      render: function renderEquals(text, record) {
        const expanded = expandedRows.includes(record.key);
        if (expanded) {
          return false;
        }
        return <div style={{textAlign: 'center'}}><FontAwesomeIcon icon={faEquals} /></div>;
      }
    });
    marketColumn.children.push({
      className: 'text-right',
      title: <div style={{textAlign: 'right'}}><FormattedMessage
        id="TableStocktaking.stocktakingMarketValue"
        defaultMessage="Fair Market Value"
      /></div>,
      dataIndex: 'stocktakingMarketValue',
      key: 'stocktakingMarketValue',
      render: (text, record) => {
        const costCurrency = record.residenceCurrency;
        const expanded = expandedRows.includes(record.key);
        if (expanded) {
          return false;
        }
        let result = '';
        result = <PrintAsset
          mode={'text'}
          disableBlink={true}
          asset={costCurrency}
          value={record.stocktakingMarketValue}
          colors={colors} />;
        if (record.stocktakingPriceUsed) {
          result = <strong>{result}</strong>;
        }
        return <div style={{textAlign: 'right'}}>
          {result}
        </div>;
      }
    });
    columns.push(marketColumn);

    const stocktakingColumn = {
      title: <FormattedMessage
        id="TableStocktaking.stocktakingColumn"
        defaultMessage="Stocktaking"
      />,
      children: []
    };
    stocktakingColumn.children.push({
      className: 'text-right',
      title: <div style={{textAlign: 'right'}}><FormattedMessage
        id="TableStocktaking.stocktakinAmount"
        defaultMessage="Amount"
      /></div>,
      dataIndex: 'stocktakingAmount',
      key: 'stocktakingAmount',
      width: '300px',
      render: (text, record) => {
        const expanded = expandedRows.includes(record.key);
        if (expanded) {
          return false;
        }
        if (record.isGroup) {
          return <div
            style={{textAlign: 'right'}}>
            <PrintAsset
              disableBlink={true}
              asset={record.asset}
              value={record.stocktakingAmount}
              colors={colors} />
          </div>;
        }
        if (!record.stocktakingAmount) {
          return 'loading...';
        }
        return <div
          style={{textAlign: 'right'}}>
          <EditAsset
            onChange={console.log}
            disableBlink={true}
            asset={record.asset}
            value={record.stocktakingAmount}
            colors={colors} />
        </div>;
      }
    });
    stocktakingColumn.children.push({
      title: '',
      dataIndex: 'stocktakingTimes',
      key: 'stocktakingTimes',
      render: function renderTimes(text, record) {
        const expanded = expandedRows.includes(record.key);
        if (expanded) {
          return false;
        }
        return <div style={{textAlign: 'center'}}><FontAwesomeIcon icon={faTimes} /></div>;
      }
    });
    stocktakingColumn.children.push({
      className: 'text-right',
      title: <div style={{textAlign: 'right'}}><FormattedMessage
        id="TableStocktaking.stocktakingRate"
        defaultMessage="Price"
      /></div>,
      dataIndex: 'stocktakingPrice',
      key: 'stocktakingPrice',
      render: (text, record) => {
        const costCurrency = record.residenceCurrency;
        if (record.isChild) {
          return <div style={{textAlign: 'right'}}><PrintAsset
            mode={'text'}
            disableBlink={true}
            asset={costCurrency}
            value={record.stocktakingRate}
            colors={colors} /></div>;
        }

        let warn = '';
        if (!record.stocktakingRate) {
          record.stocktakingRate = 0;
          warn = <span style={{
            display: 'inline-block',
            color: 'red',
            marginLeft: '8px',
            marginRight: '8px'}}><FontAwesomeIcon icon={faExclamationTriangle}/></span>;
        }
        return <div style={{textAlign: 'right'}}>
          {warn}
          <EditAsset
            onChange={console.log}
            disableBlink={true}
            mode={'text'}
            asset={costCurrency}
            value={record.stocktakingRate}
            colors={colors} />
          <span style={{display: 'inline-block', width: '4px'}}></span>
        </div>;
      }
    });
    stocktakingColumn.children.push({
      title: '',
      dataIndex: 'stocktakingEquals',
      key: 'stocktakingEquals',
      render: function renderEquals(text, record) {
        const expanded = expandedRows.includes(record.key);
        if (expanded) {
          return false;
        }
        return <div style={{textAlign: 'center'}}><FontAwesomeIcon icon={faEquals} /></div>;
      }
    });
    stocktakingColumn.children.push({
      className: 'text-right',
      title: <div style={{textAlign: 'right'}}><FormattedMessage
        id="TableStocktaking.stocktakingValue"
        defaultMessage="Value"
      /></div>,
      dataIndex: 'stocktakingValue',
      key: 'stocktakingValue',
      render: (text, record) => {
        const costCurrency = record.residenceCurrency;
        const expanded = expandedRows.includes(record.key);
        if (expanded) {
          return false;
        }
        let result = '';
        result = <PrintAsset
          mode={'text'}
          disableBlink={true}
          asset={costCurrency}
          value={record.stocktakingValue}
          colors={colors} />;
        if (record.stocktakingPriceUsed) {
          result = <strong>{result}</strong>;
        }
        return <div style={{textAlign: 'right'}}>
          {result}
        </div>;
      }
    });
    columns.push(stocktakingColumn);

    function footerRenderer() {
      const downloadBtn = <Button
        size="small"
        onClick={() => {
          reports.stocktaking(operation);
        }}
      ><FontAwesomeIcon style={{marginRight: '8px'}} icon={faSave} /> <FormattedMessage
          id="TableStocktaking.saveAsCSV"
          defaultMessage="Save as CSV"
        /></Button>;

      return <Row>
        <Col span={4}>
          {downloadBtn}
        </Col>
        <Col span={20} style={{textAlign: 'right', opacity: 0.5}}>
          <FormattedMessage
            id="TableStocktaking.footer"
            defaultMessage="Last no {lastNo}, cost basis valuation {stocktakingCostBasis}, market valuation {stocktakingMarketValuation}, valuation {stocktakingValuation}"
            values={{
              lastNo: costs.length,
              stocktakingCostBasis: <PrintAsset
                mode={'text'}
                disableBlink={true}
                asset={stocktaking.operationResidenceCurrency}
                value={stocktaking.stocktakingCostBasis}
                colors={colors} />,
              stocktakingMarketValuation: <PrintAsset
                mode={'text'}
                disableBlink={true}
                asset={stocktaking.operationResidenceCurrency}
                value={stocktaking.stocktakingMarketValuation}
                colors={colors} />,
              stocktakingValuation: <PrintAsset
                mode={'text'}
                disableBlink={true}
                asset={stocktaking.operationResidenceCurrency}
                value={stocktaking.stocktakingValuation}
                colors={colors} />
            }}
          />
        </Col>
      </Row>;
    }
    return (
      <Table
        defaultExpandedRowKeys={expandedRows}
        onExpandedRowsChange={newExpandedRows => {
          expandedRows = newExpandedRows;
        }}
        title={() => <span>
          <FontAwesomeIcon icon={faPiggyBank} style={{marginRight: '4px'}} />
          <FormattedMessage
            id="TableStocktaking.title"
            defaultMessage="Stocktaking at {date}"
            values={{
              date: <strong><PrintTimestamp timestamp={operation.timestamp} colors={colors}/></strong>
            }}
          /></span>}
        scroll={{x: '830px'}}
        dataSource={dataSource}
        columns={columns}
        size="small"
        // bordered={true}
        footer={footerRenderer}
        pagination={false}
      />
    );
  }
}

export default TableStocktaking;
