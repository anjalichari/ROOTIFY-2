import React from 'react';
import { Link } from 'react-router-dom';
import { Category } from '../../types';

interface CategoryCardProps {
  category: Category;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category }) => {
  return (
    <Link
      to={`/explore?cat=${category.id}`}
      className="group relative flex flex-col items-center text-center p-3 rounded-2xl bg-white border border-sand-300 hover:border-brand-300 hover:shadow-card-hover transition-all duration-300 overflow-hidden shrink-0 w-28 sm:w-32"
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden mb-2.5 bg-sand-100 ring-2 ring-sand-200 group-hover:ring-brand-400 transition-all group-hover:scale-105">
        <img
          src={category.image}
          alt={category.name}
          className="w-full h-full object-cover"
        />
      </div>
      <span className="font-display font-bold text-xs sm:text-sm text-charcoal-900 group-hover:text-brand-700 transition leading-tight">
        {category.name}
      </span>
      <span className="text-[10px] text-charcoal-500 mt-0.5">
        {category.itemCount} items
      </span>
    </Link>
  );
};
