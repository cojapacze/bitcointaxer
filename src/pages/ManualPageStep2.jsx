import React from 'react';
import {FormattedMessage} from 'react-intl';
import globalMessageValues from '../locales/globalMessageValues.js';

const CalculatorPageStep2 = () => (
  <div>
    <div className="steps-content">
      <h2>
        <FormattedMessage
          id="ManualPageStep2.title"
          defaultMessage="The calculation settings."
        />
      </h2>
      <div style={{height: '16px'}} />
      <h3>
        <FormattedMessage
          id="ManualPageStep2.queue"
          defaultMessage="The calculator assigns the coins purchase cost to every operation using the following methods:"
        />
      </h3>
      <ul>
        <li>
          <FormattedMessage
            id="ManualPageStep2.queue.fifo"
            defaultMessage="<strong>FIFO</strong> – chronologically – first in, first out;"
            values={globalMessageValues}
          />
        </li>
        <li>
          <FormattedMessage
            id="ManualPageStep2.queue.lifo"
            defaultMessage="<strong>LIFO</strong> – chronologically –  last in, first out;"
            values={globalMessageValues}
          />
        </li>
        <li>
          <FormattedMessage
            id="ManualPageStep2.queue.hifo"
            defaultMessage="<strong>HIFO</strong> – descending by purchase cost – the most expensive coins are sold first."
            values={globalMessageValues}
          />
        </li>
      </ul>
      <div style={{height: '16px'}} />
      <h3>
        <FormattedMessage
          id="ManualPageStep2.mode"
          defaultMessage="The calculation settings."
        />
      </h3>
      <ul>
        <li>
          <FormattedMessage
            id="ManualPageStep2.mode.oneQueue"
            defaultMessage="<strong>Common cue</strong> - The costs from all localisations (markets) are aggregated to a single cue."
            values={globalMessageValues}
          />
        </li>
        <li>
          <FormattedMessage
            id="ManualPageStep2.mode.trackLocations"
            defaultMessage="<strong>Cue by source and stock level</strong> - The costs of purchase from each localization are cued separately. Transfers affect the assignment of the costs."
            values={globalMessageValues}
          />
        </li>
      </ul>
      <div style={{height: '16px'}} />
      <h3>
        <FormattedMessage
          id="ManualPageStep2.ctc"
          defaultMessage="Crypto to crypto conversions:"
        />
      </h3>
      <p>
        <FormattedMessage
          id="ManualPageStep2.ctc.desc"
          defaultMessage="The calculator can handle conversions between cryptocurrencies as a taxation-relevant event or not."
        />
      </p>
      <ul>
        <li>
          <FormattedMessage
            id="ManualPageStep2.ctc.off"
            defaultMessage="<strong>disabled</strong> – when converting between cryptocurrencies, the cost of purchase of the sold one is assigned as the purchase cost of the purchased tokens."
            values={globalMessageValues}
          />
        </li>
        <li>
          <FormattedMessage
            id="ManualPageStep2.ctc.on"
            defaultMessage="<strong>enabled</strong> – the hypothetical income is calculated using the token – residency currency (e.g. PLN) conversion rate at the date of exchange."
            values={globalMessageValues}
          />
          <ul>
            <li>
              <FormattedMessage
                id="ManualPageStep2.ctc.on.threshold"
                defaultMessage="<strong>threshold:</strong> transactions below the threshold will not be regarded as tax-relevant events."
                values={globalMessageValues}
              />
            </li>
          </ul>
        </li>
      </ul>
      <div style={{height: '16px'}} />
    </div>
  </div>
);

export default CalculatorPageStep2;
