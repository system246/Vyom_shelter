import { Link } from 'react-router-dom';

export default function CategoryCard({ to, image, title, count }) {
  return (
    <Link to={to} className="relative rounded-2xl overflow-hidden h-44 group block shadow-sm hover:shadow-lg transition-shadow">
      <img src={image} alt={title} loading="lazy" className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute bottom-0 left-0 p-4">
        <p className="text-white font-semibold text-base">{title}</p>
        {count && <p className="text-white/70 text-xs">{count}</p>}
      </div>
    </Link>
  );
}
