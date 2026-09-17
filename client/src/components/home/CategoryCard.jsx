import { Link } from 'react-router-dom';

const categoryIcons = {
  Electronics: '📱',
  'Mobile Phones': '📲',
  Laptops: '💻',
  Furniture: '🛋️',
  Vehicles: '🚗',
  Books: '📚',
  Clothing: '👕',
  Sports: '⚽',
  'Home Appliances': '🏠',
  Other: '📦',
};

const CategoryCard = ({ name }) => (
  <Link
    to={`/products?category=${encodeURIComponent(name)}`}
    className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-gray-200 hover:border-primary-300 hover:shadow-md transition-all group"
  >
    <span className="text-3xl group-hover:scale-110 transition-transform">{categoryIcons[name] || '📦'}</span>
    <span className="text-sm font-medium text-gray-700 text-center group-hover:text-primary-600">{name}</span>
  </Link>
);

export default CategoryCard;
