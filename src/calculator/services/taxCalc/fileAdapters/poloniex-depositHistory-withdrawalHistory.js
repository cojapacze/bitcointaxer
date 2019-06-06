const domain = 'poloniex.com';
const adapter = 'depositHistory-or-withdrawalHistory';

const csvParseConfig = {
    delimiter: ','
};

function match(file) {
    //              0    1        2      3       4
    const pattern = 'Date,Currency,Amount,Address,Status';
    if (file.content.substr(0, pattern.length) === pattern) {
        return true;
    }
    return false;
}

function getOperations(file) {
    const operations = [];
    const data = file.data;
    let i = 0;
    let from, record, to;
    let type = 'unknown';
    if (file.basename.indexOf('depositHistory') !== -1) {
        type = 'deposit';
    }
    if (file.basename.indexOf('withdrawalHistory') !== -1) {
        type = 'withdraw';
    }
    for (i = 1; i < data.length; i += 1) {
        record = {};
        record.type = 'transfer';
        record.sourcefile = file;
        record.rawCSVLine = data[i];
        record.rawCSVLineNo = i;
        record.date = record.rawCSVLine[0];
        record.timestamp = Date.parse(record.date);
        record.currency = record.rawCSVLine[1];
        record.asset = record.rawCSVLine[1];
        record.amount = parseFloat(record.rawCSVLine[2]);
        record.address = record.rawCSVLine[3];
        record.status = record.rawCSVLine[4];
        record.type = type;
        record.recordRaw = record;
        if (type === 'withdraw') {
            from = {
                loc: 'poloniex.com',
                amount: record.amount,
                currency: record.currency,
                asset: record.asset
            };
            to = {
                loc: 'wallet',
                amount: record.amount,
                currency: record.currency,
                asset: record.asset,
                address: record.address
            };
        } else {
            from = {
                loc: 'wallet',
                amount: record.amount,
                currency: record.currency,
                asset: record.asset
            };
            to = {
                loc: 'poloniex.com',
                amount: record.amount,
                currency: record.currency,
                asset: record.asset
            };
        }
        record.from = from;
        record.to = to;
        record.type = type;
        record.ex = 'poloniex.com';
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

