import Eventsmanager from './Eventsmanager';
import {getAssetConfig, CONFIG} from './Utils';
import openSocket from 'socket.io-client';

class Prices extends Eventsmanager {
    cachedPrices = [];
    cachedOperationValuations = [];

    setPriceServerAddr(priceServerAddr) {
        this.priceServerAddr = priceServerAddr;
        this.connectToPriceServer(this.priceServerAddr);
    }

    constructor(config) {
        super();
        window.prices = this;
        if (!config.storage) {
            throw new Error('config.storage is required');
        }
        this.storage = config.storage;
        this.priceServerAddr = CONFIG.priceServerAddress;
        this.setPriceServerAddr(this.priceServerAddr);
        this.on('operation-valuation-changed', e => {
            if (e.operationValuation) {
                this.recalculateOperationValuation(e.operationValuation);
            }
        });
        this.on('price-alternative-results-changed', e => {
            if (e.sidePrice) {
                this.recalculateSidePrice(e.sidePrice);
            }
        });
        this.on('price-alternative-changed', e => {
            if (e.sidePrice) {
                this.recalculateSidePrice(e.sidePrice);
            }
        });
    }

    /* getters */
    getCounters() {
        let useBaseAssetValueCounter = 0;
        let useQuoteAssetValueCounter = 0;
        let totalCounter = 0;
        this.cachedOperationValuations.forEach(operationPrices => {
            totalCounter += 1;
            if (operationPrices.useBaseAssetValue) {
                useBaseAssetValueCounter += 1;
            }
            if (operationPrices.useQuoteAssetValue) {
                useQuoteAssetValueCounter += 1;
            }
        });
        const sidePriceCounters = {
            totalCounter,
            useBaseAssetValueCounter,
            useQuoteAssetValueCounter
        };
        this.sidePriceCounters = sidePriceCounters;
        return sidePriceCounters;
    }
    getOperationValuationSidePriceAlternativesStats = alternativesList => {
        const result = {
            total: 0,
            checked: 0
        };
        alternativesList.forEach(row => {
            result.total += 1;
            if (row.checked) {
                result.checked += 1;
            }
        });
        return result;
    }

    /* setters */
    setOperationValuationCustomValue(operationValuation, value) {
        operationValuation.operation.calculator.markSetupAsModified({
            setOperationValuationCustomValue: {
                operationValuation,
                value
            }
        });
        operationValuation.modified = true;
        operationValuation.useQuoteAssetValue = false;
        operationValuation.useBaseAssetValue = false;
        operationValuation.valuationCTCDiscount = 0;
        operationValuation.custom = value;
        operationValuation.value = value;
        const counters = this.getCounters();
        this.dispatch('operation-valuation-changed', {
            operationValuation,
            counters
        });
    }
    setOperationValuationPricesSidePrice(operationValuation, sidePriceKey, checked) {
        operationValuation.operation.calculator.markSetupAsModified({
            setOperationValuationPricesSidePrice: {
                operationValuation,
                sidePriceKey,
                checked
            }
        });
        if (!operationValuation) {
            console.error('setOperationValuationPricesSidePrice.setOperationValuationPricesSidePrice - exists operationPricesKey required', operationValuation, sidePriceKey, checked);
            return;
        }
        if (sidePriceKey === 'baseAsset') {
            operationValuation.useBaseAssetValue = checked;
            if (!operationValuation.useBaseAssetValue && !operationValuation.useQuoteAssetValue) {
                operationValuation.useQuoteAssetValue = true;
            }
        }
        if (sidePriceKey === 'quoteAsset') {
            operationValuation.useQuoteAssetValue = checked;
            if (!operationValuation.useBaseAssetValue && !operationValuation.useQuoteAssetValue) {
                operationValuation.useBaseAssetValue = true;
            }
        }
        const counters = this.getCounters();
        this.dispatch('operation-valuation-changed', {
            operationValuation,
            counters
        });
    }

