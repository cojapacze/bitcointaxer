import React from 'react';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import {FormattedMessage} from 'react-intl';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faPen, faArrowLeft, faExternalLinkAlt, faLongArrowAltRight} from '@fortawesome/free-solid-svg-icons';

import {Button, Row, Col} from 'antd';
import Zoom from 'react-medium-image-zoom';
import 'react-medium-image-zoom/dist/styles.css';

class HowToFileModernPage extends React.Component {
  static propTypes = {
    history: PropTypes.object
  }
  render() {
    const {history} = this.props;
    const descStyle = {
      fontSize: '20px',
      fontWeight: 250
    };
    const rowStyle = {
      marginTop: '48px',
      marginBottom: '48px'
    };
    const stepNoStyle = {
      fontSize: '20px',
      fontWeight: 300
    };

    const elements = <div id="nowe_zasady_od_2019">
      <center>
        <div
          style={{
            marginTop: '48px',
            marginBottom: '48px'
          }}
        >
          <h1 style={{
            fontSize: '48px',
            fontWeight: 400
          }}><FormattedMessage
              id="HowToFilePage.title"
              defaultMessage="Jak rozliczyć podatek od kryptowalut na nowych zasadach za 2019 rok?"
            /></h1>
          <span><FormattedMessage
            id="HowToFilePage.tagline"
            defaultMessage="Zeznanie na nowych zasadach składamy pierwszy raz do 31 kwietnia 2020 roku."
          /></span>
        </div>
      </center>
      <div>
        <Row gutter={16}>
          <Col span={24}>
            <h4><a rel="noopener noreferrer" target="_blank" href="https://www.lexlege.pl/ustawa-o-podatku-dochodowym-od-osob-fizycznych/art-22/">§</a> Przepisy obowiązujące od 2019r.:</h4>
            <blockquote cite="https://www.lexlege.pl/ustawa-o-podatku-dochodowym-od-osob-fizycznych/art-22/">
              <ol start="14">
                <li>Koszty uzyskania przychodów z tytułu odpłatnego zbycia waluty wirtualnej stanowią udokumentowane wydatki bezpośrednio poniesione na nabycie waluty wirtualnej oraz koszty związane ze zbyciem waluty wirtualnej, w tym udokumentowane wydatki poniesione na rzecz podmiotów, o których mowa w art. 2 instytucje obowiązane ust. 1 pkt 12 ustawy o przeciwdziałaniu praniu pieniędzy oraz finansowaniu terroryzmu.</li>
                <li>Koszty uzyskania przychodów, o których mowa w ust. 14, są potrącane w tym roku podatkowym, w którym zostały poniesione, z zastrzeżeniem ust. 16.</li>
                <li>Nadwyżka kosztów uzyskania przychodów, o których mowa w ust. 14, nad przychodami z odpłatnego zbycia waluty wirtualnej uzyskanymi w roku podatkowym powiększa koszty uzyskania przychodów z tytułu odpłatnego zbycia waluty wirtualnej poniesione w następnym roku podatkowym.</li>
              </ol>
            </blockquote>
            <h4><a rel="noopener noreferrer" target="_blank" href="http://www.przepisy.gofin.pl/przepisy,4,42,42,5018,,20190101,ustawa-z-dnia-23102018-r-o-zmianie-ustawy-o-podatku.html">§</a> Przepisy przejściowe:</h4>
            <blockquote cite="http://www.przepisy.gofin.pl/przepisy,4,42,42,5018,,20190101,ustawa-z-dnia-23102018-r-o-zmianie-ustawy-o-podatku.html">
              <strong>Art. 23.</strong> Koszty uzyskania przychodów, o których mowa w art. 22 ust. 14 ustawy zmienianej w art. 1 oraz w art. 15 ust. 11 ustawy zmienianej w art. 2, poniesione i nieodliczone od przychodów przed dniem wejścia w życie niniejszej ustawy, podatnik wykazuje odpowiednio w zeznaniu, o którym mowa w art. 45 ust. 1a pkt 1 ustawy zmienianej w art. 1, składanym za 2019 r. albo w zeznaniu, o którym mowa w art. 27 ust. 1 ustawy zmienianej w art. 2, składanym za pierwszy rok podatkowy rozpoczynający się po dniu 31 grudnia 2018 r.
            </blockquote>
          </Col>
        </Row>
        <div>
          <h3>Waluty wirtualne</h3>
          <p>Przez odpłatne zbycie waluty wirtualnej rozumie się wymianę waluty wirtualnej na prawny środek płatniczy, towar, usługę, lub prawo majątkowe inne niż waluta wirtualna lub regulowanie innych zobowiązań walutą wirtualną.</p>
          <p>Podatnicy, którzy:</p>
          <ul>
            <li>w 2019 r. uzyskali przychód z odpłatnego zbycia waluty wirtualnej;</li>
            <li>w 2019 r. ponieśli koszty uzyskania przychodów w postaci wydatków na nabycie waluty wirtualnej, nawet w przypadku, gdy w tym roku podatkowym nie uzyskali przychodu ze zbycia waluty wirtualnej;</li>
            <li>w latach poprzednich ponieśli koszty uzyskania przychodów w postaci udokumentowanych wydatków na nabycie waluty wirtualnej lub udokumentowane wydatki poniesione na rzecz podmiotów, o których mowa w art. 2 ust. 1 pkt 12 ustawy z dnia 1 marca 2018 r. o przeciwdziałaniu praniu pieniędzy oraz finansowaniu terroryzmu (Dz.U. z 2019 poz. 1115, z późn. zm.), które nie zostały odliczone od przychodów przed dniem 1 stycznia 2019 r., nawet w przypadku, gdy w 2019 r. nie uzyskali przychodu ze zbycia waluty wirtualnej, są zobowiązani do wykazania przychodów z odpłatnego zbycia waluty wirtualnej w zeznaniu podatkowym.</li>
          </ul>
          <h4>Koszty uzyskania przychodów z odpłatnego zbycia walut wirtualnych</h4>
          <p>Zgodnie art. 22 ust. 14 ustawy koszty uzyskania przychodów z tytułu odpłatnego zbycia waluty wirtualnej stanowią udokumentowane wydatki bezpośrednio poniesione na nabycie waluty wirtualnej oraz koszty związane ze zbyciem waluty wirtualnej, w tym udokumentowane wydatki poniesione na rzecz podmiotów, o których mowa w art. 2 ust. 1 pkt 12 ustawy z dnia 1 marca 2018 r. o przeciwdziałaniu praniu pieniędzy oraz finansowaniu terroryzmu.<br/>
            Podatnik w zeznaniu podatkowym wykazuje koszty uzyskania przychodów poniesione w 2019 r. oraz poniesione w latach ubiegłych i nieodliczone od przychodów uzyskanych przed dniem 1 stycznia 2019 r.</p>
        </div>
        <h3 style={{
          marginTop: '48px',
          fontSize: '24px',
          fontWeight: 300,
          textAlign: 'center'
        }}>Instrukcja krok po kroku, jak samodzielnie rozliczyć kryptowaluty przez Internet.</h3>
        <Row gutter={16} style={rowStyle}>
          <Col span={12} style={descStyle}>
            <div style={stepNoStyle}>1.</div>
            W serwisie <strong>podatki.gov.pl</strong> wybierz Twój e-PIT, a następnie uwierzytelnij się klikając w przycisk <q className="target-button">Twój <span className="pl-red">e</span>-PIT – zaloguj się</q>
            <div
              style={{
                textAlign: 'center',
                marginTop: '32px',
              }}
            >
              Otwórz stronę:<br/>
              <a rel="noopener noreferrer" target="_blank" href="https://www.podatki.gov.pl/pit/twoj-e-pit/">https://www.podatki.gov.pl/pit/twoj-e-pit/</a>
            </div>
          </Col>
          <Col span={12}>
            <Zoom>
              <img alt="Twój e-PIT na stronie podatki.gov.pl" className="image-preview" style={{float: 'left', width: '100%'}} src="images/how_to_file/pl/01.start-podatki.gov.pl.jpg"/>
            </Zoom>
          </Col>
        </Row>
        <Row gutter={16} style={rowStyle}>
          <Col span={12}>
            <Zoom>
              <img alt="Wybór sposobu logowania do strony Twój e-PIT." className="image-preview" style={{float: 'right', width: '100%'}} src="images/how_to_file/pl/02.logowanie-epit1.podatki.gov.pl.jpg"/>
            </Zoom>
          </Col>
          <Col span={12} style={descStyle}>
            <div style={stepNoStyle}>2.</div>
            <Row>
              <Col span={10} style={{fontSize: '17px'}}>
                <p>Wpisz swoje dane:</p>
                <ol>
                  <li>PESEL (albo: NIP i datę urodzenia)</li>
                  <li>kwotę przychodu z deklaracji za rok 2018</li>
                  <li>kwotę przychodu z jednej z informacji od pracodawców (np. PIT-11) za rok 2019</li>
                </ol>
                <p>i potwierdź kwotą nadpłaty/podatku do zapłaty z deklaracji za 2018 r.</p>
                <p style={{fontSize: '15px'}}>Jeżeli otrzymałeś informację od organu rentowego (PIT-40A) i w 2018 r.<br/>
                nie rozliczyłeś się samodzielnie – podaj kwotę nadpłaty/do zapłaty z PIT-40A.
                </p>
              </Col>
              <Col span={4}>
                <div style={{
                  background: 'rgba(31,85,160,1)',
                  border: '8px solid rgba(1,84,151,1)',
                  padding: '12px',
                  fontSize: '20px',
                  position: 'absolute',
                  borderRadius: '50%',
                  color: 'rgba(250,220,112,1)',
                  textAlign: 'center',
                }}>lub</div>
              </Col>
              <Col span={10} style={descStyle}>
                <p>użyj <strong>profilu zaufanego</strong><br/>
                  by skorzystać z tej opcji, musisz<br/>
                  mieć założony profil zaufany.<br/>
                </p>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row gutter={16} style={rowStyle}>
          <Col span={12} style={descStyle}>
            <div style={stepNoStyle}>3.</div>
            <p>Po zalogowaniu się do Twój e-PIT, przejdź do sekcji <span className="target-button">Twój <span className="pl-red">e</span>-PIT-<span className="pl-red">38</span> za rok 2019</span>, a następnie kliknij w <q className="target-button">Edytuj dochód (przychody i koszty) <FontAwesomeIcon icon={faPen} /></q>.</p>
          </Col>
          <Col span={12}>
            <Zoom>
              <img alt="Wybór złożenia deklaracji PIT-38." className="image-preview" style={{float: 'left', width: '100%'}} src="images/how_to_file/pl/03.wybror-pit-38-epit.podatki.gov.pl.jpg"/>
            </Zoom>
          </Col>
        </Row>
        <Row gutter={16} style={rowStyle}>
          <Col span={12}>
            <Zoom>
              <img alt="Wybór sekcji odpłatnego zbycia walut wirtualnych w PIT-38." className="image-preview" style={{float: 'right', width: '100%'}} src="images/how_to_file/pl/04.wybror-pit-38-waluty-wirtualne-epit.podatki.gov.pl.jpg"/>
            </Zoom>
          </Col>
          <Col span={12} style={descStyle}>
            <div style={stepNoStyle}>4.</div>
            <p>Na stronie <q className="target-button">Twój <span className="pl-red">e</span>-PIT-<span className="pl-red">38</span> za rok 2019</q> w sekcji <q><strong>Inne przychody, w tym uzyskane za granicą oraz odpłatne zbycie walut wirtualnych art. 30B ust. 1A ustawy</strong></q> kliknij w przycisk <q className="target-button">Dodaj przychód</q>.</p>
            <div
              style={{
                textAlign: 'center',
                marginTop: '32px'
              }}
            >
              <a rel="noopener noreferrer" target="_blank" href="https://www.podatki.gov.pl/pit/twoj-e-pit/pit-38-za-2019/#inne-przychody"><FontAwesomeIcon icon={faExternalLinkAlt} /> Czytaj więcej</a>
            </div>
          </Col>
        </Row>
        <Row gutter={16} style={rowStyle}>
          <Col span={12} style={descStyle}>
            <div style={stepNoStyle}>5.</div>
            <p>
              <h4><FontAwesomeIcon icon={faLongArrowAltRight} /> Przychód (poz. 34 z PIT-38)</h4>
              <p>W to pole wpisujemy wartość wymienionych walut wirtualnych na prawny środek płatniczy, towar, usługę, lub prawo majątkowe inne niż waluta wirtualna lub regulowanie innych zobowiązań walutą wirtualną.</p>
              <p>Wartość z kalkulatora znajduje się w pozycji <q className="target-button calculator">Przychód</q> podsumowania roku 2019.</p>
            </p>
            <br/>
            <p>
              <h4><FontAwesomeIcon icon={faLongArrowAltRight} /> Koszty uzyskania przychodów (poz. 35 z PIT-38)</h4>
              <p>W to pole wpisujemy zgodnie art. 22 ust. 14 ustawy koszty uzyskania przychodów z tytułu odpłatnego zbycia waluty wirtualnej stanowią udokumentowane wydatki bezpośrednio poniesione na nabycie waluty wirtualnej oraz koszty związane ze zbyciem waluty wirtualnej, w tym udokumentowane wydatki poniesione na rzecz podmiotów, o których mowa w art. 2 ust. 1 pkt 12 ustawy z dnia 1 marca 2018 r. o przeciwdziałaniu praniu pieniędzy oraz finansowaniu terroryzmu.</p>
              <p>Wartość z kalkulatora znajduje się w pozycji <q className="target-button calculator">Wydatki</q> podsumowania roku 2019.</p>
            </p>
            <p>
              <h4><FontAwesomeIcon icon={faLongArrowAltRight} /> Koszty uzyskania przychodów poniesione w latach ubiegłych i niepotrącone w poprzednim roku podatkowym (poz. 36 z PIT-38)</h4>
              <p>W to pole wpisujemy wartość <strong>wszystkich niesprzedanych kryptowalut</strong> z lat ubiegłych wg <strong>ceny nabycia</strong> lub <strong>spisu z natury</strong> na zakończenie roku 2018 w przypadku prowadzenia działalności gospodarczej.
                <br/><strong>Pole jest obowiązkowe</strong>.
              </p>
              <p>W kalkulatorze funkcja <q className="target-button calculator">Inwentaryzacja</q> pozwala sprawdzić stan i wycenę posiadanych walut wirtualnych na koniec roku 2018.</p>
            </p>
            <p>Po wprowadzeniu danych, <q className="target-button">Zatwierdź</q> formularz przyciskiem.</p>
          </Col>
          <Col span={12}>
            <Zoom>
              <img alt="Edycja wartości w sekcji odpłatnego zbycia walut wirtualnych w zeznaniu rocznym PIT-38." className="image-preview" style={{float: 'left', width: '100%'}} src="images/how_to_file/pl/05.edycja-pit-38-waluty-wirtualne-epit.podatki.gov.pl.jpg"/>
            </Zoom>
          </Col>
        </Row>
        <Row gutter={16} style={rowStyle}>
          <Col span={12}>
            <Zoom>
              <img alt="Podgląd wypełionego formularza PIT-38 w sekcji odpłatnego zbycia kryptowalut." className="image-preview" style={{float: 'right', width: '100%'}} src="images/how_to_file/pl/06.podglad-formularza-pit-38-epit.podatki.gov.pl.jpg"/>
            </Zoom>
          </Col>
          <Col span={12} style={descStyle}>
            <div style={stepNoStyle}>6.</div>
            Kliknij <q className="target-button"><FontAwesomeIcon icon={faArrowLeft} /> Wróć do zeznania</q> i sprawdź poprawość swojego zeznania klikająć w przycisk <q className="target-button">Podgląd PIT</q> w sekcji <span className="target-button">Twój <span className="pl-red">e</span>-PIT-<span className="pl-red">38</span> za rok 2019</span>.
          </Col>
        </Row>
        <Row gutter={16} style={rowStyle}>
          <Col span={12} style={descStyle}>
            <div style={stepNoStyle}>7.</div>
            Jeszcze raz sprawdź swoje dane.<br/>
            <h3>Zaakceptuj i wyślij zeznanie,</h3>
            <div style={stepNoStyle}>8.</div>
            <h3>Teraz możesz pobrać<br/>
            Urzędowe Poświadczenie<br/>
            Odbioru (UPO)</h3>
          </Col>
          <Col span={12}>
            <img alt="Wysłanie rozliczenia PIT-38" className="image-preview" style={{float: 'left', width: '100%'}} src="images/how_to_file/pl/07.akceptacja-formularza-pit-38-epit.podatki.gov.pl.jpg"/>
          </Col>
        </Row>

      </div>
      <center>
        <h2>Rozpocznij składanie zeznania przez Internet</h2>
        <div
          style={{marginTop: '64px', marginBottom: '64px'}}
        >
          <Button
            type="primary"
            size="large"
            onClick={() => {
              history.push('https://epit.podatki.gov.pl/');
            }}
          >
            <FormattedMessage
              id="HowToFilePage.logitToGov"
              defaultMessage="Zaloguj się do Twój e-PIT"
            />
          </Button>
        </div>
      </center>
    </div>;
    return elements;
  }
}
export default withRouter(HowToFileModernPage);
