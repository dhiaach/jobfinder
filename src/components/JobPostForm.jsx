import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { v4 as uuidv4 } from 'uuid';
import { useNavigate } from 'react-router-dom';
import './JobPostForm.css';

const JobPostForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    opportunity_type: 'job',
    job_title: '',
    company_name: '',
    wilaya: '',
    city_district: '',
    salary: '',
    work_days_per_week: '',
    work_hours_start: '',
    work_hours_end: '',
    gender_preference: 'any',
    contact_email: '',
    contact_phone: '',
    job_description: '',
    expectations: '',
    category_name: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const categories = [
    'Food',
    'Sales & Retail',
    'Freelance',
    'Hospitality',
    'Event & Catering',
    'Cleaning Services',
    'Manual & Labor',
    'Childcare',
    'Teaching Support'
  ];

  const wilayas = [
    'Adrar', 'Chlef', 'Laghouat', 'Oum El Bouaghi', 'Batna',
    'Béjaïa', 'Biskra', 'Béchar', 'Blida', 'Bouira',
    'Tamanrasset', 'Tébessa', 'Tlemcen', 'Tiaret', 'Tizi Ouzou',
    'Algiers', 'Djelfa', 'Jijel', 'Sétif', 'Saïda',
    'Skikda', 'Sidi Bel Abbès', 'Annaba', 'Guelma', 'Constantine',
    'Médéa', 'Mostaganem', 'M\'Sila', 'Mascara', 'Ouargla',
    'Oran', 'El Bayadh', 'Illizi', 'Bordj Bou Arréridj', 'Boumerdès',
    'El Tarf', 'Tindouf', 'Tissemsilt', 'El Oued', 'Khenchela',
    'Souk Ahras', 'Tipaza', 'Mila', 'Aïn Defla', 'Naâma',
    'Aïn Témouchent', 'Ghardaïa', 'Relizane', 'Other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) throw new Error('Authentication required');

      const postData = {
        id_post: uuidv4(),
        ...formData,
        posted_id: user.id,
        salary: Number(formData.salary),
        work_days_per_week: Number(formData.work_days_per_week),
        work_hours_start: `${formData.work_hours_start}:00`,
        work_hours_end: `${formData.work_hours_end}:00`,
        post_date: new Date().toISOString()
      };

      const { error: insertError } = await supabase
        .from('posts')
        .insert(postData);

      if (insertError) throw insertError;

      navigate('/', {
        state: { 
          showSuccess: true,
          message: 'Opportunity posted successfully!' 
        }
      });

    } catch (err) {
      setError(err.message);
      console.error('Submission error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="post-form-container">
      <h2>Post New Opportunity</h2>

      {error && (
        <div className="alert error">
          ⚠️ {error}
          <button onClick={() => setError('')} className="close-btn">×</button>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Opportunity Type *</label>
          <select
            value={formData.opportunity_type}
            onChange={e => setFormData({ ...formData, opportunity_type: e.target.value })}
            required
          >
            <option value="job">Job</option>
            <option value="freelance">Freelance</option>
          </select>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Job Title *</label>
            <input
              type="text"
              value={formData.job_title}
              onChange={e => setFormData({ ...formData, job_title: e.target.value })}
              placeholder="Enter job title"
              required
            />
          </div>
          <div className="form-group">
            <label>Company Name *</label>
            <input
              type="text"
              value={formData.company_name}
              onChange={e => setFormData({ ...formData, company_name: e.target.value })}
              placeholder="Enter company name"
              required
            />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Category *</label>
            <select
              value={formData.category_name}
              onChange={e => setFormData({ ...formData, category_name: e.target.value })}
              required
            >
              <option value="">Select Category</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Wilaya *</label>
            <select
              value={formData.wilaya}
              onChange={e => setFormData({ ...formData, wilaya: e.target.value })}
              required
            >
              <option value="">Select Wilaya</option>
              {wilayas.map(wilaya => (
                <option key={wilaya} value={wilaya}>{wilaya}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>City/District *</label>
            <input
              type="text"
              value={formData.city_district}
              onChange={e => setFormData({ ...formData, city_district: e.target.value })}
              placeholder="Enter city/district"
              required
            />
          </div>
          <div className="form-group">
            <label>Work Days/Week *</label>
            <input
              type="number"
              min="1"
              max="7"
              value={formData.work_days_per_week}
              onChange={e => setFormData({ ...formData, work_days_per_week: e.target.value })}
              placeholder="Enter work days"
              required
            />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Monthly Salary (DZD) *</label>
            <input
              type="number"
              value={formData.salary}
              onChange={e => setFormData({ ...formData, salary: e.target.value })}
              placeholder="Enter salary"
              required
            />
          </div>
          <div className="form-group">
            <label>Gender Preference</label>
            <select
              value={formData.gender_preference}
              onChange={e => setFormData({ ...formData, gender_preference: e.target.value })}
            >
              <option value="any">Any Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div className="form-group">
          <label>Work Hours *</label>
          <div className="time-inputs">
            <input
              type="time"
              value={formData.work_hours_start}
              onChange={e => setFormData({ ...formData, work_hours_start: e.target.value })}
              required
            />
            <span>to</span>
            <input
              type="time"
              value={formData.work_hours_end}
              onChange={e => setFormData({ ...formData, work_hours_end: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="form-grid">
          <div className="form-group">
            <label>Contact Email *</label>
            <input
              type="email"
              value={formData.contact_email}
              onChange={e => setFormData({ ...formData, contact_email: e.target.value })}
              placeholder="Enter contact email"
              required
            />
          </div>
          <div className="form-group">
            <label>Contact Phone</label>
            <input
              type="tel"
              value={formData.contact_phone}
              onChange={e => setFormData({ ...formData, contact_phone: e.target.value })}
              placeholder="Enter contact phone"
            />
          </div>
        </div>

        <div className="form-group">
          <label>Job Description *</label>
          <textarea
            value={formData.job_description}
            onChange={e => setFormData({ ...formData, job_description: e.target.value })}
            placeholder="Enter detailed job description"
            rows="5"
            required
          />
        </div>

        <div className="form-group">
          <label>Expectations *</label>
          <textarea
            value={formData.expectations}
            onChange={e => setFormData({ ...formData, expectations: e.target.value })}
            placeholder="Enter role expectations"
            rows="5"
            required
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Post Opportunity'}
        </button>
      </form>
    </div>
  );
};

export default JobPostForm;