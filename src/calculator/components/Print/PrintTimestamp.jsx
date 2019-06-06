import React from 'react';
import PropTypes from 'prop-types';

import {timestamp2dateObj} from '../../services/taxCalc/libs/Utils.js';

function PrintTimestamp(props) {
  const {
    timestamp,
    date,
    // no,
    groupBy,
    colors
  } = props;
  const timestampData = timestamp || new Date(date).getTime();
  if (!timestampData) {
    return '---';
  }
  const dateObj = timestamp2dateObj(timestampData);
  const dateString = `${dateObj.yyyy}-${dateObj.mm}-${dateObj.dd} ${dateObj.hh}:${dateObj.ii}:${dateObj.ss}:${dateObj.ms}.${dateObj.no}`;
  let result = dateString;
  switch (groupBy) {
    case 'full':
      result = dateString;
      break;
    default:
    case 'second':
      result = String(dateString).substring(0, 19);
      break;
    case 'minute':
      result = String(dateString).substring(0, 16);
      break;
    case 'hour':
      result = String(dateString).substring(0, 13);
      break;
    case 'day':
      result = String(dateString).substring(0, 10);
      break;
    case 'raw':
      result = date || dateString;
  }
  let style = {};
  if (colors) {
    style = {
      // color: 'green'
    };
  }
  let className = '';
  if (colors) {
    className += ' date-color';
  }
  return <span style={style} className={className}>
    {result}
  </span>;
}

PrintTimestamp.propTypes = {
  timestamp: PropTypes.number,
  date: PropTypes.string,
  no: PropTypes.number,
  groupBy: PropTypes.string,
  colors: PropTypes.bool
};

export default PrintTimestamp;
