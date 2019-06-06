import React from 'react';
import {message, notification, Icon, Divider, Button} from 'antd';
import {PrintOperation, PrintOperationNoAndTimestamp} from '../../../components/Print/';

// message.success(content, [duration], onClose)
// message.error(content, [duration], onClose)
// message.info(content, [duration], onClose)
// message.warning(content, [duration], onClose)
// message.warn(content, [duration], onClose) // alias of warning
// message.loading(content, [duration], onClose)
class Console {
    i = 0;
    config = {
        displayErrors: false,
        displayMessages: false
    }
    setConfig(config) {
        Object.assign(this.config, config);
    }
    destroy() {
        if (!this.config.displayErrors) {
            return;
        }
        notification.destroy();
        this.i = 0;
    }
    success(content, duration, onClose) {
        if (!this.config.displayMessages) {
            return;
        }
        message.success(content, duration, onClose);
    }
    operationError(operation, errors, tag) {
        if (!this.config.displayErrors) {
            return;
        }
        // tag = 'GO TO';
        const operationQueue = operation.operationQueue;
        const duration = 0;
        const placement = 'bottomLeft';
        const theme = 'twoTone';
        const twoToneColor = 'orange';
        this.i += 1;
        const notificationKey = this.i;
        const actionShowOperation = closeDrawer => {
            if (operation !== operationQueue.getCurrent()) {
                if (operationQueue.drawerOpened) {
                    // console.log('delayed');
                    operationQueue.dispatch('close-drawer');
                    setTimeout(() => {
                        operationQueue.setCurrent(operation.key); // set current key or refactor to pass operation object
                        operationQueue.dispatch('open-drawer');
                    }, 500);    
                } else {
                    // setTimeout(() => {
                    operationQueue.setCurrent(operation.key); // set current key or refactor to pass operation object
                    operationQueue.dispatch('open-drawer');
                    // }, 250);    
                }
            } else if (!operationQueue.drawerOpened) {
                operationQueue.dispatch('open-drawer');
            }
        
            if (closeDrawer) {
                notification.close(notificationKey);
            }
        };
        const button = <Button
            type={'dashed'}
            onClick={() => actionShowOperation(false)}
        >GO TO</Button>;
        notification.open({
            key: notificationKey,
            btn: button,
            message: tag,
            description: <div>
                <div onClick={() => actionShowOperation(false)}
                    style={{fontSize: '12px', cursor: 'pointer'}}
                >
                    <PrintOperationNoAndTimestamp operation={operation} totalSteps={operationQueue.getCount()}/>
                </div>
                <div
                    style={{fontSize: '12px', cursor: 'pointer'}}
                    onClick={() => actionShowOperation(false)}
                >
                    <PrintOperation operation={operation} colors={true}/>
                </div>
                <Divider orientation="right">Uwagi</Divider>
                {errors}
            </div>,
            icon: <Icon type="exclamation-circle" theme={theme} twoToneColor={twoToneColor}/>,
            duration,
            placement
        });
    }
    cookies() {
        const content = 'We may uses cookies to ensure that we give you the best experience on our website. By using the website you agree to our use of cookies.';
        const duration = 6;
        const placement = 'bottomLeft';

        notification.open({
            message: 'Cookies',
            description: content,
            icon: <Icon type="info-circle"/>,
            duration,
            placement
        });
    }

    error(stamp, operation, ...args) {
        if (!this.config.displayErrors) {
            return;
        }

        const content = args.join(' ');
        const duration = 0;
        const placement = 'bottomLeft';
        const theme = 'twoTone';
        const twoToneColor = 'orange';

        notification.open({
            // operationQueue.getCount()
            message: <div style={{fontSize: '12px'}}><PrintOperationNoAndTimestamp operation={operation} totalSteps={666}/></div>,
            description: <div>
                <div style={{fontSize: '12px'}}><PrintOperation operation={operation} colors={true}/></div>
                <hr/>
                {stamp} {content}
            </div>,
            icon: <Icon type="exclamation-circle" theme={theme} twoToneColor={twoToneColor}/>,
            duration,
            placement
        });
        // message.error(content, duration, onClose);
    }
    info(content, duration, onClose) {
        if (!this.config.displayMessages) {
            return;
        }
        message.info(content, duration, onClose);
    }
    warning(content, duration, onClose) {
        if (!this.config.displayMessages) {
            return;
        }
        message.warning(content, duration, onClose);
    }
    warn(content, duration, onClose) {
        if (!this.config.displayMessages) {
            return;
        }
        message.warn(content, duration, onClose);
    }
    loading(content, duration, onClose) {
        if (!this.config.displayMessages) {
            return;
        }
        message.loading(content, duration, onClose);
    }
    log(...args) {
        if (!this.config.displayMessages) {
            return;
        }
        const content = args.join(' ');
        const duration = 5;
        const onClose = false;
        message.info(content, duration, onClose);
    }
    debug(text) {
        if (!this.config.displayMessages) {
            return;
        }
        message.warn(text);
    }
    constructor() {
        notification.config({
            placement: 'topLeft',
            // bottom: 50,
            duration: 3
        });
        window.notification = notification;
        this.cookies();
        // this.log('Console - self init.');
    }
}

export default Console;
