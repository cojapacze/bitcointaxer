
const domain = 'pro.coinbase.com';
const adapter = 'fills.csv';
const location = 'pro.coinbase.com';
const parseConfig = {
    type: 'csv',
    delimiter: ','
};

function match(file) {
    const pattern = 'portfolio,type,time,amount,balance,amount/balance unit,transfer id,trade id,order id';
    if (file.content.indexOf(pattern) !== -1) {
        return true;
    }
    return false;
}

function getOperations(file) {
    const data = file.data;

    const operations = [];
    let record;
    let recordFee, recordFrom, recordTo;
    let i = 0;

    for (i = 1; i < data.length; i += 1) {
        record = {};
        record.rawCSVLine = data[i];
        record.rawCSVLineNo = i;

        record.file = file;
        record.line = i;
        record.sourcefile = record.file;
        record.portfolio = record.rawCSVLine[0];
        record.coinbaseType = record.rawCSVLine[1];
        record.date = String(record.rawCSVLine[2]).replace('T', ' ').replace('Z', '');
        record.timestamp = new Date(record.rawCSVLine[2]).getTime();
        record.amount = parseFloat(record.rawCSVLine[3]);
        record.balance = parseFloat(record.rawCSVLine[4]);
        record.asset = String(record.rawCSVLine[5]);
        record.transferId = String(record.rawCSVLine[6]);
        record.tradeId = String(record.rawCSVLine[7]);
        record.orderId = String(record.rawCSVLine[8]);
        record.recordRaw = record;
        switch (record.coinbaseType) {
        case 'deposit':
            record.type = 'deposit';
            Object.assign(record, {
                from: {
                    loc: 'coinbase.com',
                    amount: record.amount,
                    asset: record.asset
                },
                to: {
                    loc: `${location}-${record.portfolio}`,
                    amount: record.amount,
                    asset: record.asset
                }
            });
            operations.push(record);
            break;
        case 'withdrawal':
            record.type = 'withdraw';
            Object.assign(record, {
                from: {
                    loc: `${location}-${record.portfolio}`,
                    amount: -1 * record.amount,
                    asset: record.asset
                },
                to: {
                    loc: 'coinbase.com',
                    amount: -1 * record.amount,
                    asset: record.asset
                }
            });
            operations.push(record);
            break;
        case 'match':
            record.type = 'trade';

            recordFrom = data[i];
            recordTo = data[i + 1];
            recordFee = data[i + 2];
            i += 2;

            if (!recordFrom || recordFrom[1] !== 'match') {
                Error('Unexpected format - match from');
            }
            if (!recordTo || recordTo[1] !== 'match') {
                Error('Unexpected format - match to');
            }
            if (!recordFee || recordFee[1] !== 'fee') {
                Error('Unexpected format - fee');
            }
            Object.assign(record, {
                from: {
                    loc: `${location}-${record.portfolio}`,
                    amount: -1 * parseFloat(recordFrom[3]),
                    asset: recordFrom[5]
                },
                to: {
                    loc: `${location}-${record.portfolio}`,
                    amount: parseFloat(recordTo[3]),
                    asset: recordTo[5]
                }
            });
            operations.push(record);
            break;
        case 'fee':
            Error('Fee shoud be consumed by trade.');
            break;
        default:
            Error(`Unknown record type: ${record.type}`);
        }
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

