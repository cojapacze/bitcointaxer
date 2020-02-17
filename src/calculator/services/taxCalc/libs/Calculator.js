import Eventsmanager from './Eventsmanager';
import Prices from './Prices';
import Console from './Console';
import OperationQueue from './OperationQueue';
import {ExportToCsv} from 'export-to-csv';
import {
    getTaxResidenceConfig,
    getTaxResidenceCurrency,
    getInventorySortFunction,
    getSortCostsFunction,
    CONFIG
} from './Utils';
const crypto = require('crypto');
const extend = require('extend-shallow');

class Calculator extends Eventsmanager {
    // defaultSetup = 'error'

    getAssetTurnoverObject(asset) {
        const assetTurnoverTemplate = {
            buy: 0,
            sell: 0,
            transfer: 0,
            total: 0
        };
        let assetTurnoverObject = this.assetsTurnover[asset];
        if (!assetTurnoverObject) {
            assetTurnoverObject = Object.assign({}, assetTurnoverTemplate);
            this.assetsTurnover[asset] = assetTurnoverObject;
        }
        return assetTurnoverObject;
    }
    constructor(config) {
        super();
        if (!(config.prices instanceof Prices)) {
            throw new Error('prices are not instanceof Prices', config.prices);
        }
        this.prices = config.prices;
        if (!(config.console instanceof Console)) {
            throw new Error('console is not instanceof Console', config.console);
        }
        this.console = config.console;
        if (!(config.operationQueue instanceof OperationQueue)) {
            throw new Error('operationQueue is not instanceof OperationQueue', config.operationQueue);
        }
        this.operationQueue = config.operationQueue;
        this.console.destroy();

        window.calculator = this;

        const setup = config.setup || new Error('config.setup is required');
        this.inputChecksumHash = config.inputChecksumHash || 'unknown input hash';
        this.lastChecksumHash = this.inputChecksumHash;
        this.year = config.year;
        this.endDate = `${this.year}-12-31 23:59:59`;
        this.setup = setup;
        this.onPrevCalculatorFinish = this.onPrevCalculatorFinish.bind(this);
        this.on('finish', () => {
            this.recalculateInventory(this.endDate);
        });
        this.setPrevCalculator(config.prevCalculator);
        
        setup.taxResidenceConfig = getTaxResidenceConfig(setup.taxResidence);
        setup.residenceCurrency = getTaxResidenceCurrency(setup.taxResidence);

        // this.setOperations(this.operationQueue.getOperations({year: this.year}));
    }
    onPrevCalculatorFinish(prevCalculator) {
        this.recalculateCalculatorOperations(prevCalculator);
    }
    setPrevCalculator(prevCalculator) {
        if (this.prevCalculator) {
            this.prevCalculator.removeListener('finish', this.onPrevCalculatorFinish);
            this.prevCalculator = false;
        }
        if (prevCalculator) {
            prevCalculator.on('finish', this.onPrevCalculatorFinish);
            this.prevCalculator = prevCalculator;
        }
    }
    markSetupAsModified(modified) {
        if (!this.setupModified) {
            this.setupModified = {};
        }
        Object.assign(this.setupModified, modified);
        this.dispatch('setup-modified', modified);
        // this.setupModified = true;
    }
    markSetupAsDefault() {
        this.setupModified = false;
        this.dispatch('setup-default');
    }

    takeOperationContract(operation, fraction, i) {
        const contract = {
            calculator: operation.calculator,
            cryptoToCryptoTrade: operation.cryptoToCryptoTrade,
            // customSetup: operation.customSetup,
            date: operation.date,
            from: Object.assign({}, operation.from, {
                amount: operation.from.amount * fraction
            }),
            key: `${operation.key}-${i}`,
            // operationNo: operation.operationNo,
            operationQueue: operation.operationQueue,
            rawCSVLine: operation.rawCSVLine,
            rawCSVLineNo: operation.rawCSVLineNo,
            recordRaw: operation.recordRaw,
            sourcefile: operation.sourcefile,
            // tags: operation.tags,
            taxYear: operation.taxYear,
            taxable: operation.taxable,
            timestamp: operation.timestamp,
            to: Object.assign({}, operation.to, {
                amount: operation.to.amount * fraction
            }),
            // touched: operation.touched,
            // txid: operation.txid,
            type: 'contract',
            valuation: Object.assign({}, operation.valuation, {
                fromAssetValue: operation.valuation.fromAssetValue * fraction,
                toAssetValue: operation.valuation.toAssetValue * fraction,
                value: operation.valuation.value * fraction
            }),

            isChildContract: true,
            fraction: fraction,
            parent: operation
        };
        contract.valuation.operation = contract;
        return contract;
    }
    splitOperationIntoContracts(operation, proceedsLimit) {
        const contracts = [];
        const operationProceeds = operation.calculatorStep.operationProceeds;
        // create
        operation.splitedValueLimit = proceedsLimit;
        let operationProceedsRemained = operationProceeds;
        let i = 0;
        while (operationProceedsRemained > 0) {
            i += 1;
            let operationProceedsTaken = proceedsLimit;
            if (operationProceedsRemained < operationProceedsTaken) {
                operationProceedsTaken = operationProceedsRemained;
            }
            operationProceedsRemained -= operationProceedsTaken;
            const fraction = operationProceedsTaken / operationProceeds;
            const contract = this.takeOperationContract(
                operation,
                fraction,
                i
            );
            contracts.push(contract);
        }
        return contracts;
    }
    splitOperationsIntoContracts(splitOperationIntoContractsUpToValue) {
        // const {
        //     splitOperationIntoContracts,
        // } = this.getSetup();
        const operations = [];
        this.operations.forEach(operation => {
            if (
                operation.taxable &&
                // splitOperationIntoContracts &&
                operation.valuation && operation.valuation.resolved &&
                operation.calculatorStep.operationProceeds > splitOperationIntoContractsUpToValue
            ) {
                const contracts = this.splitOperationIntoContracts(
                    operation,
                    splitOperationIntoContractsUpToValue
                );
                operations.push(...contracts);
            } else {
                operations.push(operation);
            }
            // operations.push(operation);
            return true;
        });
        this.operationsFinal = operations;
        this.setupDefaultOperations('new');
    }

