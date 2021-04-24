import React from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';

import {Button, Row, Col} from 'antd';

class HowToFileClassicPage extends React.Component {
  static propTypes = {
    history: PropTypes.object,
  };
  render() {
    const {history} = this.props;
    const elements = (
      <div>
        <center>
          <div
            style={{
              marginTop: '148px',
              marginBottom: '48px',
            }}
          >
            <h1
              style={{
                fontSize: '48px',
                fontWeight: 400,
              }}
            >
              Jak rozliczyć podatek na zasadach ogólnych do 2018 roku włącznie?
            </h1>
            <span>
              Czyli jak działa podatek dochodowy w momencie zawarcia transakcji
              (zdarzenia podatkowego).
            </span>
          </div>
        </center>
        <div>
          <Row gutter={16}>
            <Col span={12}>
              <h2>Osoba fizyczna</h2>
              <ul>
                <li>
                  W momencie nabycia walut wirtualnych zostaje przypisany im
                  koszt nabycia wyrażony w polskim złotym, a następnie trafiają
                  one do <strong>kolejki</strong> kosztów;
                </li>
                <li>
                  W momencie zbycia walut wirtualnych powstaje{' '}
                  <strong>koszt</strong> w wartości zbywanych walut wirtualnych
                  podjętych z kolejki kosztów oraz powstaje{' '}
                  <strong>przychód</strong> w wartości otrzymanych dóbr, tj.
                  walut, walut wirtualnych, towarów lub usług wg aktualnego
                  kursu wyrażony w polskim złotym;
                </li>
                <li>
                  <strong>Dochodem</strong> z odpłatnego zbycia walut
                  wirtualnych jest osiągnięta w roku podatkowym różnica między
                  sumą przychodów uzyskanych z tytułu odpłatnego zbycia walut
                  wirtualnych a powstałymi kosztami uzyskania przychodów.
                </li>
              </ul>
              <p></p>
            </Col>
            <Col span={12} className="instructions">
              <h2>Działalnośc gospodarcza</h2>
              <ul>
                <li>
                  Podatnicy są obowiązani do sporządzenia i wpisania do{' '}
                  <strong>księgi</strong> spisu z natury towarów handlowych
                  (walut wirtualnych) zwanego dalej „
                  <strong>spisem z natury</strong>”, na dzień 1 stycznia, na
                  koniec każdego roku podatkowego, na dzień rozpoczęcia
                  działalności w ciągu roku podatkowego, a także w razie zmiany
                  wspólnika, zmiany proporcji udziałów wspólników lub likwidacji
                  działalności;
                </li>
                <li>
                  Wydane waluty wirtualne to `wydatek`, który wpisywany jest na
                  bieżąco do <strong>księgi</strong> wg aktualnego kursu
                  wyrażonego w polskim złotym;
                </li>
                <li>
                  Otrzymane waluty wirtualne to `przychód`, który wpisywany jest
                  na bieżąco do <strong>księgi</strong> wg aktualnego kursu tj.
                  otrzymanej zapłacie wyrażonej w polskim złotym;
                </li>
                <li>
                  Na koniec roku podatnik jest obowiązany wycenić materiały i
                  towary handlowe (waluty wirtualne) objęte{' '}
                  <strong>spisem z natury</strong> według cen zakupu lub nabycia
                  albo według cen rynkowych z dnia sporządzenia spisu, jeżeli są
                  one niższe od cen zakupu lub nabycia.
                </li>
                <li>
                  Od kosztów uzyskania przychodów odejmowana jest różnica
                  wartości pomiędzy początkowym, a końcowym{' '}
                  <strong>spisem z natury</strong>.
                </li>
              </ul>
              <p>
                Sprawdź Rozporządzenie Ministra Finansów z dnia 26 sierpnia 2003
                r. w sprawie prowadzenia podatkowej księgi przychodów i
                rozchodów.{' '}
                <a href="http://prawo.sejm.gov.pl/isap.nsf/download.xsp/WDU20031521475/O/D20031475.pdf">
                  {' '}
                  Dz.U. 2003 nr 152 poz. 1475
                </a>
                . Waluty wirtualne należy traktować jak{' '}
                <strong>towar handlowy</strong>.
              </p>
            </Col>
          </Row>
        </div>
        <center>
          <div style={{marginTop: '64px', marginBottom: '64px'}}>
            <Button
              type="primary"
              size="large"
              onClick={() => {
                history.push('/find-tax-advisor');
              }}
            >
              Znajdź doradcę
            </Button>
          </div>
        </center>
      </div>
    );
    return elements;
  }
}
export default withRouter(HowToFileClassicPage);
