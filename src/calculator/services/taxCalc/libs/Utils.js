const rgb = require('hsv-rgb');
const crypto = require('crypto');
const CONFIG = {
    seed: '',
    filenamePrefix: 'bitcointaxer',
    features: {
        devTools: true,
        operationTable: true,
        summary: true,
        unknownAssets: false,
        annualUnknownAssets: true,
        priceLoader: true,
        charts: false,
        stocktaking: true,
        priceTable: true,
        trackCoins: false,
        demoSeal: false,
        splitIntoContracts: false,
        stocktakingNOW: false,
        dummy: 'foo'
    },
    calculatorFeatures: {
        fixupResidenceCurrencyCostBasis: true,
        showFine: false
    },
    testcaseFile: '/tests/testcase_11.csv',
    priceServerAddress: 'https://newio01.priceserver.bitcointaxer.org:8088'
};
const assetsConfig = {
    LTC: {
        weight: 1,
        color: '#9e9e9e',
        type: 'cryptocurrency',
        name: 'litecoin',
        iso: 'LTC',
        addressFilter: /[LM3][a-km-zA-HJ-NP-Z1-9]{26,33}/,
        blockchain: 'Litecoin blockchain',
        blockchainAddressPrelink: 'http://explorer.litecoin.net/address/',
        blockchainTxPrelink: 'http://explorer.litecoin.net/tx/',
        priceHistoryAdapter: ['coinmarketcap'],
        decimalPlaces: 8
    },
    BTC: {
        weight: 0,
        color: '#f9a642',
        type: 'cryptocurrency',
        name: 'bitcoin',
        iso: 'BTC',
        blockchain: 'Bitcoin blockchain',
        addressFilter: /(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}/,
        blockchainAddressPrelink: 'https://blockchain.info/address/',
        blockchainTxPrelink: 'https://blockchain.info/tx/',
        priceHistoryAdapter: ['coinmarketcap'],
        decimalPlaces: 8
    },
    DOGE: {
        weight: 2,
        color: '#c2a633',
        type: 'cryptocurrency',
        name: 'dogecoin',
        iso: 'DOGE',
        blockchain: 'Dogecoin blockchain',
        addressFilter: /D{1}[5-9A-HJ-NP-U]{1}[1-9A-HJ-NP-Za-km-z]{32}/,
        blockchainAddressPrelink: 'https://dogechain.info/address/',
        blockchainTxPrelink: 'https://dogechain.info/tx/',
        priceHistoryAdapter: ['coinmarketcap'],
        decimalPlaces: 0
    },
    LSK: {
        weight: 2,
        color: '#1a6896',
        type: 'cryptocurrency',
        name: 'lisk',
        iso: 'LSK',
        blockchain: 'Lisk blockchain',
        addressFilter: /[0-9]+L/,
        blockchainAddressPrelink: 'https://explorer.lisk.io/address/',
        blockchainTxPrelink: 'https://explorer.lisk.io/tx/',
        priceHistoryAdapter: ['coinmarketcap'],
        decimalPlaces: 8
    },
    ETH: {
        weight: 1,
        color: '#7886cd',
        type: 'cryptocurrency',
        name: 'ethereum',
        iso: 'ETH',
        blockchain: 'Ethereum blockchain',
        addressFilter: /(0x)?[a-fA-F0-9]{40}/,
        blockchainAddressPrelink: 'https://www.etherchain.org/account/',
        blockchainTxPrelink: 'https://www.etherchain.org/tx/',
        priceHistoryAdapter: ['coinmarketcap'],
        decimalPlaces: 8
    },
    PLN: {
        weight: -10,
        color: '#ee6666',
        type: 'fiat',
        name: 'polishzloty',
        iso: 'PLN',
        blockchain: 'Documents',
        priceHistoryAdapter: [1],
        decimalPlaces: 2
    },
    USD: {
        weight: -20,
        color: '#606a45',
        type: 'fiat',
        name: 'usdolar',
        iso: 'USD',
        blockchain: 'Documents',
        priceHistoryAdapter: ['nbp'],
        decimalPlaces: 2
    },
    EUR: {
        weight: -20,
        color: '#003984',
        type: 'fiat',
        name: 'euro',
        iso: 'EUR',
        blockchain: 'Documents',
        priceHistoryAdapter: ['nbp'],
        decimalPlaces: 2
    },
    CAD: {
        weight: -15,
        color: '#BB9AA0',
        type: 'fiat',
        name: 'cad-dolar',
        iso: 'CAD',
        blockchain: 'Documents',
        priceHistoryAdapter: ['nbp'],
        decimalPlaces: 2
    }
};
const baseConfig = {
    us_usd: {
        key: 'us-usd',
        country: 'United States of America',
        name: 'United States of America (USD)',
        iso: 'USD'
    },
    ca_cad: {
        key: 'ca-cad',
        country: 'Canada',
        name: 'Canada (CAD)',
        iso: 'CAD'
    },
    uk_gbp: {
        key: 'uk-gbp',
        country: 'United Kingdom',
        name: 'United Kingdom (GBP)',
        curr_name: 'Pound sterling',
        iso: 'GBP'
    },
    de_eur: {
        key: 'de-eur',
        country: 'Germany',
        name: 'Germany (EUR)',
        iso: 'EUR'
    },
    fr_eur: {
        key: 'fr-eur',
        country: 'France',
        name: 'France (EUR)',
        iso: 'EUR'
    },
    se_sek: {
        key: 'se-sek',
        country: 'Kingdom of Sweden',
        name: 'Kingdom of Sweden (SEK)',
        curr_name: 'Euro',
        iso: 'SEK'
    },
    dk_dkk: {
        key: 'dk-dkk',
        country: 'Denmark',
        name: 'Denmark (DKK)',
        curr_name: 'Danish krone',
        iso: 'DKK'
    },
    pl_pln: {
        key: 'pl-pln',
        country: 'Poland',
        name: 'Poland (PLN)',
        iso: 'PLN'
    },
    ru_rub: {
        key: 'ru-rub',
        country: 'Russian Federation',
        name: 'Russian Federation (RUB)',
        iso: 'RUB'
    },
    au_aud: {
        key: 'au-aud',
        country: 'Australia',
        name: 'Australia (AUD)',
        iso: 'AUD'
    },
    global_btc: {
        key: 'global-btc',
        country: 'Global',
        name: 'Global (BTC)',
        iso: 'BTC'
    }
};
const antColors = [
    'red',
    'volcano',
    'orange',
    'gold',
    'yellow',
    'lime',
    'green',
    'cyan',
    'blue',
    // 'geekblue',
    'purple',
    'magneta'

    // 'grey',
    // 'color',

    // 'blue',
    // 'green',
    // 'gold',
    // 'red',
];
window.antColors = antColors;

