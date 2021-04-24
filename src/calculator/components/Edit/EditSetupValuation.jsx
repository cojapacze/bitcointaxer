import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Checkbox, Form, InputNumber, Select} from 'antd';

class EditSetupCalculator extends React.Component {
  state = {};
  static propTypes = {
    form: PropTypes.object,
    calculator: PropTypes.object,
  };
  static getDerivedStateFromProps(props) {
    return props;
  }
  setSetting(name, value) {
    switch (name) {
      case 'valuationSide':
      case 'valuationStrategy':
        value.sort();
        break;
      default:
    }
    const {calculator} = this.state;
    const assignValuationSetup = {};
    assignValuationSetup[name] = value;
    calculator.setValuationSetup(assignValuationSetup);
    calculator.markSetupAsModified({
      valuationSetup: {
        name,
        value,
      },
    });
  }
  render() {
    const {calculator} = this.state;
    const setup = calculator.getSetup();
    // const issetupModified = calculator.setupModified;
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 14},
    };
    if (!setup) {
      return '<div>no calculator setup (calculator)</div>';
    }
    const valuationSetup = setup.valuationSetup || {
      valuationPriceServer: 'https://priceserver.bitcointaxer.org:8088',
      valuationPrice: ['low'],
      valuationSide: ['residence_side', 'fiat_side', 'lower_side'],
      valuationStrategy: ['nbp.pl', 'lower_price'],
    };
    setup.valuationSetup = valuationSetup;
    return (
      <div>
        <Form
          className={'compact-form'}
          onSubmit={this.handleSubmit}
          initialValues={valuationSetup}
        >
          <Form.Item
            name="valuationPriceServer"
            {...formItemLayout}
            label={
              <FormattedMessage
                id="EditSetupValuation.valuationPriceServer"
                defaultMessage="Price server"
              />
            }
            style={{display: 'none'}}
          >
            <Select
              onChange={e => this.setSetting('valuationPriceServer', e)}
              rules={[
                {
                  required: true,
                  message: 'Choose which price server use for valuation',
                },
              ]}
            >
              <Select.Option value="https://priceserver.bitcointaxer.org:8088">
                https://priceserver.bitcointaxer.org:8088
              </Select.Option>
              <Select.Option value="https://priceserver.bitcointaxer.com:8081">
                https://priceserver.bitcointaxer.com:8081
              </Select.Option>
              <Select.Option value="http://localhost:8081">
                http://localhost:8081
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="valuationSide"
            {...formItemLayout}
            label={
              <FormattedMessage
                id="EditSetupValuation.valuationSide"
                defaultMessage="Valuation side"
              />
            }
          >
            <Select
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="EditSetupValuation.valuationSide.required"
                      defaultMessage="Select operation side"
                    />
                  ),
                },
              ]}
              placeholder={
                <FormattedMessage
                  id="EditSetupValuation.valuationSide.placeholder"
                  defaultMessage="Select the operation side strategy in order for operation valuation"
                />
              }
              onChange={e => this.setSetting('valuationSide', e)}
              mode="multiple"
            >
              <Select.Option value="_01residence_side">
                <FormattedMessage
                  id="EditSetupValuation.valuationSide._01residence_side"
                  defaultMessage="1. residence side"
                />
              </Select.Option>
              <Select.Option value="_02fiat_side">
                <FormattedMessage
                  id="EditSetupValuation.valuationSide._02fiat_side"
                  defaultMessage="2. fiat side"
                />
              </Select.Option>
              <Select.Option value="_03lower_side">
                <FormattedMessage
                  id="EditSetupValuation.valuationSide._03lower_side"
                  defaultMessage="3. lower side"
                />
              </Select.Option>
              <Select.Option value="_04higher_side">
                <FormattedMessage
                  id="EditSetupValuation.valuationSide._04higher_side"
                  defaultMessage="4. higher side"
                />
              </Select.Option>
              <Select.Option value="_05base_asset">
                <FormattedMessage
                  id="EditSetupValuation.valuationSide._05base_asset"
                  defaultMessage="5. base side"
                />
              </Select.Option>
              <Select.Option value="_06quote_asset">
                <FormattedMessage
                  id="EditSetupValuation.valuationSide._06quote_asset"
                  defaultMessage="6. quote side"
                />
              </Select.Option>
              <Select.Option value="_07both_average">
                <FormattedMessage
                  id="EditSetupValuation.valuationSide._07both_average"
                  defaultMessage="7. both sides"
                />
              </Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="valuationStrategy"
            {...formItemLayout}
            label={
              <FormattedMessage
                id="EditSetupValuation.valuationStrategy"
                defaultMessage="Use pricelist in order"
              />
            }
          >
            <Select
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="EditSetupValuation.valuationStrategy.required"
                      defaultMessage="Select order of API`s"
                    />
                  ),
                },
              ]}
              placeholder={
                <FormattedMessage
                  id="EditSetupValuation.valuationStrategy.placeholder"
                  defaultMessage="Select order of API`s"
                />
              }
              onChange={e => this.setSetting('valuationStrategy', e)}
              mode="multiple"
            >
              <Select.Option value="_01nbp.pl">
                <FormattedMessage
                  id="EditSetupValuation.valuationStrategy._01nbp.pl"
                  defaultMessage="1. nbp.pl"
                />
              </Select.Option>
              <Select.Option value="_02cryptocompare.com">
                <FormattedMessage
                  id="EditSetupValuation.valuationStrategy._02cryptocompare.com"
                  defaultMessage="2. cryptocompare.com"
                />
              </Select.Option>
              <Select.Option value="_03coinpaprika.com">
                <FormattedMessage
                  id="EditSetupValuation.valuationStrategy._03coinpaprika.com"
                  defaultMessage="3. coinpaprika.com.com"
                />
              </Select.Option>
              {/* <Select.Option value="_04lower_price"><FormattedMessage
                  id="EditSetupValuation.valuationStrategy._04lower_price"
                  defaultMessage="4. lower pricelist"
                /></Select.Option> */}
            </Select>
          </Form.Item>

          <Form.Item
            name="valuationPrice"
            {...formItemLayout}
            label={
              <FormattedMessage
                id="EditSetupValuation.valuationPrice"
                defaultMessage="Use prices"
              />
            }
          >
            <Checkbox.Group
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="EditSetupValuation.valuationPrice.required"
                      defaultMessage="Choose which price from result use for valuation"
                    />
                  ),
                },
              ]}
              options={['low', 'open', 'close', 'high']}
              onChange={e => this.setSetting('valuationPrice', e)}
            />
          </Form.Item>
          <Form.Item
            name="valuationCTCDiscount"
            {...formItemLayout}
            label={
              <FormattedMessage
                id="EditSetupValuation.valuationCTCDiscount"
                defaultMessage="Crypto-to-crypto depth discount"
              />
            }
          >
            <InputNumber
              rules={[
                {
                  required: true,
                  message: (
                    <FormattedMessage
                      id="EditSetupValuation.valuationCTCDiscount.required"
                      defaultMessage="Lower the valuation in crypto-to-crypto transactions"
                    />
                  ),
                },
              ]}
              onChange={e => this.setSetting('valuationCTCDiscount', e)}
              min={-100}
              max={100}
              formatter={value => `${value}%`}
              parser={value => value.replace('%', '')}
            />
          </Form.Item>
        </Form>
      </div>
    );
  }
}

export default EditSetupCalculator;
