
const domain = 'coinbase.com';
const adapter = 'transaction_history';
const location = 'coinbase.com';
const DATA_FROM_LINE = 8;
const parseConfig = {
    type: 'csv',
    delimiter: ',',
    // from_line: DATA_FROM_LINE,
    quote: '"',
    relax_column_count: true
};

function match(file) {
    const pattern = '"You can use this transaction report to inform your likely tax obligations. For US customers, Sells, Converts, and Rewards Income, and Coinbase Earn transactions are taxable events. For final tax obligations, please consult your tax advisor."';
    if (file.content.substr(0, pattern.length) === pattern) {
        return true;
    }
    return false;
}

function coinbaseDateToIsoDate(coinbaseDate) {
    return String(coinbaseDate).replace('T', ' ').replace('Z', '');
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
    const addressFound = notes.match(/[A-Z|a-z|0-9]{34,64}$/);
    return {
        foundValues: foundValues,
        wallet: wallet,
        address: addressFound && addressFound[0]
    };
}


function getOperations(file) {
    const operations = [];
    const data = file.data;
    let from, operation, record, recordA, to;
    let i = 0;
    const data_transfers = [];
    const data_trades = [];
    const reportBaseCurrency = String(data[7][6]).substr(0, 3);

    // sort record types
    for (i = DATA_FROM_LINE; i < data.length; i += 1) {
        record = {};
        record.rawCSVLine = data[i];
        record.rawCSVLineNo = i;

        record.date = coinbaseDateToIsoDate(record.rawCSVLine[0]);
        record.timestamp = new Date(record.rawCSVLine[0]).getTime();
        record.type = record.rawCSVLine[1];
        record.currency = record.rawCSVLine[2];
        record.asset = record.currency;
        record.amount = parseFloat(record.rawCSVLine[3]);
        record.baseCurrency = reportBaseCurrency;
        record.baseCurrencyPrice = parseFloat(record.rawCSVLine[4]);
        record.baseCurrencyValuationSubtotal = parseFloat(record.rawCSVLine[5]);
        record.baseCurrencyValuationWithFee = parseFloat(record.rawCSVLine[6]);
        record.fees = parseFloat(record.rawCSVLine[7]);
        record.notes = record.rawCSVLine[8];
        record.loc = location;
        record.file = file;
        record.line = i;
        record.infoFromNotes = readInfoFromNotes(record.notes);

        switch (record.type) {
        case 'Receive':
        case 'Send':
            data_transfers.push(record);    
            break;
        case 'Buy':
        case 'Sell':
        case 'Convert':
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
                address: record.infoFromNotes && record.infoFromNotes.address
            };
        } else if (record.amount > 0 && record.type === 'Receive') {
            record.transferType = 'deposit';
            from = {
                loc: 'wallet',
                amount: record.amount,
                currency: record.currency,
                asset: record.currency,
                address: record.infoFromNotes && record.infoFromNotes.address
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


    recordA = true;

    while (recordA) {
        recordA = data_trades.shift();
        if (!recordA) {
            continue;
        }
        if (recordA.type === 'Convert') {
            const infoFromNotes = recordA.infoFromNotes;
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
                console.error(domain, adapter, 'Asset "from" not match asset in notes!', infoFromNotes.foundValues[0].asset, recordA.currency, recordA, infoFromNotes);
                continue;
            }
            if (infoFromNotes.foundValues[0].value !== recordA.amount) {
                console.error(domain, adapter, 'Amount "from" not match amount in notes!', infoFromNotes.foundValues[0].value, recordA.amount, recordA, infoFromNotes);
                continue;
            }
            from = {
                loc: location,
                amount: infoFromNotes.foundValues[0].value,
                currency: infoFromNotes.foundValues[0].asset,
                asset: infoFromNotes.foundValues[0].asset
            };
            to = {
                loc: location,
                amount: infoFromNotes.foundValues[1].value,
                currency: infoFromNotes.foundValues[1].asset,
                asset: infoFromNotes.foundValues[1].asset
            };
            // TODO: fees may not be included in Covert transaction(!)
        } else if (recordA.type === 'Buy') {
            const infoFromNotes = recordA.infoFromNotes;
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
        } else if (recordA.type === 'Sell') {
            const infoFromNotes = recordA.infoFromNotes;
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
                console.error(domain, adapter, 'Asset "from" not match asset in notes!', infoFromNotes.foundValues[0].asset, recordA.currency, recordA, infoFromNotes);
                continue;
            }
            if (infoFromNotes.foundValues[0].value !== recordA.amount) {
                console.error(domain, adapter, 'Amount "from" not match amount in notes!', infoFromNotes.foundValues[0].value, recordA.amount, recordA, infoFromNotes);
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
                amount: infoFromNotes.foundValues[1].value,
                currency: infoFromNotes.foundValues[1].asset,
                asset: infoFromNotes.foundValues[1].asset
            };
        } else {
            console.error(domain, adapter, 'Unknow record type!', recordA);
        }

        operation = {
            sourcefile: recordA.file,
            rawCSVLineNo: recordA.rawCSVLineNo,
            recordRaw: recordA,
            line: recordA.line,
            date: recordA.date,
            timestamp: recordA.timestamp,
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

