import Eventsmanager from './Eventsmanager';
import User from './User';
import Calculator from './Calculator';
import Prices from './Prices';
import Console from './Console';
import DataStorage from './DataStorage';
import {stringLike, getAssetConfig, colorOfHash, timestamp2dateStr} from './Utils';

const crypto = require('crypto');
// const extend = require('extend-shallow');

class OperationQueue extends Eventsmanager {    
    lastModified = '';
    setModified(since) {
        if (since > this.lastModified || !this.lastModified) {
            this.lastModified = since;
        }
    }
    recalculateIfModified() {
        if (this.lastModified) {
            this.recalculateOperations();
            this.lastModified = '';
        }
    }
    config = {
        'ignore-duplicates-from-different-sources': false
    };
    tags = [];
    getTag(tag) {
        return this.tags.find(tagObj => tagObj.tag === tag);
    }
    enterTag(operation, tag) {
        const tagObj = this.getTag(tag);
        if (!tagObj) {
            this.tags.push({
                tag: tag,
                color: colorOfHash(tag),
                entranceOperation: operation
            });
            operation.entranceTags = tagObj;
            this.recalculateTags();
            operation.tags.push(tag);
        } else {
            this.console.warn(`Error, tag '${tag}' exists`);
        }
    }
    removeTag(tag) {
        this.tags = this.tags.filter(tagObj => tagObj.tag !== tag);
        this.recalculateTags();
    }
    recalculateTags() {
        this.recalculateOperationsIfModified();
    }
    getAnnualStatementYears = () => {
        let i;
        const annualStatementYears = [];
        window.annualStatementYears = annualStatementYears;
        function updateOperationAnnualYears(operation) {
            const year = parseInt(new Date(operation.timestamp).getFullYear(), 10);
            if (annualStatementYears.indexOf(year) === -1) {
                annualStatementYears.push(year);
            }
        }
        for (i = 0; i < this.operationQueueHistory.length; i += 1) {
            const operation = this.operationQueueHistory[i];
            updateOperationAnnualYears(operation);
        }
        annualStatementYears.sort();
        return annualStatementYears;
    }
    getFirstCalculator() {
        const annualStatementYears = this.getAnnualStatementYears();
        const firstYear = annualStatementYears[0];
        return this.calculators[firstYear];
    }

    getAnnualYearCalculator = year => this.calculators[year];

    constructor(config) {
        super();
        this.calculators = {};
        this.operationQueueHistory = [];
        this.operationCounter = 0;
        this.cursor = 0;

        if (!(config.user instanceof User)) {
            throw new Error('user is not instanceof User', config.user);
        }
        this.user = config.user;

        if (!(config.prices instanceof Prices)) {
            throw new Error('prices is not instanceof Prices', config.prices);
        }
        this.prices = config.prices;

        if (!(config.console instanceof Console)) {
            throw new Error('console is not instanceof Console', config.console);
        }
        this.console = config.console;

        if (!(config.storage instanceof DataStorage)) {
            throw new Error('storage is not instanceof DataStorage', config.storage);
        }
        this.storage = config.storage;

        this.on('change-currentOperation', record => {
            window.location.hash = record.key;
        });
        this.prices.on('operation-valuation-changed', e => {
            this.setModified(e.operationValuation.date);
        });

        window.onhashchange = () => {
            const currentOperation = this.getCurrent();
            const currentHash = document.location.hash.substr(1);
            if (currentOperation && currentOperation.key !== currentHash) {
                this.setCurrent(currentHash);
            }
        };
        // disable storage
        // this.on('operation-data-changed', operation => this.storage.storeOperation(this.operationData(operation)));
    }
    operationData(operation) {
        const operationData = {
            source: operation.sourcefile && {
                filename: operation.sourcefile.filename,
                type: operation.sourcefile.type,
                contentHash: operation.sourcefile.contentHash
            },
            type: operation.type,
            date: operation.date,
            timestamp: operation.timestamp,
            key: operation.key,
            // operation config
            // standard operation
            from: operation.from && {
                address: operation.from.address,
                loc: operation.from.loc,
                amount: operation.from.amount,
                asset: operation.from.asset
            },
            to: operation.to && {
                address: operation.to.address,
                loc: operation.to.loc,
                amount: operation.to.amount,
                asset: operation.to.asset
            },
            taxable: operation.taxable,
            valuation: operation.valuation && {
                asset: operation.valuation.asset, // tax residence currency
                custom: operation.valuation.custom,
                fromAssetValue: operation.valuation.fromAssetValue,
                toAssetValue: operation.valuation.toAssetValue,
                useBaseAssetValue: operation.valuation.useBaseAssetValue,
                useQuoteAssetValue: operation.valuation.useQuoteAssetValue,
                value: operation.valuation.value
            }
        };
        return operationData;
    }
    getOperations(filters) {
        let operations = this.operationQueueHistory;

        if (filters) {
            if (filters.year) {
                operations = operations.filter(operation => operation.taxYear === filters.year);
            }
            if (filters.noSummary) {
                operations = operations.filter(operation => operation.type !== 'summary');
            }
            if (filters.noSetup) {
                operations = operations.filter(operation => operation.type !== 'setup');
            }
        }
        return operations;
    }
    getFirstOperationByDate(date) {
        let found = false,
            i;
        for (i = 0; i < this.operationQueueHistory.length; i += 1) {
            found = stringLike(this.operationQueueHistory[i].date, date);
            if (found) {
                return this.operationQueueHistory[i];
            }
        }
        return found;
    }
    getOperationsByDate(date) {
        const result = [];
        this.operationQueueHistory.forEach(record => {
            if (stringLike(record.date, date)) {
                result.push(record);
            }
        });
        return result;
    }
    getOperationByKey(key) {
        let i;
        for (i = 0; i < this.operationQueueHistory.length; i += 1) {
            if (this.operationQueueHistory[i].key === key) {
                return this.operationQueueHistory[i];
            }
        }
        return false;
    }
    getOperation(key) {
        return this.operationQueueHistory.find(record => record.key === key);
    }