    setupCalculatorOperations() {
        const {
            trackLocations
        } = this.setup;
        const operations = [];
        this.operations.forEach(operation => {
            if (!trackLocations) {
                if (operation.type === 'transfer') {
                    return false;
                }
                if (operation.type === 'withdraw') {
                    return false;
                }
                if (operation.type === 'deposit') {
                    return false;
                }
            }
            operations.push(operation);
            return true;
        });
        this.operationsFinal = operations;
        return operations;
    }
    getCalculatorOperations() {
        return this.operationsFinal;
    }
    prepareCalculator() {
        const stocktackingOpen = {
            autoOperation: true,
            date: `${this.year}-01-01 00:00:00`,
            timestamp: new Date(`${this.year}-01-01 00:00:00`).getTime(),
            type: 'stocktaking',
            subtype: 'open',
            taxYear: this.year,
            key: `${this.year}-01-01_00:00:00_stocktaking-open-year`,
            operationQueue: this.operationQueue,
            calculator: this
        };
        const stocktackingClose = {
            autoOperation: true,
            date: `${this.year}-12-31 23:59:59`,
            timestamp: new Date(`${this.year}-12-31 23:59:59`).getTime(),
            type: 'stocktaking',
            subtype: 'close',
            taxYear: this.year,
            key: `${this.year}-12-31_23:59:59_stocktaking-close-year`,
            operationQueue: this.operationQueue,
            calculator: this
        };
        this.operationQueue._addOperation(stocktackingOpen);
        this.operationQueue._addOperation(stocktackingClose);
    }
    setOperations(operations) {
        this.uncalculatedOperations = true;
        this.operations = operations;
        this.operationsSplitedIntoContractsUpToValue = false;
        this.setupCalculatorOperations();
        this.setupDefaultOperations('new');
    }
    getHash(str) {
        const hash = crypto.createHmac('sha256', str)
            .update('I love crypto')
            .digest('hex')
            .substring(0, 16);
        return hash;
    }
    getInputHash() {
        let inputHash = 'genesis';
        if (this.prevCalculator) {
            inputHash = this.prevCalculator.getCalculatorHash();
        }
        return inputHash;
    }

    getOutputHash() {
        return this.getCalculatorHash();
    }

    getCalculatorHash() {
        const operation = this.getSummaryOperation();
        return operation && operation.calculatorStep && operation.calculatorStep.checksumHash;
    }

    // getters
    getSetup() {
        const setup = this.setup;
        setup.oneQueue = !setup.trackLocations;
        return setup;
    }

    // calculation setup
    setTaxResidence(taxResidence) {
        const setup = this.getSetup();
        setup.taxResidence = taxResidence;
        setup.taxResidenceConfig = getTaxResidenceConfig(setup.taxResidence);
        setup.residenceCurrency = getTaxResidenceCurrency(setup.taxResidence);
        this.resetValuationOfOperations();
        this.recalculateCalculatorOperations();
    }
    setQueueMethod(queueMethod) {
        const setup = this.getSetup();
        setup.queueMethod = queueMethod;
        this.markSetupAsModified({
            calculator: {
                queueMethod: queueMethod
            }
        });
    }
    setTrackLocations(trackLocations) {
        const setup = this.getSetup();
        setup.trackLocations = trackLocations;
        setup.oneQueue = !trackLocations;
        this.markSetupAsModified({
            calculator: {
                trackLocations: trackLocations
            }
        });
    }
    setCryptoToCryptoTaxable(cryptoToCryptoTaxable) {
        const setup = this.getSetup();

        setup.cryptoToCryptoTaxable = cryptoToCryptoTaxable;

        this.markSetupAsModified({
            calculator: {
                cryptoToCryptoTaxable: cryptoToCryptoTaxable
            }
        });
    }
    setCryptoToCryptoTaxableFromValuationThreshold(cryptoToCryptoTaxableFromValuationThreshold) {
        const setup = this.getSetup();

        setup.cryptoToCryptoTaxableFromValuationThreshold = parseFloat(cryptoToCryptoTaxableFromValuationThreshold);
        this.markSetupAsModified({
            calculator: {
                setCryptoToCryptoTaxableFromValuationThreshold: cryptoToCryptoTaxableFromValuationThreshold
            }
        });
    }
    setSplitOperationIntoContracts(splitOperationIntoContracts) {
        const setup = this.getSetup();
        setup.splitOperationIntoContracts = splitOperationIntoContracts;
        this.markSetupAsModified({
            calculator: {
                splitOperationIntoContracts: splitOperationIntoContracts
            }
        });
    }
    setSplitOperationIntoContractsUpToValue(splitOperationIntoContractsUpToValue) {
        const setup = this.getSetup();
        setup.splitOperationIntoContractsUpToValue = parseFloat(splitOperationIntoContractsUpToValue);
        this.markSetupAsModified({
            calculator: {
                splitOperationIntoContractsUpToValue: splitOperationIntoContractsUpToValue
            }
        });
    }

    setLongTermBuckets(longTermBuckets) {
        const setup = this.getSetup();
        setup.longTermBuckets = longTermBuckets;
    }

    // valuation setup
    setValuationSetup(assignValuationSetup) {
        const setup = this.getSetup();
        if (!setup.valuationSetup) {
            setup.valuationSetup = {};
        }
        Object.assign(setup.valuationSetup, assignValuationSetup);
    }
    setValuationPriceServer(priceServerAddr) {
        this.prices.setPriceServerAddr(priceServerAddr);
    }
    setActivityType(activityType) {
        const setup = this.getSetup();
        Object.assign(setup, {activityType});
        this.markSetupAsModified({
            calculator: {
                activityType: activityType
            }
        });
    }
    evaluateOperation(operation) {
        if (!operation || !operation.calculatorStep) {
            console.error('evaluateOperation - empty operation', operation);
            return Promise.reject('evaluateOperation - empty operation');
        }
        const residenceCurrency = operation.calculatorStep.residenceCurrency;
        const operationValuation = this.prices.getOperationValuation(operation, residenceCurrency);
        operation.valuation = operationValuation;
        this.prices.dispatch('operation-valuation-start', operation);
        return new Promise(resolve => {
            operation.valuation.promise.then(() => {
                this.prices.dispatch('operation-valuation-finish', operation);
                resolve(operation);
            });
        });
    }
    reevaluateOperations() {
        const operations = this.getCalculatorOperations('reevaluateOperations');
        operations.forEach(operation => {
            if (operation.valuation) {
                this.prices.setOperationValuationDefaults(operation.valuation);
            }
        });
        this.recalculateCalculatorOperations();
    }

