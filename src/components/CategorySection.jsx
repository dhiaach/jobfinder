import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CategorySection.css';

const categories = [
  { name: 'Food', icon: 'restaurant' },
  { name: 'Sales & Retail', icon: 'shopping_cart' },
  { name: 'Freelance', icon: 'work_outline' },
  { name: 'Hospitality', icon: 'hotel' },
  { name: 'Event & Catering', icon: 'event' },
  { name: 'Cleaning', icon: 'cleaning_services' },
  { name: 'Manual & Labor', icon: 'construction' },
  { name: 'Childcare', icon: 'child_care' },
  { name: 'Teaching', icon: 'school' },
];

function CategorySection() {
  const navigate = useNavigate();

  // CORRECTED handleClick function
  const handleClick = (category) => {
    // Proper URL encoding while preserving spaces and special characters
    const encodedCategory = encodeURIComponent(category);
    navigate(`/category/${encodedCategory}`);
  };

  return (
    <div className="category-container">
      {categories.map((cat) => (
        <div
          key={cat.name}
          className="category-card"
          onClick={() => handleClick(cat.name)}
        >
          <span className="category-icon material-icons">{cat.icon}</span>
          <div className="category-name">{cat.name}</div>
        </div>
      ))}
      <div className="category-card see-all" onClick={() => navigate('/categories')}>
        <span className="category-icon material-icons">more_horiz</span>
        <div className="category-name">See All</div>
      </div>
    </div>
  );
}

export default CategorySection;