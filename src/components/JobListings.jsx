import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import JobCardSearch from './JobCardSearch';
import './JobListings.css';

const JobListings = () => {
  const [searchParams] = useSearchParams();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savedJobs, setSavedJobs] = useState(new Set());

  const handleSave = async (postId) => {
    try {
      if (savedJobs.has(postId)) {
        await supabase
          .from('saved_posts')
          .delete()
          .eq('post_id', postId);
        setSavedJobs(prev => new Set([...prev].filter(id => id !== postId)));
      } else {
        await supabase
          .from('saved_posts')
          .insert([{ post_id: postId }]);
        setSavedJobs(prev => new Set([...prev, postId]));
      }
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        // Fetch saved jobs
        const savedRes = await supabase
          .from('saved_posts')
          .select('post_id')
          .abortSignal(abortController.signal);

        if (savedRes.error) throw savedRes.error;
        if (isMounted) setSavedJobs(new Set(savedRes.data.map(item => item.post_id)));

        // Fetch posts
        let query = supabase
          .from('posts')
          .select(`
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
          `)
          .abortSignal(abortController.signal);

        const category = searchParams.get('category');
        const region = searchParams.get('region');

        if (category) query = query.ilike('category_name', `%${category}%`);
        if (region) query = query.ilike('wilaya', `%${region}%`);

        const postsRes = await query;
        if (postsRes.error) throw postsRes.error;

        if (isMounted) {
          setPosts(postsRes.data.map(post => ({
            ...post,
            isSaved: savedJobs.has(post.id_post)
          })));
          setLoading(false);
        }
      } catch (err) {
        if (isMounted && !abortController.signal.aborted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [searchParams]);

  return (
    <div className="job-listings-container">
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading jobs...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <h3>Error</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
      ) : (
        <>
          <h2 className="results-header">
            {posts.length} jobs found
            {searchParams.get('category') && ` in ${searchParams.get('category')}`}
            {searchParams.get('region') && `, ${searchParams.get('region')}`}
          </h2>
          
          <div className="jobs-grid">
            {posts.length > 0 ? (
              posts.map(post => (
                <JobCardSearch 
                  key={post.id_post}
                  job={post}
                  handleSave={handleSave}
                />
              ))
            ) : (
              <div className="no-results">
                <h3>No jobs found</h3>
                <p>Try different search terms</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default JobListings;