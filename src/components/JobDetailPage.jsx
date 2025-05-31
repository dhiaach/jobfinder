import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { supabase } from "../supabaseClient";
import {
  FaRegBookmark,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaClock,
  FaEnvelope,
  FaPhone,
  FaComments,
} from "react-icons/fa";
import { MdWork, MdPeople, MdDescription } from "react-icons/md";
import "./JobDetailPage.css";

const JobDetailPage = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isSaved, setIsSaved] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const { data, error } = await supabase
          .from("posts")
          .select("*")
          .eq("id_post", id)
          .single();

        if (error) throw error;
        setJob(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  useEffect(() => {
    if (job) {
      checkIfSaved();
    }
  }, [job]);

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

  const handleSave = async () => {
    setSaveLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert('Please log in to save posts');
        setSaveLoading(false);
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
      }
    } catch (err) {
      console.error('Error saving post:', err);
      alert('Error saving post. Please try again.');
    } finally {
      setSaveLoading(false);
    }
  };

  const formatTime = (time) => {
    return new Date(`1970-01-01T${time}`).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) return <div className="jdp-container loading">Loading...</div>;
  if (error) return <div className="jdp-container error">Error: {error}</div>;
  if (!job) return <div className="jdp-container">Job not found</div>;

  return (
    <div className="jdp-container">
      <div className="jdp-header">
        <h1 className="jdp-title">{job.job_title}</h1>
        <div className="jdp-company-header">
          <div className="jdp-company-info">
            <MdWork className="jdp-icon" />
            <h2 className="jdp-company-name">{job.company_name}</h2>
          </div>
          <div className="jdp-meta-right">
            <span className="jdp-posted-date">
              Posted: {new Date(job.post_date).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      <div className="jdp-content">
        <div className="jdp-main-content">
          <div className="jdp-details-grid">
            <div className="jdp-detail-item">
              <FaMapMarkerAlt className="jdp-icon" />
              <div className="jdp-detail-content">
                <h3 className="jdp-detail-title">Location</h3>
                <p className="jdp-detail-text">Wilaya: {job.wilaya}</p>
                <small className="jdp-detail-small">{job.city_district}</small>
              </div>
            </div>

            <div className="jdp-detail-item">
              <FaMoneyBillWave className="jdp-icon" />
              <div className="jdp-detail-content">
                <h3 className="jdp-detail-title">Salary</h3>
                <p className="jdp-detail-text">
                  {new Intl.NumberFormat("en-DZ").format(job.salary)} DZD/month
                </p>
              </div>
            </div>

            <div className="jdp-detail-item">
              <MdPeople className="jdp-icon" />
              <div className="jdp-detail-content">
                <h3 className="jdp-detail-title">Requirements</h3>
                <p className="jdp-detail-text">Category: {job.category_name}</p>
                <small className="jdp-detail-small">
                  Gender: {job.gender_preference || "Any"}
                </small>
              </div>
            </div>

            <div className="jdp-detail-item">
              <FaClock className="jdp-icon" />
              <div className="jdp-detail-content">
                <h3 className="jdp-detail-title">Work Schedule</h3>
                <p className="jdp-detail-text">
                  {formatTime(job.work_hours_start)} - {formatTime(job.work_hours_end)}
                </p>
                <small className="jdp-detail-small">
                  {job.work_days_per_week} days/week
                </small>
              </div>
            </div>
          </div>

          <div className="jdp-description-section">
            <h3 className="jdp-section-title">
              <MdDescription className="jdp-icon" />
              Job Description
            </h3>
            <p className="jdp-description-text">{job.job_description}</p>
          </div>

          <div className="jdp-description-section">
            <h3 className="jdp-section-title">Expectations</h3>
            <div className="jdp-expectations-text">
              {job.expectations?.split("\n").map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
          </div>

          <div className="jdp-contact-section">
            <h3 className="jdp-section-title">Contact Information</h3>
            <div className="jdp-contact-details">
              <div className="jdp-contact-item">
                <FaEnvelope className="jdp-icon" />
                <a href={`mailto:${job.contact_email}`} className="jdp-contact-link">
                  {job.contact_email}
                </a>
              </div>
              <div className="jdp-contact-item">
                <FaPhone className="jdp-icon" />
                <a href={`tel:${job.contact_phone}`} className="jdp-contact-link">
                  {job.contact_phone}
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="jdp-action-buttons">
          <button
            className={`jdp-save-btn ${isSaved ? "jdp-saved" : ""}`}
            onClick={handleSave}
            disabled={saveLoading}
          >
            <FaRegBookmark className="jdp-btn-icon" />
            {isSaved ? "Saved" : "Save Job"}
          </button>
          <Link to={`/chat/${job.id_post}`} className="jdp-chat-btn">
            <FaComments className="jdp-btn-icon" />
            Start Chat
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;