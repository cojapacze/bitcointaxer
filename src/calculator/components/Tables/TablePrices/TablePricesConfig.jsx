import React from 'react';
import PropTypes from 'prop-types';
import {Form, Radio} from 'antd';

const TablePricesConfig = props => {
  console.debug('TablePricesConfig', props);
  return (
    <div>
      <Form.Item>
        <Radio.Group size="default" value={props.value} onChange={props.onChange}>
          <Radio.Button value="day">by day</Radio.Button>
          <Radio.Button value="hour">by hour</Radio.Button>
          <Radio.Button value="minute">by minute</Radio.Button>
          <Radio.Button value="second">by second</Radio.Button>
          <Radio.Button value="transaction">by transaction</Radio.Button>
        </Radio.Group>
      </Form.Item>
    </div>
  );
};
TablePricesConfig.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func
};
export default TablePricesConfig;
