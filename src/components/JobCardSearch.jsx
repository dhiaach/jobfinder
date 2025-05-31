import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './JobCard.css';

const JobCardSearch = ({ job, onSaveChange }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkIfSaved();
  }, [job.id_post]);

  const checkIfSaved = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_posts')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', job.id_post)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error checking saved status:', error);
        return;
      }

      setIsSaved(!!data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleSave = async (e) => {
    e.stopPropagation();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please log in to save posts');
        setLoading(false);
        return;
      }

      if (isSaved) {
        // Unsave the post
        const { error } = await supabase
          .from('saved_posts')
          .delete()
          .eq('user_id', user.id)
          .eq('post_id', job.id_post);

        if (error) throw error;
        setIsSaved(false);
        if (onSaveChange) onSaveChange(job.id_post, false);
      } else {
        // Save the post
        const { error } = await supabase
          .from('saved_posts')
          .insert({
            id: crypto.randomUUID(),
            user_id: user.id,
            post_id: job.id_post
          });

        if (error) throw error;
        setIsSaved(true);
        if (onSaveChange) onSaveChange(job.id_post, true);
      }
    } catch (err) {
      console.error('Error saving post:', err);
      alert('Error saving post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatSalary = (salary) => {
    return new Intl.NumberFormat('en-DZ').format(salary) + ' DZD/month';
  };

  const formatPostDate = (dateString) => {
    const postDate = new Date(dateString);
    const now = new Date();
    const hoursDiff = Math.floor((now - postDate) / 3600000);
    
    if (hoursDiff < 1) return 'Just now';
    if (hoursDiff < 24) return `${hoursDiff}h ago`;
    
    const daysDiff = Math.floor(hoursDiff / 24);
    return `${daysDiff}d ago`;
  };

  return (
    <div className="job-card">
      <div className="card-header">
        <div className="header-top">
          <h3 className="job-title">{job.job_title}</h3>
          <div className="type-save-container">
            <span className={`job-type ${job.opportunity_type}`}>
              {job.opportunity_type.charAt(0).toUpperCase() + job.opportunity_type.slice(1)}
            </span>
            <button 
              className="save-btn" 
              onClick={handleSave}
              disabled={loading}
            >
              <span className="material-icons">
                {isSaved ? 'bookmark' : 'bookmark_border'}
              </span>
            </button>
          </div>
        </div>
        <p className="company-name">{job.company_name}</p>
      </div>

      <div className="job-meta">
        <div className="meta-item">
          <span className="material-icons">location_on</span>
          <span>{job.wilaya}, {job.city_district}</span>
        </div>
        <div className="meta-item">
          <span className="material-icons">schedule</span>
          <span>{job.work_days_per_week} days/week</span>
        </div>
        <div className="meta-item highlight">
          <span className="material-icons">attach_money</span>
          <span>{formatSalary(job.salary)}</span>
        </div>
      </div>

      <div className="card-footer">
        <span className="post-age">{formatPostDate(job.post_date)}</span>
        <Link to={`/jobs/${job.id_post}`} className="see-more">
          See More <span className="material-icons">arrow_forward</span>
        </Link>
      </div>
    </div>
  );
};

export default JobCardSearch;