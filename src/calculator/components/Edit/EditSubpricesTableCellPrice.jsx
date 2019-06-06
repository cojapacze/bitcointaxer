import React from 'react';
// import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Divider, Checkbox} from 'antd';

import Ansi from 'ansi-to-react';

import {PrintAsset, PrintPriceCalculation} from '../Print';

import {operationQueue} from '../../services/taxCalc/index.js';

function EditSubpricesTableCellPrice(text, record, rowI) {
  const prices = operationQueue.prices;
  const {operationValuation} = this;
  if (record.error) {
    return <Ansi>{record.error}</Ansi>;
  }
  const colors = true;
  const elements = [];
  let result = 'ERR';
  const selectedCount = record.results.reduce((c, price) => {
    console.debug('selected, count');
    return (price.checked) ? c + 1 : c;
  }, 0);

  function changeCurrentPriceKey(e) {
    prices.setOperationValuationSidePriceAlternativeResults(
      record,
      e.target.value, // alternativePriceResultKey
      e.target.checked,
      operationValuation
    );
  }
  if (record.arguments) {
    result = (
      <span>
        <div><small><FormattedMessage
          id="EditSubpricesTableCellPrice.calculation"
          defaultMessage="Calculation"
        /></small></div>
        <div>
          <PrintPriceCalculation
            mode={'text'}
            price={record}
            operation={record.operation}
            colors={colors}
            noResult={true}
          />
        </div>
      </span>
    );
  } else {
    if (record.results && record.results.length) {
      record.results.sort((a, b) => a.value - b.value);
      record.results.forEach(priceResult => {
        if (priceResult.type === 'price') {
          elements.push(<span key={priceResult.key} style={{display: 'inline-block'}}>
            <Checkbox
              onChange={changeCurrentPriceKey}
              name={`${rowI}-${record.key}-${priceResult.key}`}
              value={priceResult.key}
              checked={priceResult.checked}
              disabled={priceResult.checked && selectedCount < 2}
            ><small>{priceResult.key}</small><br/>
              <div className={(priceResult.checked) ? 'enabled' : 'disabled'}>
                <PrintAsset
                  mode={'text'}
                  asset={record.toAsset}
                  value={priceResult.value}
                  colors={colors} />
              </div>
            </Checkbox></span>);
        }
      });
    }
    if (!elements.length) {
      result = <h1 color='red'>error</h1>;
    } else {
      let i = 0;
      for (i = 1; i < elements.length; i += 2) {
        elements.splice(i, 0, <Divider key={`sep-${i}`} type="vertical"/>);
      }
      result = (<div className='to'>
        <div>
          {elements}
        </div>
      </div>);
    }
  }
  return <div style={{textAlign: 'right'}} className={(record.checked) ? 'enabled' : 'disabled'}>{result}</div>;
}
export default EditSubpricesTableCellPrice;
