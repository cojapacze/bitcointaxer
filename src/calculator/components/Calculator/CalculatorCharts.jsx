import React from 'react';
import PropTypes from 'prop-types';
import {timestamp2dateStr, autoValue} from '../../services/taxCalc/libs/Utils';
import {injectIntl} from 'react-intl';
import {
  Chart,
  Geom,
  Axis,
  Tooltip,
  Coord
} from 'bizcharts';
import DataSet from '@antv/data-set';

class CalculatorCharts extends React.Component {
  static propTypes = {
    calculator: PropTypes.object,
    intl: PropTypes.object
  }
  state = {}
  static getDerivedStateFromProps(props) {
    return props;
  }

  render() {
    const {intl} = this.props;
    const {calculator} = this.state;
    const ticks = [];
    const startDate = `${calculator.year}-01-01 00:00:00`;
    const endDate = `${calculator.year}-12-31 23:59:59`;
    let lastOperation = false;
    let i = 1;
    for (i = 1; i <= 12; i += 1) {
      const monthNo = `0${i}`.substr(-2);
      ticks.push(new Date(`${calculator.year}-${monthNo}-01 00:00:00`).getTime());
    }
    const data = calculator.operations
      .filter(operation => operation.calculatorStep)
      .map(operation => {
        void (0);
        lastOperation = operation;
        return {
          date: timestamp2dateStr(parseInt(operation.timestamp, 10)),
          timestamp: parseInt(operation.timestamp, 10),
          sumGainLoss: operation.calculatorStep.sumGainLoss,
          sumProceeds: operation.calculatorStep.sumProceeds,
          sumCostBasis: operation.calculatorStep.sumCostBasis,
          valuationAsset: operation.calculatorStep.operationResidenceCurrency
        };
      });
    data.unshift({
      date: startDate,
      timestamp: new Date(startDate).getTime(),
      sumGainLoss: 0,
      sumProceeds: 0,
      sumExpense: 0,
      valuationAsset: calculator.setup.residenceCurrency
    });
    data.push({
      date: endDate,
      timestamp: new Date(endDate).getTime(),
      sumGainLoss: lastOperation.calculatorStep.sumGainLoss,
      sumProceeds: lastOperation.calculatorStep.sumProceeds,
      sumCostBasis: lastOperation.calculatorStep.sumCostBasis,
      valuationAsset: lastOperation.calculatorStep.operationResidenceCurrency
    });
    window.chartData = data;
    const dataSet = new DataSet();
    const dataView = dataSet.createView();
    dataView.source(data);
    const taxCurrency = calculator.setup.residenceCurrency;
    const tooltipCfg = {
      showTitle: false,
      crosshairs: {
        type: 'cross'
      }
    };
    const scale = {
      timestamp: {
        ticks: ticks,
        type: 'linear',
        range: [0, 1]
      }
    };
    const grid = {
      zeroLineStyle: {
        stroke: '#ddd',
        lineDash: [2, 4]
      }
    };
    return (
      <Chart
        height={400}
        data={dataView}
        scale={scale}
        grid={grid}
        forceFit
      >
        <Coord />
        <Axis
          name="timestamp"
          label={{
            rotate: 30,
            textStyle: {
              textAlign: 'left'
            },
            formatter: val => {
              void (0);
              return intl.formatDate(
                new Date(parseInt(val, 10)),
                {
                  month: 'short'
                }
              );
            }
          }}/>
        <Axis
          name="sumGainLoss"
          label={{
            formatter: val => `${(val)} ${taxCurrency}`
          }}
        />
        <Tooltip {...tooltipCfg} />
        <Geom
          type="line"
          position="timestamp*sumGainLoss"
          size={2}
          tooltip={false}
        />
        <Geom
          type="point"
          position="timestamp*sumGainLoss"
          size={4}
          shape={'circle'}
          color={'sumGainLoss'}
          tooltip={['timestamp*sumGainLoss', (timestamp, sumGainLoss) => {
            void (0);
            return {
              name: intl.formatMessage({id: 'CalculatorCharts.sumGainLoss', defaultMessage: 'Gain / Loss'}),
              value: `${autoValue(sumGainLoss, taxCurrency)} ${taxCurrency}`
            };
          }]}
          style={{
            lineWidth: 1
          }}
        />
      </Chart>
    );
  }
}
export default injectIntl(CalculatorCharts);
