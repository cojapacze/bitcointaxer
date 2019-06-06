import React from 'react';
import PropTypes from 'prop-types';

import PrintTimestamp from './PrintTimestamp';
import PrintOperationNo from './PrintOperationNo';
import {
  CONFIG,
  colorOfHash,
  getOperationSymbol} from '../../services/taxCalc/libs/Utils';
class PrintOperationNoAndTimestamp extends React.Component {
  state = {
    colors: true,
    operation: false,
    disableBlink: false,
    blink: true
  }
  static propTypes = {
    operation: PropTypes.object,
    suffix: PropTypes.node,
    features: PropTypes.array,
    colors: PropTypes.bool,
    disableBlink: PropTypes.bool,
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
    const {
      blink,
      colors,
      disableBlink,
      features,
      suffix,
      operation
    } = this.state;
    let className = '';
    if (!disableBlink && blink) {
      className += ` ${blink}`;
    }
    let result = 'err';
    if (operation) {
      let suffixEl = suffix;
      if (operation.from && operation.to) {
        if (features && features.length && features.includes('locations')) {
          const operationSymbol = getOperationSymbol(operation);
          suffixEl = <span style={{padding: '0 8px'}}>{suffixEl}{operation.from.loc} {operationSymbol} <strong>{operation.to.loc}</strong></span>;
        }
        if (features && features.length && features.includes('locations_akcent')) {
          const operationSymbol = getOperationSymbol(operation);
          suffixEl = <span style={{padding: '0 8px', opacity: 0.5}}>{suffixEl}{operation.from.loc} {operationSymbol} <strong>{operation.to.loc}</strong></span>;
        }
        if (features && features.length && features.includes('last_location_akcent')) {
          const locationColor = colorOfHash(operation.domain, CONFIG.seed);
          suffixEl = <span style={{padding: '0 8px', opacity: 1}}>{suffixEl} <strong
            style={{color: locationColor}}
          >{operation.to.loc}</strong></span>;
        }
      }
      result = <span className={className}>
        <div><small><PrintOperationNo operation={operation} colors={colors}/>{suffixEl}</small></div>
        <div><PrintTimestamp timestamp={operation.timestamp} colors={colors}/></div>
      </span>;
    }
    return result;
  }
}

export default PrintOperationNoAndTimestamp;
