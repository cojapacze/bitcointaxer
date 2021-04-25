import moment from 'moment';

const domain = 'coinbase.com';
const adapter = 'transaction_history';
const location = 'coinbase.com';
const DATA_FROM_LINE = 4;
const parseConfig = {
    type: 'csv',
    delimiter: ',',
    // from_line: DATA_FROM_LINE,
    relax_column_count: true
};

function match(file) {
    const pattern = 'Transactions\nUser,';
    if (file.content.substr(0, pattern.length) === pattern) {
        return true;
    }
    return false;
}

function coinbaseDateToIsoDate(coinbaseDate) {
    const yearStr = String(coinbaseDate).substr(6, 4);
    const monthStr = String(coinbaseDate).substr(0, 2);
    const dayStr = String(coinbaseDate).substr(3, 2);
    const timeStr = String(coinbaseDate).substr(11);
    const dateStr = `${yearStr}-${monthStr}-${dayStr} ${timeStr}`;
    return dateStr;
}
function getOperations(file) {
    const operations = [];
    const data = file.data;
    let from, operation, record, recordA, recordB, recordTmp, to;
    let i = 0;
    const data_transfers = [];
    const data_trades = [];
    const reportBaseCurrency = String(data[3][4]).substr(0, 3);
    // sort record types
    for (i = DATA_FROM_LINE; i < data.length; i += 1) {
        record = {};
        record.rawCSVLine = data[i];
        record.rawCSVLineNo = i;

        record.date = coinbaseDateToIsoDate(record.rawCSVLine[0]);
        record.timestamp = moment(record.date).valueOf() + i * 1000;
        record.type = record.rawCSVLine[1];
        record.currency = record.rawCSVLine[2];
        record.asset = record.currency;
        record.amount = parseFloat(record.rawCSVLine[3]);
        record.baseCurrency = reportBaseCurrency;
        record.baseCurrencyPrice = parseFloat(record.rawCSVLine[4]);
        record.baseCurrencyValuationWithFee = parseFloat(record.rawCSVLine[5]);
        record.address = record.rawCSVLine[6];
        record.notes = record.rawCSVLine[7];
        record.loc = location;
        record.file = file;
        record.line = i;
        switch (record.type) {
            case 'Receive':
            case 'Send':
                data_transfers.push(record);
                break;
            case 'Buy':
            case 'Sell':
            case 'Trade':
                data_trades.push(record);
                break;
            default:
                Error(`Unknown record type: ${record.type}`);
        }
    }
    for (i = 0; i < data_transfers.length; i += 1) {
        record = data_transfers[i];

        if (record.amount > 0 && record.type === 'Send') {
            record.transferType = 'withdraw';
            from = {
                loc: location,
                amount: record.amount,
                currency: record.currency,
                asset: record.currency
            };
            to = {
                loc: 'wallet',
                amount: record.amount,
                currency: record.currency,
                asset: record.currency,
                address: record.address
            };
        } else if (record.amount > 0 && record.type === 'Receive') {
            record.transferType = 'deposit';
            from = {
                loc: 'wallet',
                amount: record.amount,
                currency: record.currency,
                asset: record.currency,
                address: record.address
            };
            to = {
                loc: location,
                amount: record.amount,
                currency: record.currency,
                asset: record.currency
            };
        } else {
            console.error(domain, adapter, 'Unknown rekord', record);
        }
        operation = {
            sourcefile: record.file,
            rawCSVLineNo: record.rawCSVLineNo,
            lines: record.lines,
            date: record.date,
            timestamp: record.timestamp,
            recordRaw: record,
            type: record.transferType,
            ex: domain,
            amount: record.amount,
            currency: record.currency,
            valuationFromExchange: {
                currency: record.baseCurrency,
                value: record.baseCurrencyValuationWithFee
            },
            from: from,
            to: to
        };
        operations.push(operation);
    }
    function getTwinningOperation(ledger, siblingRecord) {
        if (!ledger) {
            return false;
        }
        let found = false;
        for (let n = ledger.length - 1; n >= 0 && !found; n -= 1) {
            if (ledger[n].notes === siblingRecord.notes && ledger[n].date === siblingRecord.date) {
                found = ledger.splice(n, 1)[0];
            }
        }
        return found;
    }
    function readInfoFromNotes(notes) {
        const regex = /(([0-9]+[ 0-9]*([,.][0-9]+)?)[ €$£]+([A-Z]+))/gm;
        let m;
        const foundValues = [];
        let value;
        while ((m = regex.exec(notes)) !== null) {
            if (m.index === regex.lastIndex) {
                regex.lastIndex += 1;
            }
            value = m[2];

            // ??? thousand separator
            // if (value.indexOf('.') !== -1 || ((value.match(/,/g) || []).length > 1)) {
            //     value = value.replace(',', '');
            // }
            // warn: case "1,000" may not be correctly detected if Coinbase uses "," as thousand separator
            // it's probably not necessary

            value = value.replace(',', '.');
            value = value.replace(' ', '');
            foundValues.push({
                rawRegexResult: m,
                value: parseFloat(value),
                asset: m[4]
            });
        }
        const wallet = notes.indexOf('Wallet') !== -1;
        return {
            foundValues: foundValues,
            wallet: wallet
        };
    }

    recordA = true;
    let operationTimestamp = false;
    while (recordA) {
        recordTmp = false;
        recordA = data_trades.shift();
        operationTimestamp = false;
        if (!recordA) {
            continue;
        }
        if (recordA.type === 'Trade') {
            recordB = getTwinningOperation(data_trades, recordA);
            const infoFromNotes = readInfoFromNotes(recordA.notes);
            if (!recordB) {
                console.error(domain, adapter, 'Twinning not found!', recordA);
                continue;
            }
            // validate with notes
            if (!infoFromNotes.foundValues) {
                console.error(domain, adapter, 'Values in notes not found!', recordA);
                continue;
            }
            if (infoFromNotes.foundValues.length !== 2) {
                console.error(domain, adapter, 'Found values count in notes is not equal 2!', recordA);
                continue;
            }
            if (infoFromNotes.foundValues[0].asset !== recordA.currency) {
                recordTmp = recordA;
                recordA = recordB;
                recordB = recordTmp;
            }
            if (infoFromNotes.foundValues[0].asset !== recordA.currency) {
                console.error(domain, adapter, 'Asset "from" not match asset in notes!', infoFromNotes.foundValues[0].asset, recordA.currency, recordA, infoFromNotes);
                continue;
            }
            if (infoFromNotes.foundValues[0].value !== recordA.amount) {
                console.error(domain, adapter, 'Amount "from" not match amount in notes!', infoFromNotes.foundValues[0].value, recordA.amount, recordA, infoFromNotes);
                continue;
            }
            if (infoFromNotes.foundValues[1].asset !== recordB.currency) {
                console.error(domain, adapter, 'Asset "to" not match asset in notes!', infoFromNotes.foundValues[1].asset, recordB.currency, recordB, infoFromNotes);
                continue;
            }
            if (infoFromNotes.foundValues[1].value !== recordB.amount) {
                console.error(domain, adapter, 'Amount "to" not match amount in notes!', infoFromNotes.foundValues[1].value, recordB.amount, recordB, infoFromNotes);
                continue;
            }
            from = {
                loc: location,
                amount: recordA.amount,
                currency: recordA.currency,
                asset: recordA.currency
            };
            to = {
                loc: location,
                amount: recordB.amount,
                currency: recordB.currency,
                asset: recordB.currency
            };
            if (recordTmp) {
                operationTimestamp = Math.min(recordA.timestamp, recordB.timestamp);
            } else {
                operationTimestamp = recordA.timestamp;
            }
        } else if (recordA.type === 'Buy') {
            const infoFromNotes = readInfoFromNotes(recordA.notes);

            // validate with notes
            if (!infoFromNotes.foundValues) {
                console.error(domain, adapter, 'Values in notes not found!', recordA);
                continue;
            }
            if (infoFromNotes.foundValues.length !== 2) {
                console.error(domain, adapter, 'Found values count in notes is not equal 2!', recordA);
                continue;
            }
            if (infoFromNotes.foundValues[0].asset !== recordA.currency) {
                console.error(domain, adapter, 'Bought asset not match asset in notes!', infoFromNotes.foundValues[0].asset, recordA.currency, recordA, infoFromNotes);
                continue;
            }
            if (infoFromNotes.foundValues[0].value !== recordA.amount) {
                console.error(domain, adapter, 'Bought amount not match amount in notes!', infoFromNotes.foundValues[0].value, recordA.amount, recordA, infoFromNotes);
                continue;
            }
            if (infoFromNotes.foundValues[1].value !== recordA.baseCurrencyValuationWithFee) {
                console.error(domain, adapter, 'Bought value not match value in notes!', recordA);
                continue;
            }
            const bougtForCurrency = infoFromNotes.foundValues[1].asset;

            if (!infoFromNotes.wallet) {
                operations.push({
                    sourcefile: recordA.file,
                    rawCSVLineNo: recordA.rawCSVLineNo,
                    recordRaw: recordA,
                    line: recordA.line,
                    date: recordA.date,
                    timestamp: recordA.timestamp,
                    type: 'deposit',
                    ex: domain,
                    from: {
                        loc: 'wallet',
                        amount: recordA.baseCurrencyValuationWithFee,
                        currency: bougtForCurrency,
                        asset: bougtForCurrency
                    },
                    to: {
                        loc: location,
                        amount: recordA.baseCurrencyValuationWithFee,
                        currency: bougtForCurrency,
                        asset: bougtForCurrency
                    },
                    valuationFromExchange: {
                        currency: recordA.baseCurrency,
                        value: recordA.baseCurrencyValuationWithFee
                    }
                });
            }
            from = {
                loc: location,
                amount: recordA.baseCurrencyValuationWithFee,
                currency: bougtForCurrency,
                asset: bougtForCurrency
            };
            to = {
                loc: location,
                amount: recordA.amount,
                currency: recordA.currency,
                asset: recordA.currency
            };
            operationTimestamp = recordA.timestamp;
        } else if (recordA.type === 'Sell') {
            from = {
                loc: location,
                amount: recordA.amount,
                currency: recordA.currency,
                asset: recordA.currency
            };
            to = {
                loc: location,
                amount: recordA.baseCurrencyValuationWithFee,
                currency: reportBaseCurrency,
                asset: reportBaseCurrency
            };
            operationTimestamp = recordA.timestamp;
        } else {
            console.error(domain, adapter, 'Unknow record type!', recordA);
        }

        operation = {
            sourcefile: recordA.file,
            rawCSVLineNo: recordA.rawCSVLineNo,
            recordRaw: recordA,
            line: recordA.line,
            date: recordA.date,
            timestamp: operationTimestamp,
            type: 'trade',
            ex: domain,
            from: from,
            to: to,
            valuationFromExchange: {
                currency: recordA.baseCurrency,
                value: recordA.baseCurrencyValuationWithFee
            }
        };
        operations.push(operation);
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
