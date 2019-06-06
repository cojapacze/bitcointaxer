import React from 'react';
import PropTypes from 'prop-types';

class PrintOperationLink extends React.Component {
  state = {
    colors: true,
    operation: false,
    blink: true
  }
  static propTypes = {
    operation: PropTypes.object,
    operationKey: PropTypes.string,
    onClick: PropTypes.func,
    colors: PropTypes.bool
  }
  static getDerivedStateFromProps(props) {
    const operationKey = (props.operation && props.operation.key) || props.operationKey;
    return {
      ...props,
      operationKey
    };
  }
  render() {
    const {operationKey, onClick} = this.state;
    return <strong
      style={{cursor: 'pointer'}}
      onClick={onClick}
    >{operationKey}</strong>;
  }
}

export default PrintOperationLink;
