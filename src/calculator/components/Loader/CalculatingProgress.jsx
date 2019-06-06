import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Affix,
  Progress
} from 'antd';

class CalculatingProgress extends React.Component {
  static propTypes = {
    prices: PropTypes.object,
    colors: PropTypes.bool
  };
  state = {
    stats: {
      valuations: {
        total: 0,
        done: 0
      },
      prices: {
        total: 0,
        done: 0
      }
    }
  }
  static getDerivedStateFromProps(props) {
    return props;
  }

  getPricesProgressStats() {
    const prices = this.prices;
    const stats = prices.getPricesProgressStats();
    return stats;
  }
  updateProgress() {
    // console.log('%cthis.getPricesProgressStats()', 'background:green;color:white', this.getPricesProgressStats());
    if (!this.mounted) {
      return;
    }
    this.setState({
      stats: this.getPricesProgressStats()
    });
  }
  constructor(props) {
    super();
    const prices = props.prices;
    this.prices = prices;
    this.updateProgressCallback = () => {
      this.updateProgress();
    };
    this.state = {
      stats: this.getPricesProgressStats(),
      affixed: false
    };
  }
  componentDidMount() {
    this.mounted = true;
    this.prices.after('progress-changed', this.updateProgressCallback);
    this.updateProgress();
  }
  componentWillUnmount() {
    this.mounted = false;
    this.prices.removeListener('progress-changed', this.updateProgressCallback);
  }
  render() {
    const {
      stats,
      affixed
    } = this.state;
    if (stats.valuations.total) {
      stats.valuations.percent = (stats.valuations.done / stats.valuations.total) * 100;
    }
    if (stats.prices.total) {
      stats.prices.percent = parseInt((stats.prices.done / stats.prices.total) * 100, 10);
    }
    if (!stats.prices.percent) {
      stats.prices.percent = 0;
    }
    const classNameList = ['price-loading-progress'];

    if (affixed) {
      classNameList.push('affixed');
    }
    if (stats.prices.total === stats.prices.done) {
      classNameList.push('done');
    }
    const el = <div style={{
      textAlign: 'center',
      background: 'rgba(255,255,255, 0.9)',
      border: '1px solid rgba(0,0,0, 0.1)',
      padding: '32px',
      borderRadius: '4px'
    }}
    className="progress-box"
    >
      <p><strong><FormattedMessage
        id="CalculatingProgress.gettingPrices"
        defaultMessage="Getting prices {done}/{total}"
        values={{
          total: stats.prices.total,
          done: stats.prices.done
        }}
        description="loader getting prices"
      /></strong></p>
      <Progress
        // status="success"
        percent={stats.prices.percent}
        successPercent={stats.prices.percent}
        showInfo={true}
      />
    </div>;
    return <Affix
      offsetTop={64}
      className={classNameList.join(' ')}
      style={{
        position: 'absolute',
        width: '100%'
      }}
      onChange={affixedStatus => {
        // console.log('affixedStatus', affixedStatus);
        this.setState({
          affixed: affixedStatus
        });
      }}
    >
      {el}
    </Affix>;
  }
}

export default CalculatingProgress;
