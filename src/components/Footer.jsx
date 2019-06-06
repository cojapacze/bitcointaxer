import React from 'react';
import PropTypes from 'prop-types';

import {Icon} from 'antd';
import LanguagesMenu from '../calculator/components/Misc/LanguagesMenu';
import GlobalFooter from 'ant-design-pro/lib/GlobalFooter';

const links = [{
  key: 'github',
  title: <Icon type="github" />,
  href: 'https://github.com/cojapacze/bitcointaxer',
  blankTarget: true
}];

const copyright = <div>Copyright <Icon type="copyright" /> 2017-2019 timescraper.com</div>;

const Footer = props => {
  const {translations, onLocaleChange, currentLocale} = props;
  return (
    <div style={{overflow: 'hidden', textAlign: 'center'}}>
      <div style={{height: '3vw'}} />
      <GlobalFooter links={links} copyright={copyright} />
      <LanguagesMenu translations={translations} locale={currentLocale} onChange={onLocaleChange}/>
      <div style={{height: '3vw'}} />
    </div>
  );
};

Footer.propTypes = {
  onLocaleChange: PropTypes.func,
  translations: PropTypes.array,
  currentLocale: PropTypes.string
};

export default Footer;
