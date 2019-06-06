import React from 'react';
import PropTypes from 'prop-types';

import {Input} from 'antd';
import {getAssetConfig, format} from '../../services/taxCalc/libs/Utils.js';

class EditAsset extends React.Component {
  state = {
    value: '',
    asset: 'INIT',
    colors: true
  }
  static propTypes = {
    asset: PropTypes.string,
    blink: PropTypes.bool,
    colors: PropTypes.bool,
    disabled: PropTypes.bool,
    disableBlink: PropTypes.bool,
    id: PropTypes.string,
    mode: PropTypes.string,
    modified: PropTypes.bool,
    onChange: PropTypes.func.isRequired,
    onChangeBlur: PropTypes.func,
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
      disableBlink,
      disabled,
      id,
      inputHeight,
      inputWidth,
      mode,
      modified,
      onChange,
      onChangeBlur,
      value
    } = Object.assign({
      inputWidth: '200px'
    }, this.state);
    const assetConfig = getAssetConfig(asset);
    const assetColor = (colors) ? assetConfig.color : 'black';
    if (value < 0) {
      return <span
        className={`currency ${asset}`}
        style={{color: assetColor}}>
          ({format(value, assetConfig.decimalPlaces, 3, ' ', ',')} {asset})
      </span>;
    }
    let className = `currency ${asset}`;
    if (!disableBlink && blink) {
      className += ` ${blink}`;
    }
    const hSpace = '0.6em';
    const outerStyle = {
      background: 'white',
      border: '1px solid',
      borderColor: assetColor,
      borderRadius: '4px',
      color: assetColor,
      display: 'inline-block',
      overflow: 'hidden',
      position: 'relative',
      top: '5px',
      lineHeight: inputHeight
    };
    const inputStyle = {
      border: 0,
      fontFamily: 'monospace',
      fontSize: '1.2em',
      height: '1.2em',
      textAlign: 'right',
      minWidth: inputWidth,
      width: inputWidth,
      padding: '0',
      fontWeight: (modified) ? 'bold' : 'normal',
      color: 'black',
      background: 'white',
      display: 'inline-block'
    };
    if (disabled) {
      Object.assign(outerStyle, {
        backgroundColor: '#f5f5f5'
      });
      Object.assign(inputStyle, {
        color: 'rgba(0, 0, 0, 0.25)'
      });
    }
    if (mode === 'text') {
      Object.assign(outerStyle, {
        border: 'unset',
        borderBottom: '1px solid',
        borderRadius: '0px',
        overflow: 'hidden'
      });
      Object.assign(inputStyle, {
        boxShadow: 'none',
        background: 'unset'
      });
    }
    const inputValue = parseFloat(format(value, assetConfig.decimalPlaces, 0, '', '.'));
    let lastValue = inputValue;
    function onFocus(e) {
      lastValue = e.target.value;
    }
    function onBlur(e) {
      if (lastValue !== e.target.value) {
        if (typeof onChangeBlur === 'function') {
          onChangeBlur(e);
        }
      }
    }
    const result = <span
      className={className}
      style={outerStyle}><span style={{
        display: 'inline-block',
        paddingRight: hSpace,
        paddingLeft: hSpace
      }}><Input
          disabled={disabled}
          id={id}
          className={'focusable-input'}
          style={inputStyle}
          type="number"
          min={0}
          value={inputValue}
          step={1 / Math.pow(10, assetConfig.decimalPlaces)}
          title={'Enter value'}
          onBlur={onBlur}
          onChange={onChange || console.log}
          onFocus={onFocus}
        /></span><span style={{
        color: 'white',
        display: 'inline-block',
        backgroundColor: assetColor,
        paddingRight: hSpace,
        paddingLeft: hSpace
      }}>{asset}</span></span>;
    return result;
  }
}

export default EditAsset;
