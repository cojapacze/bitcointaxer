import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Button, Spin} from 'antd';


class Download extends React.Component {
  static propTypes = {
    operationQueue: PropTypes.object,
    colors: PropTypes.string
  }
  state = {}

  static getDerivedStateFromProps(props) {
    return props;
  }
  render() {
    const {operationQueue} = this.state;
    const currentStocktakingOperation = operationQueue.currentStocktakingOperation;
    if (!currentStocktakingOperation) {
      return <center><Spin size="large"/></center>;
    }
    const downloadFilename = `bitcointaxer_${currentStocktakingOperation.date}.csv`;
    return (
      <div>
        <center>
          <h3><FormattedMessage id="Download.title" defaultMessage="Download"/></h3>
          <p><FormattedMessage id="Download.info" defaultMessage="Download trade history, prices, results and app in one package"/></p>
          <Button
            onClick={() => operationQueue.downloadReport({}, downloadFilename)}
            type="primary"
            icon="download"
          >{downloadFilename}</Button>
        </center>

      </div>
    );
  }
}
export default Download;