    // prepares operation for calculation
    setupDefaultOperations(mode) {
        const operations = this.getCalculatorOperations('setupDefaultOperations');
        let i;
        let operation;
        const currentSetup = this.getSetup(); // use default setup
        // mark taxable opertions
        for (i = 0; i < operations.length; i += 1) {
            operation = operations[i];
            if (mode === 'new' && operation.touched) {
                continue;
            }
            operation.touched = true;
            operation.customSetup = false;
            operation.taxable = false; // reset
            // if (operation.type === 'setup') {
            //     currentSetup = operation.setup;
            // }
            if (operation.type === 'atomic-swap' || operation.type === 'trade' || operation.type === 'contract') {
                if (!currentSetup.cryptoToCryptoTaxable && operation.cryptoToCryptoTrade) {
                    operation.taxable = false;
                } else {
                    operation.taxable = true;
                }
            }
        }
    }
    resetValuationOfOperations() {
        const operations = this.getCalculatorOperations('resetValuationOfOperations');
        let i;
        let operation;
        for (i = 0; i < operations.length; i += 1) {
            operation = operations[i];
            operation.valuation = {};
            delete operation.valuation;
        }
    }
    updateOperation(operation) {
        operation.customSetup = true;
        operation.calculatorStep.taxableEvent = operation.taxable;
        this.markSetupAsModified({
            operation: operation
        });
        this.recalculateCalculatorOperations();
    }
    updateContract(contract) {
        contract.customSetup = true;
        contract.calculatorStep.taxableEvent = contract.taxable;
        this.markSetupAsModified({
            contract: contract
        });
        this.recalculateCalculatorOperations();
    }

    translateFrom(date, fromResidenceCurrency, prevCosts) {
        if (!date) {
            console.error('translateFrom - date - is required');
            return;
        }

        if (!prevCosts) {
            return;
        }
        const toResidenceCurrency = this.setup.residenceCurrency;
        if (fromResidenceCurrency !== toResidenceCurrency) {
            const simplePriceEnquiry = 
                this.prices.getSimpleExchangePrice(date, fromResidenceCurrency, toResidenceCurrency);
            if (simplePriceEnquiry.resolved) {
                const exitExchangeRate = this.prices.recalculateSidePrice(simplePriceEnquiry.priceResponse);
                prevCosts.forEach(cost => {
                    cost.costBasis *= exitExchangeRate;
                    cost.rate = cost.costBasis / cost.amount;
                });    
            } else {
                // waiting for pices
                // console.log('Waiting for price...');
                simplePriceEnquiry.promise.then(() => this.recalculateCalculatorOperations());
            }
        } else {
            console.debug('no-taxation-change');
        }
    }
    copyCosts(costsArr) {
        const newCostsArr = [];
        costsArr.forEach(costEl => newCostsArr.push(Object.assign({}, costEl)));
        return newCostsArr;
    }
    resetContinousData() {
        // do clean copy of input data
        let prevLocBalances = {}; // salda
        let prevCosts = []; // koszty
        let prevMissingCosts = []; // brakujące koszty

        const prevCalculator = this.prevCalculator;
        if (prevCalculator) {
            // make copy from prevCalculator
            prevLocBalances = JSON.parse(JSON.stringify(prevCalculator.locBalances)); // salda
            prevCosts = this.copyCosts(prevCalculator.costs); // koszty
            this.translateFrom(`${this.year}-01-01 00:00:00`, prevCalculator.setup.residenceCurrency, prevCosts); // przewalutuj koszty
            prevMissingCosts = this.copyCosts(prevCalculator.missingCostsGlobal); // brakujące koszty
        }
        // save as this current data
        this.locBalances = prevLocBalances; // salda
        this.costs = prevCosts; // koszty
        this.missingCosts = []; // brakujące koszty
        this.missingCostsGlobal = prevMissingCosts; // brakujące koszty
    }
    resetCalculator() {
        // reset calculator data
        this.stepNo = 0; // step counter
        this.proceeds = 0; // przychod
        this.costBasis = 0; // koszt
        this.gainLoss = 0; // dochod / strata
        this.expenses = 0; // wydatki
        this.income = 0; // przychod
        this.assetsTurnover = {}; // obróty
        this.stats = {
            operationsByDay: {},
            operationsByMonth: {}
        };
        this.resetContinousData();
    }
    getUnfinishedValuationPromises() {
        const operations = this.getCalculatorOperations('getUnfinishedValuationPromises');
        const unfinishedPricePromises = [];
        if (!operations || operations.length < 1) {
            return false;
        }
        operations.forEach(operation => {
            // default operation
            if (operation.valuation && operation.valuation.promise && !operation.valuation.resolved) {
                unfinishedPricePromises.push(operation.valuation.promise);
            }
            // stocktaking
            if (operation.priceRequests) {
                Object.values(operation.priceRequests).forEach(priceRequest => {
                    if (!priceRequest.resolved) {
                        unfinishedPricePromises.push(priceRequest.promise);
                    }
                });
            }
        });
        return unfinishedPricePromises;
    }

