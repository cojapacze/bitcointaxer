import moment from 'moment';
import {getAssetConfig} from '../libs/Utils.js';

let domain = 'testcase';
const adapter = 'csv';

const parseConfig = {
    type: 'csv',
    delimiter: ',',
    relax_column_count: true
};

function match(file) {
    const pattern = '#testcase';
    if (file.content.substr(0, pattern.length) === pattern) {
        domain = 'testcase';
        return true;
    }
    const pattern2 = '#peers';
    if (file.content.substr(0, pattern2.length) === pattern2) {
        domain = 'peers';
        return true;
    }
    const pattern3 = '#custom';
    if (file.content.substr(0, pattern3.length) === pattern3) {
        domain = 'custom';
        return true;
    }
    return false;
}
function getAddress(asset, locationAddress) {
    const assetConfig = getAssetConfig(asset);
    const addressTest = assetConfig.addressFilter || /(?=a)b/;
    const found = String(locationAddress).match(addressTest);
    if (found) {
        return found[0];
    }
    return locationAddress;
}

function getLocation(asset, locationAddress) {
    const assetConfig = getAssetConfig(asset);
    const addressTest = assetConfig.addressFilter || /(?=a)b/;
    let renderLocation = locationAddress;
    const found = String(locationAddress).match(addressTest);
    if (found) {
        renderLocation = String(renderLocation).replace(addressTest, '').replace(/:$/, '').trim() || renderLocation || 'unknown location';
    }
    return renderLocation;
}

function getOperations(file) {
    const operations = [];
    const data = file.data;
    let i = 0;
    let record;

    for (i = 1; i < data.length; i += 1) {
        if (!data[i][0]) {
            continue;
        }
        if (data[i][0][0] === '#') {
            continue;
        }

        if (data[i][2] === 'summary') {
            operations.push({
                date: data[i][0],
                timestamp: moment(data[i][0]).valueOf(),
                type: 'summary'
            });
            continue;
        }
        record = {
            date: data[i][0],
            txid: data[i][7]
        };
        // debugger;
        record.timestamp = moment(record.date).valueOf();
        record.from = {
            address: getAddress(data[i][3], data[i][1]),
            loc: getLocation(data[i][3], data[i][1]),
            amount: parseFloat(data[i][2]),
            asset: data[i][3]
            // currency: data[i][2],
        };
        record.to = {
            address: getAddress(data[i][6], data[i][4]),
            loc: getLocation(data[i][6], data[i][4]),
            amount: parseFloat(data[i][5]),
            asset: data[i][6]
            // currency: data[i][5],
        };
        record.recordRaw = record;
        record.rawCSVLineNo = i;
        record.rawCSVLine = data[i];
        record.sourcefile = file;
        record.type = 'operation';
        if (record.from.asset === record.to.asset && record.from.address !== record.to.address) {
            record.type = 'transfer';
        }
        if (record.from.asset !== record.to.asset && record.from.address === record.to.address) {
            record.type = 'trade';
        }
        if (record.from.asset !== record.to.asset && record.from.address !== record.to.address) {
            record.type = 'atomic-swap';
        }
        operations.push(record);
    }
    return operations;
}
export default {
    domain,
    adapter,
    getPluginname: () => `${domain}-${adapter}`,
    pluginname: `${domain}-${adapter}`,
    pluginfilename: __filename,
    match,
    parseConfig,
    getOperations
};
