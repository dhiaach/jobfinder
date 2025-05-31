import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header2 from './Headertwo';
import SearchBar from './SearchBar';
import CategorySection from './CategorySection';
import './HomePage.css'; // Create this file for the CSS

const HomePage = () => {
  const location = useLocation();
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (location.state?.showSuccess) {
      setSuccessMessage(location.state.message);
      
      const timer = setTimeout(() => {
        setSuccessMessage('');
        window.history.replaceState({}, document.title);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [location.state]);

  return (
    <div className="home-page">
      {successMessage && (
        <div className="success-banner">
          ✅ {successMessage}
        </div>
      )}
      
      <Header2 />
      <SearchBar />
      <div className="emploitic-container">
        <h1>Or Among more than 923 categories</h1>
      </div>
      <CategorySection />
    </div>
  );
};

export default HomePage;