import moment from 'moment';
// import {getAssetConfig} from '../libs/Utils.js';
const domain = 'wavesplatform.com';
const adapter = 'fullOrders';

const location = 'wavesplatform.com';

const parseConfig = {
    type: 'csv',
    delimiter: ',',
    relax_column_count: true
};

function match(file) {
    //               0    1              2                3                           4                  5                6                 7              8                   9                 10                 11              12         13       14        15     16                 17                    18                     19                 20         21                22         23                24
    const pattern =
        'Date,Transaction ID,Transaction type,Blockchain transaction type,Price asset ticker,Price asset name,Price asset value,Price asset ID,Amount asset ticker,Amount asset name,Amount asset value,Amount asset ID,Fee ticker,Fee name,Fee value,Fee ID,Transaction sender,Transaction recipient,Transaction attachment,Transaction height,Alias name,Token description,Token name,Can reissue token,Precision';
    if (file.content.substr(0, pattern.length) === pattern) {
        return true;
    }
    return false;
}

function wavesplatformDateToIsoDate(wavesplatformDate) {
    const timeStr = String(wavesplatformDate).substr(11);
    const yearStr = String(wavesplatformDate).substr(6, 4);
    const monthStr = String(wavesplatformDate).substr(3, 2);
    const dayStr = String(wavesplatformDate).substr(0, 2);
    const dateStr = `${yearStr}-${monthStr}-${dayStr} ${timeStr}`;
    return dateStr;
}
function getOperations(file) {
    const operations = [];
    const data = file.data;
    let i = 0;
    let record;

    for (i = 1; i < data.length; i += 1) {
        const rawRecord = data[i];
        switch (rawRecord[2]) {
            case 'exchange-sell':
            case 'exchange-buy':
            case 'receive':
                break;
            default:
                continue;
        }
        // const markets = rawRecord[1].split('-');
        const type = rawRecord[2].split('-');
        record = {};

        record.date = wavesplatformDateToIsoDate(rawRecord[0]);
        record.timestamp = moment(record.date).valueOf();
        const from = {
            loc: location,
            amount: parseFloat(rawRecord[6].replace(/,/g, '')),
            asset: rawRecord[4] || rawRecord[5]
        };
        const to = {
            loc: location,
            amount: parseFloat(rawRecord[10].replace(/,/g, '')),
            asset: rawRecord[8] || rawRecord[9]
        };
        if (type[1] === 'buy') {
            record.from = from;
            record.to = to;
        } else if (type[1] === 'sell') {
            record.from = to;
            record.to = from;
        } else if (type[0] === 'receive') {
            from.loc = 'wallet';
            from.amount = to.amount;
            from.asset = to.asset;
            record.from = from;
            record.to = to;
        }
        record.recordRaw = record;
        record.rawCSVLineNo = i;
        record.rawCSVLine = data[i];
        record.sourcefile = file;
        record.type = 'operation';
        if (record.from.asset === record.to.asset && record.from.location !== record.to.loc) {
            record.type = 'transfer';
        }
        if (record.from.asset !== record.to.asset && record.from.loc === record.to.loc) {
            record.type = 'trade';
        }
        if (record.from.asset !== record.to.asset && record.from.loc !== record.to.loc) {
            record.type = 'atomic-swap';
        }
        operations.push(record);
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
