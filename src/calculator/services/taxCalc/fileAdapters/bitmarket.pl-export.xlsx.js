import moment from 'moment';

const utils = require('../libs/Utils');

const domain = 'bitmarket.pl';
const adapter = 'export.xlsx';

const location = 'bitmarket.pl';

const parseConfig = {
    type: 'xlsx'
};

function match(file) {
    if (file.detectedFiletype === 'xlsx') {
        if (JSON.stringify(Object.keys(file.data[0])) === '["Data operacji","Rodzaj operacji","Kwota","Waluta","Kurs","Prowizja"]') {
            return true;
        }
    }
    return false;
}
function getOperations(file) {
    const operations = [];
    const data = file.data;
    let i = 0;
    let from, record, to;
    // rawRecord example:
    // Data operacji: "2019-01-01 21:18:01"
    // Kurs: 14046.5397
    // Kwota: -4999.99995067
    // Prowizja: 0
    // Rodzaj operacji: "Wymiana na giełdzie" || "Wypłata z konta" || "Anulowanie oferty" || "Złożenie oferty"
    // Waluta: "PLN"
    const data_trade_taken = [];
    const data_trade_received = [];
    const data_withdraw = [];
    const data_deposit = [];
    for (i = 0; i < data.length; i += 1) {
        const rawRecord = data[i];
        rawRecord.rawCSVLineNo = i + 1;
        switch (rawRecord['Rodzaj operacji']) {
            case 'Wypłata z konta':
                data_withdraw.push(rawRecord);
                break;
            case 'Wpłata na konto':
                data_deposit.push(rawRecord);
                break;
            case 'Wymiana na giełdzie':
                if (rawRecord.Kwota < 0) {
                    data_trade_taken.push(rawRecord);
                } else {
                    data_trade_received.push(rawRecord);
                }
                break;
            case 'Anulowanie oferty':
            case 'Złożenie oferty':
                // ignore
                break;
            default:
                console.error('unknown record', rawRecord);
        }
    }

    data_trade_taken.sort((a, b) => utils.comapreObjectsByFields(a, b, ['Data operacji', 'Kurs', 'Kwota']));
    data_trade_received.sort((a, b) => utils.comapreObjectsByFields(a, b, ['Data operacji', 'Kurs', 'Kwota']));

    function pickTakenRecord(recordReceived) {
        const foundRecord = data_trade_taken.find((rec, j) => {
            if (rec['Data operacji'] !== recordReceived['Data operacji']) {
                return false;
            }
            if (rec.Kurs !== recordReceived.Kurs) {
                return false;
            }
            data_trade_taken.splice(j, 1);
            return true;
        });
        return foundRecord;
    }
    for (i = data_trade_received.length - 1; i >= 0; i -= 1) {
        const rawRecordReceived = data_trade_received[i];
        const rawRecordTaken = pickTakenRecord(rawRecordReceived);
        if (!rawRecordTaken) {
            continue;
        }
        data_trade_received.splice(i, 1);
        from = {
            loc: location,
            amount: parseFloat(rawRecordTaken.Kwota) * -1,
            asset: rawRecordTaken.Waluta
        };
        to = {
            loc: location,
            amount: parseFloat(rawRecordReceived.Kwota),
            asset: rawRecordReceived.Waluta
        };
        record = {
            sourcefile: file,
            recordRaw: rawRecordReceived,
            rawCSVLineNo: rawRecordReceived.rawCSVLineNo,
            date: rawRecordReceived['Data operacji'],
            timestamp: moment(rawRecordReceived['Data operacji']).valueOf(),
            type: 'trade',
            ex: domain,
            from: from,
            to: to
        };
        operations.push(record);
    }
    if (data_trade_taken.length) {
        console.error(domain, adapter, 'orphan data_trade_taken', data_trade_taken);
    }
    if (data_trade_received.length) {
        console.error(domain, adapter, 'orphan data_trade_received', data_trade_received);
    }

    for (i = 0; i < data_deposit.length; i += 1) {
        const rawRecord = data_deposit[i];
        from = {
            loc: 'wallet',
            amount: parseFloat(rawRecord.Kwota),
            asset: rawRecord.Waluta
        };
        to = {
            loc: location,
            amount: from.amount,
            asset: from.asset
        };
        record = {
            sourcefile: file,
            recordRaw: rawRecord,
            rawCSVLineNo: rawRecord.rawCSVLineNo,
            date: rawRecord['Data operacji'],
            timestamp: moment(rawRecord['Data operacji']).valueOf(),
            type: 'deposit',
            ex: domain,
            from: from,
            to: to
        };
        operations.push(record);
    }
    for (i = 0; i < data_withdraw.length; i += 1) {
        const rawRecord = data_withdraw[i];
        from = {
            loc: location,
            amount: parseFloat(rawRecord.Kwota) * -1,
            asset: rawRecord.Waluta
        };
        to = {
            loc: 'wallet',
            amount: from.amount,
            asset: from.asset
        };
        record = {
            sourcefile: file,
            recordRaw: rawRecord,
            rawCSVLineNo: rawRecord.rawCSVLineNo,
            date: rawRecord['Data operacji'],
            timestamp: moment(rawRecord['Data operacji']).valueOf(),
            type: 'withdraw',
            ex: domain,
            from: from,
            to: to
        };
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
