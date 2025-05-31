import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './BusinessCategoryGrid.css';

const BusinessCategoryGrid = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategoriesWithCounts = async () => {
      try {
        // Fetch all categories
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('categories')
          .select('name');

        if (categoriesError) throw categoriesError;

        // Fetch all posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('category_name');

        if (postsError) throw postsError;

        // Create a map of category counts
        const categoryCounts = postsData.reduce((acc, post) => {
          acc[post.category_name] = (acc[post.category_name] || 0) + 1;
          return acc;
        }, {});

        // Merge categories with their counts
        const mergedCategories = categoriesData.map(category => ({
          name: category.name,
          count: categoryCounts[category.name] || 0,
          id: category.name.toLowerCase().replace(/\s+/g, '-')
        })).sort((a, b) => b.count - a.count); // Sort by count descending

        setCategories(mergedCategories);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCategoriesWithCounts();
  }, []);

  if (loading) {
    return <div className="loading">Loading categories...</div>;
  }

  if (error) {
    return <div className="error">Error loading categories: {error}</div>;
  }

  return (
    <div className="business-categories-container">
      <h1 className="business-categories-title">All Categories</h1>
      
      <div className="business-categories-grid">
       {categories.map((category) => (
  <Link 
    to={`/category/${encodeURIComponent(category.name)}`}  // Changed to singular
    className={`business-category-tile ${category.count === 0 ? 'empty-category' : ''}`}
    key={category.name}
  >
    <div className="business-category-content">
      <span className="business-category-count">{category.count}</span>
      <h3 className="business-category-name">{category.name}</h3>
    </div>
  </Link>
))}
      </div>
    </div>
  );
};

export default BusinessCategoryGrid;