    waitForValuations() {
        const operations = this.getCalculatorOperations('waitForValuations');
        const unfinishedPricePromises = this.getUnfinishedValuationPromises();
        let i, operation;
        if (!unfinishedPricePromises || unfinishedPricePromises.length < 1) {
            this.console.success('No unfinished price query.');
            const brokenOperations =
            operations.filter(operationF => operationF.currentErrors && operationF.currentErrors.length);
            if (brokenOperations) {
                // brokenOperations.reverse();
                for (i = brokenOperations.length - 1; i >= 0; i -= 1) {
                    operation = brokenOperations[i];
                    if (operation.currentErrors && operation.currentErrors.length) {
                        this.console.operationError(operation, operation.currentErrors, `Error ${i + 1} of ${brokenOperations.length}`);
                    }
                }
            } else {
                this.console.info('All calculations done.');
            }
            if (this.isLastCalculator) {
                this.operationQueue.dispatch('last-calculator-finish');
            }
            return false;
        }
        this.console.warn(`Waiting for ${unfinishedPricePromises.length} prices.`);
        Promise.all(unfinishedPricePromises).then(() => {
            this.console.success('All calculator prices discovered.');
            this.recalculateCalculatorOperations();
        });
        return true;
    }

    getSummaryOperation() {
        const operations = this.getCalculatorOperations('getSummaryOperation');
        return operations[operations.length - 1];
    }

    // get current calculator step
    getLastCalculatorStep = calculatorStep => {
        this.stepNo += 1;
        // hibernated state
        // const currentSetup = Object.assign({}, this._getFlatSetup());
        const currentSetup = this.setup;
        if (!calculatorStep || !calculatorStep.operation) {
            console.error('Missing operation in calculation step:', calculatorStep);
            throw new Error('Missing operation in calculation step', calculatorStep);
        }
        const operationStringArr = [];
        operationStringArr.push(this.lastChecksumHash);
        operationStringArr.push(calculatorStep.operation.taxYear);
        operationStringArr.push(this.stepNo);
        operationStringArr.push(calculatorStep.operation.date);
        operationStringArr.push(calculatorStep.operation.type);
        operationStringArr.push(calculatorStep.operation.type);
        const result = {
            ...calculatorStep,
            checksumHash: 'off', // this.getHash(operationStringArr.join('|')), // calculatorStep: calculatorStep,
            taxYear: calculatorStep.operation.taxYear, // calculatorStep: calculatorStep,
            calculator: this,
            stepNo: this.stepNo,

            setup: currentSetup,
            locBalances: JSON.parse(JSON.stringify(this.locBalances)), // make full copy of object and all children
            assetsTurnover: JSON.parse(JSON.stringify(this.assetsTurnover)), // make full copy of object and all children

            // unusedCostsTree: JSON.parse(JSON.stringify(this.costsTree)),
            unusedCosts: this.costs.slice(), // copy
            unusedCostBasis: this.sumCostBasis(this.costs),
            missingCosts: this.missingCosts.slice(), // copy array
            missingCostsGlobal: this.missingCostsGlobal.slice(), // copy array

            residenceCurrency: currentSetup.residenceCurrency,

            sumProceeds: this.proceeds,
            sumCostBasis: this.costBasis,
            sumGainLoss: this.gainLoss,
            sumExpenses: this.expenses,
            sumIncome: this.income
        };
        result.calculator = this;
        return result;
    }

    // *** calculator methods ***
    putBalance(loc, amount, asset) {
        if (!this.locBalances[loc]) {
            this.locBalances[loc] = {};
        }
        if (!this.locBalances[loc][asset]) {
            this.locBalances[loc][asset] = 0;
        }
        this.locBalances[loc][asset] += amount;
    }

    takeBalance(loc, amount, asset) {
        if (!this.locBalances[loc]) {
            this.locBalances[loc] = {};
            this.currentWarnings.push(`⚠ Wybranie: ${amount} ${asset} z nieistniejacej lokalizacji: ${loc}.`);
        }
        if (!this.locBalances[loc][asset]) {
            this.currentWarnings.push(`⚠ Wybranie: ${amount} ${asset} z lokalizacji: ${loc} bez istniejących środków.`);
            this.locBalances[loc][asset] = 0;
        }
        if ((this.locBalances[loc][asset]) < amount) {
            this.currentWarnings.push(`⚠ Wybranie: ${amount} ${asset} z lokalizacji: ${loc} bez wystarczających środków, było tylko: ${this.locBalances[loc][asset]} ${asset}.`);
        }
        this.locBalances[loc][asset] -= amount;
    }

    sumCostBasis(costsList) {
        let unusedCostBasis = 0;
        costsList.forEach(cost => {
            unusedCostBasis += cost.costBasis;
        });
        return unusedCostBasis;
    }

