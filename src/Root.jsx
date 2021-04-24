import React from 'react';
import {BrowserRouter, Route, Switch} from 'react-router-dom';
// import {withRouter} from 'react-router-dom';

import Header from './components/Header';
import Footer from './components/Footer';
// import LeftMenu from './components/LeftMenu';
// import Breadcrumb from './components/Breadcrumb';

// import HomePage from './pages/HomePage';
import StartPage from './pages/StartPage';
import CalculatorPage from './pages/CalculatorPage';
import ManualPage from './pages/ManualPage';
import HowToFilePage from './pages/HowToFilePage';
import FindTaxAdvisorPage from './pages/FindTaxAdvisorPage';

// import FaqPage from './pages/FaqPage';
// import Page from './pages/Page';

import {Layout} from 'antd';

import {user} from './calculator/services/taxCalc/index.js';

import 'antd/dist/antd.css';
import 'ant-design-pro/dist/ant-design-pro.css';
import './styles/custom.css';

import {ConfigProvider} from 'antd';
import {IntlProvider} from 'react-intl';
import globalMessageValues from './locales/globalMessageValues.js';

// Start: Old-browsers polyfill
import {shouldPolyfill as shouldPolyfillPluralRules} from '@formatjs/intl-pluralrules/should-polyfill';
import {shouldPolyfill as shouldPolyfillRelativeTimeFormat} from '@formatjs/intl-relativetimeformat/should-polyfill';
async function polyfillTranslations(locale) {
  if (shouldPolyfillPluralRules()) {
    await import('@formatjs/intl-pluralrules/polyfill');
  }
  if (Intl.PluralRules.polyfilled) {
    switch (locale) {
      default:
        await import('@formatjs/intl-pluralrules/locale-data/en');
        break;
      case 'pl':
        await import('@formatjs/intl-pluralrules/locale-data/pl');
        break;
    }
  }

  if (shouldPolyfillRelativeTimeFormat()) {
    await import('@formatjs/intl-relativetimeformat/polyfill');
  }
  if (Intl.RelativeTimeFormat.polyfilled) {
    switch (locale) {
      default:
        await import('@formatjs/intl-relativetimeformat/locale-data/en');
        break;
      case 'pl':
        await import('@formatjs/intl-relativetimeformat/locale-data/pl');
        break;
    }
  }
}
// End: Old-browsers polyfill

import plMessages from './locales/pl.json';
import enMessages from './locales/en.json';

const translations = [
  {
    name: 'English (global) ',
    locale: 'en',
    messages: enMessages,
  },
  {
    name: 'Polski (PL)',
    locale: 'pl',
    messages: plMessages,
  },
];

class Root extends React.Component {
  static getDerivedStateFromProps(props) {
    return props;
  }
  constructor() {
    super();
    this.state = {
      localeLanguage: user.getLocaleLanguage(),
    };
  }
  onLocaleChange(localeLanguage) {
    console.log('current locale', localeLanguage);
    // old browsers polyfill
    polyfillTranslations(localeLanguage);
    this.setState({localeLanguage});
  }
  render() {
    const {localeLanguage} = this.state;
    const translation =
      translations.find(t => t.locale === localeLanguage) || translations[0];
    const result = (
      <div>
        <BrowserRouter>
          <Layout>
            <Header />
            <Layout>
              {/* <LeftMenu /> */}
              <Layout style={{padding: '24px 24px 24px'}}>
                {/* <Breadcrumb /> */}
                <Layout.Content
                  style={{
                    background: '#fff',
                    padding: 24,
                    margin: 0,
                    minHeight: 280,
                  }}
                >
                  <Switch>
                    <Route exact path="/" component={StartPage} />
                    <Route path="/introduction/:step" component={ManualPage} />
                    <Route path="/calculator" component={CalculatorPage} />
                    <Route path="/how-to-file" component={HowToFilePage} />
                    <Route
                      path="/find-tax-advisor"
                      component={FindTaxAdvisorPage}
                    />
                    {/* <Route path="/faq" component={FaqPage} /> */}
                    {/* <Route path="/pages/:id" component={Page} /> */}
                    {/* <Route path="*" component={HomePage} /> */}
                  </Switch>
                </Layout.Content>
              </Layout>
            </Layout>
          </Layout>
        </BrowserRouter>
        <Footer
          translations={translations}
          currentLocale={localeLanguage}
          onLocaleChange={this.onLocaleChange.bind(this)}
        />
      </div>
    );

    return (
      <ConfigProvider locale={translation.antd}>
        <IntlProvider
          locale={translation.locale}
          messages={translation.messages}
          formats={{
            ...globalMessageValues,
          }}
        >
          {result}
        </IntlProvider>
      </ConfigProvider>
    );
  }
}

export default Root;
