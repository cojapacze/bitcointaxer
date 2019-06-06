const domain = 'bitmarket24.pl';
const adapter = 'historia_salda';

const csvParseConfig = {
    delimiter: ','
};

function match(file) {
    //              0  1                 2                  3      4     5        6                    7
    const pattern = 'id,"data utworzenia","data zakonczenia",waluta,kwota,prowizja,"adres/konto wyplat","id transkacji"';
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
        record.sourcefile = file;
        record.recordRaw = record;
        record.type = 'transfer';
        record.rawCSVLine = data[i];
        record.rawCSVLineNo = i;
        record.id = record.rawCSVLine[0];
        record.date_start = record.rawCSVLine[1];
        record.date_end = record.rawCSVLine[2];
        record.date = record.date_end;
        record.timestamp = Date.parse(record.date);
        record.currency = record.rawCSVLine[3];
        record.asset = record.currency;
        record.amount = parseFloat(record.rawCSVLine[4]);
        record.fee = parseFloat(record.rawCSVLine[5]);
        record.address = record.rawCSVLine[6];
        record.txid = record.rawCSVLine[7];
        if (record.amount < 0) {
            record.type = 'withdraw';
            record.amount *= -1;
            from = {
                loc: 'bitmarket24.pl',
                amount: record.amount,
                currency: record.currency,
                asset: record.asset,
                txid: record.txid
            };
            to = {
                loc: 'wallet',
                amount: record.amount,
                currency: record.currency,
                asset: record.asset,
                address: record.address,
                txid: record.txid
            };
        } else {
            record.type = 'deposit';
            from = {
                loc: 'wallet',
                amount: record.amount,
                currency: record.currency,
                asset: record.asset,
                address: record.address,
                txid: record.txid
            };
            to = {
                loc: 'bitmarket24.pl',
                amount: record.amount,
                currency: record.currency,
                asset: record.asset,
                txid: record.txid
            };
        }
        record.from = from;
        record.to = to;
        record.ex = 'bitmarket24.pl';
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
