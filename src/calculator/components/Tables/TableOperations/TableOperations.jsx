import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Table} from 'antd';

import TableOperationsCellDate from './TableOperationsCellDate';
import TableOperationsCellFrom from './TableOperationsCellFrom';
import TableOperationsCellOperation from './TableOperationsCellOperation';
import TableOperationsCellTo from './TableOperationsCellTo';
import TableOperationsCellValuation from './TableOperationsCellValuation';
import TableOperationsCellCost from './TableOperationsCellCost';
import TableOperationsCellIncome from './TableOperationsCellIncome';
import TableOperationsCellExpense from './TableOperationsCellExpense';
import TableOperationsCellTaxable from './TableOperationsCellTaxable';
import TableOperationsCellProfit from './TableOperationsCellProfit';
import TableOperationsCellNotes from './TableOperationsCellNotes';
import {PrintAssetLabel} from '../../Print';


const
  VK_DOWN = 40,
  VK_ENTER = 13,
  VK_ESC = 27,
  VK_LEFT = 37,
  VK_RIGHT = 39,
  VK_SPACE = 34,
  VK_UP = 38;

class TableOperations extends React.Component {
  static propTypes = {
    operationQueue: PropTypes.object,
    calculator: PropTypes.object,
    title: PropTypes.node,
    footer: PropTypes.node,
    colors: PropTypes.bool,
    year: PropTypes.number,
    addOperationButton: PropTypes.node
  }

  static getDerivedStateFromProps(props) {
    return props;
  }
  onTypeFilter = (record, filter) => {
    function checkRecordFilter(groupFilter) {
      const typeFilters = [];
      switch (groupFilter) {
        case 'transfers': // 'Transfers'
          typeFilters.push('withdraw');
          typeFilters.push('deposit');
          typeFilters.push('transfer');
          return typeFilters.includes(record.type);
        case 'trade_fiat_fiat': // 'Trade FIAT'
          typeFilters.push('trade');
          return typeFilters.includes(record.type) && record.fiatToFiatTrade;
        case 'trade_crypto_fiat': // 'Trade CRYPTO-FIAT'
          typeFilters.push('trade');
          return typeFilters.includes(record.type) && record.cryptoToFiatTrade;
        case 'trade_fiat_crypto': // 'Trade FIAT-CRYPTO'
          typeFilters.push('trade');
          return typeFilters.includes(record.type) && record.fiatToCryptoTrade;
        case 'trade_crypto_crypto': // 'Trade CRYPTO'
          typeFilters.push('trade');
          return typeFilters.includes(record.type) && record.cryptoToCryptoTrade;
        default:
          return true;
      }
    }
    const result = checkRecordFilter(filter);
    return result;
  }

