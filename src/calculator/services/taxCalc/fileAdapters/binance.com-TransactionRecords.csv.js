import moment from 'moment';

const domain = 'binance.com';
const adapter = 'TransactionRecords.csv';
const location = 'binance.com';

const parseConfig = {
    type: 'csv',
    delimiter: ','
};

function match(file) {
    const pattern = '"User_ID","UTC_Time","Account","Operation","Coin","Change","Remark"';
    return file.detectedFiletype === 'csv' && file.content.startsWith(pattern);
}
function pickFirstFromGroup(group, type) {
    const foundIndex = group.findIndex(item => !type || item._type === type);
    if (foundIndex !== -1) {
        const foundItem = group[foundIndex];
        group.splice(foundIndex, 1);
        return foundItem;
    }
    return null;
}

function getOperationType(entry) {
    // ignore other that spot and funding (excluding margin trading accounts)
    if (!['Spot', 'Funding'].includes(entry.account)) {
        return 'ignore';
    }
    switch (entry.operation) {
        case 'Deposit':
        case 'Crypto Box':
            return 'deposit';
        case 'Withdraw':
            return 'withdraw';
        case 'Transaction Buy':
        case 'Transaction Revenue':
            return 'buy';
        case 'Transaction Spend':
        case 'Transaction Sold':
            return 'spend';
        case 'Transaction Fee':
            return 'fee';
        case 'Binance Convert':
        case 'Small Assets Exchange BNB':
            return entry.amount > 0 ? 'buy' : 'spend';
        case 'Transfer Between Main Account/Futures and Margin Account':
        case 'Isolated Margin Loan':
        case 'Isolated Margin Repayment':
        case 'BNB Fee Deduction':
        case 'Margin Fee':
        case 'Isolated Margin Liquidation - Fee':
        case 'Cross Margin Liquidation - Repayment':
        case 'Cross Margin Liquidation - Small Assets Takeover':
        case 'Asset Recovery':
            // TODO: ADD MARGIN TRADING - withdraws to margin account are considered as trades
            return 'ignore';

        default:
            console.error('Unknown operation type:', entry);
            debugger;
            return 'unknown';
    }
}

function groupByTime(data) {
    const groups = {};
    for (let i = 1; i < data.length; i++) {
        const row = data[i];
        const utcTime = row[1];
        if (!groups[utcTime]) {
            groups[utcTime] = [];
        }
        const [
            // eslint-disable-next-line no-unused-vars
            userId,
            // eslint-disable-next-line no-unused-vars
            utcTimex,
            // eslint-disable-next-line no-unused-vars
            account,
            operation,
            coin,
            change,
            // eslint-disable-next-line no-unused-vars
            remark
        ] = row;
        const date = moment.utc(utcTimex).format('YYYY-MM-DD HH:mm:ss');
        const timestamp = moment.utc(date).valueOf();
        const amount = parseFloat(change);

        const entry = {
            userId,
            utcTimex,
            account,
            operation,
            coin,
            change,
            remark,
            date,
            timestamp,
            amount
        };
        console.log('entry', entry);
        entry._type = getOperationType(entry);
        if (entry._type === 'ignore') {
            continue;
        }
        groups[utcTime].push(entry);
    }
    for (const utcTime of Object.keys(groups)) {
        groups[utcTime].sort((a, b) => {
            if (a.account !== b.account) {
                return a.account.localeCompare(b.account);
            }
            if (a.operation !== b.operation) {
                return a.operation.localeCompare(b.operation);
            }
            if (a.coin !== b.coin) {
                return a.coin.localeCompare(b.coin);
            }
            if (a.amount !== b.amount) {
                return Math.abs(a.amount) - Math.abs(b.amount);
            }
            return 0;
        });
    }
    return groups;
}

function getOperations(file) {
    const operations = [];
    const groups = groupByTime(file.data);
    let moveToNextGroup = null;
    Object.keys(groups).forEach(utcTime => {
        const group = groups[utcTime];
        while (group.length > 0) {
            if (moveToNextGroup) {
                group.push(moveToNextGroup);
                moveToNextGroup = null;
            }
            const firstEntry = pickFirstFromGroup(group, false);
            if (firstEntry._type === 'withdraw') {
                const operation = {
                    date: firstEntry.date,
                    timestamp: firstEntry.timestamp,
                    type: 'withdraw',
                    from: {
                        loc: location,
                        asset: firstEntry.coin,
                        amount: -firstEntry.amount
                    },
                    to: {
                        loc: 'wallet',
                        asset: firstEntry.coin,
                        amount: -firstEntry.amount
                    },
                    recordRaw: firstEntry,
                    sourcefile: file
                };
                operations.push(operation);
                continue;
            }
            if (firstEntry._type === 'deposit') {
                const operation = {
                    date: firstEntry.date,
                    timestamp: firstEntry.timestamp,
                    type: 'deposit',
                    from: {
                        loc: 'wallet',
                        asset: firstEntry.coin,
                        amount: firstEntry.amount
                    },
                    to: {
                        loc: location,
                        asset: firstEntry.coin,
                        amount: firstEntry.amount
                    },
                    recordRaw: firstEntry,
                    sourcefile: file
                };
                operations.push(operation);
                continue;
            }
            const tradeTypes = ['buy', 'spend', 'fee'];
            if (tradeTypes.includes(firstEntry._type)) {
                console.log('GROUP', JSON.parse(JSON.stringify(group)));
                const missingTypes = tradeTypes.filter(type => firstEntry._type !== type);
                let buyEntry = null;
                let spendEntry = null;
                let feeEntry = null;
                if (firstEntry._type === 'buy') {
                    buyEntry = firstEntry;
                } else if (firstEntry._type === 'spend') {
                    spendEntry = firstEntry;
                } else if (firstEntry._type === 'fee') {
                    feeEntry = firstEntry;
                }
                if (missingTypes.includes('buy')) {
                    buyEntry = pickFirstFromGroup(group, 'buy');
                }
                if (missingTypes.includes('spend')) {
                    spendEntry = pickFirstFromGroup(group, 'spend');
                }
                if (missingTypes.includes('fee')) {
                    feeEntry = pickFirstFromGroup(group, 'fee');
                }
                if (!buyEntry || !spendEntry) {
                    console.warn('missing buy or spend entry', firstEntry, buyEntry, spendEntry);
                    moveToNextGroup = buyEntry || spendEntry;
                    continue;
                }
                const operation = {
                    date: firstEntry.date,
                    timestamp: firstEntry.timestamp,
                    type: 'trade',
                    from: {
                        loc: location,
                        asset: spendEntry.coin,
                        amount: Math.abs(spendEntry.amount)
                    },
                    to: {
                        loc: location,
                        asset: buyEntry.coin,
                        amount: Math.abs(buyEntry.amount)
                    },
                    fee: feeEntry && {
                        loc: location,
                        asset: feeEntry.coin,
                        amount: Math.abs(feeEntry.amount)
                    },
                    recordRaw: [firstEntry, buyEntry, spendEntry, feeEntry],
                    sourcefile: file
                };
                operations.push(operation);
                continue;
            }
            console.warn('unknown operation type', firstEntry);
        }
    });
    console.log('operations', operations);
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
