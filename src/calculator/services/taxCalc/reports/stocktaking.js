import {ExportToCsv} from 'export-to-csv';
import {
    getSortCostsFunction} from '../libs/Utils';
  
function stocktakingCSV(operation) {
    const {calculator, operationQueue} = operation;
    const filename = `${calculator.getFilename()}_stocktaking`;
    const options = { 
        filename: filename,
        fieldSeparator: ',',
        quoteStrings: '"',
        decimalSeparator: '.',
        showLabels: true, 
        showTitle: true,
        title: `Bitcointaxer, stock-taking at ${operation.date}`,
        useTextFile: false,
        useBom: true,
        headers: [
            'Asset',
            'No',
            'Index',
            'Ref',
            'Location',
            'Purchased amount',
            'Price of purchase',
            'Cost Basis',
            'Final Amount',
            'Market Price',
            'Fair Market Value',
            'Amount',
            'Price',
            'Value'
        ]
    };
    const stocktaking = operation.operationStocktaking;
    const costs = stocktaking.inventory;
    const currentSetup = calculator.getSetup();
    costs.sort(getSortCostsFunction(currentSetup));
    const data = costs.map(cost => {
        const op = operationQueue.getOperationByKey(cost.operationKey);
        return {
            asset: cost.asset,
            no: cost.no,
            index: cost.operationKey,
            ref: `${op.calculatorStep.stepNo}/${op.calculator.year}`,
            location: cost.loc,
            stocktakingCostBasisAmount: cost.stocktakingCostBasisAmount,
            stocktakingCostBasisRate: cost.stocktakingCostBasisRate,
            stocktakingCostBasis: cost.stocktakingCostBasis,
            stocktakingMarketAmount: cost.stocktakingMarketAmount,
            stocktakingMarketRate: cost.stocktakingMarketRate,
            stocktakingMarketValue: cost.stocktakingMarketValue,
            stocktakingAmount: cost.stocktakingAmount,
            stocktakingRate: cost.stocktakingRate,
            stocktakingValue: cost.stocktakingValue
        };
    });
    const csvExporter = new ExportToCsv(options);
    csvExporter.generateCsv(data);
}

export default stocktakingCSV;