    setCurrentByDate(date) {
        const operation = this.getFirstOperationByDate(date);
        if (operation && operation !== this.getCurrent()) {
            this.setCurrent(operation.key);
        }
    }
    getCount() {
        return this.operationQueueHistory.length;
    }
    setCurrentVirtual(operation) {
        if (this.currentVirtual !== operation) {
            this.currentVirtual = operation;
        }
    }
    getCurrent() {
        if (this.currentVirtual) {
            return this.currentVirtual;
        }
        return this.operationQueueHistory[this.cursor];
    }
    setCurrent(operationKey) {
        this.currentVirtual = false;
        const currentOperation = this.getOperation(operationKey);
        if (currentOperation === this.getCurrent()) {
            return false;
        }
        this.cursor = this.operationQueueHistory.indexOf(currentOperation);
        if (this.operationQueueHistory[this.cursor]) {
            this.dispatch('change-currentOperation', this.operationQueueHistory[this.cursor], this.cursor);
        }
        
        return this.operationQueueHistory[this.cursor];
    }

    selectPrev() {
        if (this.cursor <= 0) {
            return false;
        }
        this.cursor--;
        if (this.operationQueueHistory[this.cursor]) {
            this.dispatch('change-currentOperation', this.operationQueueHistory[this.cursor], this.cursor);
        }
        return this.operationQueueHistory[this.cursor];
    }
    selectNext() {
        if (this.cursor >= (this.operationQueueHistory.length - 1)) {
            return false;
        }
        this.cursor++;
        if (this.operationQueueHistory[this.cursor]) {
            this.dispatch('change-currentOperation', this.operationQueueHistory[this.cursor], this.cursor);
        }
        return this.operationQueueHistory[this.cursor];
    }
    sortOperations() {
        this.operationQueueHistory.sort((a, b) => {
            if (!a.timestamp || !b.timestamp) {
                this.console.error('Fatal error, operation without timestamp');
            }
            // 
            if (a.timestamp !== b.timestamp) {
                return a.timestamp - b.timestamp;
            }
            return a.operationNo - b.operationNo;
        });
    }

    _addOperation(operation) {
        if (operation.type === 'error') {
            return;
        }
        if (!operation.date) {
            throw new Error('operation record must contain .date field');
        }
        if (!operation.timestamp) {
            throw new Error('operation record must contain .timestamp field');
        }
        this.operationCounter++;
        operation.operationQueue = this;
        operation.operationNo = this.operationCounter;
        operation.tags = operation.tags || [];
        operation.domain = (
            operation &&
            operation.sourcefile &&
            operation.sourcefile.fileAdapter &&
            operation.sourcefile.fileAdapter.domain) || 'unknown-domain';

        if (!operation.key) {
            const hash = crypto.createHmac('sha256', `abcdefg${this.operationCounter}`)
                .update('I love crypto')
                .digest('hex').substring(0, 16);
            operation.key = hash;
        }
        operation.taxYear = parseInt(new Date(operation.timestamp).getFullYear(), 10);
        // if (this.config['ignore-duplicates-from-different-sources']) {
        // }
        if (operation.from && operation.from.asset) {
            operation.from.assetConfig = getAssetConfig(operation.from.asset);
        }
        if (operation.to && operation.to.asset) {
            operation.to.assetConfig = getAssetConfig(operation.to.asset);
        }
        if (operation.from && operation.from.assetConfig && operation.to && operation.to.assetConfig) {
            if (
                operation.from.assetConfig.type === 'cryptocurrency'
                &&
                operation.to.assetConfig.type === 'cryptocurrency'
            ) {
                if (operation.type === 'trade') {
                    operation.cryptoToCryptoTrade = true;
                }
            }
            if (
                operation.from.assetConfig.type === 'fiat'
                &&
                operation.to.assetConfig.type === 'fiat'
            ) {
                if (operation.type === 'trade') {
                    operation.fiatToFiatTrade = true;
                }
            }
            if (
                operation.from.assetConfig.type === 'fiat'
                &&
                operation.to.assetConfig.type === 'cryptocurrency'
            ) {
                if (operation.type === 'trade') {
                    operation.fiatToCryptoTrade = true;
                }
            }
            if (
                operation.from.assetConfig.type === 'cryptocurrency'
                &&
                operation.to.assetConfig.type === 'fiat'
            ) {
                if (operation.type === 'trade') {
                    operation.cryptoToFiatTrade = true;
                }
            }
        }
        this.operationQueueHistory.push(operation);
    }
    recalculateOperations() {
        if (this.posponedRecalculation) {
            clearTimeout(this.posponedRecalculation);
        }
        this.posponedRecalculation = setTimeout(() => {
            this.recalculateOperationsSync();
        }, 100);
    }

