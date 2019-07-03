
const utils = require('../libs/Utils');
const domain = 'bitbay.net';
const adapter = 'Historia-Szczegolowa';

const parseConfig = {
    type: 'csv',
    delimiter: ';'
};

function match(file) {
    //                            0             1      2       3      4                          5                             6
    const pattern = String('\ufeffData operacji;Rodzaj;Wartość;Waluta;Saldo dostępne po operacji;Saldo zablokowane po operacji;Saldo całkowite po operacji;');
    const pattern2 = String('Data operacji;Rodzaj;Wartość;Waluta;Saldo dostępne po operacji;Saldo zablokowane po operacji;Saldo całkowite po operacji;');
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

function getBitbayOperationType(type) {
    switch (type) {
    case 'Wpłata na rachunek':
    case 'Wypłata środków':
        return 'transfer';
    case 'Pobranie środków z transakcji z rachunku':
    case 'Otrzymanie środków z transakcji na rachunek':
    case 'Pobranie prowizji za transakcję':
        return 'trade';
    case 'Utworzenie rachunku':
    case 'Blokada środków':
    case 'Zwrot za usunięcie oferty na rachunek':
    case 'Blokada środków na rachunku':
    case 'Anulowanie oferty poniżej wartości minimalnych':
        return 'ignore';
    // case 'Pobranie prowizji za transakcję':
    //     console.warn('Nie uwzgledniam prowizji');
    //     return 'ignore';
    default:
        return type;
    }
}
function orderDataTrades(data_trades) {
    const data_trades_ordered = [];
    if (data_trades.length < 1) {
        return data_trades_ordered;
    }
    // console.table('data_trades', Object.assign({}, data_trades));
    data_trades.sort((a, b) => utils.comapreObjectsByFields(a, b, ['date', 'rawType', 'amount']));
    console.table('data_trades-sorted', Object.assign({}, data_trades));
    function pickFirst(list, date, type) {
        let result = false;
        list.find((el, i) => {
            // if (date) {
            //     if (el.date !== date) {
            //         return false;
            //     }
            // }
            if (el.rawType !== type) {
                return false;
            }
            result = el;
            list.splice(i, 1);
            return true;
        });
        return result;
    }
    function pickPacket(pobrano) {
        const otrzymano = pickFirst(data_trades, pobrano.date, 'Otrzymanie środków z transakcji na rachunek');
        const prowizja = pickFirst(data_trades, pobrano.date, 'Pobranie prowizji za transakcję');
        if (!otrzymano) {
            console.error('Brak spasowania wpisu "otrzymano" dla "pobrano"', pobrano);
            throw new Error('Brak spasowania wpisu "otrzymano" dla "pobrano"');
        }
        data_trades_ordered.push(pobrano);
        data_trades_ordered.push(otrzymano);
        if (prowizja) {
            data_trades_ordered.push(prowizja);
        }
    }
    let pobranoFirst = pickFirst(data_trades, false, 'Pobranie środków z transakcji z rachunku');
    // debugger;
    while (pobranoFirst) {
        pickPacket(pobranoFirst);
        pobranoFirst = pickFirst(data_trades, false, 'Pobranie środków z transakcji z rachunku');
    }
    return data_trades_ordered;
}
function getOperations(file) {
    const operations = [];
    const data = file.data;
    let operation = {};
    let i = 0;
    const data_transfers = [];
    let data_trades = [];
    let from,
        record,
        to;
    for (i = 1; i < data.length; i += 1) {
        record = {};
        record.rawCSVLine = data[i];
        record.rawCSVLineNo = i;
        record.rawType = record.rawCSVLine[1];
        record.type = getBitbayOperationType(record.rawCSVLine[1]);
        record.date = bitbayDate2ISODate(record.rawCSVLine[0]);
        record.amount = parseFloat(record.rawCSVLine[2]);
        if (record.rawType === 'Pobranie środków z transakcji z rachunku' || record.rawType === 'Pobranie prowizji za transakcję') {
            record.amount *= -1;
        }
        record.currency = record.rawCSVLine[3];
        record.asset = record.currency;
        record.sourcefile = file;

        switch (record.type) {
        case 'transfer':
            data_transfers.push(record);
            break;
        case 'trade':
            record.loc = 'bitbay.net';
            data_trades.push(record);
            break;
        default:
            Error('Unknown type');
        }
    }
    for (i = 0; i < data_transfers.length; i += 1) {
        record = data_transfers[i];

        if (record.amount < 0) {
            record.amount *= -1;
            record.transferType = 'withdraw';
            from = {
                loc: 'bitbay.net',
                amount: record.amount,
                currency: record.currency,
                asset: record.currency
            };
            to = {
                loc: 'wallet',
                amount: record.amount,
                currency: record.currency,
                asset: record.currency
            };
        } else {
            record.transferType = 'deposit';
            from = {
                loc: 'wallet',
                amount: record.amount,
                currency: record.currency,
                asset: record.currency
            };
            to = {
                loc: 'bitbay.net',
                amount: record.amount,
                currency: record.currency,
                asset: record.currency
            };
        }
        operation = {
            sourcefile: file,
            recordRaw: record,
            // rawCSVLineNo: record.rawCSVLineNo,
            date: record.date,
            timestamp: Date.parse(record.date),
            type: record.transferType,
            ex: 'bitbay.net',
            from: from,
            to: to
        };
        operations.push(operation);
    }

    data_trades = orderDataTrades(data_trades);
    for (i = 0; i < data_trades.length; i += 2) {
        from = data_trades[i];
        to = data_trades[i + 1];
        let fee = data_trades[i + 2];
        if (fee.rawType === 'Pobranie prowizji za transakcję') {
            i += 1;
        } else {
            fee = false;
        }
        if (fee) {
            if (fee.asset === from.asset) {
                from.amount += fee.amount;
            } else if (fee.asset === to.asset) {
                to.amount -= fee.amount;
            } else {
                console.error('Prowizja pobrana w walucje z poza transakcji', fee, 'transakcja', from, to, fee.asset, from.asset, to.asset);
            }
        }
        if (from.rawCSVLine[1] !== 'Pobranie środków z transakcji z rachunku' || to.rawCSVLine[1] !== 'Otrzymanie środków z transakcji na rachunek') {
            console.error('Blad spasowania transakcji', from, to);
            throw new Error('Blad spasowania transakcji', from, to);
        }
        if (from.amount < 0) {
            console.error('Ujemne saldo zrodla wymiany', from);
            throw new Error('Ujemne saldo zrodla wymiany');
        }
        // if (from.date !== to.date) {
        //     console.error('Missmatch dates in transaction', from, to);
        //     throw new Error('Missmatch dates in transaction', from, to);
        // }
        operation = {
            sourcefile: file,
            date: from.date,
            timestamp: Date.parse(from.date),
            recordRaw: from,
            type: 'trade',
            ex: 'bitbay.net',
            from: from,
            to: to
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
