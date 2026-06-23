export default function EmptyState({ icon: Icon, title, action }) {
  return (
    <div className="card p-14 text-center">
      {Icon && <Icon size={32} className="mx-auto text-gray-300 mb-3" />}
      <p className="text-gray-400 text-sm mb-3">{title}</p>
      {action}
    </div>
  );
}