function colorOfHash(obj, seed) {
    const secret = JSON.stringify(obj) + seed;
    const random = parseInt(`0x${crypto.createHmac('sha256', secret).update('I love csupcak2dsaeks').digest('hex').substr(0, 4)}`, 16) / Math.pow(16, 4);
    const randomColor = rgb(360 * random, 70, 70);
    const color = {
        r: randomColor[0],
        g: randomColor[1],
        b: randomColor[2],
        a: 1
    };
    return `rgba(${color.r},${color.g},${color.b},${color.a})`;
}
window.colorOfHash = colorOfHash;

function comapreObjectsByFields(a, b, fields) {
    // debugger;
    let firstCompareResult = 0,
        i = 0;
    function compareByField(field) {
        // a, b,
        let compareResult = 0;
        if (!a || !b) {
            return false;
        }
        if (a[field] < b[field]) {
            compareResult = 1;
        }
        if (a[field] > b[field]) {
            compareResult = -1;
        }
        return compareResult;
    }

    for (i = 0; i < fields.length && !firstCompareResult; i += 1) {
        const field = fields[i];
        if (typeof field === 'function') {
            firstCompareResult = field(a, b);
        } else {
            firstCompareResult = compareByField(fields[i]); // a, b,
        }
    }
    return firstCompareResult;
}

function getBaseConfig() {
    return baseConfig;
}
function getTaxResidenceConfig(taxResidence) {
    let taxResidenceConfig = false;
    Object.keys(baseConfig).forEach(configKey => {
        if (baseConfig[configKey].key === taxResidence) {
            taxResidenceConfig = baseConfig[configKey];
        }
    });
    return taxResidenceConfig;
}

function getTaxResidenceCurrency(taxResidence) {
    const taxResidenceConfig = getTaxResidenceConfig(taxResidence);
    return taxResidenceConfig.iso;
}
const operationConfig = {
    transfer: {
        type: 'transfer',
        taxable: false
    },
    trade: {
        type: 'trade',
        taxable: true
    }
};

