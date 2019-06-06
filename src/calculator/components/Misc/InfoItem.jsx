import React from 'react';
import PropTypes from 'prop-types';

function InfoItem(props) {
  let labelClassName = 'label ant-col';
  let dataClassName = 'data ant-col';
  if (props.labelCol && props.labelCol.span) {
    labelClassName = `label ant-col-${props.labelCol.span}`;
  }
  if (props.wrapperCol && props.wrapperCol.span) {
    dataClassName = `data ant-col-${props.wrapperCol.span}`;
  }

  switch (props.display) {
    case 'full':
      return (
        <div className={'ant-row details-row'}>
          <span className={'data ant-col-24'}>{props.children}</span>
        </div>
      );
    case 'wide':
      return (
        <div className={'ant-row details-row'}>
          <span className={labelClassName} style={{textAlign: 'left'}}>{props.label}:</span>
          <span className={dataClassName} style={{textAlign: 'right'}}>{props.children}</span>
        </div>
      );
    default:
      return (
        <div className={'ant-row details-row'}>
          <span className={labelClassName}>{props.label}:</span>
          <span className={dataClassName}>{props.children}</span>
        </div>
      );
  }
}

InfoItem.propTypes = {
  labelCol: PropTypes.object,
  wrapperCol: PropTypes.object,
  display: PropTypes.string,
  label: PropTypes.node,
  children: PropTypes.node
};

export default InfoItem;
