import React, { useState, useEffect } from 'react';
import './ProductForm.css';

interface Product {
    id: number;
    name: string;
    manufacturer: string;
    cost: number;
    date: string;
    ipi: number | null;
}

interface ProductFormProps {
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onClose: () => void;
  productToEdit: Product | null;
}

const ProductForm: React.FC<ProductFormProps> = ({ onAddProduct, onUpdateProduct, onClose, productToEdit }) => {
  const [name, setName] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [cost, setCost] = useState('');
  const [date, setDate] = useState('');
  const [hasIpi, setHasIpi] = useState(false);
  const [ipi, setIpi] = useState<string | number>('');

  useEffect(() => {
    if (productToEdit) {
      setName(productToEdit.name);
      setManufacturer(productToEdit.manufacturer);
      setCost(productToEdit.cost.toString());
      setDate(productToEdit.date);
      setHasIpi(productToEdit.ipi !== null);
      setIpi(productToEdit.ipi !== null ? productToEdit.ipi.toString() : '');
    } else {
      // Reset form for "add" mode
      setName('');
      setManufacturer('');
      setCost('');
      const today = new Date();
      const offset = today.getTimezoneOffset();
      const adjustedDate = new Date(today.getTime() - (offset * 60 * 1000));
      setDate(adjustedDate.toISOString().split('T')[0]);
      setHasIpi(false);
      setIpi('');
    }
  }, [productToEdit]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const costValue = parseFloat(cost);
    const ipiValue = hasIpi ? parseFloat(ipi as string) : null;

    const finalName = name.toUpperCase();
    const finalManufacturer = manufacturer.toUpperCase();

    if (finalName && finalManufacturer && !isNaN(costValue) && date) {
        if(hasIpi && isNaN(ipiValue as number)) {
            alert("Por favor, preencha o valor do IPI.");
            return;
        }

        if(productToEdit) {
            onUpdateProduct({ id: productToEdit.id, name: finalName, manufacturer: finalManufacturer, cost: costValue, date, ipi: ipiValue });
        } else {
            onAddProduct({ name: finalName, manufacturer: finalManufacturer, cost: costValue, date, ipi: ipiValue });
        }
      onClose();
    } else {
        alert("Por favor, preencha todos os campos corretamente.");
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{productToEdit ? 'Editar Produto' : 'Adicionar Novo Produto'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nome / Descrição</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="manufacturer">Fabricante</label>
            <input
              type="text"
              id="manufacturer"
              value={manufacturer}
              onChange={(e) => setManufacturer(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="cost">Custo Recebido</label>
            <input
              type="number"
              id="cost"
              value={cost}
              onChange={(e) => setCost(e.target.value)}
              step="0.01"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="date">Data</label>
            <input
              type="date"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Possui IPI?</label>
            <div className="radio-group">
                <label>
                    <input
                    type="radio"
                    name="hasIpi"
                    value="yes"
                    checked={hasIpi === true}
                    onChange={() => setHasIpi(true)}
                    />
                    Sim
                </label>
                <label>
                    <input
                    type="radio"
                    name="hasIpi"
                    value="no"
                    checked={hasIpi === false}
                    onChange={() => setHasIpi(false)}
                    />
                    Não
                </label>
            </div>
          </div>
          {hasIpi && (
            <div className="form-group">
              <label htmlFor="ipi">Valor do IPI (%)</label>
              <input
                type="number"
                id="ipi"
                value={ipi}
                onChange={(e) => setIpi(e.target.value)}
                step="0.01"
                required
              />
            </div>
          )}
          <div className="form-actions">
            <button type="submit">{productToEdit ? 'Salvar Alterações' : 'Adicionar'}</button>
            <button type="button" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductForm;
