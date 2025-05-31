import Header2 from "../components/Headertwo";
import Psting from "../components/JobPostForm";
import { MdWork } from "react-icons/md";
import { FaUserCheck, FaRocket, FaShieldAlt, FaChartLine } from "react-icons/fa";

const Pages = () => {
  return (
    <div className="job-post-page">
      <Header2 />
      <div className="posting-container">
        <div className="posting-hero">
          <h1 className="hero-title">Post a Job Opportunity</h1>
          <p className="hero-subtitle">
            Reach qualified candidates in your area
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <MdWork className="stat-icon" />
              <span>1,234+ Local Hires Last Month</span>
            </div>
            <div className="stat-item">
              <FaUserCheck className="stat-icon" />
              <span>85% Candidate Satisfaction</span>
            </div>
          </div>
        </div>

        <Psting />

        <div className="posting-benefits">
          <h3>Why Choose JobFinder?</h3>
          <div className="benefits-grid">
            <div className="benefit-card">
              <FaRocket className="benefit-icon" />
              <h4>Quick Listings</h4>
              <p>Get your job posting live in under 5 minutes</p>
            </div>
            <div className="benefit-card">
              <FaShieldAlt className="benefit-icon" />
              <h4>Trusted Network</h4>
              <p>Verified professionals only</p>
            </div>
            <div className="benefit-card">
              <FaChartLine className="benefit-icon" />
              <h4>Smart Matching</h4>
              <p>AI-powered candidate recommendations</p>
            </div>
          </div>
        </div>b
      </div>
    </div>
  );
};

export default Pages;