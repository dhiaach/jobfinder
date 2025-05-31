import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import MyJobCard from './MyJobCard';
import './JobListings.css';

const MyJobPosts = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        console.log('getCurrentUser result:', user);
        setUser(user);
        return user;
      } catch (err) {
        console.error('Auth error:', err);
        setError('Authentication error');
        return null;
      }
    };

    const fetchMyJobs = async () => {
      try {
        const currentUser = await getCurrentUser();
        
        if (!currentUser) {
          console.log('No user logged in');
          setLoading(false);
          return;
        }

        console.log('Fetching jobs for user:', currentUser.id);

        const { data, error } = await supabase
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
          .eq('posted_id', currentUser.id)
          .order('post_date', { ascending: false });

        if (error) {
          console.error('Supabase query error:', error);
          throw error;
        }

        console.log('Raw data from Supabase:', data);

        // Check if data exists and is an array
        if (!data || !Array.isArray(data)) {
          console.log('No data returned or data is not an array');
          setJobs([]);
          return;
        }

        // Transform the data with proper error handling
        const transformedJobs = data.map((job, index) => {
          console.log(`Transforming job ${index}:`, job);
          
          // Validate that job object has required fields
          if (!job || typeof job !== 'object') {
            console.error(`Job at index ${index} is invalid:`, job);
            return null;
          }

          const transformedJob = {
            id: job.id_post,
            title: job.job_title || 'Untitled Position',
            company: job.company_name || 'Unknown Company',
            wilaya: job.wilaya || 'Unknown',
            city_district: job.city_district || 'Unknown',
            salary: job.salary || 0,
            commitment: job.work_days_per_week ? `${job.work_days_per_week} days/week` : 'Not specified',
            post_date: job.post_date || new Date().toISOString(),
            type: job.category_name || 'General',
            opportunityType: job.opportunity_type || 'full-time',
            // Add tags as empty array for now, you can modify this based on your data structure
            tags: []
          };

          console.log(`Transformed job ${index}:`, transformedJob);
          return transformedJob;
        }).filter(job => job !== null); // Remove any null entries

        console.log('Final transformed jobs:', transformedJobs);
        setJobs(transformedJobs);
        
      } catch (err) {
        console.error('Error fetching user jobs:', err);
        setError(`Failed to fetch jobs: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchMyJobs();
  }, []);

  const handleDelete = async (jobId) => {
    try {
      console.log('Attempting to delete job with ID:', jobId);
      
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id_post', jobId)
        .eq('posted_id', user.id);

      if (error) throw error;

      // Remove the deleted job from the state
      setJobs(prevJobs => prevJobs.filter(job => job.id !== jobId));
      
      console.log('Job deleted successfully');
    } catch (err) {
      console.error('Error deleting job:', err);
      alert('Failed to delete job. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="job-listings-container">
        <div className="loading">Loading your job posts...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="job-listings-container">
        <div className="no-jobs">Error: {error}</div>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="job-listings-container">
        <div className="no-jobs">Please log in to view your job posts</div>
        <button onClick={() => window.location.reload()}>Retry</button>
      </div>
    );
  }

  return (
    <div className="job-listings-container">
      <h2>My Job Posts</h2>
      

      
      {jobs.length === 0 ? (
        <div className="no-jobs">You haven't posted any jobs yet</div>
      ) : (
        <div className="jobs-grid">
          {jobs.map((job, index) => {
            console.log(`About to render job ${index}:`, job);
            console.log(`Job ${index} is valid:`, job && typeof job === 'object' && job.id);
            
            // Additional safety check before rendering
            if (!job || typeof job !== 'object' || !job.id) {
              console.error(`Invalid job data at index ${index}:`, job);
              return (
                <div key={index} style={{padding: '20px', border: '1px solid orange', margin: '10px'}}>
                  <strong>Invalid job data at index {index}</strong>
                  <pre>{JSON.stringify(job, null, 2)}</pre>
                </div>
              );
            }
            
            return (
              <MyJobCard 
                key={job.id} 
                job={job} 
                handleDelete={handleDelete}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyJobPosts;