import OperationQueue from './libs/OperationQueue';
import FileList from './libs/FileList';
import Prices from './libs/Prices';
import Console from './libs/Console';
import User from './libs/User';
import DataStorage from './libs/DataStorage';

const user = new User();
const storage = new DataStorage();
const antConsole = new Console();
const prices = new Prices({
    storage: storage
});

const operationQueue = new OperationQueue({
    user: user,
    storage: storage,
    prices: prices,
    console: antConsole
});

window.prices = prices;
window.antConsole = antConsole;

const fileList = new FileList(operationQueue);
window.operationQueue = operationQueue;
window.fileList = fileList;


export {
    user,
    operationQueue,
    fileList
};
