import React from 'react';
import PropTypes from 'prop-types';

import PrintAsset from './PrintAsset';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes, faEquals} from '@fortawesome/free-solid-svg-icons';

class PrintAssetExchangePriceCalculation extends React.Component {
  static propTypes = {
    align: PropTypes.string,
    price: PropTypes.object,
    colors: PropTypes.bool,
    currency: PropTypes.string,
    asset: PropTypes.string,
    amount: PropTypes.number
  }
  render() {
    const {price, colors, amount, asset, align} = this.props;
    const elements = [];
    let result = <span style={{display: 'inline-block'}}>no-price-x</span>;
    if (!price) {
      return result;
    }
    elements.push(
      <PrintAsset key={'amount'} value={amount} asset={asset} colors={colors}/>
    );
    elements.push(
      <FontAwesomeIcon key={'times'} style={{margin: '0px 4px'}} icon={faTimes} />
    );
    elements.push(
      <big key={'big-price'}><PrintAsset key={'price'} mode={'text'} value={price.price} asset={price.toAsset || price.validatedQuery.toAsset} colors={colors}/></big>
    );
    elements.push(
      <FontAwesomeIcon key={'sep-equal'} style={{margin: '0px 4px'}} icon={faEquals} />
    );

    const extraStyle = {};
    if (align === 'right') {
      extraStyle.paddingRight = '16px';
    }
    if (asset === (price.toAsset || price.validatedQuery.toAsset)) {
      elements.length = 0;
      elements.push(<div key={'empty'} style={{height: '23px'}}/>);
    }
    result = (
      <span style={{display: 'inline-block', textAlign: align}}>
        <div><small>{elements}</small></div>
        <div style={extraStyle}>
          <PrintAsset
            mode={'text'}
            value={price.price * amount}
            asset={price.toAsset || price.validatedQuery.toAsset}
            colors={colors}/>
        </div>
      </span>
    );

    return result;
  }
}

export default PrintAssetExchangePriceCalculation;
