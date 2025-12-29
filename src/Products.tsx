import React, { useState, useMemo } from 'react';
import './Products.css';
import ProductForm from './ProductForm';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface Product {
  id: number;
  name: string;
  manufacturer: string;
  cost: number;
  date: string;
  ipi: number | null;
}

const initialProducts: Product[] = [
  { id: 1, name: 'Seringa Descartável 5ml', manufacturer: 'Descarpack', cost: 0.8, date: '2025-12-01', ipi: 5 },
  { id: 2, name: 'Luva de Procedimento (M)', manufacturer: 'Talge', cost: 0.25, date: '2025-12-02', ipi: null },
];

type SortKey = keyof Product;
type SortOrder = 'asc' | 'desc';

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [filter, setFilter] = useState({ name: '', manufacturer: '', cost: '', date: '', ipi: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; order: SortOrder } | null>(null);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilter({ ...filter, [name]: value });
  };

  const handleAddProduct = (newProduct: Omit<Product, 'id'>) => {
    setProducts([...products, { ...newProduct, id: Date.now() }]);
  };

  const handleUpdateProduct = (updatedProduct: Product) => {
    setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  }

  const handleDelete = (id: number) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
        setProducts(products.filter((p) => p.id !== id));
    }
  }

  const handleSort = (key: SortKey) => {
    let order: SortOrder = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.order === 'asc') {
      order = 'desc';
    }
    setSortConfig({ key, order });
  };

  const sortedAndFilteredProducts = useMemo(() => {
    let sortableProducts = [...products];

    if (sortConfig !== null) {
      sortableProducts.sort((a, b) => {
        const valA = a[sortConfig.key];
        const valB = b[sortConfig.key];
  
        if (valA === null) return sortConfig.order === 'asc' ? -1 : 1;
        if (valB === null) return sortConfig.order === 'asc' ? 1 : -1;
  
        if (valA < valB) {
          return sortConfig.order === 'asc' ? -1 : 1;
        }
        if (valA > valB) {
          return sortConfig.order === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return sortableProducts.filter((product) => {
        const ipiString = product.ipi === null ? 'Não' : product.ipi.toString();
        return (
          product.name.toLowerCase().includes(filter.name.toLowerCase()) &&
          product.manufacturer.toLowerCase().includes(filter.manufacturer.toLowerCase()) &&
          product.cost.toString().includes(filter.cost) &&
          product.date.includes(filter.date) &&
          ipiString.toLowerCase().includes(filter.ipi.toLowerCase())
        );
      });
  }, [products, filter, sortConfig]);

  const handleExport = () => {
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';

    const formattedData = sortedAndFilteredProducts.map(product => ({
      'NOME / DESCRIÇÃO': product.name,
      'FABRICANTE': product.manufacturer,
      'CUSTO RECEBIDO': product.cost,
      'IPI (%)': product.ipi !== null ? product.ipi : 'N/A',
      'DATA': new Date(product.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'}),
    }));

    const ws = XLSX.utils.json_to_sheet(formattedData);
    const wb = { Sheets: { 'Produtos': ws }, SheetNames: ['Produtos'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], {type: fileType});
    saveAs(data, 'produtos' + fileExtension);
  }

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const getSortIndicator = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) {
      return null;
    }
    return sortConfig.order === 'asc' ? ' ▲' : ' ▼';
  }

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  }


  return (
    <div className="products-container">
        <div className="products-header">
            <h2>Produtos</h2>
            <div className="header-actions">
                <button onClick={handleExport} className="export-btn">Exportar para Excel</button>
                <button onClick={() => setIsModalOpen(true)} className="add-product-btn">+</button>
            </div>
        </div>

        {isModalOpen && (
            <ProductForm 
                onClose={closeModal}
                onAddProduct={handleAddProduct}
                onUpdateProduct={handleUpdateProduct}
                productToEdit={editingProduct}
            />
        )}

      <table className="products-table">
        <thead>
          <tr>
            <th><input type="text" name="name" placeholder="Filtrar por nome..." value={filter.name} onChange={handleFilterChange} /></th>
            <th><input type="text" name="manufacturer" placeholder="Filtrar por fabricante..." value={filter.manufacturer} onChange={handleFilterChange} /></th>
            <th><input type="text" name="cost" placeholder="Filtrar por custo..." value={filter.cost} onChange={handleFilterChange} /></th>
            <th><input type="text" name="ipi" placeholder="Filtrar por IPI..." value={filter.ipi} onChange={handleFilterChange} /></th>
            <th><input type="text" name="date" placeholder="Filtrar por data..." value={filter.date} onChange={handleFilterChange} /></th>
            <th></th>
          </tr>
          <tr>
            <th onClick={() => handleSort('name')}>NOME / DESCRIÇÃO{getSortIndicator('name')}</th>
            <th onClick={() => handleSort('manufacturer')}>FABRICANTE{getSortIndicator('manufacturer')}</th>
            <th onClick={() => handleSort('cost')}>CUSTO RECEBIDO{getSortIndicator('cost')}</th>
            <th onClick={() => handleSort('ipi')}>IPI (%){getSortIndicator('ipi')}</th>
            <th onClick={() => handleSort('date')}>DATA{getSortIndicator('date')}</th>
            <th>AÇÕES</th>
          </tr>
        </thead>
        <tbody>
          {sortedAndFilteredProducts.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.manufacturer}</td>
              <td>{formatCurrency(product.cost)}</td>
              <td>{product.ipi !== null ? `${product.ipi}%` : 'N/A'}</td>
              <td>{new Date(product.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</td>
              <td>
                <button onClick={() => handleEdit(product)} className="action-btn edit-btn">Editar</button>
                <button onClick={() => handleDelete(product.id)} className="action-btn delete-btn">Excluir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Products;
