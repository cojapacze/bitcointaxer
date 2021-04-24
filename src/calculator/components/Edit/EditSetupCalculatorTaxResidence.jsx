import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Form, Select} from 'antd';
import {getBaseConfig} from '../../services/taxCalc/libs/Utils';

class EditSetupCalculatorTaxResidence extends React.Component {
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
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 14},
    };
    if (!setup) {
      return '<div>no calculator setup (calculator)</div>';
    }

    const taxResidenceConfigs = Object.values(getBaseConfig());

    const makeTaxResidenceOption = taxResidenceConfig => (
      <Select.Option
        key={taxResidenceConfig.key}
        value={taxResidenceConfig.key}
      >
        {taxResidenceConfig.name}
      </Select.Option>
    );
    return (
      <div>
        <Form className={'compact-form'} initialValues={{...setup}}>
          <Form.Item
            {...formItemLayout}
            label={
              <FormattedMessage
                id="EditSetupCalculatorTaxResidence.taxResidence"
                defaultMessage="Tax residence"
              />
            }
            name="taxResidence"
          >
            <Select
              rules={[
                {
                  required: false,
                  message: (
                    <FormattedMessage
                      id="EditSetupCalculatorTaxResidence.taxResidence.required"
                      defaultMessage="Select your tax residence"
                    />
                  ),
                },
              ]}
              onChange={taxResidence =>
                calculator.setTaxResidence(taxResidence)
              }
            >
              {taxResidenceConfigs.map(makeTaxResidenceOption)}
            </Select>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

export default EditSetupCalculatorTaxResidence;
