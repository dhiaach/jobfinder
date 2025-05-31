import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import "./JobCard.css";

const JobCard = ({ job, onSaveChange, showUnsaveOption = false }) => {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkIfSaved();
  }, [job.id]);

  const checkIfSaved = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('saved_posts')
        .select('id')
        .eq('user_id', user.id)
        .eq('post_id', job.id)
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
          .eq('post_id', job.id);

        if (error) throw error;
        setIsSaved(false);
        if (onSaveChange) onSaveChange(job.id, false);
      } else {
        // Save the post
        const { error } = await supabase
          .from('saved_posts')
          .insert({
            id: crypto.randomUUID(),
            user_id: user.id,
            post_id: job.id
          });

        if (error) throw error;
        setIsSaved(true);
        if (onSaveChange) onSaveChange(job.id, true);
      }
    } catch (err) {
      console.error('Error saving post:', err);
      alert('Error saving post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="job-card">
      <div className="card-header">
        <div className="header-top">
          <h3 className="job-title">{job.title}</h3>
          <div className="type-save-container">
            <span className={`job-type ${job.opportunityType}`}>
              {job.opportunityType.charAt(0).toUpperCase() + job.opportunityType.slice(1)}
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

export default JobCard;