    setAllOperationValuationSidePriceAlternatives = (operationValuation, alternativesList, name, checked) => {
        operationValuation.operation.calculator.markSetupAsModified({
            setAllOperationValuationSidePriceAlternatives: {
                operationValuation,
                alternativesList,
                name,
                checked
            }
        });
        const checkedCount = alternativesList.reduce((last, rec) => {
            if (rec.checked) {
                return last + 1;
            }
            return last;
        }, 0);
        if (checkedCount !== alternativesList.length) {
            checked = !checked;
        }

        if (alternativesList.length < 1) {
            return false;
        }
        alternativesList.forEach(row => {
            row.checked = checked;
        });
        const counters = this.getCounters();
        this.dispatch('operation-valuation-changed', {
            operationValuation,
            counters
        });
        return true;
    }
    setOperationValuationSidePriceAlternative = (
        alternativesList, alternative, alternativeKey, checked, operationValuation, sidePrice
    ) => {
        const selectedCount = alternativesList.reduce((c, price) => {
            if (price.checked) {
                return c + 1;
            }
            return c;
        }, 0);
        if (selectedCount < 2 && !checked) {
            return false;
        }
        alternative.checked = checked;
        const counters = this.getCounters();
        if (operationValuation) {
            operationValuation.operation.calculator.markSetupAsModified({
                setOperationValuationSidePriceAlternative: {
                    alternativeKey,
                    checked
                }
            });
            this.dispatch('operation-valuation-changed', {
                operationValuation,
                counters
            });    
        }
        if (sidePrice) {
            this.dispatch('price-alternative-changed', {
                sidePrice,
                counters
            });
        }
        return true;
    }
    setOperationValuationSidePriceAlternativeResults = (
        alternativePriceArgument, alternativePriceResultKey, checked, operationValuation, sidePrice
    ) => {
        const selectedCount = alternativePriceArgument.results.reduce((c, price) => {
            if (price.checked) {
                return c + 1;
            }
            return c;
        }, 0);
        if (selectedCount < 2 && !checked) {
            return false;
        }    
        alternativePriceArgument
            .results
            .find(price => price.key === alternativePriceResultKey)
            .checked = checked;

        const counters = this.getCounters();
        if (operationValuation) {
            operationValuation.operation.calculator.markSetupAsModified({
                setOperationValuationSidePriceAlternativeResults: {
                    operationValuation,
                    alternativePriceArgument,
                    alternativePriceResultKey,
                    checked
                }
            });
            this.dispatch('operation-valuation-changed', {
                operationValuation,
                counters
            });
        }
        if (sidePrice) {
            this.dispatch('price-alternative-results-changed', {
                sidePrice,
                counters
            });
        }
        return true;    
    }

    /* auto price strategy */
    getValidPriceResults(priceObject) {
        if (priceObject.results && priceObject.results.length) {
            // find all price results
            const pricesResults = priceObject.results && priceObject.results.filter(result => result.type === 'price');
            if (pricesResults && pricesResults.length) {
                return pricesResults;
            }
        }
        return false;
    }
    // unselect all price results
    cleanResult(priceObject) {
        const validPriceResults = this.getValidPriceResults(priceObject);
        // #1: results
        if (validPriceResults) {
            validPriceResults.forEach(result => {
                result.checked = false;
            });
        }
        // #2: arguments
        if (priceObject.arguments && priceObject.arguments.length) {
            priceObject.arguments.forEach(this.cleanResult.bind(this));
        }
        priceObject.resultsSelected = [];
        priceObject.price = NaN;
    }
    selectLowestResult(priceObject) {
        // #1: results
        const validPriceResults = this.getValidPriceResults(priceObject);
        if (validPriceResults) {
            let minResult = validPriceResults[0];
            validPriceResults.forEach(result => {
                if (result.value < minResult.value) {
                    minResult = result;
                }
            });
            minResult.checked = true;
            priceObject.resultsSelected = validPriceResults.filter(result => result.checked);
            // calculate current price based of avg of selected price results
            priceObject.price = priceObject.resultsSelected
                .reduce((previousValue, currentValue) => previousValue + currentValue.value, 0)
                / priceObject.resultsSelected.length;
        }
        // #2: arguments
        if (priceObject.arguments && priceObject.arguments.length) {
            priceObject.arguments.forEach(this.selectLowestResult.bind(this));
            priceObject.price = 
            priceObject.arguments
                .reduce((previousValue, currentValue) => previousValue * currentValue.price, 1);
        }
    }
    selectHighestResult(priceObject) {
        // #1: results
        const validPriceResults = this.getValidPriceResults(priceObject);
        if (validPriceResults) {
            let maxResult = validPriceResults[0];
            validPriceResults.forEach(result => {
                if (result.value > maxResult.value) {
                    maxResult = result;
                }
            });
            maxResult.checked = true;
            priceObject.resultsSelected = validPriceResults.filter(result => result.checked);
            // calculate current price based of avg of selected price results
            priceObject.price = priceObject.resultsSelected
                .reduce((previousValue, currentValue) => previousValue + currentValue.value, 0)
                / priceObject.resultsSelected.length;
        }
        // #2: arguments
        if (priceObject.arguments && priceObject.arguments.length) {
            priceObject.arguments.forEach(this.selectHighestResult.bind(this));
            priceObject.price = 
            priceObject.arguments
                .reduce((previousValue, currentValue) => previousValue * currentValue.price, 1);
        }
    }
    selectResult(priceObject, key) {
        // #1: results
        const validPriceResults = this.getValidPriceResults(priceObject);
        if (validPriceResults) {
            validPriceResults.forEach(result => {
                if (result.key === key) {
                    result.checked = true;
                }
            });
            priceObject.resultsSelected = validPriceResults.filter(result => result.checked);
            priceObject.price = priceObject.resultsSelected
                .reduce((previousValue, currentValue) => previousValue + currentValue.value, 0)
                / priceObject.resultsSelected.length;
        }
        // #2: arguments
        if (priceObject.arguments && priceObject.arguments.length) {
            priceObject.arguments.forEach(argument =>
                this.selectResult(argument, key));
            priceObject.price = 
                priceObject.arguments
                    .reduce((previousValue, currentValue) => previousValue * currentValue.price, 1);
        }
    }

    selectPriceResults(sidePrice, keys) {
        if (sidePrice.alternatives && sidePrice.alternatives.length) {
            sidePrice.alternativesValid = sidePrice.alternatives.filter(alternative => !alternative.error);
        }
        if (sidePrice.alternativesValid && sidePrice.alternativesValid.length) {
            // recalculate all alternative prices
            sidePrice.alternativesValid.forEach(alternative => {
                this.cleanResult(alternative);
                keys.forEach(key => {
                    switch (key) {
                    case 'low':
                        this.selectLowestResult(alternative);
                        break;
                    case 'high':
                        this.selectHighestResult(alternative);
                        break;
                    default:
                        this.selectResult(alternative, key);
                    }
                });
            });
        }
    }
    selectLowerAlternative(sidePrice) {
        sidePrice.custom = NaN;
        if (sidePrice.alternatives && sidePrice.alternatives.length) {
            sidePrice.alternativesValid = sidePrice.alternatives.filter(alternative => !alternative.error);
        }
        if (sidePrice.alternativesValid && sidePrice.alternativesValid.length) {
            let lowAlternative = sidePrice.alternativesValid[0];
            sidePrice.alternativesValid.forEach(alternative => {
                alternative.checked = false;
                if (alternative.price < lowAlternative.price) {
                    lowAlternative = alternative;
                }
            });
            lowAlternative.checked = true;
            sidePrice.alternativesSelected = [lowAlternative];
            sidePrice.price = lowAlternative.price;
        }
    }
    setCustomAlternative(sidePrice, customAlternativeAdapter) {
        if (sidePrice.alternatives && sidePrice.alternatives.length) {
            sidePrice.alternativesValid = sidePrice.alternatives.filter(alternative => !alternative.error);
        }
        if (sidePrice.alternativesValid && sidePrice.alternativesValid.length) {
            const foundCustomAdapterAlternative =
                sidePrice.alternativesValid.find(alternative => alternative.adapter === customAlternativeAdapter);
            if (foundCustomAdapterAlternative) {
                sidePrice.custom = NaN;
                sidePrice.alternativesValid.forEach(alternative => {
                    alternative.checked = false;
                });
                foundCustomAdapterAlternative.checked = true;
                sidePrice.alternativesSelected = [foundCustomAdapterAlternative];
                sidePrice.price = foundCustomAdapterAlternative.price;
            }
        }
    }

