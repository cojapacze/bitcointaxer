import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

function PrintOperationFilePointer(props) {
  const {operation} = props;
  // if (!operation || !operation.from || !operation.to) {
  //   return <div>no-operation</div>;
  // }
  return <FormattedMessage
    id="PrintOperationFilePointer.filePointer"
    defaultMessage="{basename} line {lineNo}"
    values={{
      basename: operation.sourcefile.basename,
      lineNo: operation.rawCSVLineNo
    }}
  />;
}
PrintOperationFilePointer.propTypes = {
  colors: PropTypes.bool,
  operation: PropTypes.object
};
export default PrintOperationFilePointer;