    makeCostAverage() {
        const currentSetup = this.getSetup();
        const costs = this.costs;
        let assetGroup;
        const groups = {};
        const sortedArr = [];
        costs.sort(getSortCostsFunction(currentSetup));
        costs.forEach((cost, i) => {
            assetGroup = groups[cost.asset];
            if (!assetGroup) {
                assetGroup = {
                    key: cost.asset,
                    asset: cost.asset,
                    residenceCurrency: cost.residenceCurrency,
                    amount: 0,
                    loc: [],
                    costBasis: 0,
                    min: 0,
                    dateMin: false,
                    dateMax: false,
                    max: 0,
                    children: []
                };
                groups[cost.asset] = assetGroup;
                // expandedRows.push(assetGroup.key);
                sortedArr.push(assetGroup);
            }
            // update group stats
            if (!assetGroup.dateMin || cost.date < assetGroup.dateMin) {
                assetGroup.dateMin = cost.date;
            }
            if (!assetGroup.dateMax || cost.date > assetGroup.dateMax) {
                assetGroup.dateMax = cost.date;
            }
            assetGroup.amount += cost.amount;
            assetGroup.costBasis += cost.costBasis;
            assetGroup.rate = (assetGroup.amount) ? (assetGroup.costBasis / assetGroup.amount) : '-';
            assetGroup.children.push(Object.assign(
                {},
                cost,
                {
                    key: `${cost.asset}-${i}`,
                    prevOperation: this.operationQueue.getOperationByKey(cost.operationKey)
                }
            ));
        });
        this.costs = sortedArr.map(groupedCost => ({
            amount: groupedCost.amount,
            asset: groupedCost.asset,
            costBasis: groupedCost.costBasis,
            date: groupedCost.dateMin,
            ex: 'wallet',
            loc: 'wallet',
            no: 'none',
            operationKey: 'none',
            operationNo: 'none',
            rate: groupedCost.rate,
            rawCSVLineNo: 'none',
            residenceCurrency: groupedCost.residenceCurrency,
            timestamp: new Date(groupedCost.dateMin).getTime()
        }));
    }
    takeCost(currentQueueMethod, oneQueue, asset, amount, loc, residenceCurrency, operation) {
        const costsList = this.costs.sort(getInventorySortFunction(currentQueueMethod));
        const costsTaken = [];
        let costBasis = 0;
        let costElement;
        let costPart = null;
        let i;
        for (i = costsList.length - 1; amount && i >= 0; i -= 1) {
            costElement = costsList[i];
            // wybieramy koszt wg assetu i lokalizacji (jezeli ma byc uwzgledniania)
            if (costElement.asset === asset && (oneQueue || costElement.loc === loc)) {
                if (costElement.amount <= amount) { // uzywamy calego elementu kosztu
                    amount -= costElement.amount; // zmniejsz brakujaca ilosc o cala ilosc w elemencie kosztu
                    costBasis += costElement.costBasis; // zsumuj wybrany koszt
                    costsTaken.push(costElement); // zrzuc wybrany koszt
                    costsList.splice(i, 1); // usun uzyty w calosci element kosztu
                } else if (costElement.amount > amount) { // jezeli potrzebna mniejsza ilosc niz w elemencie kosztu
                    // stworz kopie biezacego kosztu, dla nowego obiektu reszty, ktorym zostanie napisany
                    costElement = Object.assign({}, costElement);
                    // stworz kopie biezacego kosztu, dla wybranej jego czesci
                    costPart = Object.assign({}, costElement, {
                        amount: amount,
                        costBasis: amount * costElement.rate
                    });
                    costElement.amount -= costPart.amount; // zmniejsz ilosc w elemencie kosztu
                    costElement.costBasis -= costPart.costBasis; // obniz calkowity koszt elementy kosztu
                    // *.rate sie nie zmienia, gdyz wybieramy proporcjonalnie amount i costBasis
                    // nadpisz reszte
                    costsList[i] = costElement; 
                    // zapisz koszt
                    costsTaken.push(costPart);
                    costBasis += costPart.costBasis;
                    amount -= costPart.amount;
                }
            }
        }

        // jezeli brakuje kosztu
        let missingCostPart = false;
        if (amount) {
            const missingCostKey = `${operation.key}-${loc}-${asset}-${amount}`; // this.getHash(str);
            missingCostPart = {
                missingCostKey: missingCostKey, // this.getHash(str);
                errorResolved: false,
                loc: loc,
                ex: operation.ex,
                date: operation.date,
                timestamp: operation.timestamp,
                asset: asset,
                amount: amount,
                createOperationKey: operation.key, // singleton, do not copy?
                residenceCurrency: residenceCurrency,
                operationKey: operation.key,
                costBasis: 0,
                penalty: 0,
                rate: 0
            };
            // set costBasis for residence currency
            if (CONFIG.calculatorFeatures.fixupResidenceCurrencyCostBasis) {
                if (residenceCurrency === asset) {
                    missingCostPart.costBasis = missingCostPart.amount;
                    missingCostPart.rate = 1;
                }    
            }
            const missingCostPartSaved = this.operationQueue.getMissingCostByKey(missingCostKey);
            extend(missingCostPart, missingCostPartSaved);
            if (missingCostPart.costBasis) {
                costBasis += missingCostPart.costBasis;
            }
            this.currentErrors.push({
                type: 'missing-cost',
                msg: `⚠ Unknown source of asset ${amount} ${asset} at ${loc} - [${currentQueueMethod} (${(oneQueue) ? 'oneQueue' : 'trackLocations'})]`,
                missingCostPart: missingCostPart
            });

            this.missingCosts.push(missingCostPart);
            this.missingCostsGlobal.push(missingCostPart);
            // !!!
            // wrzucone tak samo jak zwykły kosz, który moze sie potem dzielic
            // w przypadku robienia kopi
            // w rezultacie moze byc wymagane przeliczenie calego kalkulatra,
            // aby rozpropagować np. parametr errorResolved
            costsTaken.push(missingCostPart);
        }
        // if (isNaN(costBasis)) {
        //     debugger;
        // }
        const result = {
            usedCosts: costsTaken,
            missingCostPart: missingCostPart,
            costBasis: costBasis
        };
        return result;
    }

    putCost(date, timestamp, asset, amount, costBasis, ex, loc, residenceCurrency, operation) {
        const cost = {
            date: date,
            timestamp: timestamp,
            asset: asset,
            amount: amount,
            costBasis: costBasis,
            ex: ex,
            loc: loc,
            rate: costBasis / amount,
            residenceCurrency: residenceCurrency,
            operationNo: operation.operationNo,
            rawCSVLineNo: operation.rawCSVLineNo,
            operationKey: operation.key
        };
        this.costs.push(cost);
    }


