import React from 'react';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import {withRouter, matchPath} from 'react-router-dom';

import {Avatar, Layout, Menu} from 'antd';

import {NavLink} from 'react-router-dom';

import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faUserSecret} from '@fortawesome/free-solid-svg-icons';

import {user} from '../calculator/services/taxCalc/index.js';

function Header(props) {
  const {location} = props;
  const currentLocations = [];
  if (matchPath(location.pathname, {path: '/introduction/:step', exact: false, strict: false})) {
    currentLocations.push('introduction');
  }
  if (matchPath(location.pathname, {path: '/calculator', exact: false, strict: false})) {
    currentLocations.push('calculator');
  }

  return (
    <Layout.Header className="header">
      <div className="logo" style={{position: 'absolute', left: '24px', color: 'white'}}>
        <a style={{color: 'white'}} href="/">
          <img src="/logo_white.png" height="48" alt="bitcointaxer.org"/>
          &nbsp; <FormattedMessage
            id="app.domain"
            defaultMessage="bitcointaxer.org"
            description="domain name"
          />
        </a>
         &nbsp;  &nbsp;  &nbsp;  &nbsp;
      </div>
      <Menu
        theme="dark"
        mode="horizontal"
        selectedKeys={currentLocations}
        style={{marginLeft: '160px', lineHeight: '64px'}}
      >
        <Menu.Item key="introduction"><NavLink className="nav-link-off" to="/introduction/prepare"><FormattedMessage
          id="Header.manual"
          defaultMessage="Introduction"
          description="topmenu: manual"
        /></NavLink></Menu.Item>
        <Menu.Item key="calculator"><NavLink className="nav-link-off" to="/calculator"><FormattedMessage
          id="Header.calculator"
          defaultMessage="Calculator"
          description="topmenu: calculator"
        /></NavLink></Menu.Item>
      </Menu>
      <div style={{position: 'absolute', top: '0px', right: '24px', color: 'white'}}>
        {/* <Dropdown
          overlay={menu}
          placement="bottomLeft"
        > */}
        <div><Avatar><FontAwesomeIcon icon={faUserSecret} /></Avatar> {user.getUserName()}</div>
        {/* </Dropdown> */}
      </div>
    </Layout.Header>
  );
}

Header.propTypes = {
  match: PropTypes.object,
  location: PropTypes.object
};

export default withRouter(Header);

