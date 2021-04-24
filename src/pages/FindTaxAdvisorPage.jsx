import React from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import FindTaxAdvisorPLPage from './FindTaxAdvisor/pl/FindTaxAdvisorPLPage';
import {FormattedMessage, injectIntl} from 'react-intl';

import {Input} from 'antd';

class FindTaxAdvisorPage extends React.Component {
  static propTypes = {
    history: PropTypes.object,
    intl: PropTypes.object,
  };
  render() {
    const {intl} = this.props;
    const elements = [];
    switch (intl.locale) {
      case 'pl':
        elements.push(<FindTaxAdvisorPLPage key="1" />);
        break;
      default:
    }
    const template = (
      <div>
        <center>
          <div
            style={{
              marginTop: '48px',
              marginBottom: '48px',
            }}
          >
            <h1>
              <FormattedMessage
                id="FindTaxAdvisor.title"
                defaultMessage="Find Tax Advisor"
              />
            </h1>
            <p>
              <FormattedMessage
                id="FindTaxAdvisor.tagline"
                defaultMessage="Search:"
              />
            </p>
            <FormattedMessage
              id="FindTaxAdvisor.search.placeholder"
              defaultMessage="enter location"
            >
              {placeholder => (
                <Input.Search
                  disabled
                  placeholder={placeholder}
                  onSearch={value => console.log(value)}
                  style={{width: 200}}
                />
              )}
            </FormattedMessage>
          </div>
        </center>
        {elements}
      </div>
    );
    return template;
  }
}
export default injectIntl(withRouter(FindTaxAdvisorPage));
