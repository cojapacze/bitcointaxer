
const domain = 'poloniex.com';
const adapter = 'tradeHistory';

const parseConfig = {
    type: 'csv',
    delimiter: ','
};

function match(file) {
    //             0    1      2        3    4     5      6     7   8            9                   10
    const pattern = 'Date,Market,Category,Type,Price,Amount,Total,Fee,Order Number,Base Total Less Fee,Quote Total Less Fee';
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
    for (i = 1; i < data.length; i += 1) {
        record = {};
        record.type = 'trade';
        record.rawCSVLine = data[i];
        record.rawCSVLineNo = i;
        record.sourcefile = file;
        record.date = record.rawCSVLine[0];
        record.timestamp = Date.parse(record.date);
        record.market = record.rawCSVLine[1];
        record.marketArr = record.market.split('/');
        record.category = record.rawCSVLine[2];
        record.type = record.rawCSVLine[3];
        record.price = parseFloat(record.rawCSVLine[4]);
        record.amount = parseFloat(record.rawCSVLine[5]);
        record.total = parseFloat(record.rawCSVLine[6]);
        record.fee = parseFloat(record.rawCSVLine[7]);
        record.order_no = record.rawCSVLine[8];
        record.base_total_less_fee = parseFloat(record.rawCSVLine[9]);
        record.quote_total_less_fee = parseFloat(record.rawCSVLine[10]);
        record.recordRaw = record;
        switch (record.category) {
        case 'Exchange':
        case 'Settlement':
        case 'Margin trade':
            break;
        default:
            console.error(`Unknown record category: ${record.category}!`, record);
        }
        if (record.type === 'Buy') {
            from = {
                loc: 'poloniex.com',
                amount: record.total,
                currency: record.marketArr[1],
                asset: record.marketArr[1]
            };
            to = {
                loc: 'poloniex.com',
                amount: record.quote_total_less_fee,
                currency: record.marketArr[0],
                asset: record.marketArr[0]
            };
        } else if (record.type === 'Sell') {
            from = {
                loc: 'poloniex.com',
                amount: record.amount,
                currency: record.marketArr[0],
                asset: record.marketArr[0]
            };
            to = {
                loc: 'poloniex.com',
                amount: record.base_total_less_fee,
                currency: record.marketArr[1],
                asset: record.marketArr[1]
            };
        }
        record.type = 'trade';
        record.from = from;
        record.to = to;
        record.ex = 'poloniex';
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
