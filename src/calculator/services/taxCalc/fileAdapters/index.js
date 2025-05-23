import csvParse from 'csv-parse';
import XLSX from 'xlsx';
import adapter001 from './testcaseAdapter.js';
import adapter002 from './bitbay-Historia-Szczegolowa.js';
import adapter003 from './bitbay-Historia-Transakcje.js';
import adapter004 from './bitbay-Historia-Wplaty_Wyplaty.js';
import adapter005 from './bitmarket24-historia_salda.js';
import adapter006 from './bitmarket24-historia_transakcji.js';
import adapter007 from './kraken.com-ledgers.csv.js';
import adapter008 from './poloniex.com-depositHistory.js';
import adapter009 from './poloniex.com-withdrawalHistory.js';
import adapter010 from './poloniex.com-tradeHistory.js';
import adapter011 from './kursy.js';
import adapter012 from './bittrex-fullOrders';
import adapter013 from './wavesplatform-transactions';
import adapter014 from './binance.com-TradeHistory.xlsx';
import adapter015 from './binance.com-DepositHistory.csv.js';
import adapter016 from './binance.com-WithdrawalHistory.csv';
import adapter017 from './bitmarket.pl-export.xlsx.js';
import adapter018 from './coinbase.com-Transaction_history.js';
import adapter019 from './coinbase.com-TransactionHistoryReport.js';
import adapter020 from './pro.coinbase.com-account.csv.js';
import adapter021 from './binance.com-TransactionRecords.csv.js';

const plugins = [
    adapter001,
    adapter002,
    adapter003,
    adapter004,
    adapter005,
    adapter006,
    adapter007,
    adapter008,
    adapter009,
    adapter010,
    adapter011,
    adapter012,
    adapter013,
    adapter014,
    adapter015,
    adapter016,
    adapter017,
    adapter018,
    adapter019,
    adapter020,
    adapter021
];

function getPlugin(file) {
    const detectedTypes = [];
    plugins.forEach(plugin => {
        if (plugin.match(file)) {
            detectedTypes.push(plugin);
        }
    });
    if (detectedTypes.length > 1) {
        console.error('More than two adapters for file.', detectedTypes, file.filename);
        throw new Error('More than two adapters for file.');
    }
    if (detectedTypes.length < 1) {
        console.error('No adapter for file:', file.filename, 'header line[', file.content.substr(0, 100), ']', (file.data && JSON.stringify(Object.keys(file.data[0]))) || 'text');
        return false;
    }
    return detectedTypes[0];
}
function loadXSLX(file, callback) {
    function loadFileAsArrayBuffer(pe) {
        const err = false;
        const contentArrayBuffer = pe.currentTarget.result;
        const workbook = XLSX.read(contentArrayBuffer, {
            type: 'array'
        });
        const output = XLSX.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        callback(err, output);
    }
    const fileReaderArrayBuffer = new FileReader();
    fileReaderArrayBuffer.onload = loadFileAsArrayBuffer;
    fileReaderArrayBuffer.readAsArrayBuffer(file);
}
function fileLoaderPromise(file) {
    return new Promise((resolve, reject) => {
        function loadFile(fileDescriptor) {
            let fileAdapter = false;
            try {
                fileAdapter = getPlugin(fileDescriptor);
            } catch (err) {
                reject(err);
                return;
            }
            if (!fileAdapter || fileAdapter instanceof Error) {
                reject(fileAdapter);
                throw fileAdapter;
                // return;
            }
            switch (fileDescriptor.detectedFiletype) {
                case 'xlsx':
                    fileDescriptor.type = (fileAdapter.getPluginname && fileAdapter.getPluginname()) || fileAdapter.pluginname;
                    fileDescriptor.fileAdapter = fileAdapter;
                    fileDescriptor.operations = fileAdapter.getOperations(fileDescriptor) || [];
                    resolve(fileDescriptor);
                    break;
                case 'json':
                    fileDescriptor.type = (fileAdapter.getPluginname && fileAdapter.getPluginname()) || fileAdapter.pluginname;
                    fileDescriptor.fileAdapter = fileAdapter;
                    fileDescriptor.operations = fileAdapter.getOperations(fileDescriptor) || [];
                    resolve(fileDescriptor);
                    break;
                case 'csv':
                default:
                    csvParse(fileDescriptor.content, fileAdapter.parseConfig, (err, output) => {
                        if (err) {
                            console.error('error parsing CSV file', err);
                            reject(err);
                            return;
                        }
                        fileDescriptor.data = output;
                        fileDescriptor.type = (fileAdapter.getPluginname && fileAdapter.getPluginname()) || fileAdapter.pluginname;
                        fileDescriptor.fileAdapter = fileAdapter;
                        fileDescriptor.operations = fileAdapter.getOperations(fileDescriptor) || [];
                        resolve(fileDescriptor);
                    });
            }
        }
        function loadFileAsText(e) {
            const content = e.currentTarget.result;
            const fileExtension = String(file.name).split('.').pop().toLowerCase();
            let detectedFiletype = fileExtension;
            /* eslint-disable */
            const filetypeSignatures = {
                xlsx: ['PK ']
            };
            /* eslint-enable */
            Object.entries(filetypeSignatures).forEach(([filetype, signatures]) => {
                signatures.forEach(signature => {
                    if (content.substr(0, signature.length) === signature) {
                        detectedFiletype = filetype;
                    }
                });
            });
            const fileDescriptor = {
                file: file,
                basename: file.name,
                filename: file.name,
                fileExtension: fileExtension,
                detectedFiletype: detectedFiletype,
                content: content
            };
            switch (fileDescriptor.detectedFiletype) {
                case 'xlsx':
                    loadXSLX(file, (err, data) => {
                        if (err) {
                            console.error('error parsing XLSX file', err);
                            reject(err);
                            return;
                        }
                        fileDescriptor.data = data;
                        loadFile(fileDescriptor);
                    });
                    break;
                default:
                    loadFile(fileDescriptor);
            }
        }
        const fileReader = new FileReader();
        fileReader.onload = loadFileAsText;
        if (typeof file === 'string') {
            const request = new XMLHttpRequest();
            request.open('GET', file, true);
            request.responseType = 'blob';
            request.onload = function () {
                const newFile = {
                    filename: request.responseURL,
                    name: request.responseURL,
                    content: '###NULL-content',
                    size: request.response.size,
                    data: [],
                    requestURL: file
                };
                file = newFile;
                fileReader.readAsText(request.response);
            };
            request.send();
        } else {
            fileReader.readAsText(file);
        }
    });
}

export default fileLoaderPromise;
