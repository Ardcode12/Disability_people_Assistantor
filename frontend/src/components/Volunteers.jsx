import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './Volunteers.css';

const SKILLS = [
  'Wheelchair Assistance',
  'Mobility Support',
  'Sign Language',
  'First Aid',
  'Visual Guidance',
  'Companionship',
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const SAMPLE_VOLUNTEERS = [
  {
    id: 1,
    name: 'Aarav Mehta',
    rating: 4.9,
    city: 'Bengaluru',
    distanceKm: 2.1,
    skills: ['Wheelchair Assistance', 'Mobility Support'],
    languages: ['English', 'Hindi', 'Kannada'],
    availability: ['Mon', 'Wed', 'Fri', 'Sat'],
    about: 'Patient and calm, experienced with transfers and ramps. Happy to assist with shopping or appointments.',
    verified: true,
    lastActive: '2025-08-09T09:00:00Z',
    canDrive: false,
    vehicleAccessible: false,
  },
  {
    id: 2,
    name: 'Sara Khan',
    rating: 4.8,
    city: 'Hyderabad',
    distanceKm: 5.6,
    skills: ['Sign Language', 'Visual Guidance'],
    languages: ['English', 'Hindi', 'Telugu'],
    availability: ['Tue', 'Thu', 'Sat'],
    about: 'Conversant in basic and intermediate ISL. Comfortable guiding in crowded areas.',
    verified: true,
    lastActive: '2025-08-08T16:00:00Z',
    canDrive: true,
    vehicleAccessible: false,
  },
  {
    id: 3,
    name: 'Rohan Gupta',
    rating: 4.6,
    city: 'Mumbai',
    distanceKm: 8.3,
    skills: ['First Aid', 'Companionship'],
    languages: ['English', 'Hindi', 'Marathi'],
    availability: ['Wed', 'Thu', 'Sun'],
    about: 'Certified in basic first aid. Happy to read mail, run errands, or offer companionship.',
    verified: false,
    lastActive: '2025-08-09T05:00:00Z',
    canDrive: false,
    vehicleAccessible: false,
  },
  {
    id: 4,
    name: 'Priya Sharma',
    rating: 5.0,
    city: 'Delhi',
    distanceKm: 1.2,
    skills: ['Wheelchair Assistance', 'First Aid', 'Companionship'],
    languages: ['English', 'Hindi'],
    availability: ['Mon', 'Tue', 'Thu', 'Sat', 'Sun'],
    about: 'Experienced with ramps and accessible routes. Can assist at hospitals and public offices.',
    verified: true,
    lastActive: '2025-08-09T10:20:00Z',
    canDrive: true,
    vehicleAccessible: true,
  },
  {
    id: 5,
    name: 'John Mathew',
    rating: 4.7,
    city: 'Kochi',
    distanceKm: 12.5,
    skills: ['Visual Guidance', 'Companionship'],
    languages: ['English', 'Malayalam'],
    availability: ['Fri', 'Sat'],
    about: 'Enjoys outdoor walks and library visits. Can assist with navigation and reading.',
    verified: false,
    lastActive: '2025-08-07T12:00:00Z',
    canDrive: false,
    vehicleAccessible: false,
  },
  {
    id: 6,
    name: 'Neha Verma',
    rating: 4.5,
    city: 'Pune',
    distanceKm: 3.4,
    skills: ['Mobility Support', 'First Aid'],
    languages: ['English', 'Hindi', 'Marathi'],
    availability: ['Mon', 'Wed', 'Sat'],
    about: 'Can accompany to clinics, banks, and markets. Comfortable with long walks.',
    verified: true,
    lastActive: '2025-08-09T07:30:00Z',
    canDrive: false,
    vehicleAccessible: false,
  },
  {
    id: 7,
    name: 'Aditya Rao',
    rating: 4.2,
    city: 'Chennai',
    distanceKm: 18.9,
    skills: ['Sign Language', 'Companionship'],
    languages: ['English', 'Tamil'],
    availability: ['Tue', 'Thu', 'Sun'],
    about: 'ISL beginner. Friendly and punctual. Can assist with campus navigation.',
    verified: false,
    lastActive: '2025-08-06T15:00:00Z',
    canDrive: false,
    vehicleAccessible: false,
  },
  {
    id: 8,
    name: 'Ananya Singh',
    rating: 4.9,
    city: 'Jaipur',
    distanceKm: 9.1,
    skills: ['Wheelchair Assistance', 'Visual Guidance'],
    languages: ['English', 'Hindi'],
    availability: ['Sat', 'Sun'],
    about: 'Special interest in museum and park visits. Knows accessible routes.',
    verified: true,
    lastActive: '2025-08-09T11:00:00Z',
    canDrive: true,
    vehicleAccessible: false,
  },
];

const StarRating = ({ rating }) => {
  const filled = Math.round(rating);
  return (
    <div className="stars" aria-label={`Rating ${rating} out of 5`}>
      {'★'.repeat(filled)}
      <span className="stars-dim">{'★'.repeat(5 - filled)}</span>
      <span className="rating-number">{rating.toFixed(1)}</span>
    </div>
  );
};

const Chip = ({ label, active, onClick }) => (
  <button
    type="button"
    className={`chip ${active ? 'active' : ''}`}
    onClick={onClick}
    aria-pressed={active ? 'true' : 'false'}
  >
    {label}
  </button>
);

const Volunteers = () => {
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [radius, setRadius] = useState(25);
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [selectedDays, setSelectedDays] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('distance');

  const [requestOpen, setRequestOpen] = useState(false);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [activeVolunteer, setActiveVolunteer] = useState(null);

  // Request form
  const [reqForm, setReqForm] = useState({
    name: '',
    phone: '',
    preferredDay: '',
    message: '',
  });
  const [reqError, setReqError] = useState('');

  // Register form
  const [regForm, setRegForm] = useState({
    name: '',
    email: '',
    phone: '',
    city: '',
    skills: [],
    languages: '',
    days: [],
    about: '',
    agree: false,
  });
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  useEffect(() => {
    AOS.init({ duration: 900, once: true, offset: 80 });
  }, []);

  const toggleSkill = (skill) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );
  };

  const toggleDay = (day) => {
    setSelectedDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  };

  const filtered = useMemo(() => {
    let list = [...SAMPLE_VOLUNTEERS];

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (v) =>
          v.name.toLowerCase().includes(q) ||
          v.about.toLowerCase().includes(q) ||
          v.skills.some((s) => s.toLowerCase().includes(q)) ||
          v.languages.some((l) => l.toLowerCase().includes(q))
      );
    }

    if (city.trim()) {
      const c = city.toLowerCase();
      list = list.filter((v) => v.city.toLowerCase().includes(c));
    }

    list = list.filter((v) => v.distanceKm <= Number(radius));
    list = list.filter((v) => v.rating >= Number(minRating));

    if (selectedSkills.length) {
      list = list.filter((v) =>
        selectedSkills.every((s) => v.skills.includes(s))
      );
    }

    if (selectedDays.length) {
      list = list.filter((v) =>
        v.availability.some((d) => selectedDays.includes(d))
      );
    }

    switch (sortBy) {
      case 'rating':
        list.sort((a, b) => b.rating - a.rating);
        break;
      case 'recent':
        list.sort(
          (a, b) => new Date(b.lastActive).getTime() - new Date(a.lastActive).getTime()
        );
        break;
      default:
        list.sort((a, b) => a.distanceKm - b.distanceKm);
    }

    return list;
  }, [query, city, radius, selectedSkills, selectedDays, minRating, sortBy]);

  const openRequest = (volunteer) => {
    setActiveVolunteer(volunteer);
    setReqForm({
      name: '',
      phone: '',
      preferredDay: '',
      message: `Hi ${volunteer.name}, I would like to request your help.`,
    });
    setReqError('');
    setRequestOpen(true);
  };

  const submitRequest = (e) => {
    e.preventDefault();
    if (!reqForm.name || !reqForm.phone || !reqForm.preferredDay || !reqForm.message) {
      setReqError('Please fill all fields.');
      return;
    }
    setReqError('');
    setRequestOpen(false);
    alert('Request sent to volunteer. They will contact you soon.');
  };

  const submitRegister = (e) => {
    e.preventDefault();
    if (!regForm.name || !regForm.email || !regForm.phone || !regForm.city) {
      setRegError('Please fill the required fields.');
      return;
    }
    if (!regForm.skills.length) {
      setRegError('Please select at least one skill.');
      return;
    }
    if (!regForm.agree) {
      setRegError('Please agree to the community guidelines.');
      return;
    }
    setRegError('');
    setRegSuccess(true);
    setTimeout(() => {
      setRegisterOpen(false);
      setRegSuccess(false);
      setRegForm({
        name: '',
        email: '',
        phone: '',
        city: '',
        skills: [],
        languages: '',
        days: [],
        about: '',
        agree: false,
      });
    }, 1800);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const navItems = [
    { icon: '🏠', title: 'Home', path: '/' },
    { icon: '🛍️', title: 'Find Shops', path: '/shops' },
    { icon: '🏥', title: 'Hospitals', path: '/hospitals' },
    { icon: '🤝', title: 'Volunteers', path: '/volunteers' },
    { icon: '📍', title: 'Navigation', path: '/navigation' },
    { icon: '📞', title: 'Contact', path: '/contact' },
  ];

  const handleNavigation = (path) => {
    setIsSidebarOpen(false);
    navigate(path);
  };

  return (
    <div className="volunteers-page">
      {/* Sidebar Navigation */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-logo">
            <span className="logo-icon">♿</span>
            <span className="logo-text">Access Hub</span>
          </h2>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item, index) => (
            <button 
              key={index} 
              className={`nav-item ${item.path === '/volunteers' ? 'active' : ''}`}
              onClick={() => handleNavigation(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.title}</span>
              <span className="nav-indicator"></span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div 
            className="user-profile" 
            onClick={() => navigate('/signin')}
            style={{ cursor: 'pointer' }}
          >
            <div className="user-avatar">👤</div>
            <div className="user-info">
              <p className="user-name">Guest User</p>
              <p className="user-status">Sign In</p>
            </div>
          </div>
        </div>
      </div>

      {/* Menu Toggle Button */}
      <button 
        className={`menu-toggle ${isSidebarOpen ? 'active' : ''}`}
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      {/* Overlay */}
      {isSidebarOpen && (
        <div className="sidebar-overlay" onClick={toggleSidebar}></div>
      )}

      {/* Hero */}
      <section className="vol-hero">
        <div className="vol-hero-inner">
          <div className="vol-hero-text" data-aos="fade-up">
            <h1 className="vol-title">
              Connect with Volunteers
              <span className="vol-title-accent"> Ready to Help</span>
            </h1>
            <p className="vol-subtitle">
              Find trusted community volunteers for mobility assistance, sign language support,
              companionship, and more—near you.
            </p>
            <div className="vol-cta">
              <button className="btn btn-primary" onClick={() => window.scrollTo({ top: 520, behavior: 'smooth' })}>
                Find Help
              </button>
              <button className="btn btn-secondary" onClick={() => setRegisterOpen(true)}>
                Become a Volunteer
              </button>
            </div>
            <div className="vol-hero-badges">
              <span className="badge-item">✅ Verified Profiles</span>
              <span className="badge-item">⭐ Community Rated</span>
              <span className="badge-item">🕒 Flexible Availability</span>
            </div>
          </div>
          <div className="vol-hero-graphic" data-aos="fade-left" data-aos-delay="200">
            <div className="vol-graphic-card">
              <div className="vol-graphic-row">
                <span className="vol-graphic-icon">🤝</span>
                <span className="vol-graphic-text">500+ Active Volunteers</span>
              </div>
              <div className="vol-graphic-row">
                <span className="vol-graphic-icon">🧭</span>
                <span className="vol-graphic-text">Nearby & On-Demand</span>
              </div>
              <div className="vol-graphic-row">
                <span className="vol-graphic-icon">🛡️</span>
                <span className="vol-graphic-text">Safety First</span>
              </div>
            </div>
            <div className="floating-shapes">
              <div className="shape shape-1"></div>
              <div className="shape shape-2"></div>
              <div className="shape shape-3"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="vol-filters" aria-label="Volunteer filters">
        <div className="vol-filters-inner" data-aos="fade-up" data-aos-delay="100">
          <div className="vol-filters-row">
            <div className="field">
              <label htmlFor="q">Search</label>
              <input
                id="q"
                type="text"
                placeholder="Name, skill, language..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="city">City</label>
              <input
                id="city"
                type="text"
                placeholder="e.g., Bengaluru"
                value={city}
                onChange={(e) => setCity(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="radius">Radius: {radius} km</label>
              <input
                id="radius"
                type="range"
                min="1"
                max="50"
                step="1"
                value={radius}
                onChange={(e) => setRadius(e.target.value)}
              />
            </div>

            <div className="field">
              <label htmlFor="rating">Min Rating</label>
              <select
                id="rating"
                value={minRating}
                onChange={(e) => setMinRating(e.target.value)}
              >
                <option value="0">Any</option>
                <option value="3">3.0+</option>
                <option value="4">4.0+</option>
                <option value="4.5">4.5+</option>
              </select>
            </div>

            <div className="field">
              <label htmlFor="sort">Sort By</label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="distance">Distance</option>
                <option value="rating">Rating</option>
                <option value="recent">Recently Active</option>
              </select>
            </div>
          </div>

          <div className="vol-filter-chips">
            <div className="chip-group">
              <span className="chip-label">Skills:</span>
              {SKILLS.map((s) => (
                <Chip
                  key={s}
                  label={s}
                  active={selectedSkills.includes(s)}
                  onClick={() => toggleSkill(s)}
                />
              ))}
            </div>
            <div className="chip-group">
              <span className="chip-label">Days:</span>
              {DAYS.map((d) => (
                <Chip
                  key={d}
                  label={d}
                  active={selectedDays.includes(d)}
                  onClick={() => toggleDay(d)}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Results header */}
      <section className="vol-results-head" aria-live="polite">
        <div className="container">
          <div className="results-bar" data-aos="fade-up" data-aos-offset="0">
            <div>
              <strong>{filtered.length}</strong> volunteers found within {radius} km
              {city ? ` of ${city}` : ''}
            </div>
            <button className="text-link" onClick={() => navigate('/contact')}>
              Need urgent help? Contact us →
            </button>
          </div>
        </div>
      </section>

      {/* Cards */}
      <section className="vol-list container">
        <div className="vol-grid">
          {filtered.map((v, index) => (
            <article key={v.id} className="vol-card" data-aos="fade-up" data-aos-delay={ (index % 3) * 100 }>
              <div className="card-glow"></div>
              <div className="vol-card-head">
                <div className="vol-avatar" aria-hidden="true">
                  {v.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .slice(0, 2)}
                </div>
                <div className="vol-card-meta">
                  <div className="vol-name-row">
                    <h3 className="vol-name">{v.name}</h3>
                    {v.verified && <span className="badge badge-verified">Verified</span>}
                  </div>
                  <div className="vol-submeta">
                    <StarRating rating={v.rating} />
                    <span className="dot">•</span>
                    <span className="distance">{v.distanceKm} km away</span>
                    <span className="dot">•</span>
                    <span className="city">{v.city}</span>
                  </div>
                </div>
              </div>

              <p className="vol-about">{v.about}</p>

              <div className="vol-tags">
                {v.skills.map((s) => (
                  <span key={s} className="tag">
                    {s}
                  </span>
                ))}
                {v.canDrive && <span className="tag tag-alt">Can Drive</span>}
                {v.vehicleAccessible && <span className="tag tag-alt">Accessible Vehicle</span>}
              </div>

              <div className="vol-availability">
                <span className="avail-label">Available:</span>
                <div className="avail-days">
                  {DAYS.map((d) => (
                    <span key={d} className={`day ${v.availability.includes(d) ? 'on' : ''}`}>
                      {d}
                    </span>
                  ))}
                </div>
              </div>

              <div className="vol-actions">
                <button className="btn btn-primary" onClick={() => openRequest(v)}>
                  Request Help
                </button>
                <button className="btn btn-light" onClick={() => navigate('/contact')}>
                  Message
                </button>
              </div>
            </article>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="empty" data-aos="fade-up">
            <div className="empty-emoji" aria-hidden="true">🔍</div>
            <h3>No volunteers match your filters</h3>
            <p>Try widening the radius or removing some filters.</p>
            <button
              className="btn btn-secondary"
              onClick={() => {
                setSelectedSkills([]);
                setSelectedDays([]);
                setMinRating(0);
              }}
            >
              Clear Filters
            </button>
          </div>
        )}
      </section>

      {/* Safety tips */}
      <section className="vol-safety">
        <div className="container">
          <div className="safety-card" data-aos="zoom-in" data-aos-duration="600">
            <h3>Safety Tips</h3>
            <ul className="safety-list">
              <li>Meet in public places for first-time meetings.</li>
              <li>Share your trip details with a trusted contact.</li>
              <li>Verify volunteer identity and profile details.</li>
              <li>Use in-app contact methods whenever possible.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="vol-cta-banner" data-aos="fade-up">
        <div className="container vol-cta-inner">
          <div>
            <h3>Want to make a difference?</h3>
            <p>Join our volunteer network and help someone nearby today.</p>
          </div>
          <div>
            <button className="btn btn-white" onClick={() => setRegisterOpen(true)}>
              Become a Volunteer
            </button>
          </div>
        </div>
      </section>

      {/* Request Modal */}
      {requestOpen && activeVolunteer && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Request help">
          <div className="modal">
            <div className="modal-head">
              <h3>Request Help from {activeVolunteer.name}</h3>
              <button className="icon-btn" onClick={() => setRequestOpen(false)} aria-label="Close">×</button>
            </div>
            <form className="modal-body" onSubmit={submitRequest}>
              <div className="field">
                <label htmlFor="rq-name">Your Name</label>
                <input
                  id="rq-name"
                  type="text"
                  value={reqForm.name}
                  onChange={(e) => setReqForm({ ...reqForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="rq-phone">Phone</label>
                <input
                  id="rq-phone"
                  type="tel"
                  value={reqForm.phone}
                  onChange={(e) => setReqForm({ ...reqForm, phone: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="rq-day">Preferred Day</label>
                <select
                  id="rq-day"
                  value={reqForm.preferredDay}
                  onChange={(e) => setReqForm({ ...reqForm, preferredDay: e.target.value })}
                  required
                >
                  <option value="" disabled>Select a day</option>
                  {DAYS.map((d) => (
                    <option key={d} value={d} disabled={!activeVolunteer.availability.includes(d)}>
                      {d} {activeVolunteer.availability.includes(d) ? '' : '(Unavailable)'}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="rq-msg">Message</label>
                <textarea
                  id="rq-msg"
                  rows={4}
                  value={reqForm.message}
                  onChange={(e) => setReqForm({ ...reqForm, message: e.target.value })}
                  required
                />
              </div>
              {reqError && <div className="form-error">{reqError}</div>}
              <div className="modal-actions">
                <button type="button" className="btn btn-light" onClick={() => setRequestOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Send Request</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Modal */}
      {registerOpen && (
        <div className="modal-overlay" role="dialog" aria-modal="true" aria-label="Become a volunteer">
          <div className="modal wide">
            <div className="modal-head">
              <h3>Become a Volunteer</h3>
              <button className="icon-btn" onClick={() => setRegisterOpen(false)} aria-label="Close">×</button>
            </div>
            <form className="modal-body grid" onSubmit={submitRegister}>
              <div className="field">
                <label htmlFor="rg-name">Full Name *</label>
                <input
                  id="rg-name"
                  type="text"
                  value={regForm.name}
                  onChange={(e) => setRegForm({ ...regForm, name: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="rg-email">Email *</label>
                <input
                  id="rg-email"
                  type="email"
                  value={regForm.email}
                  onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="rg-phone">Phone *</label>
                <input
                  id="rg-phone"
                  type="tel"
                  value={regForm.phone}
                  onChange={(e) => setRegForm({ ...regForm, phone: e.target.value })}
                  required
                />
              </div>
              <div className="field">
                <label htmlFor="rg-city">City *</label>
                <input
                  id="rg-city"
                  type="text"
                  value={regForm.city}
                  onChange={(e) => setRegForm({ ...regForm, city: e.target.value })}
                  required
                />
              </div>

              <div className="field field-col">
                <label>Skills (select at least one) *</label>
                <div className="checkbox-grid">
                  {SKILLS.map((s) => (
                    <label key={s} className="cb">
                      <input
                        type="checkbox"
                        checked={regForm.skills.includes(s)}
                        onChange={(e) =>
                          setRegForm((prev) => ({
                            ...prev,
                            skills: e.target.checked
                              ? [...prev.skills, s]
                              : prev.skills.filter((x) => x !== s),
                          }))
                        }
                      />
                      <span className="cb-label">{s}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="field field-col">
                <label htmlFor="rg-lang">Languages Spoken</label>
                <input
                  id="rg-lang"
                  type="text"
                  placeholder="e.g., English, Hindi"
                  value={regForm.languages}
                  onChange={(e) => setRegForm({ ...regForm, languages: e.target.value })}
                />
              </div>

              <div className="field field-col">
                <label>Available Days</label>
                <div className="chips-editable">
                  {DAYS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      className={`chip ${regForm.days.includes(d) ? 'active' : ''}`}
                      onClick={() =>
                        setRegForm((prev) => ({
                          ...prev,
                          days: prev.days.includes(d) ? prev.days.filter((x) => x !== d) : [...prev.days, d],
                        }))
                      }
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field field-col">
                <label htmlFor="rg-about">About You (optional)</label>
                <textarea
                  id="rg-about"
                  rows={3}
                  placeholder="Tell the community how you can help..."
                  value={regForm.about}
                  onChange={(e) => setRegForm({ ...regForm, about: e.target.value })}
                />
              </div>

              <div className="field field-col agree-field">
                <label className="cb">
                  <input
                    type="checkbox"
                    checked={regForm.agree}
                    onChange={(e) => setRegForm({ ...regForm, agree: e.target.checked })}
                    required
                  />
                  <span className="cb-label">I agree to the community guidelines and privacy policy. *</span>
                </label>
              </div>

              <div className="form-messages field-col">
                {regError && <div className="form-error">{regError}</div>}
                {regSuccess && <div className="form-success">Thanks for joining! We'll review your profile shortly.</div>}
              </div>
              
              <div className="modal-actions field-col">
                <button type="button" className="btn btn-light" onClick={() => setRegisterOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">Submit Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Volunteers;
