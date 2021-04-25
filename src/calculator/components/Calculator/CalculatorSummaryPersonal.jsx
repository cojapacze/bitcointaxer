import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Spin} from 'antd';

import {PrintAsset} from '../Print';
import InfoItem from '../Misc/InfoItem';

class CalculatorSummary extends React.Component {
  static propTypes = {
    calculator: PropTypes.object,
    colors: PropTypes.bool,
  };

  render() {
    const {calculator} = this.props;
    const lastOperation = calculator.getSummaryOperation();
    const calculatorStep = lastOperation.calculatorStep;
    if (!calculatorStep) {
      return (
        <div className="empty-box">
          <Spin />
        </div>
      );
    }
    const fieldsRequired = [
      'residenceCurrency',
      'sumProceeds',
      'sumCostBasis',
      'sumGainLoss',
    ];
    let i;
    const errors = [];
    for (i = 0; i < fieldsRequired.length; i += 1) {
      if (calculatorStep[fieldsRequired[i]] === undefined) {
        errors.push(
          <div key={`${fieldsRequired[i]}-required`}>
            no calculatorStep.{fieldsRequired[i]}
          </div>,
        );
      } else {
        // console.log(`calculatorStep[${fieldsRequired[i]}]`, calculatorStep[fieldsRequired[i]]);
      }
    }
    if (errors.length) {
      return <div>{errors}</div>;
    }
    const colors = this.props.colors;
    const formItemLayout = {
      labelCol: {span: 10},
      wrapperCol: {span: 6},
    };
    return (
      <div>
        <InfoItem
          {...formItemLayout}
          label={
            <FormattedMessage
              id="CalculatorSummary.taxYear"
              defaultMessage="Tax year"
            />
          }
        >
          <div style={{textAlign: 'right'}}>{calculatorStep.taxYear}</div>
        </InfoItem>
        <InfoItem
          {...formItemLayout}
          label={
            <FormattedMessage
              id="CalculatorSummary.proceeds"
              defaultMessage="Proceeds"
            />
          }
        >
          <div style={{textAlign: 'right'}}>
            <PrintAsset
              mode={'text'}
              value={calculatorStep.sumProceeds}
              asset={calculatorStep.residenceCurrency}
              colors={colors}
            />
          </div>
        </InfoItem>
        <InfoItem
          {...formItemLayout}
          label={
            <FormattedMessage
              id="CalculatorSummary.costBasis"
              defaultMessage="Cost basis"
            />
          }
        >
          <div style={{textAlign: 'right'}}>
            <PrintAsset
              mode={'text'}
              value={calculatorStep.sumCostBasis}
              asset={calculatorStep.residenceCurrency}
              colors={colors}
            />
          </div>
        </InfoItem>

        <InfoItem
          {...formItemLayout}
          label={
            <span>
              <FormattedMessage
                id="CalculatorSummary.gainLoss"
                defaultMessage="Gain/Loss"
              />
            </span>
          }
        >
          <div style={{textAlign: 'right', textDecoration: 'underline'}}>
            <PrintAsset
              mode={'text'}
              value={calculatorStep.sumGainLoss}
              asset={calculatorStep.residenceCurrency}
              colors={colors}
            />
          </div>
        </InfoItem>
        {/* <div style={{textAlign: 'right'}}>* - <FormattedMessage id="CalculatorSummary.taxable" defaultMessage="taxable"/></div> */}
      </div>
    );
  }
}

export default CalculatorSummary;
