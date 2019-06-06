import Eventsmanager from './Eventsmanager';
import {CONFIG} from './Utils';

class User extends Eventsmanager {
    getLocaleLocationDefault() {
        const lang = (navigator.language || navigator.browserLanguage).toLowerCase();
        const ln = lang.substr(0, 2);
        const ct = lang.substr(3);
        if (ct) {
            switch (ct) {
            case 'us':
                return 'us';
            case 'pl':
                return 'pl';
            case 'ca':
                return 'ca';
            case 'uk':
                return 'uk';
            case 'de':
                return 'de';
            case 'fr':
                return 'fr';
            case 'se':
                return 'se';
            case 'dk':
                return 'dk';
            case 'au':
                return 'au';
            case 'ru':
                return 'ru';
            default:
            }
        }
        if (ln) {
            switch (ln) {
            case 'en':
                return 'us';
                // return 'uk';
                // return 'au';
                // return 'ca';
            case 'pl':
                return 'pl';
            case 'de':
                return 'de';
            case 'fr':
                return 'fr';
            case 'sv':
                return 'se';
            case 'da':
                return 'dk';
            case 'ru':
                return 'ru';
            default:
            }
        }
        return 'global';
    }
    getLocaleCurrencyDefault() {
        const location = this.getLocaleLocationDefault();
        switch (location) {
        case 'us':
            return 'usd';
        case 'pl':
            return 'pln';
        case 'ca':
            return 'cad';
        case 'uk':
            return 'gbp';
        case 'de':
            return 'eur';
        case 'fr':
            return 'eur';
        case 'se':
            return 'sek';
        case 'dk':
            return 'dkk';
        case 'au':
            return 'aud';
        case 'ru':
            return 'rub';
        default:
        }
        return 'btc';
    }
    getLocaleLanguageDefault() {
        const lang = (navigator.language || navigator.browserLanguage).toLowerCase();
        const ln = lang.substr(0, 2);
        return ln;
    }
    getDefaultCalculatorSetupDefault() {
        const taxResidence = this.getResidence();
        let cryptoToCryptoTaxableFromValuationThreshold = 0;
        if (taxResidence === 'pl-pln') {
            cryptoToCryptoTaxableFromValuationThreshold = 2280;
        }
        const defaultCalculatorSetup = {
            sourcefile: {
                uid: 'test',
                filename: 'script',
                type: 'eval',
                contentHash: ''
            },
            key: '1000-01-01_00:00:00_000_INIT_CONF',
            date: '1000-01-01 00:00:00',
            timestamp: Date.parse('1000-01-01 00:00:00'),
            type: 'setup',
            dataSource: {
                type: 'system'
            },
            setup: {
                taxResidence: taxResidence,
                queueMethod: 'FIFO',
                trackLocations: true,
                longTermBuckets: [],
                activityType: 'personal', // business
                cryptoToCryptoTaxable: true,
                cryptoToCryptoTaxableFromValuationThreshold: cryptoToCryptoTaxableFromValuationThreshold,
                // splitOperationIntoContracts: true,
                // splitOperationIntoContractsUpToValue: 49,
                valuationSetup: {
                    valuationPriceServer: CONFIG.priceServerAddress,
                    valuationPrice: ['low'],
                    valuationSide: ['_01residence_side', '_02fiat_side', '_03lower_side', '_05base_asset'],
                    valuationStrategy: ['_01nbp.pl', '_02cryptocompare.com', '_03coinpaprika.com'],
                    valuationCTCDiscount: 0
                }
            }
        };
        return defaultCalculatorSetup;
    }

    constructor(config) {
        super();
        if (!config) {
            config = {};
        }
        this.localeLanguage = config.localeLanguage || this.getLocaleLanguageDefault();
        this.userName = 'Anonymous';
        this.location = config.location || this.getLocaleLocationDefault();
        this.currency = config.currency || this.getLocaleCurrencyDefault();
        this.residence = `${this.location}-${this.currency}`;
        this.defaultCalculatorSetup = config.calculatorSetup || this.getDefaultCalculatorSetupDefault();
    }

    getLocaleLanguage() {
        return this.localeLanguage;
    }
    getResidence() {
        return this.residence;
    }
    getDefaultCalculatorSetup() {
        return this.defaultCalculatorSetup;
    }
    getUserName() {
        return this.userName;
    }
}

export default User;
