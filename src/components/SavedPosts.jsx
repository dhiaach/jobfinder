import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import JobCard from './JobCard';
import './SavedPosts.css';

const SavedPosts = () => {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        fetchSavedJobs(user.id);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error('Error checking user:', err);
      setLoading(false);
    }
  };

  const fetchSavedJobs = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('saved_posts')
        .select(`
          id,
          saved_at,
          posts (
            id_post,
            job_title,
            company_name,
            wilaya,
            city_district,
            salary,
            work_days_per_week,
            post_date,
            category_name,
            opportunity_type
          )
        `)
        .eq('user_id', userId)
        .order('saved_at', { ascending: false });

      if (error) throw error;

      const transformedJobs = data.map(item => ({
        id: item.posts.id_post,
        title: item.posts.job_title,
        company: item.posts.company_name,
        wilaya: item.posts.wilaya,
        city_district: item.posts.city_district,
        salary: item.posts.salary,
        commitment: `${item.posts.work_days_per_week} days/week`,
        post_date: item.posts.post_date,
        type: item.posts.category_name,
        opportunityType: item.posts.opportunity_type,
        savedAt: item.saved_at
      }));

      setSavedJobs(transformedJobs);
    } catch (err) {
      console.error('Error fetching saved jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsave = (jobId, isSaved) => {
    if (!isSaved) {
      // Remove from saved jobs list when unsaved
      setSavedJobs(prev => prev.filter(job => job.id !== jobId));
    }
  };

  if (!user) {
    return (
      <div className="saved-posts-container">
        <div className="not-logged-in">
          <h2>Please log in to view your saved posts</h2>
          <p>You need to be logged in to save and view job posts.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="saved-posts-container">
      <div className="page-header">
        <h1>My Saved Posts</h1>
        <p>Jobs you've bookmarked for later</p>
      </div>

      {loading ? (
        <div className="loading">Loading your saved posts...</div>
      ) : savedJobs.length === 0 ? (
        <div className="no-saved-posts">
          <div className="empty-state">
            <span className="material-icons empty-icon">bookmark_border</span>
            <h3>No saved posts yet</h3>
            <p>Start exploring job opportunities and save the ones you're interested in!</p>
          </div>
        </div>
      ) : (
        <>
          <div className="saved-count">
            <span>{savedJobs.length} saved {savedJobs.length === 1 ? 'post' : 'posts'}</span>
          </div>
          <div className="jobs-grid">
            {savedJobs.map(job => (
              <JobCard 
                key={job.id} 
                job={job} 
                onSaveChange={handleUnsave}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default SavedPosts;