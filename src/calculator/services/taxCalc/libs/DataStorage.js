// TODO: add data storage
import Eventsmanager from './Eventsmanager';
import PouchDB from 'pouchdb';
import {toIndexableString} from 'pouchdb-collate';
PouchDB.plugin(require('pouchdb-upsert'));

const db = new PouchDB('test', {
    revs_limit: 3
});

window.db = db;
  
db.changes({
    since: 'now',
    live: true,
    include_docs: true
}).on('change', change => {
    // handle change
    // console.log('PouchDB-change', change);
}).on('complete', info => {
    // changes() was canceled
    // console.info('PouchDB-complete', info);
}).on('error', err => {
    switch (err.name) {
    case 'not_found':
        break;
    default:
        console.error('PouchDB-error', err);
    }
});

// Add a post
class DataStorage extends Eventsmanager {
    filesStorage = {}
    constructor(config) {
        super(config);
        window.storage = this;
    }
    genDocKey(type, obj) {
        return `${obj.date}-${type}`;
    }
    getFileHash(fileObj) {
        if (fileObj) {
            return 'no-hash-error';
        }
        return false;
    }
    storeFile(fileObj) {
        const fileHash = this.getFileHash(fileObj);
        if (this.filesStorage[fileHash]) {
            return this.filesStorage[fileHash];
        }
        this.filesStorage[fileHash] = fileObj;
        return fileObj;
    }
    storePrice(price) {
        const _id = toIndexableString({
            date: price.date,
            timestamp: price.timestamp,
            type: 'price',
            baseAsset: price.baseAsset,
            baseValue: price.baseValue,
            quoteAsset: price.quoteAsset,
            quoteValue: price.quoteValue
        });
        db.upsert(_id, () => price);
    }
    storeOperation(operation) { // , method
        const _id = toIndexableString({
            date: operation.date,
            // timestamp: operation.timestamp,
            type: operation.type,
            from: JSON.stringify(operation.from),
            to: JSON.stringify(operation.to)
        });
        db.upsert(_id, () => operation);
    }
    readOperation(operation) {        
        const _id = toIndexableString({
            date: operation.date,
            // timestamp: operation.timestamp,
            type: operation.type,
            from: JSON.stringify(operation.from),
            to: JSON.stringify(operation.to)
        });
        return db.get(_id);
    }
    setItem(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }
    getItem(key) {
        const string = localStorage.getItem(key);
        if (string) {
            return JSON.parse(string);
        }
        return null;
    }
}

export default DataStorage;
