const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="text-center py-16 px-4">
      {Icon && <Icon className="w-16 h-16 mx-auto mb-4 text-gray-300" />}
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      {description && <p className="text-gray-500 text-sm max-w-md mx-auto mb-6">{description}</p>}
      {action}
    </div>
  );
};

export default EmptyState;