  setSort = (columnKey, order) => {
    this.setState({
      sortedInfo: {
        order: order,
        columnKey: columnKey
      }
    });
  }
  constructor(props) {
    super(props);
    this.operationQueue = props.operationQueue;
    this.calculator = props.calculator;
    window.TableOperations = this;
    this.state = {
      sortedInfo: {
        order: 'ascend',
        columnKey: 'date'
      },
      year: props.year,
      pageSize: 30,
      page: 1,
      colors: true,
      editingKey: '',
      currentOperationKey: 0,
      title: props.title,
      footer: props.footer,
      addOperationButton: props.addOperationButton,
      expandedRows: []
    };
    window.addEventListener('keydown', e => {
      if (document.activeElement !== document.body) {
        return;
      }
      let unhandled = false;
      switch (e.keyCode) {
        case VK_UP: // up
          this.operationQueue.selectPrev();
          break;
        case VK_DOWN: // down
          this.operationQueue.selectNext();
          break;
        case VK_LEFT: // left
        case VK_RIGHT: // right
        case VK_ENTER: // enter
        case VK_SPACE: // space
        case VK_ESC: // esc
        default:
          unhandled = true;
          console.debug('UNHANDLED KEY', e.keyCode, e);
          break;
      }
      if (!unhandled) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
    this.autoUpdate = () => this.forceUpdate();
  }
  componentDidMount() {
    this.calculator.after('setup-modified', this.autoUpdate);
    // this.calculator.prices.after('progress-changed', this.autoUpdate);
  }
  componentWillUnmount() {
    this.calculator.removeListener('setup-modified', this.autoUpdate);
    // this.calculator.prices.removeListener('progress-changed', this.autoUpdate);
  }
  onChangeColors = checked => {
    this.setState({
      colors: checked
    });
  }

  getRowClassName = record => {
    if (record.key === this.state.currentOperationKey) {
      return 'selected';
    }
    return '';
  }

  getRowKey = record => record.key;

  onPageChange = page => this.setState({page: page});

  handleSearch = (selectedKeys, confirm) => {
    console.debug('handleSearch', selectedKeys, confirm);
  }
  handleReset = clearFilters => {
    console.debug('handleReset', clearFilters);
  }
  render() {
    const {
      page,
      pageSize,
      sortedInfo,
      // year,
      calculator,
      colors
    } = this.state;
    const residenceCurrency = calculator.setup.residenceCurrency;
    const setup = calculator.getSetup();
    const columns = [];
    columns.push({
      title: <FormattedMessage id="TableOperations.date" defaultMessage="Date"/>,
      dataIndex: 'date',
      inputType: 'datetime',
      type: 'datetime',
      key: 'column-date',
      width: 180,
      sortOrder: sortedInfo.columnKey === 'date' && sortedInfo.order,
      render: TableOperationsCellDate.bind(this)
    });
    columns.push({
      title: <div style={{textAlign: 'right'}}><FormattedMessage id="TableOperations.from" defaultMessage="From"/></div>,
      dataIndex: 'from',
      key: 'column-from',
      render: TableOperationsCellFrom.bind(this)
    });
    columns.push({
      title: <div style={{textAlign: 'center'}}>◦</div>, // ◯◦
      dataIndex: 'type',
      inputType: 'no-edit',
      type: 'operation',
      key: 'column-operation',
      className: 'operation',
      // filterIcon: true,
      filterMultiple: true,
      filters: [
        {text: <FormattedMessage id="TableOperations.operation.filter.transfers" defaultMessage="Transfers"/>, value: 'transfers'},
        {text: <FormattedMessage id="TableOperations.operation.filter.fiatToFiatTrade" defaultMessage="Trade FIAT-FIAT"/>, value: 'trade_fiat_fiat'},
        {text: <FormattedMessage id="TableOperations.operation.filter.fiatToCryptoTrade" defaultMessage="Buy FIAT-CRYPTO"/>, value: 'trade_fiat_crypto'},
        {text: <FormattedMessage id="TableOperations.operation.filter.cryptoToFiatTrade" defaultMessage="Sell CRYPTO-FIAT"/>, value: 'trade_crypto_fiat'},
        {text: <FormattedMessage id="TableOperations.operation.filter.cryptoToCryptoTrade" defaultMessage="Trade Crypto-to-Crypto"/>, value: 'trade_crypto_crypto'}
      ],
      onFilter: (value, record) => this.onTypeFilter(record, value),
      width: 100,
      render: TableOperationsCellOperation.bind(this)
    });
    columns.push({
      title: <div style={{textAlign: 'left'}}><FormattedMessage id="TableOperations.to" defaultMessage="To"/></div>,
      dataIndex: 'to',
      key: 'column-to',
      render: TableOperationsCellTo.bind(this)

    });
    columns.push({
      title: <div style={{textAlign: 'right'}}><FormattedMessage id="TableOperations.costBasis" defaultMessage="Cost Basis"/></div>,
      dataIndex: 'cost',
      key: 'column-cost',
      // sorter: true,
      render: TableOperationsCellCost.bind(this)
    });
    if (setup.activityType === 'personal') {
      columns.push({
        title: <div style={{textAlign: 'right'}}><FormattedMessage
          id="TableOperations.valuation"
          defaultMessage="{asset} Valuation"
          values={{
            asset: <PrintAssetLabel asset={residenceCurrency} colors={colors}/>
          }}/></div>,
        dataIndex: 'value',
        key: 'column-value',
        // sorter: true,
        render: TableOperationsCellValuation.bind(this)
      });
    }
    columns.push({
      title: <div style={{textAlign: 'center'}}><FormattedMessage id="TableOperations.taxable" defaultMessage="Taxable"/></div>,
      dataIndex: 'taxable',
      key: 'column-taxable',
      // filters: [
      //   {text: 'Taxable', value: 'taxable'},
      //   {text: 'Non-taxable', value: 'non-taxable'}
      // ],
      render: TableOperationsCellTaxable.bind(this)
    });
    if (setup.activityType === 'business') {
      columns.push({
        title: <div style={{textAlign: 'right'}}><FormattedMessage id="TableOperations.income" defaultMessage="Income"/></div>,
        dataIndex: 'income',
        key: 'column-income',
        // sorter: true,
        render: TableOperationsCellIncome.bind(this)
      });
      columns.push({
        title: <div style={{textAlign: 'right'}}><FormattedMessage id="TableOperations.expense" defaultMessage="Expense"/></div>,
        dataIndex: 'expense',
        key: 'column-expense',
        // sorter: true,
        render: TableOperationsCellExpense.bind(this)
      });
    }
    if (setup.activityType === 'personal') {
      columns.push({
        title: <div style={{textAlign: 'right'}}><FormattedMessage id="TableOperations.gainLoss" defaultMessage="Gain / Loss"/></div>,
        dataIndex: 'profit',
        key: 'column-profit',
        // sorter: true,
        render: TableOperationsCellProfit.bind(this)
      });
    }
    columns.push({
      title: <div style={{textAlign: 'right'}}><FormattedMessage id="TableOperations.notes" defaultMessage="Notes"/></div>,
      dataIndex: 'notes',
      key: 'column-notes',
      render: TableOperationsCellNotes.bind(this)
    });
    this.columns = columns;

    const renderTableOperationsTitle = () => this.state.title;
    const renderTableOperationsHeader = () => this.state.header;
    const renderTableOperationsFooter = () => this.state.footer;

    const dataSource = calculator.getCalculatorOperations();
    return (
      <div>
        <Table
          dataSource={dataSource}
          pagination={{
            pageSize: pageSize,
            current: page,
            onChange: this.onPageChange,
            showQuickJumper: true
          }}
          onExpandedRowsChange={newExpandedRows => {
            this.setState({
              expandedRows: newExpandedRows
            });
          }}
          title={renderTableOperationsTitle}
          header={renderTableOperationsHeader}
          footer={renderTableOperationsFooter}
          bordered={true}
          onRow={this.onRow}
          columns={this.columns}
          rowClassName={this.getRowClassName}
          rowKey={this.getRowKey}
          scroll={{x: 800}}
        />
      </div>
    );
  }
}

export default TableOperations;

