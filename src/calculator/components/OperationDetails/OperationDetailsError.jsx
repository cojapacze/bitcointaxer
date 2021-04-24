import React from 'react';
import {FormattedMessage} from 'react-intl';

import {EditAsset, EditTagsQuick} from '../Edit';
import {PrintOperationCurrentErrors} from '../Print';
import {getAssetConfig} from '../../services/taxCalc/libs/Utils';
import {operationQueue} from '../../services/taxCalc/index.js';
import {Button, Form, Input, Switch, Upload} from 'antd';
import {PaperClipOutlined} from '@ant-design/icons';
import {CONFIG} from '../../services/taxCalc/libs/Utils';

class OperationDetailsError extends React.Component {
  state = {};

  static getDerivedStateFromProps(props) {
    return props;
  }

  getCurrentOperation() {
    const operation = operationQueue.getCurrent();
    if (!operation) {
      throw new Error('no-current-operation');
    }
    return operation;
  }
  getCurrentMissingCost() {
    const operation = operationQueue.getCurrent();
    return operation.calculatorStep.operationMissingCostPart;
  }
  getCurrentMissingCostKey() {
    const operation = this.getCurrentOperation();
    const missingCostKey =
      operation.calculatorStep.operationMissingCostPart.missingCostKey;
    return missingCostKey;
  }
  setCostBasis(costBasis) {
    const missingCost = this.getCurrentMissingCost();
    operationQueue.setMissingCost(missingCost, {
      costBasis: costBasis,
      rate: missingCost.amount ? costBasis / missingCost.amount : 0,
    });
    this.forceUpdate();
  }
  setNotes(notes) {
    const missingCost = this.getCurrentMissingCost();
    operationQueue.setMissingCost(missingCost, {
      notes: notes,
    });
    this.forceUpdate();
  }

  setPenalty(penalty) {
    const missingCost = this.getCurrentMissingCost();
    operationQueue.setMissingCost(missingCost, {
      penalty: penalty,
    });
    this.forceUpdate();
  }

  setErrorResolved(errorResolved) {
    const missingCost = this.getCurrentMissingCost();
    operationQueue.setMissingCost(missingCost, {
      errorResolved: errorResolved,
    });
    this.forceUpdate();
  }

  render() {
    const formItemLayout = {
      labelCol: {span: 8},
      wrapperCol: {span: 16},
      className: 'compact-form-item',
      layout: 'inline',
    };
    const operation = this.getCurrentOperation();
    const {colors} = this.state;
    if (!operation) {
      return <div>Unknown record</div>;
    }
    operation.from.assetConfig = getAssetConfig(operation.from.asset);
    operation.to.assetConfig = getAssetConfig(operation.to.asset);
    const missingCost = operationQueue.getMissingCost(
      operation.calculatorStep.operationMissingCostPart,
    );
    let costBasis = 0;
    let penalty = 0;
    let errorResolved = false;
    let notes = '';
    if (missingCost) {
      costBasis = missingCost.costBasis || costBasis;
      penalty = missingCost.penalty || penalty;
      errorResolved = missingCost.errorResolved || errorResolved;
      notes = missingCost.notes || notes;
    }
    const disabled = errorResolved;
    const uploadProps = {
      action: '/upload',
      onChange({file, fileList}) {
        if (file.status !== 'uploading') {
          console.log(file, fileList);
        }
        const fileHandler = operationQueue.storage.storeFile(file);
        console.log('fileHandler', fileHandler);
      },
      defaultFileList: [
        // {
        //   uid: '1',
        //   name: 'filename.csv',
        //   status: 'done',
        //   response: 'Server Error 500', // custom error message to show
        //   url: 'https://bitcointaxr.org/tests/test01.csv'
        // }
      ],
    };
    return (
      <Form>
        <div key={'errors'} style={{textAlign: 'center'}}>
          <PrintOperationCurrentErrors operation={operation} colors={colors} />
        </div>
        <div
          key={'resolved'}
          style={{textAlign: 'center', marginBottom: '48px', marginTop: '8px'}}
        >
          <Switch
            id="drawer-error-status"
            checkedChildren={
              <FormattedMessage
                id="OperationDetailsError.resolved"
                defaultMessage="Resolved"
              />
            }
            unCheckedChildren={
              <FormattedMessage
                id="OperationDetailsError.unresolved"
                defaultMessage="Unresolved"
              />
            }
            checked={errorResolved}
            onChange={e => this.setErrorResolved(e)}
          />
        </div>
        <Form.Item
          key={'costBasis'}
          {...formItemLayout}
          label={
            <FormattedMessage
              id="OperationDetailsError.costBasis"
              defaultMessage="Cost Basis"
            />
          }
        >
          <EditAsset
            disabled={disabled}
            id="drawer-error-costBasis"
            mode={'text'}
            disableBlink={true}
            value={costBasis}
            asset={operation.calculatorStep.residenceCurrency}
            onChange={e => this.setCostBasis(parseFloat(e.target.value))}
            onChangeBlur={() => operationQueue.recalculateIfModified()}
          />
        </Form.Item>
        {CONFIG.calculatorFeatures.showFine && (
          <Form.Item
            key={'fine'}
            {...formItemLayout}
            label={
              <FormattedMessage
                id="OperationDetailsError.fine"
                defaultMessage="Fine"
              />
            }
          >
            <EditAsset
              disabled={disabled}
              id="drawer-error-penalty"
              mode={'text'}
              disableBlink={true}
              value={penalty}
              asset={operation.calculatorStep.residenceCurrency}
              onChange={e => this.setPenalty(parseFloat(e.target.value))}
            />
          </Form.Item>
        )}

        {CONFIG.features.trackCoins && (
          <Form.Item
            key={'tags'}
            {...formItemLayout}
            label={
              <FormattedMessage
                id="OperationDetailsError.tags"
                defaultMessage="Tags"
              />
            }
          >
            <EditTagsQuick
              disabled={disabled}
              id="drawer-error-tagsQuick"
              operationQueue={operationQueue}
              operation={operation}
            />
          </Form.Item>
        )}
        <Form.Item
          key={'notes'}
          {...formItemLayout}
          label={
            <FormattedMessage
              id="OperationDetailsError.notes"
              defaultMessage="Notes"
            />
          }
        >
          <Input.TextArea
            disabled={disabled}
            id="drawer-error-notes"
            rows={4}
            value={notes}
            onChange={e => this.setNotes(String(e.target.value))}
          />
        </Form.Item>
        {false && (
          <Form.Item
            key={'documents'}
            {...formItemLayout}
            label={
              <FormattedMessage
                id="OperationDetailsError.documents"
                defaultMessage="Documents"
              />
            }
          >
            <Upload {...uploadProps} disabled={disabled}>
              <Button>
                <PaperClipOutlined type="paper-clip" />{' '}
                <FormattedMessage
                  id="OperationDetailsError.documents.attach"
                  defaultMessage="Attach"
                />
              </Button>
            </Upload>
          </Form.Item>
        )}
      </Form>
    );
  }
}

export default OperationDetailsError;
