import { useState, useEffect } from 'react';
import { Upload, X } from 'lucide-react';
import LoadingSpinner from '../ui/LoadingSpinner';
import { getErrorMessage } from '../../utils/helpers';
import {
  PRODUCT_CATEGORIES,
  PRODUCT_CONDITIONS,
  CONTACT_PREFERENCES,
  INDIAN_CITIES,
} from '../../utils/constants';
import { SUBCATEGORIES } from '../../utils/subcategories';

const ProductForm = ({ initialData = null, onSubmit, submitting }) => {
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    subcategory: '',
    price: '',
    condition: '',
    brand: '',
    location: '',
    contactPreference: 'Both',
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || '',
        subcategory: initialData.subcategory || '',
        price: initialData.price || '',
        condition: initialData.condition || '',
        brand: initialData.brand || '',
        location: initialData.location || '',
        contactPreference: initialData.contactPreference || 'Both',
      });
      setExistingImages(initialData.images || []);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === 'category' ? { subcategory: '' } : {}),
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const totalImages = existingImages.length + images.length + files.length;
    if (totalImages > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    for (const file of files) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Each image must be less than 5MB');
        return;
      }
    }
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    setError('');
  };

  const removeNewImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const totalImages = existingImages.length + images.length;
    if (totalImages === 0) {
      setError('At least one product image is required');
      return;
    }

    const formData = new FormData();
    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    images.forEach((file) => formData.append('images', file));

    if (initialData) {
      formData.append('keepImages', JSON.stringify(existingImages));
    }

    try {
      await onSubmit(formData);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save product'));
    }
  };

  const subcategoryOptions = form.category ? SUBCATEGORIES[form.category] || [] : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-200">{error}</div>
      )}

      {/* Images */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Product Images * (max 5)
        </label>
        <div className="flex flex-wrap gap-3">
          {existingImages.map((img, i) => (
            <div key={`existing-${i}`} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
              <img src={img} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeExistingImage(i)}
                className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {previews.map((preview, i) => (
            <div key={`new-${i}`} className="relative w-24 h-24 rounded-lg overflow-hidden border border-gray-200">
              <img src={preview} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeNewImage(i)}
                className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          {existingImages.length + images.length < 5 && (
            <label className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 transition-colors">
              <Upload className="w-6 h-6 text-gray-400" />
              <span className="text-xs text-gray-400 mt-1">Add</span>
              <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
            </label>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Product Name *</label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          maxLength={150}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          rows={4}
          maxLength={2000}
          className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none resize-none"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
          >
            <option value="">Select category</option>
            {PRODUCT_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Subcategory</label>
          <select
            name="subcategory"
            value={form.subcategory}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
          >
            <option value="">Select subcategory</option>
            {subcategoryOptions.map((sub) => (
              <option key={sub} value={sub}>{sub}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (₹) *</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            required
            min="1"
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Condition *</label>
          <select
            name="condition"
            value={form.condition}
            onChange={handleChange}
            required
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
          >
            <option value="">Select condition</option>
            {PRODUCT_CONDITIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Brand</label>
          <input
            type="text"
            name="brand"
            value={form.brand}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
          <select
            name="location"
            value={form.location}
            onChange={handleChange}
            required
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
          >
            <option value="">Select location</option>
            {INDIAN_CITIES.map((city) => (
              <option key={city} value={city}>{city}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Contact Preference</label>
          <select
            name="contactPreference"
            value={form.contactPreference}
            onChange={handleChange}
            className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none bg-white"
          >
            {CONTACT_PREFERENCES.map((pref) => (
              <option key={pref} value={pref}>{pref}</option>
            ))}
          </select>
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-primary-600 text-white py-3 rounded-lg font-medium hover:bg-primary-700 disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {submitting ? <LoadingSpinner size="small" /> : (initialData ? 'Update Product' : 'List Product')}
      </button>
    </form>
  );
};

export default ProductForm;
