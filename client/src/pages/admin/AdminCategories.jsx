import { useState, useEffect } from 'react';
import { Plus, Tags, Trash2 } from 'lucide-react';
import { getCategories, createCategory, deleteCategory } from '../../services/adminService';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import EmptyState from '../../components/ui/EmptyState';
import { getErrorMessage } from '../../utils/helpers';

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', subcategories: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const { data } = await getCategories();
      setCategories(data.categories);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load categories'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createCategory({
        name: form.name,
        subcategories: form.subcategories
          ? form.subcategories.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
      });
      setForm({ name: '', subcategories: '' });
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to create category'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async (id, name) => {
    if (!window.confirm(`Deactivate category "${name}"?`)) return;
    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to deactivate category'));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Category Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 px-3 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {error && <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mb-4">{error}</div>}

      {showForm && (
        <form onSubmit={handleCreate} className="bg-white rounded-xl border border-gray-200 p-4 mb-4 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subcategories (comma separated)</label>
            <input
              type="text"
              value={form.subcategories}
              onChange={(e) => setForm({ ...form, subcategories: e.target.value })}
              placeholder="e.g. Android, iPhone, Accessories"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
            />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={submitting} className="px-4 py-2 bg-primary-600 text-white text-sm rounded-lg hover:bg-primary-700 disabled:opacity-50">
              {submitting ? 'Creating...' : 'Create'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50">
              Cancel
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <LoadingSpinner />
      ) : categories.length === 0 ? (
        <EmptyState icon={Tags} title="No categories" description="Add categories to organize products." />
      ) : (
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat._id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Tags className="w-4 h-4 text-primary-600" />
                  <h3 className="font-medium text-gray-900">{cat.name}</h3>
                  {!cat.isActive && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Inactive</span>
                  )}
                </div>
                {cat.subcategories?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {cat.subcategories.map((sub) => (
                      <span key={sub} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">{sub}</span>
                    ))}
                  </div>
                )}
              </div>
              {cat.isActive && (
                <button
                  onClick={() => handleDeactivate(cat._id, cat.name)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50 shrink-0"
                >
                  <Trash2 className="w-3 h-3" /> Deactivate
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
