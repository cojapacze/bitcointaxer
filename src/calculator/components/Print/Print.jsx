import React from 'react';
import PropTypes from 'prop-types';

function stringifyAll(o) {
  const cache = [];
  return JSON.stringify(o, (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (cache.indexOf(value) !== -1) {
        // Duplicate reference found
        try {
          // If this value does not reference a parent it can be deduped
          return JSON.parse(JSON.stringify(value));
        } catch (error) {
          // discard key if value cannot be deduped
          return false;
        }
      }
      // Store value in our collection
      cache.push(value);
    }
    return value;
  });
}

class Print extends React.Component {
  static propTypes = {
    value: PropTypes.any
  }
  render() {
    const {value} = this.props;
    if (!value) {
      return <div>no data</div>;
    }
    if (typeof value === 'object') {
      const listItems = Object.keys(value).map(key =>
        <div key={key}>
          <span className={'label'}>{key}:</span>
          <span className={'data'}><pre>{stringifyAll(value[key], null, 2)}</pre></span>
        </div>
      );
      return (
        <div>{listItems}</div>
      );
    }
    return <div>str: {String(value)}</div>;
  }
}

export default Print;
