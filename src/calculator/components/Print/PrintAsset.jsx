import React from 'react';
import PropTypes from 'prop-types';
import {getAssetConfig, format} from '../../services/taxCalc/libs/Utils.js';

class PrintAsset extends React.Component {
  state = {
    value: 0,
    asset: 'INIT',
    blink: true
  }
  static propTypes = {
    asset: PropTypes.string,
    blink: PropTypes.bool,
    colors: PropTypes.bool,
    decimalPlaces: PropTypes.number,
    disableBlink: PropTypes.bool,
    mode: PropTypes.string,
    style: PropTypes.object,
    value: PropTypes.number
  }
  static getDerivedStateFromProps(props, state) {
    let blink = '';
    if (props.value !== state.value) {
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
      asset,
      blink,
      colors,
      decimalPlaces,
      disableBlink,
      mode,
      onClick,
      style,
      value
    } = this.state;
    const assetConfig = getAssetConfig(asset);
    const assetColor = (colors) ? assetConfig.color : 'black';
    let decimalPlacesForce = assetConfig.decimalPlaces;
    if (typeof decimalPlaces === 'number') {
      decimalPlacesForce = decimalPlaces;
    }
    if (mode === 'text') {
      if (value < 0) {
        return <span
          className={`currency ${asset}`}
          style={Object.assign({color: assetColor}, style)}>
            ({format(value, decimalPlacesForce, 3, ' ', ',')} {asset})
        </span>;
      }
      return <span
        className={`currency ${asset}`}
        style={Object.assign({color: assetColor}, style)}>
        {format(value, decimalPlacesForce, 3, ' ', ',')} {asset}
      </span>;
    }
    let className = `currency ${asset}`;
    if (!disableBlink && blink) {
      className += ` ${blink}`;
    }

    const hSpace = '0.6em';
    let valueColor = 'black';
    if (value < 0) {
      valueColor = 'red';
    }
    const result = <span
      onClick={onClick}
      className={className}
      style={Object.assign({
        color: assetColor,
        display: 'inline-block',
        border: '1px solid',
        borderRadius: '4px',
        borderColor: assetColor,
        overflow: 'hidden',
        top: '5px',
        position: 'relative'
      }, style)}><span style={{
        color: valueColor,
        background: 'white',
        display: 'inline-block',
        paddingRight: hSpace,
        paddingLeft: hSpace
      }}>{format(value, decimalPlacesForce, 3, ' ', ',')}</span><span style={{
        color: 'white',
        display: 'inline-block',
        backgroundColor: assetColor,
        paddingRight: hSpace,
        paddingLeft: hSpace
      }}>{asset}</span></span>;
    return result;
  }
}

export default PrintAsset;
