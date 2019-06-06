import React from 'react';

import {operationQueue} from '../calculator/services/taxCalc/index.js';
import MainCalculator from '../calculator/MainCalculator';

const CalculatorPage = () => (
  <div>
    <MainCalculator colors={true} operationQueue={operationQueue} />
  </div>
);

export default CalculatorPage;
