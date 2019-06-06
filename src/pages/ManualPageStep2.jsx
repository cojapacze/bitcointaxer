import React from 'react';


const CalculatorPageStep2 = () => (
  <div>
    <div className="steps-content">
      <h2>Ustawienia kalkulatora</h2>
      <div style={{height: '16px'}}/>
      <h3>Kalkulator do każdej operacji przyporządkowuje koszt nabycia użytych monet, wg następujących metod:</h3>
      <ul>
        <li><strong>FIFO</strong> - koszty przyporządkowywane są chronologicznie - pierwsze weszło, pierwsze wyszło</li>
        <li><strong>LIFO</strong> - koszty przyporządkowywane są chronologicznie - ostatnie weszło, pierwsze wyszło</li>
        <li><strong>HIFO</strong> - koszty przyporządkowywane są wg cen nabycia - w pierwszej kolejności zbywane są najdrożej nabyte monety</li>
      </ul>
      <div style={{height: '16px'}}/>
      <h3>Kalkulator może pracować w dwóch trybach</h3>
      <ul>
        <li><strong>wspólna kolejka</strong> - kolejka kosztów jest wspólna dla wszystkich lokalizacji (giełd)</li>
        <li>
          <strong>uwzględniaj położenie i stan magazynowy</strong> - dla
          każdej lokalizacji powadzona jest osobna kolejka kosztów, transfery mają wpływ na lokalizacje kosztów
        </li>
      </ul>
      <div style={{height: '16px'}}/>
      <h3>Zamiany krypto-na-krypto</h3>
      <p>
        Kalkulator może traktować zamiany kryptowalut jako zdarzenia podatkowe lub nie.
      </p>
      <ul>
        <li>
          <strong>wyłączone</strong> przy zamianie jednej kryptowaluty na drugą,
          przepisywany jest koszt nabycia kryptowaluty zbywanej jako koszt nabycia kryptowaluty nabywanej.
          {/* Koszt nabycia przechodzi od jednej kryptowaluty do drugiej, aż do momentu sprzedaży za walutę FIAT. */}
        </li>
        <li>
          <strong>włączone</strong> wyceniany jest hipotetyczny przychód
          wg szacowanej wartości do waluty rezydencji (np. złotówki) na dzień zamiany.
          <ul>
            <li>
              <strong>opcja zwolnienia</strong> wg art. 21 ust. 1 pkt 32b ustawy o podatku dochodowym
              wolne od podatku dochodowego są przychody z zamiany rzeczy lub praw,
              jeżeli z tytułu jednej umowy nie przekraczają kwoty 6000zł lub 2280zł przed rokiem 2018.
            </li>
          </ul>
        </li>
      </ul>
      <div style={{height: '16px'}}/>
    </div>
  </div>
);

export default CalculatorPageStep2;
