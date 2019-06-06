import React from 'react';

import Eventsmanager from './Eventsmanager';
import {CONFIG, colorOfHash, comapreObjectsByFields} from './Utils';
import fileLoaderPromise from '../fileAdapters/index.js';
class FileList extends Eventsmanager {
    constructor(operationQueue) {
        super();
        this.fileList = [];
        this.operationQueue = operationQueue;
        const url = CONFIG.testcaseFile;
        if (url) {
            fileLoaderPromise(url, console.log).then(loadedFile => {
                this.addFile(loadedFile);
            }).catch(err => {
                console.error('urlLoaderPromise-error', err);
            });
        }
    }
    getFileList() {
        return this.fileList;
    }
    getUploadFileList() {
        const fileList = this.fileList.map(fullFile => {
            let name = `${fullFile.basename}`;

            if (fullFile.addinfo) {
                name += ` (${fullFile.addinfo})`;
            }
            if (fullFile.type) {
                name += ` [${fullFile.type}]`;
            }
            let color = 'black';
            const seed = CONFIG.seed;
            color = colorOfHash(fullFile.fileAdapter.domain, seed);
            return {
                domain: fullFile.fileAdapter.domain,
                adapter: fullFile.fileAdapter.adapter,
                fileAdapter: fullFile.fileAdapter,
                uid: fullFile.file.uid,
                name: <div style={{color: color}}>{name}</div>,
                filename: name,
                status: 'done'
            };
        });
        fileList.sort((a, b) => -1 * comapreObjectsByFields(a, b, ['domain', 'filename', 'adapter']));
        return fileList;
    }

    addFile(fullFile) {
        if (!fullFile.file.uid) {
            fullFile.file.uid = fullFile.file.filename;
        }
        this.fileList.push(fullFile);
        this.operationQueue.addOperations(fullFile.operations);
        this.dispatch('change', this.fileList);
    }

    removeFile(file) {
        this.fileList = this.fileList.filter(fullFile => {
            if (fullFile.file.uid === file.uid) {
                this.operationQueue.removeOperations(el => !fullFile.operations.includes(el));
                return false;
            }
            return true;
        });
        this.dispatch('change', this.fileList);
    }
}

export default FileList;