    /* trade calculator */
    atomic(operation, atomicType) {
        const setup = this.getSetup();
        const {queueMethod, residenceCurrency, oneQueue} = setup;

        const taxableEvent = operation.taxable;
        // let taxableEventDisabled = false;
        // request for valuation if it is taxable operation (ask at begin, because later taxableEvent may change)
        if (taxableEvent && !operation.valuation) {
            operation.valuation = this.prices.getOperationValuation(operation, residenceCurrency);
        }

        const fromAssetTurnoverObject = this.getAssetTurnoverObject(operation.from.asset);
        const toAssetTurnoverObject = this.getAssetTurnoverObject(operation.to.asset);

        switch (atomicType) {
        // case 'contract':
        case 'trade':
            fromAssetTurnoverObject.sell += operation.from.amount;
            fromAssetTurnoverObject.total += operation.from.amount;
            toAssetTurnoverObject.buy += operation.to.amount;
            toAssetTurnoverObject.total += operation.to.amount;
            break;
        case 'transfer':
            fromAssetTurnoverObject.transfer += operation.from.amount;
            fromAssetTurnoverObject.total += operation.from.amount;
            toAssetTurnoverObject.transfer += operation.to.amount;
            toAssetTurnoverObject.total += operation.to.amount;
            // oneQueue = false;
            break;
        case 'atomic-swap':
            fromAssetTurnoverObject.transfer += operation.from.amount;
            fromAssetTurnoverObject.total += operation.from.amount;
            toAssetTurnoverObject.transfer += operation.to.amount;
            toAssetTurnoverObject.total += operation.to.amount;
            fromAssetTurnoverObject.sell += operation.from.amount;
            fromAssetTurnoverObject.total += operation.from.amount;
            toAssetTurnoverObject.buy += operation.to.amount;
            toAssetTurnoverObject.total += operation.to.amount;
            break;
        default:
            console.error(`Unknown atomicType: ${atomicType}`, operation);
            throw new Error(`Unknown atomicType: ${atomicType}`);
        }

        let operationProceeds = 0; // NaN
        let operationCostBasis = 0;
        let operationGainLoss = 0;
        let operationExpenses = 0;
        let operationIncome = 0;
        // physic queue
        const costsTaken = this.takeCost(
            queueMethod,
            oneQueue,
            operation.from.asset,
            operation.from.amount,
            operation.from.loc,
            residenceCurrency,
            operation
        );
        operationCostBasis = costsTaken.costBasis;

        if (taxableEvent) {
            if (operation.valuation && operation.valuation.value) {
                operationProceeds = parseFloat(operation.valuation.value);
                if (operation.cryptoToCryptoTrade || operation.fiatToCryptoTrade) {
                    operationExpenses = operation.valuation.value;
                }
                if (operation.cryptoToCryptoTrade || operation.cryptoToFiatTrade) {
                    operationIncome = operation.valuation.value;
                }
            } else {
                // !!!! temporary solution for missing valuation
                // while requesting
                // in result -> taxaction cancelled
                // operationProceeds = operationCostBasis;
                operationProceeds = 0;
            }
        } else {
            operationProceeds = operationCostBasis;
        }
        if (atomicType === 'transfer') {
            costsTaken.usedCosts.forEach(cost => 
                this.putCost(
                    cost.date,
                    cost.timestamp,
                    operation.to.asset,
                    cost.amount,
                    cost.costBasis,
                    operation.from.loc,
                    operation.to.loc,
                    residenceCurrency,
                    operation
                )
            );
        } else {
            this.putCost(
                operation.date,
                operation.timestamp,
                operation.to.asset,
                operation.to.amount,
                operationProceeds,
                operation.from.loc,
                operation.to.loc,
                residenceCurrency,
                operation
            );
        }
        // calculate Gain / Loss
        operationGainLoss = operationProceeds - operationCostBasis;

        // modify global Proceeds - CostBasis = Gain / Loss
        if (taxableEvent) {
            if (operation.from.asset !== residenceCurrency) {
                this.proceeds += operationProceeds;
                this.costBasis += operationCostBasis;
            }
            this.gainLoss += operationGainLoss;
            this.expenses += operationExpenses;
            this.income += operationIncome;
        }

        // modify * simple * balances
        this.takeBalance(operation.from.loc, operation.from.amount, operation.from.asset);
        this.putBalance(operation.to.loc, operation.to.amount, operation.to.asset);

        return this.getLastCalculatorStep({
            operationType: atomicType,
            operation: operation,
            taxableEvent: taxableEvent,
            // taxableEventDisabled: taxableEventDisabled,

            operationResidenceCurrency: residenceCurrency,
            operationCostsTaken: costsTaken,
            operationMissingCostPart: costsTaken.missingCostPart,

            operationCostBasis: operationCostBasis,
            operationProceeds: operationProceeds,
            operationGainLoss: operationGainLoss,
            operationExpenses: operationExpenses,
            operationIncome: operationIncome
        });
    }

    stocktaking(operation) {
        // console.log('%cstocktaking:', 'background:red;color:white', operation.date, operation);
        if (!operation.calculatorStep) {
            return false;
        }
        let finished = true;
        const setup = this.getSetup();
        const {residenceCurrency} = setup;
        const costsList = operation.calculatorStep.unusedCosts;
        const stocktakingMode = 'lower';
        costsList.sort(getSortCostsFunction(setup));
        const priceRequests = operation.priceRequests || {};
        const priceRequestsPendingPromises = [];
        let stocktakingValuation = 0;
        let stocktakingCostBasis = 0;
        let stocktakingMarketValuation = 0;
        costsList.forEach((cost, i) => {
            cost.no = i + 1;
            const priceQuery = {
                date: operation.date,
                fromAsset: cost.asset,
                toAsset: residenceCurrency
            };
            const priceKey = this.prices.getPriceQueryKey(priceQuery);
            let stocktakingPriceObj = priceRequests[priceKey];
            if (!stocktakingPriceObj) {
                stocktakingPriceObj = this.prices.getPrice(priceQuery);
                priceRequests[priceKey] = stocktakingPriceObj;
            }

            if (stocktakingPriceObj.resolved) {
                const assetRate = this.prices.recalculateSidePrice(stocktakingPriceObj.priceResponse) || 0;
                // zapisz oryginalne wartosci
                cost.stocktakingPriceObj = stocktakingPriceObj;


                cost.stocktakingCostBasisAmount = cost.amount;
                cost.stocktakingCostBasis = cost.costBasis;
                cost.stocktakingCostBasisRate = cost.rate;
                cost.stocktakingMarketAmount = cost.amount;
                cost.stocktakingMarketRate = assetRate;
                cost.stocktakingMarketValue = cost.stocktakingMarketAmount * cost.stocktakingMarketRate;
                // default: purchase cost
                cost.stocktakingRate = cost.stocktakingCostBasisRate;
                cost.stocktakingValue = cost.stocktakingCostBasis;
                cost.stocktakingAmount = cost.stocktakingCostBasisAmount;
                switch (stocktakingMode) {
                case 'lower':
                    // obniz wycene do cen rynkowych
                    if (cost.stocktakingCostBasisRate > cost.stocktakingMarketRate) {
                        cost.stocktakingPriceUsed = true;
                        cost.stocktakingRate = cost.stocktakingMarketRate;
                        cost.stocktakingValue = cost.stocktakingMarketValue;
                    }
                    break;
                case 'market':
                    cost.stocktakingPriceUsed = true;
                    cost.stocktakingRate = cost.stocktakingMarketRate;
                    cost.stocktakingValue = cost.stocktakingMarketValue;
                    break;
                default:
                }
                // valuation = cost.stocktakingValue;
            } else {
                finished = false;
                priceRequestsPendingPromises.push(stocktakingPriceObj.promise);
            }
            stocktakingValuation += cost.stocktakingValue;
            stocktakingCostBasis += cost.stocktakingCostBasis;
            stocktakingMarketValuation += cost.stocktakingMarketValue;
        });
        operation.priceRequests = priceRequests;
        operation.priceRequestsPendingPromises = priceRequestsPendingPromises;
        const operationStocktaking = {
            // timestamp: operation.timestamp,
            // date: operation.date,
            finished: finished,
            operationType: operation.type,
            inventory: costsList,
            operation: operation,
            priceRequests: priceRequests,
            taxableEvent: operation.taxable,
            stocktakingValuation: stocktakingValuation,
            stocktakingMarketValuation: stocktakingMarketValuation,
            stocktakingCostBasis: stocktakingCostBasis,
            operationResidenceCurrency: residenceCurrency
        };
        operation.operationStocktaking = operationStocktaking;
        if (priceRequestsPendingPromises.length) {
            Promise.all(priceRequestsPendingPromises).then(() => {
                this.stocktaking(operation);
                operation.operationQueue.dispatch('stocktaking-recalculated', operation);
            });
        }
        return operationStocktaking;
    }

