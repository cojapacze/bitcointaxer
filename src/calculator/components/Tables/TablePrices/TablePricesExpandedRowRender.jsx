import React from 'react';

import {EditSubpricesTable} from '../../Edit';
function expandedRowRender(row, index, indent, expanded) {
  console.debug('TablePricesExpandedRowRender', row, index, indent, expanded);
  return <EditSubpricesTable sidePrice={row.priceResponse}/>;
}
export default expandedRowRender;
