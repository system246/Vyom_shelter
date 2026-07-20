import { memo } from 'react';
import { Link } from 'react-router-dom';

function CategoryCard({ to, title, image }) {
  return (
    <Link to={to} className="group relative overflow-hidden rounded-2xl h-36 block">
      <img src={image} alt={title} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#1a3a5c]/80 via-[#1a3a5c]/30 to-transparent" />
      <p className="absolute bottom-3 left-3 right-3 text-white font-bold text-sm">{title}</p>
    </Link>
  );
}

export default memo(CategoryCard);
