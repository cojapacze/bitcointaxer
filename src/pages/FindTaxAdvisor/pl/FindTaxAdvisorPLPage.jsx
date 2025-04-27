import React from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';

import {Row, Col} from 'antd';

class FindTaxAdvisorPL extends React.Component {
  static propTypes = {
    history: PropTypes.object
  }
  render() {
    const elements = <div>
      <Row gutter="24">
        <Col span="12">
          <img alt="Mapa Polski" style={{float: 'left', width: '100%'}} src="images/find_tax_advisor/pl/map.svg"/>
        </Col>
        <Col span="12">
          <h1>Bezpłatnych informacji na temat podatków w Polsce udziela:</h1>
          <h2>Krajowa Informacja Skarbowa</h2>
          <p>Informacje na temat podatków można uzyskać dzwoniąc pod nr telefonu:</p>
          <ul>
            <li>22 330 03 30 (z telefonów komórkowych)</li>
            <li>801 055 055 (z telefonów stacjonarnych)</li>
            <li>+48 22 330 03 30 (z zagranicy)</li>
          </ul>
          <p>od poniedziałku do piątku w godzinach od 7.00 do 18.00.</p>
          <p>Po połączeniu system zapowiedzi głosowych poprowadzi po menu, prosząc o wybranie cyfry odpowiadającej interesującemu zagadnieniu, np. <strong>podatek dochodowy od osób fizycznych</strong>.</p>
          <a href="https://www.kis.gov.pl/zalatwianie-spraw/udzielanie-informacji" target="_blank" rel="noreferrer">odwiedź stronę</a>
        </Col>
      </Row>
    </div>;
    return elements;
  }
}
export default withRouter(FindTaxAdvisorPL);