    selectLowerSide(operationValuation) {
        operationValuation.fromAssetValue = this.recalculateSidePrice(operationValuation.fromPrice)
            * operationValuation.operation.from.amount;
        operationValuation.toAssetValue = this.recalculateSidePrice(operationValuation.toPrice)
            * operationValuation.operation.to.amount;

        operationValuation.custom = NaN;
        if (operationValuation.fromAssetValue === operationValuation.toAssetValue) {
            operationValuation.useBaseAssetValue = true;
            operationValuation.useQuoteAssetValue = true;
        } else if (operationValuation.fromAssetValue < operationValuation.toAssetValue) {
            operationValuation.useBaseAssetValue = true;
            operationValuation.useQuoteAssetValue = false;
        } else if (operationValuation.fromAssetValue > operationValuation.toAssetValue) {
            operationValuation.useBaseAssetValue = false;
            operationValuation.useQuoteAssetValue = true;
        }
    }
    selectHigherSide(operationValuation) {
        operationValuation.fromAssetValue = this.recalculateSidePrice(operationValuation.fromPrice)
            * operationValuation.operation.from.amount;
        operationValuation.toAssetValue = this.recalculateSidePrice(operationValuation.toPrice)
            * operationValuation.operation.to.amount;

        operationValuation.custom = NaN;
        if (operationValuation.fromAssetValue === operationValuation.toAssetValue) {
            operationValuation.useBaseAssetValue = true;
            operationValuation.useQuoteAssetValue = true;
        } else if (operationValuation.fromAssetValue < operationValuation.toAssetValue) {
            operationValuation.useBaseAssetValue = false;
            operationValuation.useQuoteAssetValue = true;
        } else if (operationValuation.fromAssetValue > operationValuation.toAssetValue) {
            operationValuation.useBaseAssetValue = true;
            operationValuation.useQuoteAssetValue = false;
        }
    }
    selectSide(operationValuation, side) {
        operationValuation.fromAssetValue = this.recalculateSidePrice(operationValuation.fromPrice)
            * operationValuation.operation.from.amount;
        operationValuation.toAssetValue = this.recalculateSidePrice(operationValuation.toPrice)
            * operationValuation.operation.to.amount;

        operationValuation.custom = NaN;
        switch (side) {
        case 'quote':
            operationValuation.useBaseAssetValue = false;
            operationValuation.useQuoteAssetValue = true;
            break;
        case 'base':
            operationValuation.useBaseAssetValue = true;
            operationValuation.useQuoteAssetValue = false;
            break;
        default:
            operationValuation.useBaseAssetValue = true;
            operationValuation.useQuoteAssetValue = true;
        }
    }

    selectRealSideOrDoNothing(operationValuation, targetAsset) {
        const operation = operationValuation.operation;
        if (!operation) {
            throw Error('operationValuation.operation required!');
        }
        if (!operation.from) {
            throw Error('operationValuation.operation.from required!');
        }
        if (!operation.to) {
            throw Error('operationValuation.operation.to required!');
        }
        if (operation.from.asset === targetAsset && operation.to.asset === targetAsset) {
            operationValuation.useBaseAssetValue = true;
            operationValuation.useQuoteAssetValue = true;
        } else if (operation.from.asset === targetAsset) {
            operationValuation.useBaseAssetValue = true;
            operationValuation.useQuoteAssetValue = false;
        } else if (operation.to.asset === targetAsset) {
            operationValuation.useBaseAssetValue = false;
            operationValuation.useQuoteAssetValue = true;
        }
    }
    selectFiatSideOrDoNothing(operationValuation) {
        const operation = operationValuation.operation;
        if (!operation) {
            throw Error('operationValuation.operation required!');
        }
        if (!operation.from) {
            throw Error('operationValuation.operation.from required!');
        }
        if (!operation.to) {
            throw Error('operationValuation.operation.to required!');
        }
        const baseAssetConfig = getAssetConfig(operation.from.asset);
        const quoteAssetConfig = getAssetConfig(operation.to.asset);
        if (baseAssetConfig.type === 'fiat' && quoteAssetConfig.type === 'fiat') {
            operationValuation.useBaseAssetValue = true;
            operationValuation.useQuoteAssetValue = true;
        } else if (baseAssetConfig.type === 'fiat') {
            operationValuation.useBaseAssetValue = true;
            operationValuation.useQuoteAssetValue = false;
        } else if (quoteAssetConfig.type === 'fiat') {
            operationValuation.useBaseAssetValue = false;
            operationValuation.useQuoteAssetValue = true;
        }
    }

