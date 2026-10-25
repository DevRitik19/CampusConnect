import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import api from '../services/api';

export const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [postType, setPostType] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [price, setPrice] = useState('');
  const [condition, setCondition] = useState('GOOD');
  const [subject, setSubject] = useState('');
  const [skillsInput, setSkillsInput] = useState('');
  const [availability, setAvailability] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/posts/${id}`);
        if (res.success && res.data) {
          const p = res.data;
          setPostType(p.type);
          setTitle(p.title);
          setDescription(p.description);
          setCategory(p.category);
          setLocation(p.location || '');
          setImageUrl(p.images && p.images.length > 0 ? p.images[0] : '');
          setTagsInput(p.tags ? p.tags.join(', ') : '');

          if (p.type === 'MARKETPLACE') {
            setPrice(p.details?.price !== undefined ? p.details.price : '');
            setCondition(p.details?.condition || 'GOOD');
          } else if (p.type === 'COLLABORATION') {
            setSubject(p.details?.subject || '');
            setAvailability(p.details?.availability || '');
            setSkillsInput(p.details?.skills ? p.details.skills.join(', ') : '');
          }
        }
      } catch (err) {
        setError(err.message || 'Failed to load post data');
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const payload = {
      title: title.trim(),
      description: description.trim(),
      category: category.trim(),
      location: location.trim(),
      images: imageUrl.trim() ? [imageUrl.trim()] : [],
      tags: tagsInput ? tagsInput.split(',').map((t) => t.trim()).filter(Boolean) : [],
      details: {},
    };

    if (postType === 'MARKETPLACE') {
      payload.details.price = Number(price);
      payload.details.condition = condition;
    } else if (postType === 'COLLABORATION') {
      payload.details.subject = subject.trim();
      payload.details.availability = availability.trim();
      payload.details.skills = skillsInput ? skillsInput.split(',').map((s) => s.trim()).filter(Boolean) : [];
    }

    try {
      setSubmitting(true);
      const res = await api.patch(`/posts/${id}`, payload);
      if (res.success) {
        navigate(`/posts/${id}`);
      }
    } catch (err) {
      setError(err.message || 'Failed to update post.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>Loading listing for edit...</p>
      </div>
    );
  }

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
          Edit Campus Listing
        </h1>

        {error && (
          <div style={{ background: 'var(--danger-light)', color: 'var(--danger)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              required
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
                className="form-control"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Campus Location</label>
              <input
                type="text"
                className="form-control"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          {postType === 'MARKETPLACE' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Price (₹) *</label>
                <input
                  type="number"
                  min="0"
                  required
                  className="form-control"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Condition</label>
                <select
                  className="form-control"
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                >
                  <option value="NEW">Brand New</option>
                  <option value="LIKE_NEW">Like New</option>
                  <option value="GOOD">Good</option>
                  <option value="FAIR">Fair</option>
                </select>
              </div>
            </div>
          )}

          {postType === 'COLLABORATION' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Subject / Domain</label>
                <input
                  type="text"
                  className="form-control"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Skills (Comma separated)</label>
                <input
                  type="text"
                  className="form-control"
                  value={skillsInput}
                  onChange={(e) => setSkillsInput(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Description *</label>
            <textarea
              required
              rows="5"
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Image URL</label>
            <input
              type="url"
              className="form-control"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Search Tags (Comma separated)</label>
            <input
              type="text"
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
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
