import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {CONFIG} from '../../services/taxCalc/libs/Utils';

import {Form, Tooltip, Switch, Radio} from 'antd';
import EditAsset from './EditAsset';

class EditSetupCalculator extends React.Component {
  state = {};
  static propTypes = {
    form: PropTypes.object,
    calculator: PropTypes.object,
  };
  static getDerivedStateFromProps(props) {
    return props;
  }
  render() {
    const {calculator} = this.state;
    const setup = calculator.getSetup();

    let classicMethodCaption = (
      <FormattedMessage
        id="EditSetupCalculator.activityType.personal"
        defaultMessage="Personal"
      />
    );
    let modernMethodCaption = (
      <FormattedMessage
        id="EditSetupCalculator.activityType.business"
        defaultMessage="Business"
      />
    );
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 14},
    };
    if (!setup) {
      return '<div>no calculator setup (calculator)</div>';
    }

    // country specific setup
    if (calculator.year >= 2019 && setup.taxResidence === 'pl-pln') {
      classicMethodCaption = (
        <FormattedMessage
          id="EditSetupCalculator.activityType.personal_pl_2019"
          defaultMessage="Classic"
        />
      );
      modernMethodCaption = (
        <FormattedMessage
          id="EditSetupCalculator.activityType.business_pl_2019"
          defaultMessage="Modern"
        />
      );
    }
    const fromValueStyle = {
      opacity: 0.5,
    };
    if (setup.cryptoToCryptoTaxableFromValuationThreshold) {
      fromValueStyle.opacity = 1;
    }

    return (
      <Form className={'compact-form'} initialValues={setup}>
        <Form.Item
          key="activityType"
          name="activityType"
          {...formItemLayout}
          label={
            <FormattedMessage
              id="EditSetupCalculator.activityType"
              defaultMessage="Activity type"
            />
          }
        >
          <Radio.Group
            rules={[
              {
                required: false,
                message: (
                  <FormattedMessage
                    id="EditSetupCalculator.activityType.required"
                    defaultMessage="Select business type!"
                  />
                ),
              },
            ]}
            // size="small"
            buttonStyle="solid"
            onChange={e => calculator.setActivityType(e.target.value)}
          >
            <Radio.Button value="personal">{classicMethodCaption}</Radio.Button>
            <Radio.Button value="business">{modernMethodCaption}</Radio.Button>
          </Radio.Group>
        </Form.Item>
        <Form.Item
          key="queueMethod"
          name="queueMethod"
          {...formItemLayout}
          label={
            <FormattedMessage
              id="EditSetupCalculator.queueMethod"
              defaultMessage="Inventory distribution method"
            />
          }
        >
          <Radio.Group
            rules={[
              {
                required: false,
                message: (
                  <FormattedMessage
                    id="EditSetupCalculator.queueMethod.required"
                    defaultMessage="Select inventory distribution method!"
                  />
                ),
              },
            ]}
            options={[
              {
                label: (
                  <FormattedMessage
                    id="EditSetupCalculator.queueMethod.FIFO"
                    defaultMessage="FIFO"
                  />
                ),
                value: 'FIFO',
              },
              {
                label: (
                  <FormattedMessage
                    id="EditSetupCalculator.queueMethod.LIFO"
                    defaultMessage="LIFO"
                  />
                ),
                value: 'LIFO',
              },
              // {label: 'First In, First Out (FIFO) - strict', value: 'FIFO-strict'},
              {
                label: (
                  <FormattedMessage
                    id="EditSetupCalculator.queueMethod.HIFO"
                    defaultMessage="HIFO"
                  />
                ),
                value: 'HIFO',
              },
              // {label: <FormattedMessage
              //   id="EditSetupCalculator.queueMethod.AVG"
              //   defaultMessage="AVG"
              // />, value: 'AVG'}
              // {label: 'Highest Value First Out (HVFO)', value: 'HVFO'},
              // {label: 'Closest Time, First Out', value: 'CTFO'},
              // {label: 'Closest Time, First Out', value: 'CPFO'}
            ]}
            onChange={e => calculator.setQueueMethod(e.target.value)}
          />
        </Form.Item>
        <Form.Item
          key="trackLocations"
          name="trackLocations"
          valuePropName="checked" // required prop name for checkbox
          {...formItemLayout}
          label={
            <FormattedMessage
              id="EditSetupCalculator.trackLocations"
              defaultMessage="Track inventory locations"
            />
          }
        >
          <Switch
            onChange={trackLocations =>
              calculator.setTrackLocations(trackLocations)
            }
            checkedChildren={
              <FormattedMessage
                id="EditSetupCalculator.trackLocations.on"
                defaultMessage="On"
              />
            }
            unCheckedChildren={
              <FormattedMessage
                id="EditSetupCalculator.trackLocations.off"
                defaultMessage="Off"
              />
            }
          />
        </Form.Item>
        {CONFIG.features.splitIntoContracts && (
          <Form.Item
            key="splitOperationIntoContracts"
            name="splitOperationIntoContracts"
            valuePropName="checked" // required prop name for checkbox
            {...formItemLayout}
            label={
              <FormattedMessage
                id="EditSetupCalculator.splitOperationIntoContracts"
                defaultMessage="Transactions"
              />
            }
          >
            <Switch
              onChange={splitOperationIntoContracts =>
                calculator.setSplitOperationIntoContracts(
                  splitOperationIntoContracts,
                )
              }
              checkedChildren={
                <FormattedMessage
                  id="EditSetupCalculator.splitOperationIntoContracts.divide"
                  defaultMessage="divide into contracts"
                />
              }
              unCheckedChildren={
                <FormattedMessage
                  id="EditSetupCalculator.splitOperationIntoContracts.noDivide"
                  defaultMessage="treat as contracts"
                />
              }
            />
            <span hidden={!setup.splitOperationIntoContracts}>
              <span style={{display: 'inline-block', padding: '4px 16px'}}>
                <FormattedMessage
                  id="EditSetupCalculator.splitOperationIntoContracts.upToValue"
                  defaultMessage="up to value"
                />
              </span>
              <EditAsset
                name={'splitOperationIntoContractsUpToValue'}
                mode={'text'}
                inputHeight={'21px'}
                inputWidth={'150px'}
                asset={setup.residenceCurrency}
                value={setup.splitOperationIntoContractsUpToValue}
                onChange={e => {
                  calculator.setSplitOperationIntoContractsUpToValue(
                    e.target.value,
                  );
                }}
              />
            </span>
          </Form.Item>
        )}
        <Form.Item
          key="cryptoToCryptoTaxable"
          name="cryptoToCryptoTaxable"
          valuePropName="checked" // required prop name for checkbox
          {...formItemLayout}
          label={
            <FormattedMessage
              id="EditSetupCalculator.cryptoToCryptoTaxable"
              defaultMessage="Crypto-to-crypto"
            />
          }
        >
          <Switch
            color="red"
            type="danger"
            onChange={cryptoToCryptoTaxable =>
              calculator.setCryptoToCryptoTaxable(cryptoToCryptoTaxable)
            }
            checkedChildren={
              <FormattedMessage
                id="EditSetupCalculator.cryptoToCryptoTaxable.taxable"
                defaultMessage="Taxable"
                values={{
                  residenceCurrency: setup.residenceCurrency,
                }}
              />
            }
            unCheckedChildren={
              <FormattedMessage
                id="EditSetupCalculator.cryptoToCryptoTaxable.nonTaxable"
                defaultMessage="Non-taxable"
              />
            }
          />
        </Form.Item>
        <div
          hidden={!setup.cryptoToCryptoTaxable}
          style={{...fromValueStyle, textAlign: 'right'}}
        >
          <span style={{display: 'inline-block', padding: '4px 16px'}}>
            <FormattedMessage
              id="EditSetupCalculator.cryptoToCryptoTaxableFromValuationThreshold.fromValue"
              defaultMessage="from value"
            />
          </span>
          <Tooltip
            placement="bottomLeft"
            title={
              <FormattedMessage
                id="EditSetupCalculator.cryptoToCryptoTaxableFromValuationThreshold.fromValue.tooltip"
                defaultMessage="Threshold"
              />
            }
          >
            <EditAsset
              name={'cryptoToCryptoTaxableFromValuationThreshold'}
              mode={'text'}
              inputHeight={'21px'}
              inputWidth={'150px'}
              asset={setup.residenceCurrency}
              value={setup.cryptoToCryptoTaxableFromValuationThreshold}
              onChange={e => {
                calculator.setCryptoToCryptoTaxableFromValuationThreshold(
                  e.target.value,
                );
              }}
            />
            &nbsp;
          </Tooltip>
        </div>
      </Form>
    );
  }
}

export default EditSetupCalculator;
