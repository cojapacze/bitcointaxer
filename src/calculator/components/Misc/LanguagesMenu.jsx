import React from 'react';
import PropTypes from 'prop-types';

function LanguagesMenu(props) {
  const {translations, locale, onChange} = props;
  const elements = [];
  let i;
  for (i = 0; i < translations.length; i += 1) {
    const localeObject = translations[i];
    const style = {
      cursor: 'pointer'
    };
    if (localeObject.locale === locale) {
      style.textDecoration = 'underline';
    }
    elements.push(
      <span
        key={localeObject.locale}
        style={style}
        onClick={() => onChange(localeObject.locale)}
      >
        {localeObject.name}
      </span>
    );
    if (i < translations.length - 1) {
      elements.push(<span style={{margin: '0 4px'}} key={`sep-${i}`}>|</span>);
    }
  }
  return <div>{elements}</div>;
}

LanguagesMenu.propTypes = {
  translations: PropTypes.array,
  locale: PropTypes.string,
  onChange: PropTypes.func
};

export default LanguagesMenu;
