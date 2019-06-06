import React from 'react';
import PropTypes from 'prop-types';

import PrintAsset from './PrintAsset';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faTimes, faEquals} from '@fortawesome/free-solid-svg-icons';

class PrintPriceCalculation extends React.Component {
  static propTypes = {
    mode: PropTypes.string,
    price: PropTypes.object,
    colors: PropTypes.bool,
    amount: PropTypes.number,
    noResult: PropTypes.bool
  }
  render() {
    const {price, colors, amount, noResult, mode} = this.props;
    const elements = [];
    let result = <span style={{display: 'inline-block'}}>no-price</span>;
    if (!price) {
      return result;
    }
    if (price.children) {
      let priceCalc = 1;
      if (amount) {
        priceCalc = amount;
        elements.push(
          <PrintAsset mode={mode} key="amount" value={amount} asset={price.fromAsset} colors={colors}/>
        );
      }
      price.children.forEach((child, i) => {
        const selectedPrice = child.price; // child[child.currentPriceKey];
        priceCalc *= selectedPrice;
        elements.push(
          <PrintAsset mode={mode} key={`child-${i}`} value={selectedPrice} asset={child.toAsset} colors={colors}/>
        );
      });
      if (!elements.length) {
        return <h1 color='red'>error</h1>;
      }
      let i = 0;
      for (i = 1; i < elements.length; i += 2) {
        elements.splice(i, 0, <FontAwesomeIcon key={`sep-${i}`} style={{margin: '0px 4px'}} icon={faTimes} />);
      }
      if (!noResult) {
        elements.push(
          <FontAwesomeIcon key={'sep-equal'} style={{margin: '0px 4px'}} icon={faEquals} />
        );
        elements.push(
          <PrintAsset mode={mode} key={'result'} value={priceCalc} asset={price.toAsset} colors={colors}/>
        );
      }
      result = (
        <span style={{display: 'inline-block'}}>
          {elements}
        </span>
      );
    }
    return result;
  }
}

export default PrintPriceCalculation;
