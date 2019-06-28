const domain = 'bitbay.net';
const adapter = 'Historia-Wplaty_Wyplaty';

const parseConfig = {
    type: 'csv',
    delimiter: ';'
};

function match(file) {
    //                            0             1      2       3      4                          5                             6
    const pattern = String('\ufeffData operacji;Rodzaj;Wartość;Waluta;Saldo całkowite po operacji;');
    const pattern2 = String('Data operacji;Rodzaj;Wartość;Waluta;Saldo całkowite po operacji;');
    if (file.content.substr(0, pattern.length) === pattern) {
        return true;
    }
    if (file.content.substr(0, pattern2.length) === pattern2) {
        return true;
    }
    return false;
}
function bitbayDate2ISODate(bbDate) {
    const day = bbDate.substr(0, 2),
        month = bbDate.substr(3, 2),
        time = bbDate.substr(11, 8),
        year = bbDate.substr(6, 4);
    return `${year}-${month}-${day} ${time}`;
}

function getOperations(file) {
    const operations = [];
    const data = file.data;
    // let operation = {};
    let i = 0;
    let record;

    for (i = 1; i < data.length; i += 1) {
        record = {};
        record.sourcefile = file;
        record.rawCSVLine = data[i];
        record.recordRaw = record;
        record.rawCSVLineNo = i;
        record.ex = 'bitbay.net';
        record.type = 'error';
        record.date = bitbayDate2ISODate(record.rawCSVLine[0]);
        record.timestamp = Date.parse(record.date);
        record.bbType = record.rawCSVLine[1];
        record.value = parseFloat(record.rawCSVLine[2]);
        record.currency = record.rawCSVLine[3];
        record.saldo = parseFloat(record.rawCSVLine[4]);
        
        switch (record.bbType) {
        case 'Wypłata środków':
            record.type = 'withdraw';
            record.from = {
                loc: 'bitbay.net',
                amount: record.value * -1,
                asset: record.currency
            };
            record.to = {
                loc: 'wallet',
                amount: record.value * -1,
                asset: record.currency
            };
            break;
        case 'Wpłata na rachunek':
            record.type = 'deposit';
            record.from = {
                loc: 'wallet',
                amount: record.value,
                asset: record.currency
            };
            record.to = {
                loc: 'bitbay.net',
                amount: record.value,
                asset: record.currency
            };
            break;
        default:
            Error(`Nieznany typ operacji ${record.bbType}`);
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
