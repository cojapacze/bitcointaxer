import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';

import {List} from 'antd';

import PrintAsset from './PrintAsset';

function PrintOperationCurrentErrors(props) {
  const {operation, colors} = props;
  if (!operation || !operation.currentErrors || !operation.currentErrors.length) {
    return <FormattedMessage colors={colors} defaultMessage="no-errors"/>;
  }
  return <div>
    <List
      style={{padding: '32px'}}
      itemLayout="horizontal"
      dataSource={operation.currentErrors}
      renderItem={(item, i) => {
        let itemEl = '';
        switch (item.type) {
          case 'missing-cost':
            itemEl = <List.Item>
              <List.Item.Meta
                title={
                  <div>
                    <span style={{display: 'none'}} >{i + 1}. </span>
                    <FormattedMessage
                      id="PrintOperationCurrentErrors.unknownAsset.title"
                      defaultMessage="Unknown Source of Asset"
                    />
                  </div>
                }
                description={<div>
                  <FormattedMessage
                    id="PrintOperationCurrentErrors.unknownAsset.description"
                    defaultMessage="{asset} at {location}"
                    values={{
                      asset: <PrintAsset
                        asset={item.missingCostPart.asset}
                        value={item.missingCostPart.amount}
                        colors={colors}/>,
                      location: <strong>{item.missingCostPart.loc}</strong>
                    }}
                  />
                </div>}
              />
            </List.Item>;
            break;
          default:
            itemEl = JSON.stringify(item);
        }
        return itemEl;
      }}
    />
  </div>;
}
PrintOperationCurrentErrors.propTypes = {
  colors: PropTypes.bool,
  operation: PropTypes.object
};
export default PrintOperationCurrentErrors;
