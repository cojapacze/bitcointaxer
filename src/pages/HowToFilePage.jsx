import React from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import {FormattedMessage, injectIntl} from 'react-intl';
import HowToFileClassicPagePL from './HowToFile/pl/HowToFileClassicPage';
import HowToFileModernPagePL from './HowToFile/pl/HowToFileModernPage';
import {Button} from 'antd';

class HowToFilePage extends React.Component {
  static propTypes = {
    history: PropTypes.object,
    intl: PropTypes.object,
  };
  render() {
    const {intl, history} = this.props;
    const elements = [];
    switch (intl.locale) {
      case 'pl':
        elements.push(<HowToFileClassicPagePL key="1" />);
        elements.push(<HowToFileModernPagePL key="2" />);
        break;
      default:
        elements.push(
          <div
            key="3"
            style={{
              marginTop: '64px',
              marginBottom: '64px',
              textAlign: 'center',
            }}
          >
            <Button
              type="primary"
              size="large"
              onClick={() => {
                history.push('/find-tax-advisor');
              }}
            >
              <FormattedMessage
                id="HowToFileClassicPage.findTaxAdvisor"
                defaultMessage="Find Tax Advisor"
              />
            </Button>
          </div>,
        );
    }
    return <div>{elements}</div>;
  }
}
export default injectIntl(withRouter(HowToFilePage));
