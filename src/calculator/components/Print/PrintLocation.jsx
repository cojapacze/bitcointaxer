import React from 'react';
import PropTypes from 'prop-types';
import {
  CONFIG,
  colorOfHash,
  getAssetConfig
} from '../../services/taxCalc/libs/Utils.js';
import {Popover} from 'antd';

function PrintLocation(props) {
  const {asset, address, location, domain} = props;
  const assetConfig = getAssetConfig(asset);
  const addressTest = assetConfig.addressFilter || /(?=a)b/;
  let locationColor = '';
  if (domain) {
    locationColor = colorOfHash(domain, CONFIG.seed);
  }
  let locationEl = <span style={{color: locationColor}} className={`location ${props.asset}`}>{location}</span>;
  let blockchainLinkEl = <div>{address}</div>;
  const renderAddress = address;
  const renderLocation = location;
  const found = String(address).match(addressTest);

  if (assetConfig.blockchainAddressPrelink) {
    locationEl = <a target="_blank" style={{color: locationColor}} rel="noopener noreferrer" className="blockchain-link" href={`${assetConfig.blockchainAddressPrelink}${renderAddress}`}>{renderLocation}</a>;
    blockchainLinkEl = <div><a target="_blank" rel="noopener noreferrer" className="blockchain-link" href={`${assetConfig.blockchainAddressPrelink}${renderAddress}`}>{renderAddress}</a></div>;
  }
  if (found) {
    return (
      <Popover placement={props.popover} content={blockchainLinkEl} title={renderLocation}>
        <span className={`location ${props.asset}`}>
          {locationEl}
        </span>
      </Popover>
    );
  }
  return locationEl;
}
PrintLocation.propTypes = {
  asset: PropTypes.string,
  address: PropTypes.string,
  domain: PropTypes.string,
  location: PropTypes.string,
  popover: PropTypes.string
};
export default PrintLocation;
