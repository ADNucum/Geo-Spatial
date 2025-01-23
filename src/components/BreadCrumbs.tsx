import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

type BreadcrumbItem = {
  label: string;
  href: string;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex space-x-2 text-sm text-gray-600 mb-4">
      {items.map((item, index) => (
        <div key={index} className="flex items-center">
          <Link to={item.href} className="hover:text-blue-600">
            <Button variant="link">{item.label}</Button>
          </Link>
          {index < items.length - 1 && (
            <span className="mx-2">/</span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumbs;
