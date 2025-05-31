import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./JobCard.css"; // Assuming this CSS file is in the same directory

const MyJobCard = ({ job, handleDelete }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Add detailed debugging
  console.log('MyJobCard received job:', job);
  console.log('Job type:', typeof job);
  console.log('Job keys:', job ? Object.keys(job) : 'job is null/undefined');
  
  // Add safety check for job prop
  if (!job) {
    return (
      <div className="job-card" style={{padding: '20px', border: '1px solid red'}}>
        <strong>Error: Job data is missing</strong>
        <pre>{JSON.stringify({job, type: typeof job}, null, 2)}</pre>
      </div>
    );
  }
  
  const getPostAge = (postDate) => {
    const now = new Date();
    const postTime = new Date(postDate).getTime();
    const timeDiff = now - postTime;

    const seconds = Math.floor(timeDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years}y ago`;
    if (months > 0) return `${months}mo ago`;
    if (weeks > 0) return `${weeks}w ago`;
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return "Just now";
  };

  const handleDropdownClick = (e) => {
    e.stopPropagation();
    setShowDropdown(!showDropdown);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this job post?')) {
      handleDelete(job.id);
    }
    setShowDropdown(false);
  };

  return (
    <div className="job-card">
      <div className="card-header">
        <div className="header-top">
          <h3 className="job-title">{job.title}</h3>
          <div className="type-save-container">
            <span className={`job-type ${job.opportunityType}`}>
              {job.opportunityType.charAt(0).toUpperCase() + job.opportunityType.slice(1)}
            </span>
            
            <div className="dropdown-container">
              <button 
                className="save-btn" 
                onClick={handleDropdownClick}
              >
                <span className="material-icons">more_vert</span>
              </button>
              
              {showDropdown && (
                <div className="dropdown-menu">
                  <button 
                    className="job-card-dropdown-item job-card-delete-item"
                    onClick={handleDeleteClick}
                  >
                    <span className="material-icons">delete</span>
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
        <p className="company-name">{job.company}</p>
      </div>

      <div className="job-meta">
        <div className="meta-item">
          <span className="material-icons">location_on</span>
          <span>{job.wilaya}, {job.city_district}</span>
        </div>
        <div className="meta-item">
          <span className="material-icons">schedule</span>
          <span>{job.commitment}</span>
        </div>
        <div className="meta-item highlight">
          <span className="material-icons">attach_money</span>
          <span>{new Intl.NumberFormat('en-DZ').format(job.salary)} DZD/month</span>
        </div>
      </div>

      {job.tags && (
        <div className="job-tags">
          {job.tags.map((tag) => (
            <span key={tag} className="tag">
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="card-footer">
        <span className="post-age">{getPostAge(job.post_date)}</span>
        <Link to={`/jobs/${job.id}`} className="see-more">
          See More <span className="material-icons">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
};

export default MyJobCard;