// Number.prototype.format(n, x, s, c),
// @param integer n: length of decimal,
// @param integer x: length of whole part,
// @param mixed   s: sections delimiter,
// @param mixed   c: decimal delimiter
function format(value, n, x, s, c) {
    if (!value) {
        return String(value);
    }
    //  \/ fix small amounts
    // const decimalPlaces = (-Math.floor(Math.log10(Math.abs(parseFloat(value)))));
    // if (decimalPlaces > 0) {
    //     n -= decimalPlaces;
    // }

    if (typeof value.toFixed === 'function') {
        const num = value.toFixed(Math.max(0, ~~n)),
            re = `\\d(?=(\\d{${x || 3}})+${n > 0 ? '\\D' : '$'})`;
        return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), `$&${s || ''}`);
    }
    return value;
}
window.format = format;
function sortAssetsByWeight(assets) {
    return assets.sort((a, b) => a.weight - b.weight);
}

function getOperationConfig(operationType) {
    return (
        operationConfig[operationType] || {
            type: operationType,
            taxable: false,
            effType: 'unknown'
        }
    );
}
function stringLike(string, like) {
    const likeLength = String(like).length;
    return String(string).substring(0, likeLength) === like;
}
window.stringLike = stringLike;

function getAssetConfig(currency) {
    let assetConfig = assetsConfig[currency];
    if (!assetConfig) {
        const fiatRresitences = getBaseConfig();
        Object.values(fiatRresitences).forEach(residence => {
            if (residence.iso === currency) {
                assetConfig = {
                    weight: 15,
                    key: residence.ley,
                    name: residence.name,
                    isoshort: currency,
                    color: '#222',
                    priceHistoryAdapter: ['nbp.pl'],
                    decimalPlaces: 2,
                    type: 'fiat'
                };
            }
        });
    }
    if (!assetConfig) {
        assetConfig = {
            weight: 997,
            key: currency,
            name: currency,
            isoshort: currency,
            color: '#111',
            priceHistoryAdapter: [],
            decimalPlaces: 8,
            type: 'cryptocurrency'
        };
    }
    return assetConfig;
}
window.getAssetConfig = getAssetConfig;

function getAssets(assetList, sortType) {
    assetList.forEach((value, key) => {
        if (typeof value === 'string') {
            assetList[key] = getAssetConfig(value);
        }
    });
    switch (sortType) {
        default:
        case 'asc':
            assetList = sortAssetsByWeight(assetList);
    }
    return assetList;
}

window.getAssets = getAssets;
function getBlockchainLink(asset, address, tx) {
    const cConfig = getAssetConfig(asset);

    if (tx && cConfig.blockchainTxPrelink) {
        return cConfig.blockchainTxPrelink + tx;
    }
    if (address && cConfig.blockchainAddressPrelink) {
        return cConfig.blockchainAddressPrelink + address;
    }
    return address || tx || 'unknown address or transaction id';
}

function getOperationSymbol(operation) {
    switch (operation.type) {
        case 'contract':
            return '⇋';
        case 'trade':
            return '⇌';
        case 'atomic-swap':
            return '⇉';
        case 'transfer':
        case 'deposit':
        case 'withdraw':
            return '→';
        default:
            return '?';
    }
}
function getInventorySortFunction(currentQueueMethod) {
    let result = false;
    switch (currentQueueMethod) {
        case 'FIFO':
            result = (a, b) => comapreObjectsByFields(a, b, ['date', 'timestamp', 'operationNo', 'rawCSVLineNo']);
            break;
        case 'LIFO':
            result = (a, b) => -1 * comapreObjectsByFields(a, b, ['date', 'timestamp', 'operationNo', 'rawCSVLineNo']);
            break;
        case 'HIFO':
            result = (a, b) => -1 * comapreObjectsByFields(a, b, ['rate', 'date', 'timestamp', 'operationNo', 'rawCSVLineNo']); // a.rate - b.rate;
            break;
        case 'LoIFO':
            result = (a, b) => comapreObjectsByFields(a, b, ['rate', 'date', 'timestamp', 'operationNo', 'rawCSVLineNo']); // b.rate - a.rate;
            break;
        case 'AVG':
            result = (a, b) => comapreObjectsByFields(a, b, ['date', 'timestamp', 'operationNo', 'rawCSVLineNo']);
            break;
        default:
            throw new Error(`Unknown currentQueueMethod: ${currentQueueMethod}`);
    }
    return result;
}