    recalculateSidePrice(sidePrice) {
        // return custom value if defined
        if (sidePrice.custom) {
            return sidePrice.custom;
        }
        // alternatives
        if (sidePrice.alternatives && sidePrice.alternatives.length) {
            sidePrice.alternativesValid = sidePrice.alternatives.filter(alternative => !alternative.error);
        }
        if (sidePrice.alternativesValid && sidePrice.alternativesValid.length) {
            // recalculate all alternative prices
            sidePrice.alternativesValid
                .map(childPrice => this.recalculateSidePrice(childPrice));
            // choose selected prices
            let alternativesSelected =
                sidePrice.alternativesValid.filter(result => result.checked);
            // select default
            if (!alternativesSelected.length) {
                sidePrice.alternativesValid[0].checked = true;
                alternativesSelected = [sidePrice.alternativesValid[0]];
            }
            sidePrice.alternativesSelected = alternativesSelected;
            // calculate current price based on avg of selected alternative prices
            sidePrice.price = alternativesSelected
                .reduce((previousValue, currentValue) => previousValue + currentValue.price, 0)
                / alternativesSelected.length;
            return sidePrice.price;
        }

        const priceObject = sidePrice;
        // arguments
        if (priceObject.arguments && priceObject.arguments.length) {
            // recalculate all argument prices
            priceObject.arguments
                .map(childPrice => this.recalculateSidePrice(childPrice));
            // calculate current price by multiplication of arguments
            priceObject.price = 
                priceObject.arguments
                    .reduce((previousValue, currentValue) => previousValue * currentValue.price, 1);
            return priceObject.price;
        }

        // results
        if (priceObject.results && priceObject.results.length) {
            // find all price results
            const pricesResults = priceObject.results && priceObject.results.filter(result => result.type === 'price');
            if (pricesResults && pricesResults.length) {
                // choose selected price results
                let selectedPricesResults = pricesResults.filter(result => result.checked);
                // select default price result
                if (!selectedPricesResults.length) {
                    pricesResults[0].checked = true;
                    selectedPricesResults = [pricesResults[0]];
                }
                priceObject.resultsSelected = selectedPricesResults;
                // calculate current price based of avg of selected price results
                priceObject.price = selectedPricesResults
                    .reduce((previousValue, currentValue) => previousValue + currentValue.value, 0)
                    / selectedPricesResults.length;
                return priceObject.price;    
            }
        }
        Error('Unknown price object, (No prices results and no childrens).');
        return NaN;
    }

