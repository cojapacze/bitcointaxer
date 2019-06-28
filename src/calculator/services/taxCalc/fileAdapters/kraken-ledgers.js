// https://support.kraken.com/hc/en-us/articles/360001169383-Explanation-of-Ledger-Fields
// https://support.kraken.com/hc/en-us/articles/115000302707-Ledgers-vs-Trades-Data
// https://support.kraken.com/hc/en-us/articles/360000678446-Digital-assets-and-cryptocurrencies-available-on-Kraken-and-their-currency-codes-
const domain = 'kraken.com';
const adapter = 'ledgers';

const parseConfig = {
    type: 'csv',
    delimiter: ','
};

function match(file) {
    //                0      1       2      3      4        5       6        7     8
    const pattern = '"txid","refid","time","type","aclass","asset","amount","fee","balance"';
    if (file.content.substr(0, pattern.length) === pattern) {
        return true;
    }
    return false;
}

function krakenCurrency2ISO(krakenCurrency) {
    const krakenCurrency2ISOMap = {
        // KRAKEN TO ISO MAP
        // https://support.kraken.com/hc/en-us/articles/360001185506-Asset-Codes
        ADA: {
            iso: 'ADA',
            name: 'Cardano',
            type: 'Cryptocurrency'
        },
        BCH: {
            iso: 'BCH',
            name: 'Bitcoin Cash',
            type: 'Cryptocurrency'
        },		 
        BSV: {
            iso: 'BSV',
            name: 'Bitcoin SV',
            type: 'Cryptocurrency'
        },	
        DASH: {
            iso: 'DASH',
            name: 'DASH',
            type: 'Cryptocurrency'
        },	
        EOS: {
            iso: 'EOS',
            name: 'EOS',
            type: 'Cryptocurrency'
        },	
        GNO: {
            iso: 'GNO',
            name: 'Gnosis',
            type: 'Cryptocurrency'
        },
        QTUM: {
            iso: 'QTUM',
            name: 'QTUM',
            type: 'Cryptocurrency'
        },		
        USDT: {
            iso: 'USDT',
            name: 'Tether',
            type: 'Cryptocurrency'
        },
        XDAO: {
            iso: 'DAO', // not found on cmc
            name: 'DAO',
            type: 'Cryptocurrency',
            notes: 'delisted'
        },	
        XETC: {
            iso: 'ETC',
            name: 'Ethereum Classic',
            type: 'Cryptocurrency'
        },	
        XETH: {
            iso: 'ETH',
            name: 'Ethereum',
            type: 'Cryptocurrency'
        },	
        XLTC: {
            iso: 'LTC',
            name: 'Litecoin',
            type: 'Cryptocurrency'
        },	
        XMLN: {
            iso: 'MLN',
            name: 'Melon',
            type: 'Cryptocurrency'
        },	
        XNMC: {
            iso: 'NMC',
            name: 'Namecoin',
            type: 'Cryptocurrency',
            notes: 'delisted'
        },	
        XREP: {
            iso: 'REP',
            name: 'Augur',
            type: 'Cryptocurrency'
        },	
        XXVN: {
            iso: 'XVN', // not found on cmc
            name: 'Ven',
            type: 'Cryptocurrency',
            notes: 'delisted'
        },	
        XICN: {
            iso: 'ICN',
            name: 'Iconomi',
            type: 'Cryptocurrency',
            notes: 'delisted'
        },	
        XXBT: {
            iso: 'BTC',
            name: 'Bitcoin',
            type: 'Cryptocurrency'
        },	
        XXDG: {
            iso: 'DOGE',
            name: 'Dogecoin',
            type: 'Cryptocurrency'
        },	
        XXLM: {
            iso: 'XLM',
            name: 'Stellar Lumens',
            type: 'Cryptocurrency'
        },	
        XXMR: {
            iso: 'XMR',
            name: 'Monero',
            type: 'Cryptocurrency'
        },	
        XXTZ: {
            iso: 'XTZ',
            name: 'Tezos',
            type: 'Cryptocurrency'
        },	
        XXRP: {
            iso: 'XRP',
            name: 'Ripple',
            type: 'Cryptocurrency'
        },		
        XZEC: {
            iso: 'ZEC',
            name: 'Zcash',
            type: 'Cryptocurrency'
        },	
        ZCAD: {
            iso: 'CAD',
            name: 'Canadian dollar',
            type: 'Fiat currency'
        },	
        ZEUR: {
            iso: 'EUR',
            name: 'Euro',
            type: 'Fiat currency'
        },		
        ZGBP: {
            iso: 'GBP',
            name: 'Great British Pound',
            type: 'Fiat currency'
        },	
        ZJPY: {
            iso: 'JPY',
            name: 'Japanese Yen',
            type: 'Fiat currency'
        },	
        ZKRW: {
            iso: 'KRW',
            name: 'South Korean Won',
            type: 'Fiat currency',
            notes: 'no longer accepted'
        },	
        ZUSD: {
            iso: 'USD',
            name: 'US Dollar',
            type: 'Fiat currency'
        },	
        KFEE: {
            iso: 'KFEE',
            name: 'Kraken Fee Credits',
            type: 'Promotional Credit'
        }	

    };
    let isoCurrency = krakenCurrency2ISOMap[krakenCurrency];
    if (!isoCurrency) {
        console.warn('Can\'t find ISO representation of Kraken currency', krakenCurrency);
        isoCurrency = krakenCurrency;
    }
    return isoCurrency.iso;
}

