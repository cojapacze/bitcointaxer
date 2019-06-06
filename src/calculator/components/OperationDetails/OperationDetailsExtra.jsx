import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {Button} from 'antd';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
  // faCoins,
  faScannerKeyboard} from '@fortawesome/free-regular-svg-icons';
import {
  TableStocktaking
} from '../Tables';


class OperationDetailsExtra extends React.Component {
  state = {};
  static propTypes = {
    operation: PropTypes.object
  }
  static getDerivedStateFromProps(props) {
    const {operation} = props;
    operation.calculator.stocktaking(operation);
    return props;
  }
  renderFinish() {
    const {operation, colors} = this.state;
    const elements = [];
    elements.push(<TableStocktaking
      key="stocktaking"
      operation={operation}
      colors={colors}/>);

    return (
      <div style={{
        marginTop: '48px'
      }}>
        {elements}
        <div style={{marginBottom: '48px'}}></div>
      </div>
    );
  }
  render() {
    const {operation} = this.state;
    const operationQueue = operation.operationQueue;

    return <center><Button

      // type="primary"
      size="large"
      onClick={() => operationQueue.dispatch('open-stocktaking-drawer')}
    >
      <FontAwesomeIcon style={{marginLeft: '16px', marginRight: '16px'}} icon={faScannerKeyboard} />
      <FormattedMessage id="OperationDetailsExtra.stocktaking" defaultMessage="Stocktaking" />
    </Button></center>;
  }
}

export default OperationDetailsExtra;
