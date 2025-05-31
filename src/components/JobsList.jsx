import React from "react";
import { useParams } from "react-router-dom";
import JobCard from "./JobCard";
import "./JobsList.css";

const JobsList = () => {
  const { category } = useParams();

  // Sample data with different job types
  const jobs = [
    {
      id: 1,
      type: "job",
      title: "Restaurant Manager",
      company: "Mega Pizza",
      location: "Annaba",
      commitment: "8am-5pm",
      compensation: "35,000 DZD/month",
      postedAt: Date.now() - 3600000 * 2 // 2 hours ago
    },
    {
      id: 2,
      type: "freelance",
      title: "Logo Design Need ",
      company: "Startup Tech",
      location: "annaba",
      commitment: "8am-5pm",
      compensation: "15,000 DZD Fixed",
      
      postedAt: Date.now() - 3600000 * 1 // 1 hour ago
    },
     {
      id: 3,
      type: "job",
      title: "Restaurant Manager",
      company: "Mega Pizza",
      location: "Annaba",
      commitment: "8am-5pm",
      compensation: "35,000 DZD/month",
      postedAt: Date.now() - 3600000 * 2 // 2 hours ago
    },
    {
      id: 4,
      type: "freelance",
      title: "Logo Design Need ",
      company: "Startup Tech",
      location: "annaba",
      commitment: "8am-5pm",
      compensation: "15,000 DZD Fixed",
      
      postedAt: Date.now() - 3600000 * 1 // 1 hour ago
    },
     {
      id: 5,
      type: "job",
      title: "Restaurant Manager",
      company: "Mega Pizza",
      location: "Annaba",
      commitment: "8am-5pm",
      compensation: "35,000 DZD/month",
      postedAt: Date.now() - 3600000 * 2 // 2 hours ago
    },
    {
      id: 6,
      type: "freelance",
      title: "Logo Design Need ",
      company: "Startup Tech",
      location: "annaba",
      commitment: "8am-5pm",
      compensation: "15,000 DZD Fixed",
      
      postedAt: Date.now() - 3600000 * 1 // 1 hour ago
    },
    
  ];

  return (
    <div className="jobs-container">
      <h2>{category} Opportunities</h2>
      <div className="jobs-grid">
        {jobs.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>
    </div>
  );
};

export default JobsList;