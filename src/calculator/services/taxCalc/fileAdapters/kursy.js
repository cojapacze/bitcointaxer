import moment from 'moment';

const parseConfig = {
    type: 'csv',
    delimiter: ','
};

function match(file) {
    //             0    1        2
    const pattern = 'date;currency;base rate';
    if (file.content.substr(0, pattern.length) === pattern) {
        return true;
    }
    return false;
}

function getOperations(file) {
    const operations = [];
    const data = file.data;
    let i = 0;
    let record;

    for (i = 1; i < data.length; i += 1) {
        record = {};
        record.type = 'kurs';
        record.rawCSVLine = data[i];
        record.rawCSVLineNo = i;
        record.date = record.rawCSVLine[0];
        record.timestamp = moment(record.date).valueOf();
        record.currency = record.rawCSVLine[1];
        record.baseRate = record.rawCSVLine[2];
        record.residenceCurrency = 'TODO';
        operations.push(record);
    }
    return operations;
}

export default {
    pluginname: 'kursy',
    parseConfig,
    pluginfilename: __filename,
    match,
    getOperations
};
