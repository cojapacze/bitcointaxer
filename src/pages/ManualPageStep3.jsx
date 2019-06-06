import React from 'react';


const CalculatorPageStep3 = () => (
  <div>
    <div className="steps-content">
      <h2>Wszystko gotowe?</h2>
      <p>
        Po uruchomienu kalkulatora zamknij plik testowy demonstrujący działanie kalkulatora (x przy nazwie),
        następnie otwórz przygotowane przez siebie pliki z <b>katalogu</b>.
      </p>
      {/* <p>
        Kalkulator jest anonimowy - nie wymaga rejestracji.
        Kalkulator jest prywatny - historia transakcji oraz wynik nigdzie nie jest wysyłany -
        wszystkie obliczenia wykonywane są na Twoim komputerze - nikt poza Tobą nie ma wglądu w Twoje dane.
      </p> */}
      {/* <center>
        <img style={{maxWidth: '480px'}} src="/images/input_folder.png" />
      </center> */}
      <p>
        <strong>Uwaga:</strong><br/>
         Narzędzie ma za zadanie ułatwić obliczenie osiągniętego dochodu w handlu kryptowalutami
         oraz pomóc w zarządzaniu swoim kryptowalutowym protfolio.
         Autor nie ponosi odpowiedzialności za działanie aplikacji,
         która może zawierać błędy lub nie spełniać innych wymogów - <strong>używasz jej na własną odpowiedzialność</strong>.
         Otrzymany wynik należy skonsultować z doradcą podatkowym.
      </p>
    </div>
  </div>
);

export default CalculatorPageStep3;