    recalculateOperationValuation(operationValuation) {
        // wycena kalkulatora powinna byc zawsze robiona na obiekcie z operationQueue
        // ktory jest kopiowany do kalkulatora
        // w innym wypadku wydaje sie, ze waluacja dziala na jakiejs kopii
        operationValuation.fromAssetValue = this.recalculateSidePrice(operationValuation.fromPrice)
            * operationValuation.operation.from.amount;
        operationValuation.toAssetValue = this.recalculateSidePrice(operationValuation.toPrice)
            * operationValuation.operation.to.amount;
        if (
            !operationValuation.useBaseAssetValue &&
            !operationValuation.useQuoteAssetValue &&
            operationValuation.custom
        ) {
            operationValuation.modified = true;
            operationValuation.value = operationValuation.custom;
        } else {
            operationValuation.custom = NaN;
            operationValuation.modified = false;
            // no-side selected fallback
            if (
                !operationValuation.useBaseAssetValue &&
                !operationValuation.useQuoteAssetValue &&
                !operationValuation.custom
            ) {
                operationValuation.useBaseAssetValue = true;
                operationValuation.useQuoteAssetValue = true;
            }
            const values = [];
            if (operationValuation.useBaseAssetValue) {
                values.push(operationValuation.fromAssetValue);
            }
            if (operationValuation.useQuoteAssetValue) {
                values.push(operationValuation.toAssetValue);
            }
            operationValuation.value = values
                .reduce((previousValue, currentValue) => previousValue + currentValue, 0)
                / values.length;
        }
        if (operationValuation.operation.cryptoToCryptoTrade && operationValuation.valuationCTCDiscount) {
            operationValuation.modified = true;
            operationValuation.value *= 1 - (operationValuation.valuationCTCDiscount / 100);
        }
        return operationValuation.value;
    }
    setOperationValuationDefaults(operationValuation) {
        const setup = operationValuation.operation.calculator.getSetup();
        const valuationSetup = setup.valuationSetup;
        // Order is important
        // 1. Select Prices Results
        // 2. Select Prices
        // 3. Select valuation

        // price rules
        this.selectPriceResults(operationValuation.fromPrice, valuationSetup.valuationPrice);
        this.selectPriceResults(operationValuation.toPrice, valuationSetup.valuationPrice);

        // alternatives rules
        // '_04lower_price' (default)
        this.selectLowerAlternative(operationValuation.fromPrice);
        this.selectLowerAlternative(operationValuation.toPrice);

        if (valuationSetup.valuationStrategy.includes('_03coinpaprika.com')) {
            this.setCustomAlternative(operationValuation.fromPrice, 'CRYPTO_USD-coinpaprika.com');
            this.setCustomAlternative(operationValuation.toPrice, 'CRYPTO_USD-coinpaprika.com');
            this.setCustomAlternative(operationValuation.fromPrice, 'CRYPTO_USD_PLN-coinpaprika.com_nbp.pl');
            this.setCustomAlternative(operationValuation.toPrice, 'CRYPTO_USD_PLN-coinpaprika.com_nbp.pl');
        }
        if (valuationSetup.valuationStrategy.includes('_02cryptocompare.com')) {
            this.setCustomAlternative(operationValuation.fromPrice, 'ALL-cryptocompare.com');
            this.setCustomAlternative(operationValuation.toPrice, 'ALL-cryptocompare.com');    
            this.setCustomAlternative(operationValuation.fromPrice, 'CRYPTO_USD_PLN-cryptocompare.com_nbp.pl');
            this.setCustomAlternative(operationValuation.toPrice, 'CRYPTO_USD_PLN-cryptocompare.com_nbp.pl');
        }
        if (valuationSetup.valuationStrategy.includes('_01nbp.pl')) {
            this.setCustomAlternative(operationValuation.fromPrice, 'FIAT_PLN-nbp.pl');
            this.setCustomAlternative(operationValuation.toPrice, 'FIAT_PLN-nbp.pl');
            this.setCustomAlternative(operationValuation.fromPrice, 'PLN_FIAT-nbp.pl');
            this.setCustomAlternative(operationValuation.toPrice, 'PLN_FIAT-nbp.pl');
        }

        // valuation side rules
        if (valuationSetup.valuationSide.includes('_07both_average')) {
            this.selectSide(operationValuation, 'both');
        }

        if (valuationSetup.valuationSide.includes('_06quote_asset')) {
            this.selectSide(operationValuation, 'quote');
        }

        if (valuationSetup.valuationSide.includes('_05base_asset')) {
            this.selectSide(operationValuation, 'base');
        }

        if (valuationSetup.valuationSide.includes('_04higher_side')) {
            this.selectHigherSide(operationValuation);
        }
        
        if (valuationSetup.valuationSide.includes('_03lower_side')) {
            this.selectLowerSide(operationValuation);
        }
        if (operationValuation.operation.calculatorStep) {
            const operationResidenceCurrencyConfig =
                getAssetConfig(operationValuation.operation.calculatorStep.operationResidenceCurrency);

            if (valuationSetup.valuationSide.includes('_02fiat_side')) {
                if (operationResidenceCurrencyConfig.type === 'fiat') {
                    this.selectFiatSideOrDoNothing(operationValuation);
                }
            }
            if (valuationSetup.valuationSide.includes('_01residence_side')) {
                this.selectRealSideOrDoNothing(operationValuation,
                    operationValuation.operation.calculatorStep.operationResidenceCurrency);
            }
        }
        if (valuationSetup.valuationCTCDiscount) {
            operationValuation.valuationCTCDiscount = valuationSetup.valuationCTCDiscount;
        } else {
            operationValuation.valuationCTCDiscount = false;
        }
        // calculate
        this.recalculateOperationValuation(operationValuation);
    }

