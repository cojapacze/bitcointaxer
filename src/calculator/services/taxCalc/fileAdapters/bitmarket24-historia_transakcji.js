const domain = 'bitmarket24.pl';
const adapter = 'historia_transakcji';

const csvParseConfig = {
    delimiter: ','
};

function match(file) {
    //               0    1     2      3    4     5
    const pattern = 'data,kwota,waluta,kurs,rynek,opis';
    if (file.content.substr(0, pattern.length) === pattern) {
        return true;
    }
    return false;
}

function rawCSVLineToRecord(rawCSVLine, lineNo) {
    const record = {};
    // console.log(rawCSVLine, lineNo);
    record.rawCSVLine = rawCSVLine;
    record.rawCSVLineNo = lineNo;
    record.loc = 'bitmarket24.pl';
    record.date = rawCSVLine[0];
    record.amount = parseFloat(rawCSVLine[1]);
    record.currency = rawCSVLine[2];
    record.asset = rawCSVLine[2];
    record.price = parseFloat(rawCSVLine[3]);
    record.market = rawCSVLine[4];
    record.description = rawCSVLine[5];
    return record;
}
function getOperations(file) {
    const operations = [];
    const data = file.data;
    let i = 0;
    let record = {};
    let fee, from, to;
    for (i = 1; i < data.length; i += 3) {
        record = {};
        to = Object.assign({}, rawCSVLineToRecord(data[i + 0], i + 0));
        fee = Object.assign({}, rawCSVLineToRecord(data[i + 1], i + 1));
        from = Object.assign({}, rawCSVLineToRecord(data[i + 2], i + 2));
        from.amount *= -1;
        record.ex = 'bitmarket24.pl';
        record.type = 'trade';
        record.sourcefile = file;
        record.recordRaw = to;
        record.date = to.date;
        record.timestamp = Date.parse(record.date);
        record.from = from;
        record.to = to;
        record.fee = fee;

        operations.push(record);
    }
    // console.log(operations);
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
