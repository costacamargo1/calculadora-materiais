import { useState } from 'react';
import Calculator from './Calculator';
import Products from './Products';
import './App.css';

type Tab = 'calculator' | 'products';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('calculator');

  return (
    <div className="App">
      <nav className="app-nav">
        <button
          className={activeTab === 'calculator' ? 'active' : ''}
          onClick={() => setActiveTab('calculator')}
        >
          Calculadora
        </button>
        <button
          className={activeTab === 'products' ? 'active' : ''}
          onClick={() => setActiveTab('products')}
        >
          Produtos
        </button>
      </nav>
      <main className="app-main">
        {activeTab === 'calculator' && <Calculator />}
        {activeTab === 'products' && <Products />}
      </main>
    </div>
  );
}

export default App;
