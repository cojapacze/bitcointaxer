import moment from 'moment';

const domain = 'poloniex.com';
const adapter = 'withdrawalHistory';

const parseConfig = {
    type: 'csv',
    delimiter: ','
};

function match(file) {
    //               0    1        2      3            4            5       6
    const pattern = 'Date,Currency,Amount,Fee Deducted,Amount - Fee,Address,Status';
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
    const type = 'withdraw';
    for (i = 1; i < data.length; i += 1) {
        record = {};
        record.type = 'transfer';
        record.sourcefile = file;
        record.rawCSVLine = data[i];
        record.rawCSVLineNo = i;
        record.date = record.rawCSVLine[0];
        record.timestamp = moment(record.date).valueOf();
        record.currency = record.rawCSVLine[1];
        record.asset = record.rawCSVLine[1];
        record.amount = parseFloat(record.rawCSVLine[2]);
        record.address = record.rawCSVLine[5];
        record.status = record.rawCSVLine[6];
        record.type = type;
        record.recordRaw = record;
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
        record.from = from;
        record.to = to;
        record.type = type;
        record.ex = 'poloniex.com';
        operations.push(record);

        // TODO: add fee support
        console.warn(domain, adapter, 'skipping fee', record.rawCSVLine[2] - record.rawCSVLine[4], record.rawCSVLine[1]);
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
