const domain = 'bitbay.net';
const adapter = 'Historia-Transakcje';

const parseConfig = {
    type: 'csv',
    delimiter: ';'
};

function match(file) {
    //                            0             1      2       3      4                          5                             6
    const pattern = String('\ufeffRynek;Data operacji;Rodzaj;Typ;Kurs;Ilość;Wartość;');
    const pattern2 = String('Rynek;Data operacji;Rodzaj;Typ;Kurs;Ilość;Wartość;');
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
        record.rawCSVLineNo = i;
        record.rawCSVLine = data[i];
        record.recordRaw = record;

        record.type = 'trade';
        record.ex = 'bitbay.net';
        record.marketArr = record.rawCSVLine[0].split(' - ');
        record.date = bitbayDate2ISODate(record.rawCSVLine[1]);
        record.timestamp = Date.parse(record.date);
        record.bbOperationType = record.rawCSVLine[2];
        record.bbActionType = record.rawCSVLine[3];
        record.rate = parseFloat(record.rawCSVLine[4]);
        record.amount = parseFloat(record.rawCSVLine[5]);
        record.value = parseFloat(record.rawCSVLine[6]);
        switch (record.bbOperationType) {
        case 'Kupno':
            record.from = {
                loc: 'bitbay.net',
                amount: record.value,
                asset: record.marketArr[1]
            };
            record.to = {
                loc: 'bitbay.net',
                amount: record.amount,
                asset: record.marketArr[0]
            };
            break;
        case 'Sprzedaż':
            record.from = {
                loc: 'bitbay.net',
                amount: record.amount,
                asset: record.marketArr[0]
            };
            record.to = {
                loc: 'bitbay.net',
                amount: record.value,
                asset: record.marketArr[1]
            };
            break;
        default:
            Error(`Nieznany typ operacji ${record.bbOperationType}`);
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
