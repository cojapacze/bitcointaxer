import csvParse from 'csv-parse';
import adapter001 from './testcaseAdapter.js';
import adapter002 from './bitbay-Historia-Szczegolowa.js';
import adapter003 from './bitbay-Historia-Transakcje.js';
import adapter004 from './bitbay-Historia-Wplaty_Wyplaty.js';
import adapter005 from './bitmarket24-historia_salda.js';
import adapter006 from './bitmarket24-historia_transakcji.js';
import adapter007 from './kraken-ledgers.js';
import adapter008 from './poloniex-depositHistory-withdrawalHistory.js';
import adapter009 from './poloniex-tradeHistory.js';
import adapter010 from './kursy.js';
import adapter011 from './bittrex-fullOrders';
import adapter012 from './wavesplatform-transactions';
// import adapter011 from './exAdapters/kraken-trades.js';

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
    adapter012
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
        console.error('No adapter for file:', file.filename, 'header line[', file.content.substr(0, 100), ']');
        return false;
    }
    return detectedTypes[0];
}

function fileLoaderPromise(file) {
    return new Promise((resolve, reject) => {
        function loadFile(e) {
            const content = e.currentTarget.result;
            const fileDescriptor = {
                file: file,
                basename: file.name,
                filename: file.name,
                content: content
            };
            let fileAdapter = false;
            try {
                fileAdapter = getPlugin(fileDescriptor);
            } catch (err) {
                reject(err);
                return;
            }
            if (!fileAdapter || (fileAdapter instanceof Error)) {
                reject(fileAdapter);
                throw fileAdapter;
                // return;
            }
            csvParse(content, fileAdapter.csvParseConfig, (err, output) => {
                if (err) {
                    console.error('ERROR', err);
                    reject(err);
                    return;
                }
                fileDescriptor.timezone = 'UTC+2h';
                fileDescriptor.data = output;
                fileDescriptor.type = (fileAdapter.getPluginname && fileAdapter.getPluginname()) || fileAdapter.pluginname;
                fileDescriptor.fileAdapter = fileAdapter;
                fileDescriptor.operations = fileAdapter.getOperations(fileDescriptor) || [];
                resolve(fileDescriptor);
            });
        }
        const fileReader = new FileReader();
        fileReader.onload = loadFile;

        if (typeof file === 'string') {
            const request = new XMLHttpRequest();

            request.open('GET', file, true);
            request.responseType = 'blob';
            request.onload = function() {
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
            // fileReader.readAsDataURL(new File(file)).catch(console.error);
        } else {
            fileReader.readAsText(file);
        }
    });
}


export default fileLoaderPromise;
