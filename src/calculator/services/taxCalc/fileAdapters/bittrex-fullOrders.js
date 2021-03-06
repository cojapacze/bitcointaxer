// import {getAssetConfig} from '../libs/Utils.js';
const domain = 'bittrex.com';
const adapter = 'fullOrders';

const csvParseConfig = {
    type: 'csv',
    delimiter: ',',
    relax_column_count: true
};

function match(file) {
    // 0         1        2    3        4     5              6     7      8
    // OrderUuid,Exchange,Type,Quantity,Limit,CommissionPaid,Price,Opened,Closed
    const pattern = 'O r d e r U u i d , E x c h a n g e , T y p e , Q u a n t i t y , L i m i t , C o m m i s s i o n P a i d , P r i c e , O p e n e d , C l o s e d ';
    if (file.content.substr(0, pattern.length) === pattern) {
        return true;
    }
    return false;
}

function bittrexDateToIsoDate(bittrecDate) {
    const dateTimeBlock = String(bittrecDate).split(' ');
    const dateBlock = String(dateTimeBlock[0]).split('/');
    const timeBlock = String(dateTimeBlock[1]).split(':');
    let hour = parseInt(timeBlock[0], 10);
    if (dateTimeBlock[2] === 'PM') {
        hour += 12;
    }
    const hourStr = String(`00${hour}`).slice(-2);
    const timeStr = `${hourStr}:${timeBlock[1]}:${timeBlock[2]}`;
    const yearStr = String(`${dateBlock[2]}`).slice(-4);
    const monthStr = String(`00${dateBlock[0]}`).slice(-2);
    const dayStr = String(`00${dateBlock[1]}`).slice(-2);
    const dateStr = `${yearStr}-${monthStr}-${dayStr} ${timeStr}`;
    return dateStr;
}
function cleanBittrexData(data) {
    /* eslint-disable */
    return String(data).replace(new RegExp(' ', 'g'), '');
    /* eslint-enable */
}
function getOperations(file) {
    const operations = [];
    const data = file.data;
    let i = 0;
    let record;

    for (i = 1; i < data.length; i += 1) {
        const rawRecord = data[i].map(cleanBittrexData);
        if (!rawRecord || !rawRecord[1]) {
            continue;
        }
        // console.log(rawRecord);
        // debugger;
        const markets = rawRecord[1].split('-');
        const type = rawRecord[2].split('_');
        record = {};
  
        record.date = bittrexDateToIsoDate(rawRecord[8]);
        record.timestamp = Date.parse(record.date);
        if (type[1] === 'BUY') {
            record.from = {
                ex: domain,
                loc: 'wallet',
                amount: parseFloat(rawRecord[6]),
                asset: markets[0]
            };
            record.to = {
                ex: domain,
                loc: 'wallet',
                amount: parseFloat(rawRecord[3]),
                asset: markets[1]
            };
        } else {
            record.from = {
                ex: domain,
                loc: 'wallet',
                amount: parseFloat(rawRecord[3]),
                asset: markets[1]
            };
            record.to = {
                ex: domain,
                loc: 'wallet',
                amount: parseFloat(rawRecord[6]),
                asset: markets[0]
            };
        }
        record.recordRaw = record;
        record.rawCSVLineNo = i;
        record.rawCSVLine = data[i];
        record.sourcefile = file;
        record.type = 'operation';
        if (record.from.asset === record.to.asset && record.from.loc !== record.to.loc) {
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
    csvParseConfig,
    getOperations
};
