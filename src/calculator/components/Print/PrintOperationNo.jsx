import React from 'react';
import PropTypes from 'prop-types';

class PrintOperationNo extends React.Component {
  state = {
    colors: true,
    operation: false,
    blink: true
  }
  static propTypes = {
    operation: PropTypes.object,
    colors: PropTypes.bool,
    blink: PropTypes.bool
  }
  static getDerivedStateFromProps(props, state) {
    let blink = '';
    if (props.operation !== state.operation) {
      if (state.blink === 'blink-a') {
        blink = 'blink-b';
      } else {
        blink = 'blink-a';
      }
    }
    return {
      ...props,
      blink
    };
  }
  render() {
    const {operation, colors, blink} = this.state;
    if (!operation || !operation.calculator || !operation.calculatorStep) {
      return 'err';
    }
    let className = `print-operation-key ${colors}`;
    if (blink) {
      className += ` ${blink}`;
    }
    let result = 'err';
    if (operation) {
      if (colors) {
        className += ' operation-no';
      }
      switch (operation.type) {
        case 'contract':
          result = <span className={className}>
            {operation.calculatorStep && operation.calculatorStep.stepNo}
            -
            {operation.calculatorStep && operation.calculatorStep.contractNo}
            /
            {operation.calculator.year}
          </span>;
          break;
        default:
          result = <span className={className}>
            {operation.calculatorStep && operation.calculatorStep.stepNo}/{operation.calculator.year}
          </span>;
      }
    }
    return result;
  }
}

export default PrintOperationNo;
