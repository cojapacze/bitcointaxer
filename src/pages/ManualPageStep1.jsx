import React from 'react';
import {Card} from 'antd';

const CalculatorPageStep1 = () => (
  <div>
    <div className="steps-content">
      <h2>Jak wczytać hitorię transakcji do kalkulatora?</h2>
      <p>Do obliczenia dochodu w handlu kryptowalutami, będziesz potrzebował pobrać historie transakcji z giełd.</p>
      <p>Zaloguj się do każdej z giełd na której dokonywałeś transakcji i pobierz do wspólnego <b>katalogu</b> pliki CSV.</p>
      <div className="manual-exchanges">
        <Card
          className="manual-exchange-card"
          title="binance.com"
        >
          <p>Wyeksportuj do wspólnego <b>katalogu</b> plik:</p>
          <ul>
            <li>TradeHistory.xlsx <a
              rel="noopener noreferrer"
              target="_blank"
              href="https://www.binance.com/pl/usercenter/history/user-trade"
            >&raquo;</a></li>
            <li hidden>DepositHistory.csv <a
              rel="noopener noreferrer"
              target="_blank"
              href="https://www.binance.com/pl/usercenter/wallet/money-log/deposit"
            >&raquo;</a></li>
            <li hidden>WithdrawalHistory.csv <a
              rel="noopener noreferrer"
              target="_blank"
              href="https://www.binance.com/pl/usercenter/wallet/money-log/withdraw"
            >&raquo;</a></li>
          </ul>
        </Card>
        <Card
          className="manual-exchange-card"
          title="kraken.com"
          extra={<a
            rel="noopener noreferrer"
            target="_blank"
            href="https://support.kraken.com/hc/en-us/articles/208267878-How-to-export-your-account-history"
          >pomoc</a>}
        >
          <p>Pobierz plik ledgers.zip i wypakuj do wspólnego <b>katalogu</b> plik:</p>
          <ul>
            <li>ledgers.csv</li>
          </ul>
        </Card>
        <Card
          className="manual-exchange-card"
          title="poloniex.com"
          // extra={<a
          //   rel="noopener noreferrer"
          //   target="_blank"
          //   href="https://www.poloniex.com/support/"
          // >pomoc</a>}
        >
          <p>Pobierz do wspólnego <b>katalogu</b> pliki:</p>
          <ul>
            <li>tradeHistory.csv <a
              rel="noopener noreferrer"
              target="_blank"
              href="https://www.poloniex.com/tradeHistory"
            >&raquo;</a></li>
            <li>withdrawHistory.csv <a
              rel="noopener noreferrer"
              target="_blank"
              href="https://poloniex.com/depositHistory"
            >&raquo;</a></li>
            <li>depositHistory.csv <a
              rel="noopener noreferrer"
              target="_blank"
              href="https://poloniex.com/depositHistory"
            >&raquo;</a></li>
          </ul>
        </Card>
        <Card
          hidden
          className="manual-exchange-card"
          title="bittrex.com"
          extra={<a
            rel="noopener noreferrer"
            target="_blank"
            href="https://bittrex.zendesk.com/hc/en-us/articles/360001359006-Where-s-my-Order-History-"
          >pomoc</a>}
        >
          <p>Pobierz do wspólnego <b>katalogu</b> pliki:</p>
          <ul>
            <li>BittrexOrderHistory_2017.csv</li>
            <li>...</li>
          </ul>
        </Card>
        <Card
          className="manual-exchange-card"
          title="bitbay.net"
          extra={<a
            rel="noopener noreferrer"
            target="_blank"
            href="https://bitbay.net/pl/pomoc/moje-konto/jak-pobrac-historie-konta-do-pliku"
          >pomoc</a>}
        >
          Wybierz historia Szczegółowa i pobierz do wspólnego <b>katalogu</b> pliki np. co kwartał
          <ul>
            <li>bitbay.net-HistoriaSzczegolowa-2018-01-01_2018-03-31.csv</li>
            <li>bitbay.net-HistoriaSzczegolowa-2018-04-01_2018-06-30.csv</li>
            <li>bitbay.net-HistoriaSzczegolowa-2018-07-01_2018-09-30.csv</li>
            <li>bitbay.net-HistoriaSzczegolowa-2018-10-01_2018-12-31.csv</li>
            <li>...</li>
            {/* <li><i>lub Historia Transakcjie + Wpłaty/Wypłaty (csv pl)</i></li> */}
          </ul>
        </Card>
        <Card
          className="manual-exchange-card"
          title="bitmarket.pl"
        >
          <p>Wyeksportuj do wspólnego <b>katalogu</b> plik:</p>
          <ul>
            <li>BITMARKET export.xlsx <a
              rel="noopener noreferrer"
              target="_blank"
              href="https://www.bitmarket.pl/"
            >&raquo;</a></li>
          </ul>
        </Card>
        <Card
          className="manual-exchange-card"
          title="bitmarket24.pl"
          extra={<a
            rel="noopener noreferrer"
            target="_blank"
            href="https://bitmarket24.pl/kontakt.html"
          >pomoc</a>}
        >
          Skopiuj do wspólnego <b>katalogu</b> pliki:
          <ul>
            <li>historia_salda.csv</li>
            <li>historia_transakcji.csv</li>
          </ul>
        </Card>
        <Card
          className="manual-exchange-card"
          title="wavesplatform.com"
        >
          <p>Wyeksportuj do wspólnego <b>katalogu</b> plik:</p>
          <ul>
            <li>transactions.csv <a
              rel="noopener noreferrer"
              target="_blank"
              href="https://client.wavesplatform.com/wallet/transactions"
            >&raquo;</a></li>
          </ul>
        </Card>
        <Card
          className="manual-exchange-card"
          title="format generyczny"
        >
          Użyj prostego formatu danych, aby dodać inne operacje np. P2P lub przekonwertuj historę z pozostałych giełd:
          <code style={{marginTop: '16px'}} className="raw code csv">{`date,from address,amount,asset,to address,amount,asset,txid
2017-03-17 12:02:23,MyBank,100,USD,Kraken.com,100,USD,deposit
2017-03-18 12:04:45,Kraken.com,100,USD,Kraken.com,0.082716212,BTC
2017-12-19 12:37:11,Kraken.com,0.082716212,BTC,Kraken.com,4.3992123321,LTC
2018-04-04 13:12:21,Kraken.com,4.3992123321,LTC,Kraken.com,506.83,USD
#komentarz`}</code>
        </Card>
      </div>
      <div style={{height: '64px'}}></div>
      <p style={{textAlign: 'right'}}><strong>Zalecane jest, aby przechowywać wyeksportowane pliki w bezpiecznym miejscu.</strong></p>
      <div style={{height: '32px'}}></div>
    </div>
  </div>
);

export default CalculatorPageStep1;
