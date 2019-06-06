import React from 'react';
import PropTypes from 'prop-types';

function PrintOperationSourceDetails(props) {
  const operation = props.operation;
  if (operation.dataSource && operation.dataSource.type) {
    return operation.dataSource.type;
  }
  if (operation.sourcefile) {
    return (
      <div>
        {operation.sourcefile.filename}
        ({operation.sourcefile.file.size} bytes),
        line {operation.recordRaw.rawCSVLineNo + 1}/{operation.sourcefile.data.length}
        [{operation.ex}@{operation.sourcefile.fileAdapter.pluginname}]
      </div>
    );
  }
  return 'unknow source';
}

PrintOperationSourceDetails.propTypes = {
  operation: PropTypes.object
};

export default PrintOperationSourceDetails;
