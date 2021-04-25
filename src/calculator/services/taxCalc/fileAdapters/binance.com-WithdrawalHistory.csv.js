import moment from 'moment';

// import {getAssetConfig} from '../libs/Utils.js';
const domain = 'binance.com';
const adapter = 'WithdrawalHistory.csv';

const location = 'binance.com';

const parseConfig = {
    type: 'xlsx'
};

function match(file) {
    if (file.detectedFiletype === 'xlsx') {
        if (JSON.stringify(Object.keys(file.data[0])) === '["Date","Coin","Amount","TransactionFee","Address","TXID","SourceAddress","PaymentID","Status"]') {
            if (String(file.filename).toLocaleLowerCase().indexOf('withdraw') !== -1) {
                return true;
            }
        }
    }
    return false;
}

function getOperations(file) {
    const operations = [];
    const data = file.data;
    let i = 0;
    let record;
    for (i = 0; i < data.length; i += 1) {
        const rawRecord = data[i];
        record = {};

        record.date = rawRecord.Date;
        record.timestamp = moment(record.date).valueOf();
        const from = {
            loc: location,
            amount: parseFloat(rawRecord.Amount),
            asset: rawRecord.Coin,
            address: rawRecord.SourceAddress
        };
        const to = {
            loc: 'wallet',
            amount: parseFloat(rawRecord.Amount),
            asset: rawRecord.Coin,
            address: rawRecord.Address
        };
        record.recordRaw = record;
        record.rawCSVLineNo = i + 1;
        record.rawCSVLine = data[i];
        record.sourcefile = file;
        record.from = from;
        record.to = to;
        record.txid = rawRecord.TXID;
        record.type = 'withdraw';
        operations.push(record);

        // TODO: add fee support
        console.warn(domain, adapter, 'skipping fee', rawRecord.TransactionFee, rawRecord.Coin);
    }
    return operations;
}
export default {
    domain,
    adapter,
    pluginname: `${domain}-${adapter}`,
    pluginfilename: __filename,
    match,
    parseConfig,
    getOperations
};
