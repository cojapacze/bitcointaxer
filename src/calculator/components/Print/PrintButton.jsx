import React from 'react';
import PropTypes from 'prop-types';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  faStickyNote
  // faLongArrowAltLeft,
} from '@fortawesome/free-regular-svg-icons';
import {
  faHistory,
  faExclamation,
  faExchangeAlt,
  faCheck,
  faArrowLeft,
  faArrowRight
} from '@fortawesome/free-solid-svg-icons';
import {Button} from 'antd';

function PrintButton(props) {
  const {
    // colors,
    text,
    onClick,
    type
  } = props;

  let button = <Button style={{margin: '8px 8px 8px 8px'}} type="dashed" shape="circle" onClick={onClick}>
    <FontAwesomeIcon icon={faArrowRight} />
  </Button>;
  switch (type) {
    case 'left':
      button = <Button style={{margin: '8px 8px 8px 8px'}} type="dashed" shape="circle" onClick={onClick}>
        <FontAwesomeIcon icon={faArrowLeft} />
      </Button>;
      break;
    case 'trade':
      button = <Button style={{margin: '8px 8px 8px 8px'}} type="dashed" shape="circle" onClick={onClick}>
        <FontAwesomeIcon icon={faExchangeAlt} />
      </Button>;
      break;
    case 'forward':
      button = <Button style={{margin: '8px 8px 8px 8px'}} type="dashed" shape="circle" onClick={onClick}>
        <FontAwesomeIcon icon={faArrowRight} />
      </Button>;
      break;
    case 'transfer':
      button = <Button style={{margin: '8px 8px 8px 8px'}} type="dashed" shape="circle" onClick={onClick}>
        <FontAwesomeIcon icon={faArrowRight} />
      </Button>;
      break;
    case 'back':
      button = <Button style={{margin: '8px 8px 8px 8px'}} type="dashed" shape="circle" onClick={onClick}>
        <FontAwesomeIcon icon={faHistory} />
      </Button>;
      break;
    case 'error':
      button = <Button style={{margin: '8px 8px 8px 8px'}} type="danger" shape="circle" onClick={onClick}>
        <FontAwesomeIcon icon={faExclamation} />
      </Button>;
      break;
    case 'resolved':
      button = <Button style={{margin: '8px 8px 8px 8px'}} type="default" shape="circle" onClick={onClick}>
        <FontAwesomeIcon icon={faCheck} />
      </Button>;
      break;
    case 'notes':
      button = <Button style={{margin: '8px 8px 8px 8px'}} type="default" shape="circle" onClick={onClick}>
        <FontAwesomeIcon icon={faStickyNote} />
      </Button>;
      break;
    default:
      button = <Button style={{margin: '8px 8px 8px 8px'}} type="dashed" shape="circle" onClick={onClick}>
        <FontAwesomeIcon icon={faArrowRight} />
      </Button>;
  }
  return <div>{button}<span>{text}</span></div>;
}

PrintButton.propTypes = {
  colors: PropTypes.bool,
  onClick: PropTypes.func,
  text: PropTypes.string,
  type: PropTypes.string
};

export default PrintButton;
