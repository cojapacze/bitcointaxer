import {ExportToCsv} from 'export-to-csv';
// import {
//     getSortCostsFunction} from '../libs/Utils';

function stocktakingCSV(calculator) {
    const {operationQueue} = calculator;
    const filename = `${calculator.getFilename()}_personal_report`;
    const options = {
        filename: filename,
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true,
        showTitle: true,
        title: `Bitcointaxer, personal-report ${calculator.year}`,
        useTextFile: false,
        useBom: true,
        // useKeysAsHeaders: true
        headers: [
            'Date',
            'No',
            'Source',
            'From amount',
            'From asset',
            'Operation',
            'To amount',
            'To asset',
            'Fair Market Value',
            'Proceeds',
            'Cost Basis',
            'Gain/Loss',
            // 'Price',
            'Used cost',
            'Price helper'
        ]
    };
    const operations = calculator.getCalculatorOperations('personal-report');
    function usedCostsToString(costTaken) {
        const result = [];
        costTaken.forEach(cost => {
            const op = operationQueue.getOperationByKey(cost.operationKey);
            result.push(`${op.calculatorStep.stepNo}/${op.calculator.year}`);
        });
        return result.join('\n');
    }
    const data = [];
    operations.forEach(operation => {
        const residenceCurrency = operation.calculatorStep.residenceCurrency;
        if (operation.type === 'stocktaking') {
            data.push({
                date: operation.date,
                no: `${operation.calculatorStep.stepNo}/${calculator.year}`,
                // key: operation.key,
                source: '-',
                fromAmount: '-',
                fromAsset: '-',
                operation: operation.type,
                toAmount: '-',
                toAsset: '-',
                fairMarketValue: operation.operationStocktaking.stocktakingMarketValuation,
                proceeds: '-',
                costBasis: operation.operationStocktaking.stocktakingCostBasis,
                gainLoss: '-',
                usedCosts: '-'
            });
            return;
        }

        let costBasis = 0;
        let proceeds = 0;
        const buy = operation.from.asset !== residenceCurrency;
        if (buy) {
            costBasis = operation.calculatorStep.operationCostBasis;
            proceeds = operation.calculatorStep.operationProceeds;
        }

        data.push({
            date: operation.date,
            no: `${operation.calculatorStep.stepNo}/${calculator.year}`,
            // key: operation.key,
            source: calculator.getOperationPointer(operation),
            fromAmount: operation.from.amount,
            fromAsset: operation.from.asset,
            operation: operation.type,
            toAmount: operation.to.amount,
            toAsset: operation.to.asset,
            fairMarketValue: (operation.valuation && operation.valuation.value.toFixed(2)) || '-',
            proceeds: proceeds.toFixed(2),
            costBasis: costBasis.toFixed(2),
            gainLoss: operation.calculatorStep.operationGainLoss.toFixed(2),
            usedCosts: (buy && usedCostsToString(operation.calculatorStep.operationCostsTaken.usedCosts)) || ''
            // USDHelperKey: `${USDHelperKey}\n${USDHelperPrice}`,
            // BASEHelperKey: `${BASEHelperKey}\n${BASEHelperPrice}`
        });
    });
    const csvExporter = new ExportToCsv(options);
    csvExporter.generateCsv(data);
}

export default stocktakingCSV;
