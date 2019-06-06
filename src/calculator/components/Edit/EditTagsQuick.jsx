import React from 'react';
import PropTypes from 'prop-types';
import {Tag, Input, Tooltip, Icon} from 'antd';
import {colorOfHash} from '../../services/taxCalc/libs/Utils';

class EditTagsQuick extends React.Component {
  static propTypes = {
    operation: PropTypes.object,
    operationQueue: PropTypes.object
  }
  state = {}
  static getDerivedStateFromProps(props) {
    return {
      ...props
    };
  }
  constructor(props) {
    super(props);
    this.state = props;
    this.operationQueue = props.operationQueue;
    this.operation = props.operation;
    this.state = {
      operationQueue: this.operationQueue,
      operation: this.operation,
      inputVisible: false,
      inputValue: ''
    };
    this.autoUpdate = () => {
      this.setState({
        operationQueue: this.operationQueue
      });
    };
  }
  componentDidMount() {
    this.operationQueue.after('change', this.autoUpdate);
  }
  componentWillUnmount() {
    this.operationQueue.removeListener('change', this.autoUpdate);
  }
  handleClose = removedTag => {
    this.operationQueue.removeTag(removedTag);
  }
  showInput = () => {
    this.setState({inputVisible: true}, () => this.input.focus());
  }
  handleInputChange = e => {
    this.setState({inputValue: e.target.value});
  }
  handleInputConfirm = (operationQueue, operation) => {
    const state = this.state;
    const inputValue = state.inputValue;
    if (typeof operationQueue.enterTag === 'function') {
      operationQueue.enterTag(operation, inputValue);
    }
    this.setState({
      inputVisible: false,
      inputValue: ''
    });
  }
  saveInputRef = input => {
    this.input = input;
  };
  render() {
    const {inputVisible, inputValue, operationQueue, operation} = this.state;
    const tags = operation.tags;
    tags.sort();
    return (
      <span>
        {tags.map(tag => {
          const isLongTag = tag.length > 20;
          const tagElem = (
            <Tag
              key={tag}
              color={colorOfHash(tag)}
              closable={true}
              afterClose={() => this.handleClose(tag)}
            >
              {isLongTag ? `${tag.slice(0, 20)}...` : tag}
            </Tag>
          );
          return isLongTag ? <Tooltip title={tag} key={tag}>{tagElem}</Tooltip> : tagElem;
        })}
        {inputVisible && (
          <Input
            ref={this.saveInputRef}
            type="text"
            size="small"
            style={{width: 240}}
            value={inputValue}
            onChange={this.handleInputChange}
            onBlur={this.handleInputConfirm}
            onPressEnter={e => this.handleInputConfirm(operationQueue, operation, e)}
          />
        )}
        {!inputVisible && (
          <Tag
            onClick={this.showInput}
            style={{background: '#fff', borderStyle: 'dashed'}}
          >
            <Icon type="plus" /> New Tag
          </Tag>
        )}
      </span>
    );
  }
}

export default EditTagsQuick;