    // // **************  L I S T  ***************

    /* communication */
    _receivePrice(priceResponse) {
        // debugger;
        const queryKey = priceResponse.cbKey;
        const priceEnquire = this.getCachedPrice(queryKey);
        if (!priceEnquire) {
            console.error('Received price for unknown priceEnquire - no query for this cbKey', priceResponse);
            return;
        }
        priceEnquire.priceResponse = priceResponse;
        // this.storage.storePrice(priceResponse);
        priceEnquire.resolved = true;
        priceEnquire.promiseResolve(priceResponse);
        this.dispatch('price-enquire-downloaded', priceEnquire);
        this.dispatch('progress-changed');
    }
    _receivePriceError(priceResponse) {
        const queryKey = priceResponse.cbKey; 
        const priceEnquire = this.getCachedPrice(queryKey);
        if (!priceEnquire) {
            console.error('Received price with unknown cbKey/queryKey', priceResponse);
            return;
        }
        // priceEnquire.resolved = true;
        priceEnquire.resolved = true;
        priceEnquire.promiseReject(priceResponse);
        this.dispatch('price-enquire-rejected');
        this.dispatch('progress-changed');
    }
    connectToPriceServer(priceServerAddr) {
        const socket = openSocket(priceServerAddr);
        this.socket = socket; // init first
        
        socket.on('get-price-result', result => {
            this._receivePrice(result);
        });
        socket.on('get-price-result-err', result => {
            console.error('%c[get-price-result-err]', 'color:red', result);
            this._receivePriceError(result);
        });
    }
    getPricesProgressStats() {
        const progressStats = {
            valuations: {
                total: this.cachedOperationValuations.length,
                done: this.cachedOperationValuations.reduce((prev, record) => {
                    if (record.resolved) {
                        return prev + 1;
                    }
                    return prev;
                }, 0)    
            },
            prices: {
                total: this.cachedPrices.length,
                done: this.cachedPrices.reduce((prev, record) => {
                    if (record.resolved) {
                        return prev + 1;
                    }
                    return prev;
                }, 0)
            }
        };
        return progressStats;
    }

    /* Prices */
    getCachedPrice(priceQueryKey) {
        const price = this.cachedPrices.find(cachedPrice => cachedPrice.priceQueryKey === priceQueryKey);
        return price;
    }
    cachePrice(priceQueryKey, price) {
        const cachedPrice = this.getCachedPrice(priceQueryKey);
        if (!cachedPrice) {
            price.priceQueryKey = priceQueryKey;
            this.cachedPrices.push(price);
        } else {
            Object.assign(cachedPrice, price);
        }
    }
    getPriceQueryKey(priceQuery) {
        // daily pricing
        const queryKey = `${priceQuery.date.substring(0, 10)}-${priceQuery.fromAsset}-${priceQuery.toAsset}`;
        return queryKey;
    }
    getPrice(priceQuery) {
        // daily pricing
        priceQuery.date = priceQuery.date.substring(0, 10);
        // get unique key
        const priceQueryKey = this.getPriceQueryKey(priceQuery);
        // never ask twice this same price query
        let priceEnquire = this.getCachedPrice(priceQueryKey);
        // maybe better return copy of price result - to allow customize price per valuation
        if (!priceEnquire) {
            priceEnquire = {
                cbKey: priceQueryKey,
                priceQueryKey,
                priceQuery,
                resolved: false
            };
            priceEnquire.promise = new Promise((resolve, reject) => {
                priceEnquire.promiseResolve = resolve;
                priceEnquire.promiseReject = reject;
                if (priceQuery.fromAsset === priceQuery.toAsset) {
                    // auto price
                    setTimeout(() => {
                        this._receivePrice({
                            cbKey: priceQueryKey,
                            date: priceQuery.date,
                            validatedQuery: priceQuery,
                            alternatives: [{
                                key: `auto-price-${priceQueryKey}`,
                                type: 'price',
                                subtype: 'price-results',
                                effectiveDate: priceQuery.date,
                                adapter: 'auto',
                                fromAsset: priceQuery.fromAsset,
                                toAsset: priceQuery.toAsset,
                                results: [{
                                    key: 'auto-default',
                                    type: 'price',
                                    value: 1
                                }]
                            }] 
                        }); 
                    }, 0);
                } else {
                    // ask server for price
                    this.socket.emit('get-price', {
                        cbKey: priceEnquire.cbKey,
                        ...priceQuery
                    });
                }
            });
            this.cachePrice(priceQueryKey, priceEnquire);
        }
        return priceEnquire;
    }

