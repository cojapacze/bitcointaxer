
class Eventsmanager {
    constructor() {
        /**
         * Key array for registering callback functions for events
         * @type {Object}
         */
        this.registeredCallbacks = {};
        this.registeredCallbacksAfter = {};
        this.registeredCallbacksOnce = {};

        this.afterThreshold = 100;
        this.afterTimeouts = {};
    }
    /**
     * Register event
     *
     * @param  {string}   event    - event name
     * @param  {function} callback - callback function
     */
    on(event, callbackFn) {
        if (typeof callbackFn !== 'function') {
            throw new Error('Eventsmanager.on(event, callbackFn) - typeof callbackFn === function required');
        }
        if (!this.registeredCallbacks[event]) {
            this.registeredCallbacks[event] = [];
        }
        this.registeredCallbacks[event].push(callbackFn);
        return this;
    }
    after(event, callbackFn) {
        if (typeof callbackFn !== 'function') {
            throw new Error('Eventsmanager.after(event, callbackFn) - typeof callbackFn === function required');
        }
        if (!this.registeredCallbacksAfter[event]) {
            this.registeredCallbacksAfter[event] = [];
        }
        this.registeredCallbacksAfter[event].push(callbackFn);
        return this;
    }
    removeListener(event, callbackFn) {
        if (!this.registeredCallbacks[event]) {
            return;
        }
        let i;
        if (this.registeredCallbacks[event]) {
            for (i = this.registeredCallbacks[event].length - 1; i >= 0; i -= 1) {
                if (this.registeredCallbacks[event][i] === callbackFn) {
                    this.registeredCallbacks[event].splice(i, 1);
                }
            }    
        }
        if (this.registeredCallbacksAfter[event]) {
            for (i = this.registeredCallbacksAfter[event].length - 1; i >= 0; i -= 1) {
                if (this.registeredCallbacksAfter[event][i] === callbackFn) {
                    this.registeredCallbacksAfter[event].splice(i, 1);
                }
            }    
        }
        if (this.registeredCallbacksOnce[event]) {
            for (i = this.registeredCallbacksOnce[event].length - 1; i >= 0; i -= 1) {
                if (this.registeredCallbacksOnce[event][i] === callbackFn) {
                    this.registeredCallbacksOnce[event].splice(i, 1);
                }
            }
        }
    }
    removeListeners(event) {
        this.registeredCallbacks[event] = [];
        this.registeredCallbacksAfter[event] = [];
        this.registeredCallbacksOnce[event] = [];
    }
    once(event, callbackFn, uniqueId) {
        if (!this.registeredCallbacksOnce[event]) {
            this.registeredCallbacksOnce[event] = [];
        }
        let added = false;
        if (uniqueId) {
            this.registeredCallbacksOnce[event].forEach(callback => {
                if (callback.id === uniqueId) {
                    callback.fn = callbackFn;
                    added = true;
                    return;
                }
            });
        }
        if (!added) {
            this.registeredCallbacksOnce[event].push({
                id: uniqueId,
                fn: callbackFn
            });
        }
        return this;
    }
    /**
     * Dispatch event
     * @param  {string} event - event name
     * @param  {any} param - argument passed to callback functions
     * @param  {any} param2 - argument 2 passed to callback functions
     * @param  {any} param3 - argument 2 passed to callback functions ... dont f with Douglas
     */
    dispatch(event, param, param2, param3) {
        if (this.registeredCallbacks[event]) {
            this.registeredCallbacks[event].forEach(callback => {
                callback(param, param2, param3);
            });
        }
        if (this.registeredCallbacksOnce[event]) {
            this.registeredCallbacksOnce[event].forEach(callback => {
                callback.fn(param, param2, param3);
            });
            delete this.registeredCallbacksOnce[event];
        }
        if (this.afterTimeouts[event]) {
            clearTimeout(this.afterTimeouts[event]);
            this.afterTimeouts[event] = false;
        }
        const that = this;
        function afterTimeout() {
            that.afterTimeouts[event] = false;
            if (that.registeredCallbacksAfter[event]) {
                that.registeredCallbacksAfter[event].forEach(callback => {
                    callback(param, param2, param3);
                });    
            }
        }
        this.afterTimeouts[event] = setTimeout(afterTimeout, this.afterThreshold);

        return this;
    }
}

export default Eventsmanager;