    summary(operation, operationType) {
        operationType = operationType || 'summary';
        const setup = this.getSetup();
        const {residenceCurrency} = setup;
        const taxableEvent = false;
        return this.getLastCalculatorStep({
            operationType: operationType,
            operation: operation,
            taxableEvent: taxableEvent,

            operationResidenceCurrency: residenceCurrency
        });
    }

    trade(operation) {
        // early bird error control - shold never happen
        if (operation.from.asset === operation.to.asset) {
            console.error('LOGIC ERROR - this same assets in trade operation', operation);
            throw new Error('LOGIC ERROR - this same assets in trade operation');
        }
        return this.atomic(operation, 'trade');
    }

    transfer(operation) {
        // early bird error control - shold never happen
        if (operation.from.asset !== operation.to.asset) {
            console.error('LOGIC ERROR - different assets in transfer operation');
            throw new Error('LOGIC ERROR - different assets in transfer operation');
        }
        if (operation.from.asset !== operation.to.asset) {
            console.error('LOGIC ERROR - transfer operation with different assets');
            throw new Error('LOGIC ERROR - transfer operation with different assets');
        }
        if (operation.from.amount !== operation.to.amount) {
            console.error('LOGIC ERROR - transfer operation with different amounts');
            throw new Error('LOGIC ERROR - transfer operation with different amounts');
        }
        return this.atomic(operation, 'transfer');
    }

    withdraw(operation) {
        return this.transfer(operation, 'transfer');
    }

    deposit(operation) {
        return this.transfer(operation, 'transfer');
    }

    /* main control api */
    execOperation(operation) {
        const setup = this.getSetup();
        if (setup.queueMethod === 'AVG') {
            this.makeCostAverage();
        }

        this.currentOperation = operation;
        this.currentWarnings = [];
        this.currentErrors = [];
        switch (operation.type) {
        case 'contract':
            operation.calculatorStep = this.trade(operation);
            break;
        case 'trade':
            operation.calculatorStep = this.trade(operation);
            break;
        case 'transfer':
            operation.calculatorStep = this.transfer(operation);
            break;
        case 'atomic-swap':
            operation.calculatorStep = this.atomic(operation, 'atomic-swap');
            break;
        case 'withdraw':
            operation.calculatorStep = this.withdraw(operation);
            break;
        case 'deposit':
            operation.calculatorStep = this.deposit(operation);
            break;
        case 'summary':
            operation.calculatorStep = this.summary(operation);
            break;
        case 'stocktaking':
            operation.calculatorStep = this.summary(operation);
            operation.operationStocktaking = this.stocktaking(operation);
            break;
        case 'price':
        case 'config':
        case 'setup':
        default:
            // debugger;
            operation.calculatorStep = this.summary(operation, operation.type);
            break;
        }
        operation.currentErrors = this.currentErrors;
        operation.currentWarnings = this.currentWarnings;
        this.currentOperation = false;
        this.currentErrors = null;
        return operation.calculatorStep;
    }
    recalculateCalculatorOperations() {
        this.operationQueue.dispatch('recalculate-calculator-start');
        setTimeout(() => this.recalculateCalculatorOperationsSync(), 10);
    }
    recalculateCalculatorOperationsSync() {
        this.resetCalculator();
        const setup = this.getSetup();
        const operations = this.getCalculatorOperations('recalculateCalculatorOperations');
        let operation;
        let i;
        for (i = 0; i < operations.length; i += 1) {
            operation = operations[i];
            operation.calculator = this;

            // stats: group by year-month-day
            const operationDateDay = operation.date.substring(0, 10);
            if (!this.stats.operationsByDay[operationDateDay]) {
                this.stats.operationsByDay[operationDateDay] = [];
            }
            this.stats.operationsByDay[operationDateDay].push(operation);

            if (!this.stats.mostPopularDay ||
                this.stats.mostPopularDay.length < this.stats.operationsByDay[operationDateDay].length) {
                this.stats.mostPopularDay = this.stats.operationsByDay[operationDateDay];
            }

            // stats: group by year-month
            const operationDateMonth = operation.date.substring(0, 7);
            if (!this.stats.operationsByMonth[operationDateMonth]) {
                this.stats.operationsByMonth[operationDateMonth] = [];
            }
            this.stats.operationsByMonth[operationDateMonth].push(operation);
            if (!this.stats.mostPopularMonth ||
                this.stats.mostPopularMonth.length < this.stats.operationsByMonth[operationDateMonth].length) {
                this.stats.mostPopularMonth = this.stats.operationsByMonth[operationDateMonth];
            }

            // recalculate operation valuation
            if (operation.valuation && operation.valuation.resolved) {
                this.prices.recalculateOperationValuation(operation.valuation);
                if (
                    !operation.customSetup &&
                    setup.cryptoToCryptoTaxable &&
                    operation.cryptoToCryptoTrade &&
                    operation.valuation.value < setup.cryptoToCryptoTaxableFromValuationThreshold) {
                    operation.taxable = false;
                }
            }
            // calculate step by type and save state to operation.calculatorStep
            operation.calculatorStep = this.execOperation(operation);
        }
        if (!this.waitForValuations()) {
            // console.log('Valutations finished');
            this.dispatch('finish', this);
        } else {
            // console.log('Waiting for valuations');
        }
        // will recalculate if finish
        // or (at end) will display errors if exists any
        this.uncalculatedOperations = false;
    }


