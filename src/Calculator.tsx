import React, { useState, useMemo, useEffect } from 'react';
import './Calculator.css';

const Calculator: React.FC = () => {
  const [cost, setCost] = useState<string>('');
  const [margin, setMargin] = useState<string>('');
  const [desiredSalePrice, setDesiredSalePrice] = useState<string>('');
  const [freightType, setFreightType] = useState<'CIF' | 'FOB'>('CIF');
  const [activeInput, setActiveInput] = useState<'margin' | 'salePrice'>('margin');

  const costValue = useMemo(() => parseFloat(cost), [cost]);

  const calculatedSalePrice = useMemo(() => {
    if (isNaN(costValue) || activeInput !== 'margin') return 0;
    const marginValue = parseFloat(margin);
    if (isNaN(marginValue)) return 0;
    return costValue / (1 - marginValue / 100);
  }, [costValue, margin, activeInput]);

  const calculatedMargin = useMemo(() => {
    if (isNaN(costValue) || activeInput !== 'salePrice') return 0;
    const salePriceValue = parseFloat(desiredSalePrice);
    if (isNaN(salePriceValue) || salePriceValue === 0) return 0;
    return ((salePriceValue - costValue) / salePriceValue) * 100;
  }, [costValue, desiredSalePrice, activeInput]);

  useEffect(() => {
    if (activeInput === 'salePrice') {
      const newMargin = calculatedMargin;
      if (!isNaN(newMargin) && newMargin > 0) {
        setMargin(newMargin.toFixed(2));
      } else {
        setMargin('');
      }
    }
  }, [desiredSalePrice, costValue, activeInput, calculatedMargin]);

  useEffect(() => {
    if (activeInput === 'margin') {
        const newSalePrice = calculatedSalePrice;
        if(!isNaN(newSalePrice) && newSalePrice > 0) {
            setDesiredSalePrice(newSalePrice.toFixed(2));
        } else {
            setDesiredSalePrice('');
        }
    }
  }, [margin, costValue, activeInput, calculatedSalePrice]);


  const salePrice = activeInput === 'margin' ? calculatedSalePrice : parseFloat(desiredSalePrice) || 0;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="calculator-container">
      <h1>Calculadora de Margens</h1>

      <div className="input-group">
        <label htmlFor="cost">Custo do Material (R$)</label>
        <input
          type="number"
          id="cost"
          value={cost}
          onChange={(e) => setCost(e.target.value)}
          placeholder="Ex: 100,00"
        />
      </div>

      <div className="input-group">
        <label htmlFor="margin">Margem Desejada (%)</label>
        <input
          type="number"
          id="margin"
          value={margin}
          onChange={(e) => {
            setMargin(e.target.value);
            setActiveInput('margin');
          }}
          onFocus={() => setActiveInput('margin')}
          placeholder="Ex: 20"
          disabled={activeInput === 'salePrice' && parseFloat(desiredSalePrice) > 0}
        />
      </div>

      <div className="input-group">
        <label htmlFor="desiredSalePrice">Valor de Venda Desejado (R$)</label>
        <input
          type="number"
          id="desiredSalePrice"
          value={desiredSalePrice}
          onChange={(e) => {
            setDesiredSalePrice(e.target.value);
            setActiveInput('salePrice');
          }}
          onFocus={() => setActiveInput('salePrice')}
          placeholder="Ex: 125,00"
          disabled={activeInput === 'margin' && parseFloat(margin) > 0}
        />
      </div>

      <div className="input-group">
        <label>Tipo de Frete</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              value="CIF"
              checked={freightType === 'CIF'}
              onChange={() => setFreightType('CIF')}
            />
            CIF (Custo, Seguro e Frete)
          </label>
          <label>
            <input
              type="radio"
              value="FOB"
              checked={freightType === 'FOB'}
              onChange={() => setFreightType('FOB')}
            />
            FOB (Livre a Bordo)
          </label>
        </div>
        <p className="freight-explanation">
          {freightType === 'CIF'
            ? 'CIF: O vendedor é responsável pelos custos e riscos do transporte até o porto de destino.'
            : 'FOB: O comprador é responsável pelos custos e riscos do transporte a partir do porto de embarque.'}
        </p>
      </div>

      <div className="results">
        <h2>Resultados</h2>
        <div className="result-item">
          <span>Valor de Custo:</span>
          <strong>{formatCurrency(parseFloat(cost) || 0)}</strong>
        </div>
        <div className="result-item">
          <span>Valor de Venda:</span>
          <strong>{formatCurrency(salePrice)}</strong>
        </div>
        <div className="result-item">
          <span>Margem sobre a Venda:</span>
          <strong>
            {salePrice > 0
              ? `${(((salePrice - (parseFloat(cost) || 0)) / salePrice) * 100).toFixed(2)}%`
              : '0.00%'}
          </strong>
        </div>
      </div>
    </div>
  );
};

export default Calculator;