    /* Simple Exchange Price Request */
    // TODO: return sync, or emit finish event
    // const priceQuery = {
    //     date: '2018-01-01',
    //     ex: 'custom',
    //     fromAsset: 'PLN',
    //     fromAmount: 0,
    //     toAsset: 'USD',
    //     toAmount: 0
    // }
    getSimpleExchangePrice(date, fromAsset, toAsset) {
        const priceQuery = {
            date: date,
            fromAsset: fromAsset,
            toAsset: toAsset
        };
        const exchangePrice = this.getPrice(priceQuery);
        return exchangePrice;
    }

    /* Operation Valuation */
    getCachedOperationValuation(operationValuationKey) {
        const operationValuation = this.cachedOperationValuations.find(
            cachedOperationValuation =>
                cachedOperationValuation.valuationKey === operationValuationKey
        );
        return operationValuation;
    }
    cacheOperationValuation(operationValuationKey, operationValuation) {
        operationValuation.type = 'operation-valuation';
        if (operationValuation.valuationKey && operationValuation.valuationKey !== operationValuationKey) {
            console.error('overwiring valuation', operationValuation.valuationKey, 'with new key', operationValuationKey, operationValuation);
        }
        operationValuation.valuationKey = operationValuationKey;
        const cachedOperationValuation = this.getCachedOperationValuation(operationValuationKey);
        if (!cachedOperationValuation) {
            this.cachedOperationValuations.push(operationValuation);
        } else {
            Object.assign(cachedOperationValuation, operationValuation);
        }   
    }
    getOperationValuation(operation, targetAsset) {
        const valuationKey = `${operation.key}-${targetAsset}`;
        let operationValuation = this.getCachedOperationValuation(valuationKey);
        if (operationValuation) {
            this.dispatch('valuation-from-cache', {
                stats: this.getPricesProgressStats(),
                operationValuation: operationValuation
            });
            return operationValuation;
        }
        const fromPriceQuery = this.getPrice({
            date: operation.date,
            fromAsset: operation.from.asset,
            toAsset: targetAsset
        });
        const toPriceQuery = this.getPrice({
            date: operation.date,
            fromAsset: operation.to.asset,
            toAsset: targetAsset
        });
        operationValuation = {
            valuationKey,
            date: operation.date,
            targetAsset: targetAsset,
            operation: operation,
            resolved: false,
            loading: true
        };
        operationValuation.promise = new Promise(resolve => {
            Promise.all([fromPriceQuery.promise, toPriceQuery.promise]).then(prices => { // <- re-using resolved promises
                // relay on promises order above
                const fromPrice = prices[0];
                const toPrice = prices[1];
                Object.assign(operationValuation, {
                    fromPrice: fromPrice,
                    toPrice: toPrice,
                    resolved: true,
                    loading: false
                });
                // apply default config for resolved valuation
                this.setOperationValuationDefaults(operationValuation);

                resolve(operationValuation);
            });    
        });
        // cache unresolved valuation to reuse instead of creating new one
        this.cacheOperationValuation(valuationKey, operationValuation);
        this.dispatch('valuation-cached', {
            stats: this.getPricesProgressStats(),
            operationValuation: operationValuation
        });
        return operationValuation;
    }
}

export default Prices;
