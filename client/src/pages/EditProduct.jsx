import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Edit } from 'lucide-react';
import ProductForm from '../components/products/ProductForm';
import { getProduct, updateProduct } from '../services/productService';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { getId, getErrorMessage } from '../utils/helpers';

const EditProduct = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await getProduct(id);
        if (getId(data.product.seller) !== getId(user) && user?.role !== 'admin') {
          setError('You are not authorized to edit this product');
          return;
        }
        setProduct(data.product);
      } catch (err) {
        setError(getErrorMessage(err, 'Product not found'));
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchProduct();
  }, [id, user]);

  const handleSubmit = async (formData) => {
    setSubmitting(true);
    try {
      await updateProduct(id, formData);
      navigate(`/products/${id}`, { state: { message: 'Product updated successfully!' } });
    } catch (err) {
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <LoadingSpinner fullScreen />;
  if (error) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <Link to="/products/mine" className="text-primary-600 hover:underline">Back to My Listings</Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Edit className="w-8 h-8 text-primary-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Edit Product</h1>
          <p className="text-gray-600 text-sm">{product?.title}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 sm:p-8">
        <ProductForm initialData={product} onSubmit={handleSubmit} submitting={submitting} />
      </div>
    </div>
  );
};

export default EditProduct;
