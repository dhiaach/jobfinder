import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './SearchBar.css';
import { FiSearch, FiMapPin, FiBriefcase, FiChevronDown } from 'react-icons/fi';

const SearchBar = () => {
  const [keywords, setKeywords] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [isKeywordsOpen, setIsKeywordsOpen] = useState(false);
  const [isRegionOpen, setIsRegionOpen] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Updated categories list
  const categories = [
    'Other',
    'Food',
    'Sales & Retail',
    'Hospitality',
    'Event & Catering',
    'Cleaning Services',
    'Manual & Labor',
    'Textile & Sewing',
    'Beauty',
    'Childcare',
    'Teaching Support',
    'Freelance'
  ];

  const regions = [
    'Algiers',
    'Oran',
    'Constantine',
    'Annaba',
    'Tizi Ouzou',
    'Blida',
    'Setif',
    'Batna'
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsKeywordsOpen(false);
        setIsRegionOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams({
      category: keywords.trim(),
      region: selectedRegion.trim()
    }).toString();
    
    navigate(`/jobs?${params}`);
  };

  return (
    <div className="emploitic-container">
      <h1>Find your future job in Algeria</h1>
      <p className="subtitle">Among more than 6,923 open positions</p>
      
      <div className="search-container" ref={searchRef}>
        {/* Keywords Dropdown */}
        <div 
          className={`search-field ${isKeywordsOpen ? 'focused' : ''}`}
          onClick={() => {
            setIsKeywordsOpen(!isKeywordsOpen);
            setIsRegionOpen(false);
          }}
        >
          <FiBriefcase className="field-icon" />
          <div className="input-container">
            <label className={`placeholder ${isKeywordsOpen || keywords ? 'active' : ''}`}>
              Keywords, skills, professions
            </label>
            <div className="selected-value">
              {keywords || ''}
            </div>
            <FiChevronDown className={`dropdown-arrow ${isKeywordsOpen ? 'open' : ''}`} />
          </div>
          
          {isKeywordsOpen && (
            <div className="dropdown-menu">
              {categories.map((category, index) => (
                <div 
                  key={index}
                  className="dropdown-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    setKeywords(category);
                    setIsKeywordsOpen(false);
                  }}
                >
                  {category}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Region Dropdown */}
        <div 
          className={`search-field ${isRegionOpen ? 'focused' : ''}`}
          onClick={() => {
            setIsRegionOpen(!isRegionOpen);
            setIsKeywordsOpen(false);
          }}
        >
          <FiMapPin className="field-icon" />
          <div className="input-container">
            <label className={`placeholder ${isRegionOpen || selectedRegion ? 'active' : ''}`}>
              Region, Wilaya
            </label>
            <div className="selected-value">
              {selectedRegion || ''}
            </div>
            <FiChevronDown className={`dropdown-arrow ${isRegionOpen ? 'open' : ''}`} />
          </div>
          
          {isRegionOpen && (
            <div className="dropdown-menu">
              {regions.map((region, index) => (
                <div 
                  key={index}
                  className="dropdown-item"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedRegion(region);
                    setIsRegionOpen(false);
                  }}
                >
                  {region}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Search Button */}
        <button className="search-btn" onClick={handleSearch}>
          <FiSearch className="search-icon" />
          Search
        </button>
      </div>
      
      <p className="recruiter-text">
        Are you a <strong>recruiter?</strong> Post your ads
      </p>
    </div>
  );
};

export default SearchBar;