import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {Form, Upload, Icon} from 'antd';

import fileLoaderPromise from './services/taxCalc/fileAdapters/index.js';
import {fileList} from './services/taxCalc';

class FileLoader extends React.Component {
  static propTypes = {
    form: PropTypes.object,
    preloadUrl: PropTypes.string
  }
  state = {
    fileList: fileList
  }
  onRemove(file) {
    fileList.removeFile(file);
  }
  constructor(props) {
    super(props);
    this.autoUpdate = () => this.setState({
      fileList: fileList
    });
  }
  componentDidMount() {
    fileList.after('change', this.autoUpdate);
  }
  componentWillUnmount() {
    fileList.removeListener('change', this.autoUpdate);
  }
  customRequest = request => {
    fileLoaderPromise(request.file, request.onProgress).then(loadedFile => {
      fileList.addFile(loadedFile);
      request.onSuccess();
    }).catch(err => {
      request.onError(err);
    });
  }

  render() {
    const {getFieldDecorator} = this.props.form;
    return (
      <div className="dropbox" style={{verticalAlign: 'middle'}}>
        {getFieldDecorator('dragger', {
        })(
          <Upload.Dragger
            action="#" multiple={true}
            // beforeUpload={this.beforeUpload}
            customRequest={this.customRequest}
            onRemove={this.onRemove}
            fileList={fileList.getUploadFileList()}
          >
            <p className="ant-upload-drag-icon">
              <Icon type="inbox" />
            </p>
            <p className="ant-upload-text"><FormattedMessage
              id="Uploader.action"
              defaultMessage="Click or drag file to this area to load"
              description="uploader trop area"
            /></p>
            {/* <p className="ant-upload-hint">Support for a single or bulk files.</p> */}
            <p className="ant-upload-hint"><FormattedMessage
              id="Uploader.hint"
              defaultMessage="Support for a simple CSV files."
              description="uploader trop area"
            /></p>
          </Upload.Dragger>
        )}
      </div>
    );
  }
}

export default Form.create()(FileLoader);
