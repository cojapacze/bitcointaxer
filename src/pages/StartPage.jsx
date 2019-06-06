import React from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import {FormattedMessage} from 'react-intl';

import {Button} from 'antd';

class StartPage extends React.Component {
  static propTypes = {
    history: PropTypes.object
  }
  render() {
    const {history} = this.props;
    const elements = <div>
      <center>
        <div
          style={{
            marginTop: '48px',
            marginBottom: '48px'
          }}
        >
          <h1><FormattedMessage
            id="StartPage.title"
            defaultMessage="Calculate your bitcoin taxes"
          /></h1>
          <span><FormattedMessage
            id="StartPage.tagline"
            defaultMessage="FMV - Cost Basis = Gain/Loss"
          /></span>
        </div>
        <div>
        </div>
        <div
          style={{marginTop: '64px', marginBottom: '64px'}}
        >
          <Button
            type="primary"
            size="large"
            onClick={() => {
              history.push('/introduction/prepare');
            }}
          >
            <FormattedMessage
              id="StartPage.startButton"
              defaultMessage="Let's start"
            />
          </Button>
        </div>
      </center>
    </div>;
    return elements;
  }
}
export default withRouter(StartPage);
