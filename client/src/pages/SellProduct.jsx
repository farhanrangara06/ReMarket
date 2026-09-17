import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle } from 'lucide-react';
import ProductForm from '../components/products/ProductForm';
import { createProduct } from '../services/productService';

const SellProduct = () => {
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      const { data } = await createProduct(formData);
      navigate(`/products/${data.product._id}`, {
        state: { message: 'Product listed successfully!' },
      });
    } catch (err) {
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <PlusCircle className="w-8 h-8 text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sell Your Product</h1>
          <p className="text-gray-600 text-sm">List a used product for sale on ReMarket</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
        <ProductForm onSubmit={handleSubmit} submitting={submitting} />
      </div>
    </div>
  );
};

export default SellProduct;