    recalculateInventory(date) {
        console.debug('Recalculate Inventory', date, this.costs);
    }
    getOperationDescription(operation) {
        let desc = `${operation.type} ${operation.from.asset}→${operation.to.asset}`;
        if (operation.type === 'trade') {
            if (operation.cryptoToCryptoTrade) {
                desc = (`Zamiana ${operation.from.asset} na ${operation.to.asset}`);
            }
            if (operation.fiatToCryptoTrade) {
                desc = (`Zakup ${operation.to.asset} za ${operation.from.asset}`);
            }
            if (operation.cryptoToFiatTrade) {
                desc = (`Sprzedaz ${operation.from.asset} za ${operation.to.asset}`);
            }
            if (operation.fiatToFiatTrade) {
                desc = (`Zamiana ${operation.from.asset} na ${operation.to.asset}`);
            }
        }
        return desc;
    }
    getOperationPointer(operation) {
        let pointer = `${operation.sourcefile.filename}@${operation.recordRaw.rawCSVLineNo + 1}/${operation.sourcefile.data.length}`;
        if (operation.ex) {
            pointer = `${operation.ex}, ${pointer}`;
        }
        return pointer;
    }
    getFilename() {
        const setup = this.getSetup();
        const parts = [];
        parts.push(CONFIG.filenamePrefix);
        parts.push(this.year);
        parts.push(setup.taxResidence);
        parts.push(setup.activityType);
        parts.push(setup.queueMethod);
        if (setup.cryptoToCryptoTaxable) {
            parts.push('CTCT');
        }
        if (setup.cryptoToCryptoTaxableFromValuationThreshold) {
            parts.push(`from_${setup.cryptoToCryptoTaxableFromValuationThreshold}`);
        }
        return parts.join('_');
    }
    getKPIRData(filter) {
        const operations = this.getCalculatorOperations();
        const output = [];
        let i = 0;
        operations.forEach(operation => {
            if (operation.type !== 'trade') {
                return;
            }
            if (operation.date.substr(0, filter.length) !== filter) {
                return;
            }
            i += 1;
            const exchangeRateDifference =
                operation.calculatorStep.operationExpenses - operation.calculatorStep.operationCostBasis;
            const extraLost = 0;
            const extraProfit = 0;
            let notes = '';
            if (operation.fiatToCryptoTrade && exchangeRateDifference) {
                if (exchangeRateDifference < 0) {
                    // extraLost = -1 * exchangeRateDifference;
                    notes += `Strata kursowa ${(-1 * exchangeRateDifference).toFixed(2)}${this.setup.residenceCurrency}`;
                } else {
                    // extraProfit = exchangeRateDifference;
                    notes += `Zysk kursowy ${(exchangeRateDifference).toFixed(2)}${this.setup.residenceCurrency}`;
                }
            }
    
            const line = {
                no: i, // 1
                date: operation.date, // 2
                evno: this.getOperationPointer(operation), // 3
                cname: '', // 4
                caddress: '', // 5
                desc: this.getOperationDescription(operation), // 6
                sell: operation.calculatorStep.operationIncome.toFixed(2), // 7
                otherIncome: extraProfit.toFixed(2), // 8
                sumIncome: (operation.calculatorStep.operationIncome + extraProfit).toFixed(2), // 9
                buy: (operation.calculatorStep.operationExpenses).toFixed(2), // 10
                otherCosts: (0).toFixed(2), // 11
                otherPays: (0).toFixed(2), // 12
                otherExpenses: extraLost.toFixed(2), // 13
                sumExpenses: (operation.calculatorStep.operationExpenses + extraLost).toFixed(2), // 14
                unknown: '', // 15
                investVal: (0).toFixed(2),
                notes: notes // 16
            };
            output.push(line);
        });
        return output;
    }
    downloadCSV() {
        const filename = this.getFilename();
        const options = { 
            filename: filename,
            fieldSeparator: ',',
            quoteStrings: '"',
            decimalSeparator: '.',
            showLabels: true, 
            showTitle: true,
            title: `bitcointaxer, ${this.year}`,
            useTextFile: false,
            useBom: true,
            // useKeysAsHeaders: true
            headers: [
                'Lp',
                'Data',
                'Nr dowodu',
                'Nazwa kontrahenta',
                'Adres',
                'Opis zdarzenia gospodarczego',
                'Sprz. tow. i usług',
                'Poz. przychody',
                'Razem przychód (7 + 8)',
                'Zak. tow. handl. i mat.',
                'Koszty ub. zak.',
                'Wynagr. w got. i nat.',
                'Poz. wydatki',
                'Razem wydatki',
                '',
                'Uwagi'
            ]
        };
         
        const csvExporter = new ExportToCsv(options);
         
        csvExporter.generateCsv(this.getKPIRData());
    }
}

export default Calculator;
