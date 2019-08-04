import React from 'react';
import PropTypes from 'prop-types';
import {withRouter, Route, Switch} from 'react-router-dom';

import {Steps, Row, Col, Button} from 'antd';
import {FormattedMessage} from 'react-intl';
import ManualPageStep1 from './ManualPageStep1';
import ManualPageStep2 from './ManualPageStep2';
import ManualPageStep3 from './ManualPageStep3';

class ManualPage extends React.Component {
  static propTypes = {
    history: PropTypes.object,
    location: PropTypes.object,
    match: PropTypes.object
  }
  state = {}
  static getDerivedStateFromProps(props) {
    return props;
  }

  constructor(props) {
    super(props);
    const {match} = props;
    console.log('ManualMatch', match);
    this.steps = [
      'prepare',
      'configure',
      'done'
    ];
  }
  render() {
    const {match, history} = this.props;
    const step = this.steps.indexOf(match.params.step);
    if (step === -1) {
      history.push(this.steps[0]);
      return false;
    }
    const isFirstStep = step === 0;
    const isLastStep = step === (this.steps.length - 1);
    console.log('render manual', match);
    const stepPage = <Switch>
      <Route path={`/introduction/${this.steps[0]}`} component={ManualPageStep1}/>
      <Route path={`/introduction/${this.steps[1]}`} component={ManualPageStep2}/>
      <Route path={`/introduction/${this.steps[2]}`} component={ManualPageStep3}/>
    </Switch>;
    let leftButton = false;
    if (!isFirstStep) {
      leftButton = <Button
        onClick={() => {
          history.push(this.steps[step - 1]);
        }}
      >
        <FormattedMessage
          id="ManualPage.prev"
          defaultMessage="Prev"
        />
      </Button>;
    }
    let rightButton = false;
    if (!isLastStep) {
      rightButton = <Button
        type="primary"
        onClick={() => {
          history.push(this.steps[step + 1]);
        }}
      >
        <FormattedMessage
          id="ManualPage.next"
          defaultMessage="Next"
        />
      </Button>;
    } else {
      rightButton = <Button
        type="primary"
        onClick={() => {
          history.push('/calculator');
        }}
      >
        <FormattedMessage
          id="ManualPage.open"
          defaultMessage="Open"
        />
      </Button>;
    }
    const elements = <div>
      <Steps current={step}>
        <Steps.Step
          title={<FormattedMessage id="ManualPage.step1" defaultMessage="Prepare history" />}
          description={<FormattedMessage id="ManualPage.step1.description" defaultMessage="How to prepare history?" />}
          style={{cursor: 'pointer'}}
          onClick={() => {
            history.push(this.steps[0]);
          }}
        />
        <Steps.Step
          title={<FormattedMessage id="ManualPage.step2" defaultMessage="The calculation settings" />}
          description={<FormattedMessage id="ManualPage.step2.description" defaultMessage="How the settings works?" />}
          style={{cursor: 'pointer'}}
          onClick={() => {
            history.push(this.steps[1]);
          }}
        />
        <Steps.Step
          title={<FormattedMessage id="ManualPage.step3" defaultMessage="Ready to proceed?" />}
          description={<FormattedMessage id="ManualPage.step3.description" defaultMessage="Run calculator!" />}
          style={{cursor: 'pointer'}}
          onClick={() => {
            history.push(this.steps[2]);
          }}
        />
      </Steps>
      {stepPage}
      <Row style={{marginTop: '32px'}}>
        <Col md={{span: 12}}>
          {leftButton}
        </Col>
        <Col style={{textAlign: 'right'}} md={{span: 12}}>
          {rightButton}
        </Col>
      </Row>
    </div>;
    return elements;
  }
}
export default withRouter(ManualPage);
