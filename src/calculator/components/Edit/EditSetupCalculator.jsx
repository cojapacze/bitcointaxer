import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {CONFIG} from '../../services/taxCalc/libs/Utils';

import {Form, Tooltip, Switch, Radio} from 'antd';
import EditAsset from './EditAsset';

class EditSetupCalculator extends React.Component {
  state = {}
  static propTypes = {
    form: PropTypes.object,
    calculator: PropTypes.object
  }
  static getDerivedStateFromProps(props) {
    return props;
  }
  render() {
    const {calculator} = this.state;
    const setup = calculator.getSetup();
    const {getFieldDecorator} = this.props.form;
    let classicMethodCaption = <FormattedMessage
      id="EditSetupCalculator.activityType.personal"
      defaultMessage="Personal"
    />;
    let modernMethodCaption = <FormattedMessage
      id="EditSetupCalculator.activityType.business"
      defaultMessage="Business"
    />;
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 14}
    };
    if (!setup) {
      return '<div>no calculator setup (calculator)</div>';
    }

    // country specific setup
    if (calculator.year >= 2019 && setup.taxResidence === 'pl-pln') {
      classicMethodCaption = <FormattedMessage
        id="EditSetupCalculator.activityType.personal_pl_2019"
        defaultMessage="Classic"
      />;
      modernMethodCaption = <FormattedMessage
        id="EditSetupCalculator.activityType.business_pl_2019"
        defaultMessage="Modern"
      />;
    }

    const options = [];
    options.push(<Form.Item
      key="activityType"
      {...formItemLayout}
      label={<FormattedMessage
        id="EditSetupCalculator.activityType"
        defaultMessage="Activity type"
      />}
    >
      {getFieldDecorator('activityType', {
        initialValue: setup.activityType,
        rules: [
          {required: false, message: <FormattedMessage
            id="EditSetupCalculator.activityType.required"
            defaultMessage="Select business type!"
          />}
        ]
      })(
        <Radio.Group
          // size="small"
          buttonStyle="solid"
          onChange={e => calculator.setActivityType(e.target.value)}
        >
          <Radio.Button value='personal'>{classicMethodCaption}</Radio.Button>
          <Radio.Button value='business'>{modernMethodCaption}</Radio.Button>
        </Radio.Group>
      )}
    </Form.Item>);

    options.push(<Form.Item
      key="queueMethod"
      {...formItemLayout}
      label={<FormattedMessage
        id="EditSetupCalculator.queueMethod"
        defaultMessage="Inventory distribution method"
      />}
    >
      {getFieldDecorator('queueMethod', {
        initialValue: setup.queueMethod,
        rules: [
          {required: false, message: <FormattedMessage
            id="EditSetupCalculator.queueMethod.required"
            defaultMessage="Select inventory distribution method!"
          />}
        ]
      })(
        <Radio.Group
          options={[
            {label: <FormattedMessage
              id="EditSetupCalculator.queueMethod.FIFO"
              defaultMessage="FIFO"
            />, value: 'FIFO'},
            {label: <FormattedMessage
              id="EditSetupCalculator.queueMethod.LIFO"
              defaultMessage="LIFO"
            />, value: 'LIFO'},
            // {label: 'First In, First Out (FIFO) - strict', value: 'FIFO-strict'},
            {label: <FormattedMessage
              id="EditSetupCalculator.queueMethod.HIFO"
              defaultMessage="HIFO"
            />, value: 'HIFO'}
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
      )}
    </Form.Item>);
    options.push(<Form.Item
      key="trackLocations"
      {...formItemLayout}
      label={<FormattedMessage
        id="EditSetupCalculator.trackLocations"
        defaultMessage="Track inventory locations"
      />}
    >
      {getFieldDecorator('trackLocations', {
        valuePropName: 'checked', // required prop name for checkbox
        initialValue: setup.trackLocations
      })(
        <Switch
          onChange={trackLocations => calculator.setTrackLocations(trackLocations)}
          checkedChildren={<FormattedMessage
            id="EditSetupCalculator.trackLocations.on"
            defaultMessage="On"
          />}
          unCheckedChildren={<FormattedMessage
            id="EditSetupCalculator.trackLocations.off"
            defaultMessage="Off"
          />}
        />
      )}
    </Form.Item>);
    if (CONFIG.features.splitIntoContracts) {
      options.push(<Form.Item
        key="splitOperationIntoContracts"
        {...formItemLayout}
        label={<FormattedMessage
          id="EditSetupCalculator.splitOperationIntoContracts"
          defaultMessage="Transactions"
        />}
      >
        {getFieldDecorator('splitOperationIntoContracts', {
          initialValue: setup.splitOperationIntoContracts,
          valuePropName: 'checked'
        })(
          <Switch
            onChange={splitOperationIntoContracts =>
              calculator.setSplitOperationIntoContracts(splitOperationIntoContracts)}
            checkedChildren={<FormattedMessage
              id="EditSetupCalculator.splitOperationIntoContracts.divide"
              defaultMessage="divide into contracts"
            />}
            unCheckedChildren={<FormattedMessage
              id="EditSetupCalculator.splitOperationIntoContracts.noDivide"
              defaultMessage="treat as contracts"
            />}
          />
        )}
        <span hidden={!setup.splitOperationIntoContracts}>
          <span style={{display: 'inline-block', padding: '4px 16px'}}><FormattedMessage
            id="EditSetupCalculator.splitOperationIntoContracts.upToValue"
            defaultMessage="up to value"
          /></span>
          <EditAsset
            name={'splitOperationIntoContractsUpToValue'}
            mode ={'text'}
            inputHeight={'21px'}
            inputWidth={'150px'}
            asset={setup.residenceCurrency}
            value={setup.splitOperationIntoContractsUpToValue}
            onChange={e => {
              calculator.setSplitOperationIntoContractsUpToValue(
                e.target.value
              );
            }}
          />
        </span>
      </Form.Item>);
    }
    const fromValueStyle = {
      opacity: 0.5
    };
    if (setup.cryptoToCryptoTaxableFromValuationThreshold) {
      fromValueStyle.opacity = 1;
    }
    options.push(<Form.Item
      key="cryptoToCryptoTaxable"
      {...formItemLayout}
      label={<FormattedMessage
        id="EditSetupCalculator.cryptoToCryptoTaxable"
        defaultMessage="Crypto-to-crypto"
      />}
    >
      {getFieldDecorator('cryptoToCryptoTaxable', {
        initialValue: setup.cryptoToCryptoTaxable,
        valuePropName: 'checked'
      })(
        <Switch
          color='red'
          type="danger"
          onChange={cryptoToCryptoTaxable => calculator.setCryptoToCryptoTaxable(cryptoToCryptoTaxable)}
          checkedChildren={<FormattedMessage
            id="EditSetupCalculator.cryptoToCryptoTaxable.taxable"
            defaultMessage="Taxable"
            values={{
              residenceCurrency: setup.residenceCurrency
            }}
          />}
          unCheckedChildren={<FormattedMessage
            id="EditSetupCalculator.cryptoToCryptoTaxable.nonTaxable"
            defaultMessage="Non-taxable"
          />}
        />
      )}
      <span hidden={!setup.cryptoToCryptoTaxable} style={fromValueStyle}>
        <span style={{display: 'inline-block', padding: '4px 16px'}}><FormattedMessage
          id="EditSetupCalculator.cryptoToCryptoTaxableFromValuationThreshold.fromValue"
          defaultMessage="from value"
        /></span>
        <Tooltip placement="bottomLeft" title={<FormattedMessage
          id="EditSetupCalculator.cryptoToCryptoTaxableFromValuationThreshold.fromValue.tooltip"
          defaultMessage="Threshold"
        />}>
          <EditAsset
            name={'cryptoToCryptoTaxableFromValuationThreshold'}
            mode ={'text'}
            inputHeight={'21px'}
            inputWidth={'150px'}
            asset={setup.residenceCurrency}
            value={setup.cryptoToCryptoTaxableFromValuationThreshold}
            onChange={e => {
              calculator.setCryptoToCryptoTaxableFromValuationThreshold(
                e.target.value
              );
            }}
          />&nbsp;
        </Tooltip>
      </span>
    </Form.Item>);
    return (
      <div>
        <Form className={'compact-form'}>
          {options}
        </Form>
      </div>
    );
  }
}

export default Form.create()(EditSetupCalculator);
