import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import JobCard from './JobCard';
import './JobListings.css';

const CategoryJobs = () => {
  const { category } = useParams();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const decodedCategory = decodeURIComponent(category);
        
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
          .eq('category_name', decodedCategory);

        if (error) throw error;

        const transformedJobs = data.map(job => ({
          id: job.id_post,
          title: job.job_title,
          company: job.company_name,
          wilaya: job.wilaya,
          city_district: job.city_district,
          salary: job.salary,
          commitment: `${job.work_days_per_week} days/week`,
          post_date: job.post_date,
          type: job.category_name,
          opportunityType: job.opportunity_type
        }));

        setJobs(transformedJobs);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [category]);

  return (
    <div className="job-listings-container">
      <h2>{decodeURIComponent(category)} Opportunities</h2>
      {loading ? (
        <div className="loading">Loading...</div>
      ) : jobs.length === 0 ? (
        <div className="no-jobs">No opportunities found in this category</div>
      ) : (
        <div className="jobs-grid">
          {jobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoryJobs;