import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';


import {Tabs, Row, Col, Checkbox} from 'antd';

import {PrintAssetExchangePriceCalculation} from '../Print';
import EditAsset from './EditAsset';
import EditSubpricesTable from './EditSubpricesTable';

class EditOperationValuation extends React.Component {
  static propTypes = {
    operation: PropTypes.object
  }
  state = {}
  static getDerivedStateFromProps(props) {
    return {
      ...props
    };
  }
  constructor(props) {
    super(props);
    const {operation} = props;
    const operationQueue = operation.operationQueue;
    this.state = {
      operation: operation
    };
    // todo: fbw
    this.prices = operationQueue.prices;
    this.autoUpdate = () => this.forceUpdate();
  }
  componentDidMount() {
    this.prices.after('operation-valuation-changed', this.autoUpdate);
  }
  componentWillUnmount() {
    this.prices.removeListener('operation-valuation-changed', this.autoUpdate);
  }
  render() {
    const {operation, colors} = this.state || {};
    const operationQueue = operation.operationQueue;
    const sidePricesTables = [];
    const valuation = operation.valuation;

    if (!valuation) {
      return <div className='error'>no operation valuation</div>;
    }
    if (!valuation.resolved) {
      return <div className='error'><FormattedMessage
        id="EditOperationValuation.error.notResolved"
        defaultMessage="waiting for valuation"
      /></div>;
    }

    const residenceCurrency = operation && operation.calculatorStep && operation.calculatorStep.residenceCurrency;
    const prices = operationQueue.prices;

    if (valuation.fromPrice) {
      sidePricesTables.push(<Tabs.TabPane
        className={(valuation.useBaseAssetValue) ? 'enabled' : 'disabled'}
        tab={<FormattedMessage
          id="EditOperationValuation.baseAssetPrice"
          defaultMessage="Base asset price"
        />}
        key={'fromPrice'}>
        <EditSubpricesTable operationValuation={valuation} sidePrice={valuation.fromPrice}/>
      </Tabs.TabPane>);
    }

    if (valuation.toPrice) {
      sidePricesTables.push(<Tabs.TabPane
        className={(valuation.useQuoteAssetValue) ? 'enabled' : 'disabled'}
        tab={<FormattedMessage
          id="EditOperationValuation.quoteAssetPrice"
          defaultMessage="Quote asset price"
        />}
        key={'toPrice'}>
        <EditSubpricesTable operationValuation={valuation} sidePrice={valuation.toPrice}/>
      </Tabs.TabPane>);
    }
    let priceSidesValuation = false;
    if (sidePricesTables.length) {
      priceSidesValuation = <div>
        <Row gutter={16}>
          <Col style={{textAlign: 'right'}} span={12}>
            <span style={{marginRight: '8px', cursor: 'pointer'}} className={(operation.valuation.useBaseAssetValue) ? 'enabled' : 'disabled'}
              onClick={() => {
                this.prices.setOperationValuationPricesSidePrice(operation.valuation, 'baseAsset', !operation.valuation.useBaseAssetValue);
              }}
            >
              <PrintAssetExchangePriceCalculation
                key={'baseAsset'}
                align={'right'}
                amount={operation && operation.from && operation.from.amount}
                asset={operation && operation.from && operation.from.asset}
                price={operation.valuation.fromPrice}
                operation={operation}
                colors={colors}
              />
            </span>
            <Checkbox
              onChange={e =>
                this.prices.setOperationValuationPricesSidePrice(operation.valuation, 'baseAsset', e.target.checked)
              }
              name={operation.valuation.valuationKey}
              value={'baseAsset'}
              checked={operation.valuation.useBaseAssetValue}
            >
            </Checkbox>
          </Col>
          <Col span={12}>
            <Checkbox
              onChange={e =>
                this.prices.setOperationValuationPricesSidePrice(operation.valuation, 'quoteAsset', e.target.checked)
              }
              name={operation.valuation.valuationKey}
              value={'quoteAsset'}
              checked={operation.valuation.useQuoteAssetValue}
            >
            </Checkbox>
            <span style={{marginLeft: '8px', cursor: 'pointer'}} className={(operation.valuation.useQuoteAssetValue) ? 'enabled' : 'disabled'}
              onClick={() => {
                this.prices.setOperationValuationPricesSidePrice(operation.valuation, 'quoteAsset', !operation.valuation.useQuoteAssetValue);
              }}
            >
              <PrintAssetExchangePriceCalculation
                key={'quoteAsset'}
                align={'left'}
                amount={operation && operation.to && operation.to.amount}
                asset={operation && operation.to && operation.to.asset}
                price={operation.valuation.toPrice}
                operation={operation}
                colors={colors}
              />
            </span>
          </Col>
        </Row>
        <Tabs
          animated={{inkBar: true, tabPane: false}}
          tabBarStyle={{textAlign: 'center'}}
          type="line"
        >{sidePricesTables}</Tabs>
      </div>;
    }

    return <div>
      <div style={{
        textAlign: 'center',
        marginBottom: '48px'
      }}>
        <div style={{fontSize: 'large'}}>
          <EditAsset
            mode={'text'}
            onChange={e => {
              prices.setOperationValuationCustomValue(operation.valuation, e.target.value);
            }}
            modified={operation.valuation.modified}
            value={parseFloat(operation.valuation.value)}
            asset={residenceCurrency}
            colors={colors}
          />
        </div>
      </div>
      <br/>
      {priceSidesValuation}
    </div>;
  }
}

export default EditOperationValuation;
