import React from 'react';
import {FormattedMessage, FormattedHTMLMessage} from 'react-intl';
import {Card} from 'antd';

const CalculatorPageStep1 = () => (
  <div>
    <div className="steps-content">
      <h2><FormattedMessage
        id="ManualPageStep1.title"
        defaultMessage="How to upload transaction history to the calculator?"
      /></h2>
      <p><FormattedMessage
        id="ManualPageStep1.lead"
        defaultMessage="To calculate the income from cryptocurrency trading, you will need to download the transaction history from cryptocurrency markets."
      /></p>
      <p><FormattedHTMLMessage
        id="ManualPageStep1.body"
        defaultMessage="Log in to every market you have been trading on and download the CSV files. Put them all into a single <b>catalog</b>."
      /></p>
      <div className="manual-exchanges">
        <Card
          className="manual-exchange-card"
          title="coinbase.com"
        >
          <p><FormattedHTMLMessage
            id="ManualPageStep1.coinbaseExport"
            defaultMessage="Set correct <a target='_blank' href='https://www.coinbase.com/settings/preferences'>local currency</a> and download the file into a common <b>catalog</b>:"
          /></p>
          <ul>
            <li>Coinbase-TaxTransactionsReport.csv <a
              rel="noopener noreferrer"
              target="_blank"
              href="https://www.coinbase.com/reports"
            >&raquo;</a></li>
          </ul>
        </Card>
        <Card
          className="manual-exchange-card"
          title="binance.com"
        >
          <p><FormattedHTMLMessage
            id="ManualPageStep1.export"
            defaultMessage="Export the files into a common <b>catalog</b>:"
          /></p>
          <ul>
            <li>TradeHistory.xlsx <a
              rel="noopener noreferrer"
              target="_blank"
              href="https://www.binance.com/pl/usercenter/history/user-trade"
            >&raquo;</a></li>
            <li>DepositHistory.csv <a
              rel="noopener noreferrer"
              target="_blank"
              href="https://www.binance.com/pl/usercenter/wallet/money-log/deposit"
            >&raquo;</a></li>
            <li>WithdrawalHistory.csv <a
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
          ><FormattedMessage
              id="ManualPageStep1.help"
              defaultMessage="help"
            /></a>}
        >
          <p><FormattedHTMLMessage
            id="ManualPageStep1.downloadAndExtract"
            defaultMessage="Download the file {filename} and save in the designated <b>catalog</b>."
            values={{
              filename: 'ledgers.zip'
            }}
          /></p>
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
          <p><FormattedHTMLMessage
            id="ManualPageStep1.save"
            defaultMessage="Save remaining files into the same, designated <b>catalog</b>:"
          /></p>
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
          ><FormattedMessage
              id="ManualPageStep1.help"
              defaultMessage="help"
            /></a>}
        >
          <p><FormattedHTMLMessage
            id="ManualPageStep1.save"
            defaultMessage="Save remaining files into the same, designated <b>catalog</b>:"
          /></p>
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
          ><FormattedMessage
              id="ManualPageStep1.help"
              defaultMessage="help"
            /></a>}
        >
          <div><FormattedHTMLMessage
            id="ManualPageStep1.goToEveryQuarter"
            defaultMessage="Go to ‘Szczegółowa’ history and download to the <b>catalog</b> all the files e.g. every quarter."
          /></div>
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
          <FormattedHTMLMessage
            id="ManualPageStep1.save"
            defaultMessage="Save remaining files into the same, designated <b>catalog</b>:"
          />
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
          ><FormattedMessage
              id="ManualPageStep1.help"
              defaultMessage="help"
            /></a>}
        >
          <FormattedHTMLMessage
            id="ManualPageStep1.save"
            defaultMessage="Save remaining files into the same, designated <b>catalog</b>:"
          />
          <ul>
            <li>historia_salda.csv</li>
            <li>historia_transakcji.csv</li>
          </ul>
        </Card>
        <Card
          className="manual-exchange-card"
          title="wavesplatform.com"
        >
          <FormattedHTMLMessage
            id="ManualPageStep1.export"
            defaultMessage="Export the files into a common <b>catalog</b>:"
          />
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
          title={<FormattedHTMLMessage
            id="ManualPageStep1.genericFormat"
            defaultMessage="generic format"
          />}
        >
          <FormattedHTMLMessage
            id="ManualPageStep1.custom"
            defaultMessage="Use simple data format, to add other operations e.g. P2P or covert the history from other cryptocurrency markets accordingly."
          />
          <code style={{marginTop: '16px'}} className="raw code csv">{`date,from address,amount,asset,to address,amount,asset,txid
2017-03-17 12:02:23,MyBank,100,USD,Kraken.com,100,USD,deposit
2017-03-18 12:04:45,Kraken.com,100,USD,Kraken.com,0.082716212,BTC
2017-12-19 12:37:11,Kraken.com,0.082716212,BTC,Kraken.com,4.3992123321,LTC
2018-04-04 13:12:21,Kraken.com,4.3992123321,LTC,Kraken.com,506.83,USD
#komentarz`}</code>
        </Card>
      </div>
      <div style={{height: '64px'}}></div>
      <p style={{textAlign: 'right'}}><strong><FormattedHTMLMessage
        id="ManualPageStep1.footer"
        defaultMessage="Keep all files in the same, designated catalog."
      /></strong></p>
      <div style={{height: '32px'}}></div>
    </div>
  </div>
);

export default CalculatorPageStep1;