    /* main calculation */
    recalculateOperationsSync() {
        this.removeAutoOperations();
        const annualStatementYears = this.getAnnualStatementYears();

        this.dispatch('calculators-start');

        this.operationsByDay = {}; // group by day cache list (used by calendar)
        this.operationsByMonth = {}; // group by month cache list (used by calendar)
        this.stats = {};

        let prevCalculator = false;
        let calculator = false;
        annualStatementYears.forEach(year => {
            // reuse year calculator or create new
            calculator = new Calculator({
                year: year,
                prevCalculator: prevCalculator,
                setup: this.user.getDefaultCalculatorSetup(year),
                prices: this.prices,
                console: this.console,
                operationQueue: this
            });
            calculator.prepareCalculator();
            prevCalculator = calculator;
            this.calculators[year] = calculator;
        });
        this.sortOperations();
        // prevCalculator = false;
        annualStatementYears.forEach(year => {
            calculator = this.getAnnualYearCalculator(year);
            // clear calculator
            calculator.isLastCalculator = false;
            const operations = this.getOperations({year: year});
            calculator.setOperations(operations);
        });

        if (calculator) {
            calculator.isLastCalculator = true;
            this.lastCalculator = calculator;
            calculator.on('finish', () => {
                let nowTimestamp = new Date().getTime() - 60 * 60 * 24 * 1000;
                const nowISODate = timestamp2dateStr(nowTimestamp).substring(0, 10);
                nowTimestamp = new Date(nowISODate).getTime();
                const stocktakingQuery = {
                    operationQueue: this,
                    date: nowISODate,
                    timestamp: nowTimestamp,
                    type: 'stocktaking',
                    key: `${nowISODate}-OQ-NOW`,
                    // operationResidenceCurrency: 'USD',
                    calculator: calculator,
                    calculatorStep: {
                        // operationResidenceCurrency: 'USD',
                        unusedCosts: calculator.costs
                    }
                };
                this.lastCalculator.stocktaking(stocktakingQuery);    
                this.currentStocktakingOperation = stocktakingQuery;
                this.dispatch('last-calculator-finish', this.lastCalculator);
            });
        }
        
        const firstCalculator = this.getFirstCalculator();
        if (firstCalculator) {
            firstCalculator.recalculateCalculatorOperations();
            this.firstCalculator = firstCalculator;
        }
        this.dispatch('calculators-finish');
    }

    removeOperation(key) {
        let i,
            removedOperation;
        for (i = this.operationQueueHistory.length - 1; i >= 0; i -= 1) {
            if (this.operationQueueHistory[i].key === key) {
                removedOperation = this.operationQueueHistory[i];
                this.operationQueueHistory.splice(i, 1);
                return removedOperation;
            }
        }
        return false;
    }
    addOperations(list) {
        list.forEach(record => {
            this._addOperation(record);
        });
        this.recalculateOperations();
    }
    getLastCalculator() {
        return this.lastCalculator;
    }
    getLastCalculatorStep() {
        const lastCalculator = this.getLastCalculator();
        if (lastCalculator) {
            const lastOperation = lastCalculator.getSummaryOperation();
            return lastOperation.calculatorStep;
        }
        return false;
    }
    removeAutoOperations() {
        this.operationQueueHistory = this.operationQueueHistory.filter(operation => !operation.autoOperation);
    }
    removeOperations(filterFn) {
        this.operationQueueHistory = this.operationQueueHistory.filter(filterFn);
        this.recalculateOperations();
    }
    getMissingCostByKey(missingCostKey) {
        if (window.missingCostsBank && window.missingCostsBank[missingCostKey]) {
            return window.missingCostsBank[missingCostKey];
        }
        return false;
    }
    getMissingCost(missingCost) {
        const result = (missingCost) || false;
        return result;
    }
    setMissingCost(missingCost, missingCostUpdate) {
        this.setModified(true);
        Object.assign(missingCost, missingCostUpdate);
        if (!window.missingCostsBank) {
            window.missingCostsBank = {};
        }
        if (!window.missingCostsBank[missingCost.missingCostKey]) {
            window.missingCostsBank[missingCost.missingCostKey] = {};
        }
        window.missingCostsBank[missingCost.missingCostKey] = missingCost;
        this.dispatch('operation-changed');
    }
    downloadReport(setup, filename) {
        console.log('downloadReport', setup, filename);
    }
}

export default OperationQueue;
