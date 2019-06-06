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

// import FaqPage from './pages/FaqPage';
// import Page from './pages/Page';

import {Layout} from 'antd';

import {user} from './calculator/services/taxCalc/index.js';

import 'antd/dist/antd.css';
import 'ant-design-pro/dist/ant-design-pro.css';
import './styles/custom.css';

import {LocaleProvider} from 'antd';
import {addLocaleData, IntlProvider} from 'react-intl';

import plAntd from 'antd/lib/locale-provider/pl_PL';
import plAppLocaleData from 'react-intl/locale-data/pl';
import plMessages from './locales/pl.json';

import enAntd from 'antd/lib/locale-provider/en_US';
import enAppLocaleData from 'react-intl/locale-data/en';
import enMessages from './locales/en.json';

const translations = [
  {
    name: 'English (dev)',
    locale: 'en',
    messages: enMessages,
    antd: enAntd,
    data: enAppLocaleData
  },
  {
    name: 'Polski',
    locale: 'pl',
    messages: plMessages,
    antd: plAntd,
    data: plAppLocaleData
  }
];
translations.forEach(t => addLocaleData(t.data));


class Root extends React.Component {
  static getDerivedStateFromProps(props) {
    return props;
  }
  constructor() {
    super();
    this.state = {
      localeLanguage: user.getLocaleLanguage()
    };
  }
  onLocaleChange(localeLanguage) {
    this.setState({localeLanguage});
  }
  render() {
    const {localeLanguage} = this.state;
    const translation = translations.find(t => t.locale === localeLanguage) || translations[0];
    const result =
      <div>
        <BrowserRouter>
          <Layout>
            <Header />
            <Layout>
              {/* <LeftMenu /> */}
              <Layout style={{padding: '24px 24px 24px'}}>
                {/* <Breadcrumb /> */}
                <Layout.Content style={{background: '#fff', padding: 24, margin: 0, minHeight: 280}}>
                  <Switch>
                    <Route exact path="/" component={StartPage} />
                    <Route path="/introduction/:step" component={ManualPage} />
                    <Route path="/calculator" component={CalculatorPage} />
                    {/* <Route path="/home" component={HomePage} /> */}
                    {/* <Route path="/calculator" component={CalculatorPage} /> */}
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
      </div>;

    return (
      <LocaleProvider locale={translation.antd}>
        <IntlProvider locale={translation.locale} messages={translation.messages}>
          {result}
        </IntlProvider>
      </LocaleProvider>
    );
  }
}

export default Root;