function getOperations(file) {
    const operations = [];
    const data = file.data;
    // let operation = {};
    let fee, from, operation, record, recordA, recordB, to;
    let i = 0;
    const data_transfers = [];
    const data_trades = [];

    // sort record types
    for (i = 1; i < data.length; i += 1) {
        record = {};
        record.rawCSVLine = data[i];
        record.rawCSVLineNo = i;

        record.krakenTxid = record.rawCSVLine[0];
        record.refid = record.rawCSVLine[1];
        record.time = record.rawCSVLine[2];
        record.type = record.rawCSVLine[3];
        record.aclass = record.rawCSVLine[4];
        record.krakenAsset = record.rawCSVLine[5];
        record.amount = parseFloat(record.rawCSVLine[6]);
        record.fee = record.rawCSVLine[7];
        record.balance = record.rawCSVLine[7];

        record.date = record.time;
        record.currency = krakenCurrency2ISO(record.krakenAsset);
        record.asset = record.currency;
        record.file = file;
        record.line = i;
        switch (record.type) {
        case 'deposit':
        case 'withdrawal':
            if (record.krakenTxid) { // skip doubled deposits/withdrawals with empty txid
                data_transfers.push(record);    
            }
            break;
        case 'trade':
            record.loc = 'kraken.com';
            data_trades.push(record);
            break;
        default:
            Error(`Unknown record type: ${record.type}`);
        }
    }

    for (i = 0; i < data_transfers.length; i += 1) {
        record = data_transfers[i];

        if (record.amount < 0 && record.type === 'withdrawal') {
            record.amount *= -1;
            record.transferType = 'withdraw';
            from = {
                loc: 'kraken.com',
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
        } else if (record.amount > 0 && record.type === 'deposit') {
            record.transferType = 'deposit';
            from = {
                loc: 'wallet',
                amount: record.amount,
                currency: record.currency,
                asset: record.currency
            };
            to = {
                loc: 'kraken.com',
                amount: record.amount,
                currency: record.currency,
                asset: record.currency
            };
        } else {
            // console.log('Nieznany rekord', record);
            throw new Error('Nieznany rekord');
        }
        operation = {
            sourcefile: record.file,
            rawCSVLineNo: record.rawCSVLineNo,
            lines: record.lines,
            date: record.date,
            timestamp: Date.parse(record.date) - 1000 * 60 * 10,
            recordRaw: record,
            type: record.transferType,
            ex: 'kraken',
            amount: record.amount,
            currency: record.currency,
            from: from,
            to: to
        };
        operations.push(operation);
    }

    for (i = 0; i < data_trades.length; i += 2) {
        recordA = data_trades[i];
        recordB = data_trades[i + 1];
        fee = false;
        if (!recordA || !recordB) {
            console.error('Pozostał opuszczony rekord (bez spasowania)s', recordA, recordB);
            continue;
        }
        if (recordA.refid !== recordB.refid) {
            console.error('Blad spasowania rekordow', recordA, recordB);
            // throw new Error('Blad spasowania rekordow', recordA, recordB);
            i -= 1;
            continue;
        }
        // console.log('refid', recordA.refid, recordB.refid);
        // lookup for fee
        if (data_trades[i + 2]) {
            if (data_trades[i + 2].refid === recordA.refid) {
                fee = data_trades[i + 2];
                i += 1;
            } else {
                console.debug('!no fee');
            }    
        }
        // console.log('ignore fee', recordA.currency, recordB.currency, fee);
        if (recordA.type === 'trade' && recordA.amount < 0 && recordB.type === 'trade' && recordB.amount > 0) {
            from = recordA;
            from.amount *= -1;
            to = recordB;
        } else if (recordB.type === 'trade' && recordB.amount < 0 && recordA.type === 'trade' && recordA.amount > 0) {
            from = recordB;
            from.amount *= -1;
            to = recordA;
        } else {
            console.error('Blad spasowania transakcji', recordA, recordB);
            throw new Error('Blad spasowania transakcji', recordA, recordB);
        }
        operation = {
            sourcefile: from.file,
            rawCSVLineNo: recordA.rawCSVLineNo,
            recordRaw: from,
            line: from.line,
            date: from.date,
            timestamp: Date.parse(from.date) - 1000 * 60 * 10,
            type: 'trade',
            ex: 'kraken',
            fee: fee,
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

