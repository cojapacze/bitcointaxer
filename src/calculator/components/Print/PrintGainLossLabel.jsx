import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

// import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
// import {faBalanceScaleLeft, faBalanceScaleRight, faBalanceScale} from '@fortawesome/free-regular-svg-icons';

function PrintGainLossLabel(props) {
  const {gainLoss} = props;
  let gainLossLabel = '';
  if (gainLoss > 0) {
    gainLossLabel = <span>
      {/* <FontAwesomeIcon style={{marginRight: '4px', color: 'green'}} icon={faBalanceScaleLeft} /> */}
      <FormattedMessage id="PrintGainLossLabel.gain" defaultMessage="Gain"/>
    </span>;
  } else if (gainLoss < 0) {
    gainLossLabel = <span>
      {/* <FontAwesomeIcon style={{marginRight: '4px', color: 'red'}} icon={faBalanceScaleRight} /> */}
      <FormattedMessage id="PrintGainLossLabel.loss" defaultMessage="Loss"/>
    </span>;
  } else {
    gainLossLabel = <span>
      {/* <FontAwesomeIcon style={{marginRight: '4px'}} icon={faBalanceScale} /> */}
      <FormattedMessage id="PrintGainLossLabel.gainLoss" defaultMessage="Gain / Loss"/>
    </span>;
  }
  return gainLossLabel;
}
PrintGainLossLabel.propTypes = {
  gainLoss: PropTypes.number,
  colors: PropTypes.bool
};
export default PrintGainLossLabel;