function getSortCostsFunction(setup) {
    const defaultSortFunction = getInventorySortFunction(setup.queueMethod);
    return function sortCosts(costA, costB) {
        if (costA.asset !== costB.asset) {
            const assetConfigA = getAssetConfig(costA.asset);
            const assetConfigB = getAssetConfig(costB.asset);
            if (assetConfigA.weight !== assetConfigB.weight) {
                return assetConfigA.weight - assetConfigB.weight;
            }
            if (costA.asset > costB.asset) {
                return 1;
            }
            return -1;
        }
        if (setup.trackLocations) {
            if (costA.loc > costB.loc) {
                return 1;
            }
            if (costA.loc < costB.loc) {
                return -1;
            }
        }
        const defaultOrder = defaultSortFunction(costA, costB);
        if (defaultOrder > 0) {
            return -1;
        }
        if (defaultOrder < 0) {
            return 1;
        }
        return 0;
    };
}
function sortArrByAsset(elA, elB) {
    const assetA = getAssetConfig(elA.asset);
    const assetB = getAssetConfig(elB.asset);
    const result = assetA.weight - assetB.weight;
    return result;
}
function sortAssetsByTypeAndWeight(assetA, assetB) {
    return assetA.weight - assetB.weight;
}
function timestamp2dateObj(timestamp) {
    const jsTimestamp = Math.trunc(timestamp);
    const date = new Date(jsTimestamp);
    const oNo = Math.abs(timestamp - jsTimestamp);

    const dateObj = {
        yyyy: date.getFullYear(),
        mm: String(`0${date.getMonth() + 1}`).substr(-2),
        dd: String(`0${date.getDate()}`).substr(-2),
        hh: String(`0${date.getHours()}`).substr(-2),
        ii: String(`0${date.getMinutes()}`).substr(-2),
        ss: String(`0${date.getSeconds()}`).substr(-2),
        ms: String(`00${date.getMilliseconds()}`).substr(-3),
        no: oNo
    };
    return dateObj;
}
function timestamp2dateStr(timestamp) {
    const dateObj = timestamp2dateObj(timestamp);
    return `${dateObj.yyyy}-${dateObj.mm}-${dateObj.dd} ${dateObj.hh}:${dateObj.ii}:${dateObj.ss}:${dateObj.ms}`;
}
function ccValue(v) {
    return Math.round(v * 100000000) / 100000000;
}
const padAsset = 16;

function fiatValue(v) {
    let n = 2;
    const decimalPlaces = -Math.floor(Math.log10(Math.abs(parseFloat(v))));
    if (decimalPlaces > 0) {
        n += decimalPlaces;
    }

    let result = parseFloat(v).toFixed(n);
    if (result.length < padAsset) {
        result = result.padStart(padAsset, ' ');
    }
    return result;
}

function autoValue(v, currency) {
    const type = (assetsConfig[currency] && assetsConfig[currency].type) || 'unknown';
    if (!v) {
        return 0;
    }
    switch (type) {
        case 'cryptocurrency':
            return ccValue(v);
        case 'fiat':
            return fiatValue(v);
        default:
            return v;
    }
}
const utils = {
    autoValue,
    comapreObjectsByFields,
    CONFIG,
    sortArrByAsset,
    sortAssetsByTypeAndWeight,
    colorOfHash,
    getAssetConfig,
    getOperationConfig,
    getBlockchainLink,
    format,
    getAssets,
    getOperationSymbol,
    stringLike,
    getBaseConfig,
    getTaxResidenceConfig,
    getTaxResidenceCurrency,
    timestamp2dateObj,
    timestamp2dateStr
};
window.utils = utils;

export {
    autoValue,
    getSortCostsFunction,
    getInventorySortFunction,
    comapreObjectsByFields,
    CONFIG,
    sortArrByAsset,
    sortAssetsByTypeAndWeight,
    colorOfHash,
    getAssetConfig,
    getOperationConfig,
    getBlockchainLink,
    format,
    getAssets,
    getOperationSymbol,
    stringLike,
    getBaseConfig,
    getTaxResidenceConfig,
    getTaxResidenceCurrency,
    timestamp2dateObj,
    timestamp2dateStr
};
