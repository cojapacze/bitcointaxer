import React from 'react';
import PropTypes from 'prop-types';
import {getAssetConfig} from '../../services/taxCalc/libs/Utils.js';

class PrintAssetLabel extends React.Component {
  state = {
    asset: 'INIT',
    text: ''
  };
  static propTypes = {
    asset: PropTypes.string.isRequired,
    text: PropTypes.string,
    colors: PropTypes.bool
  }
  static getDerivedStateFromProps(props) {
    return props;
  }

  render() {
    const {asset, text} = this.state;
    const assetConfig = getAssetConfig(asset);

    const result = <span style={{color: assetConfig.color}}>{asset} {text}</span>;
    return result;
  }
}

export default PrintAssetLabel;
