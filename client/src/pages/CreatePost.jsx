import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Layers, Plus, ArrowLeft } from 'lucide-react';
import api from '../services/api';

export const CreatePost = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'LOST_FOUND';

  const [postType, setPostType] = useState(
    ['LOST_FOUND', 'MARKETPLACE', 'COLLABORATION'].includes(initialType) ? initialType : 'LOST_FOUND'
  );

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Electronics');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  // Lost & Found details
  const [itemState, setItemState] = useState('LOST');
  const [dateOccurred, setDateOccurred] = useState(new Date().toISOString().split('T')[0]);

  // Marketplace details
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('GOOD');
  const [itemType, setItemType] = useState('Textbook');

  // Collaboration details
  const [collaborationType, setCollaborationType] = useState('HACKATHON_TEAM');
  const [subject, setSubject] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [availability, setAvailability] = useState('Evenings & Weekends');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !description.trim() || !category) {
      setError('Please provide a title, description, and category.');
      return;
    }

    const payload = {
      type: postType,
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      location: location.trim(),
      images: imageUrl.trim() ? [imageUrl.trim()] : [],
      tags: tagsInput ? tagsInput.split(',').map((t) => t.trim()).filter(Boolean) : [],
      details: {},
    };

    if (postType === 'LOST_FOUND') {
      payload.details.itemState = itemState;
      payload.details.dateOccurred = dateOccurred ? new Date(dateOccurred) : new Date();
    } else if (postType === 'MARKETPLACE') {
      if (price === '' || Number(price) < 0) {
        setError('Please enter a valid price in INR (0 or higher).');
        return;
      }
      payload.details.price = Number(price);
      payload.details.condition = condition;
      payload.details.itemType = itemType.trim();
    } else if (postType === 'COLLABORATION') {
      payload.details.collaborationType = collaborationType;
      payload.details.subject = subject.trim();
      payload.details.availability = availability.trim();
      payload.details.skills = skillsInput ? skillsInput.split(',').map((s) => s.trim()).filter(Boolean) : [];
    }

    try {
      setSubmitting(true);
      const res = await api.post('/posts', payload);
      if (res.success && res.data) {
        navigate(`/posts/${res.data._id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to publish post. Please check all fields.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ paddingTop: '2.5rem', paddingBottom: '4rem', maxWidth: '780px' }}>
      <button
        onClick={() => navigate(-1)}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="card" style={{ padding: '2.5rem' }}>
        <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginBottom: '0.5rem' }}>
          Create New Campus Listing
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '2rem' }}>
          Share an update with the Apex Institute community. Choose your listing category below.
        </p>

        {error && (
          <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem', border: '1px solid #fecaca' }}>
            {error}
          </div>
        )}

        {/* Post Type Selector Tabs */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '2rem' }}>
          <button
            type="button"
            onClick={() => {
              setPostType('LOST_FOUND');
              setCategory('Electronics');
            }}
            className="btn"
            style={{
              padding: '0.85rem 0.5rem',
              borderRadius: 'var(--radius-md)',
              border: postType === 'LOST_FOUND' ? '2px solid var(--danger)' : '1px solid var(--border)',
              background: postType === 'LOST_FOUND' ? 'var(--danger-light)' : 'var(--bg-surface)',
              color: postType === 'LOST_FOUND' ? 'var(--danger)' : 'var(--text-main)',
              fontWeight: 700,
            }}
          >
            Lost & Found
          </button>

          <button
            type="button"
            onClick={() => {
              setPostType('MARKETPLACE');
              setCategory('Books & Notes');
            }}
            className="btn"
            style={{
              padding: '0.85rem 0.5rem',
              borderRadius: 'var(--radius-md)',
              border: postType === 'MARKETPLACE' ? '2px solid #d97706' : '1px solid var(--border)',
              background: postType === 'MARKETPLACE' ? '#fef3c7' : 'var(--bg-surface)',
              color: postType === 'MARKETPLACE' ? '#b45309' : 'var(--text-main)',
              fontWeight: 700,
            }}
          >
            Marketplace
          </button>

          <button
            type="button"
            onClick={() => {
              setPostType('COLLABORATION');
              setCategory('Hackathons');
            }}
            className="btn"
            style={{
              padding: '0.85rem 0.5rem',
              borderRadius: 'var(--radius-md)',
              border: postType === 'COLLABORATION' ? '2px solid var(--primary)' : '1px solid var(--border)',
              background: postType === 'COLLABORATION' ? 'var(--primary-light)' : 'var(--bg-surface)',
              color: postType === 'COLLABORATION' ? 'var(--primary)' : 'var(--text-main)',
              fontWeight: 700,
            }}
          >
            Collaboration
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Category specific top controls */}
          {postType === 'LOST_FOUND' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Notice Type *</label>
                <select
                  className="form-control"
                  value={itemState}
                  onChange={(e) => setItemState(e.target.value)}
                >
                  <option value="LOST">Lost - I lost an item</option>
                  <option value="FOUND">Found - I found an item</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Date Occurred</label>
                <input
                  type="date"
                  className="form-control"
                  value={dateOccurred}
                  onChange={(e) => setDateOccurred(e.target.value)}
                />
              </div>
            </div>
          )}

          {postType === 'MARKETPLACE' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Price in INR (₹) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  placeholder="e.g. 400"
                  className="form-control"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Condition *</label>
                <select
                  className="form-control"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                >
                  <option value="NEW">Brand New / Unused</option>
                  <option value="LIKE_NEW">Like New</option>
                  <option value="GOOD">Good Condition</option>
                  <option value="FAIR">Fair / Usable</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Item Subtype</label>
                <input
                  type="text"
                  placeholder="e.g. Textbook, Chair"
                  className="form-control"
                  value={itemType}
                  onChange={(e) => setItemType(e.target.value)}
                />
              </div>
            </div>
          )}

          {postType === 'COLLABORATION' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Collaboration Objective *</label>
                <select
                  className="form-control"
                  value={collaborationType}
                  onChange={(e) => setCollaborationType(e.target.value)}
                >
                  <option value="HACKATHON_TEAM">Hackathon Team</option>
                  <option value="STUDY_PARTNER">Study Partner</option>
                  <option value="PERSONAL_PROJECT">Personal Project</option>
                  <option value="ASSIGNMENT_GROUP">Course Assignment Group</option>
                  <option value="RESEARCH_GROUP">Research or Learning Group</option>
                </select>
              </div>

              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Subject / Domain</label>
                <input
                  type="text"
                  placeholder="e.g. Computer Networks, Web App"
                  className="form-control"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Common Listing Fields */}
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              required
              placeholder={
                postType === 'LOST_FOUND'
                  ? 'e.g. Lost Blue Titan Watch near Sports Complex'
                  : postType === 'MARKETPLACE'
                  ? 'e.g. Erwin Kreyszig Engineering Maths (10th Ed)'
                  : 'e.g. Looking for React / Tailwind Developer for SIH Hackathon'
              }
              className="form-control"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <input
                type="text"
                required
                placeholder="e.g. Books, Electronics, Study Groups"
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Campus Location / Landmark</label>
              <input
                type="text"
                placeholder="e.g. Central Library 2nd floor, Hostel 3"
                className="form-control"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          {postType === 'COLLABORATION' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Skills Desired (Comma separated)</label>
                <input
                  type="text"
                  placeholder="e.g. React, Node.js, UI/UX"
                  className="form-control"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Availability / Schedule</label>
                <input
                  type="text"
                  placeholder="e.g. Weekends, Daily 7-9 PM"
                  className="form-control"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Full Description *</label>
            <textarea
              required
              rows="5"
              placeholder="Provide clear details to help batchmates recognize the item or understand your request..."
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Image URL (Optional)</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/... or image link"
              className="form-control"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
            <span className="form-hint">
              Images help verify item condition or lost belongings accurately.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Search Tags (Comma separated)</label>
            <input
              type="text"
              placeholder="e.g. books, math, first-year"
              className="form-control"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-secondary"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {submitting ? 'Publishing...' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
