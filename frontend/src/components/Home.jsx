import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import './home.css';
import heroImage from '../assets/img_hover.jpg';

// Typing Effect Component
const TypingText = ({ text, speed = 100, className = "", onComplete }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[currentIndex]);
        setCurrentIndex(prev => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    } else if (currentIndex === text.length && onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  return <span className={className}>{displayText}</span>;
};

const Home = () => {
  const navigate = useNavigate();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [typingComplete, setTypingComplete] = useState(false);
  const [firstLineComplete, setFirstLineComplete] = useState(false);

  useEffect(() => {
    AOS.init({
      duration: 1000,
      once: true,
      offset: 100
    });
  }, []);

  // Voice Recognition Setup
  const startListening = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
        setShowTranscript(true);
      };

      recognition.onresult = (event) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + ' ';
          } else {
            interimTranscript += transcript;
          }
        }

        setTranscript(finalTranscript || interimTranscript);

        // Voice Commands
        const command = finalTranscript.toLowerCase().trim();
        if (command.includes('scroll down')) {
          window.scrollBy(0, 500);
        } else if (command.includes('scroll up')) {
          window.scrollBy(0, -500);
        } else if (command.includes('go to top')) {
          window.scrollTo(0, 0);
        } else if (command.includes('find shops')) {
          navigate('/shops');
        } else if (command.includes('services')) {
          document.querySelector('.services-section')?.scrollIntoView({ behavior: 'smooth' });
        } else if (command.includes('go to shops')) {
          navigate('/shops');
        } else if (command.includes('hospitals')) {
          navigate('/hospitals');
        } else if (command.includes('volunteers')) {
          navigate('/volunteers');
        }
      };

      recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();

      // Store recognition instance to stop it later
      window.currentRecognition = recognition;
    } else {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
    }
  };

  const stopListening = () => {
    if (window.currentRecognition) {
      window.currentRecognition.stop();
      setIsListening(false);
    }
  };

  const toggleVoice = () => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
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

  const services = [
    {
      icon: '🛍️',
      title: 'Accessible Shopping',
      description: 'Find wheelchair-accessible shops, stores with assistance services, and disability-friendly retail locations',
      path: '/shops'
    },
    {
      icon: '🏥',
      title: 'Specialized Healthcare',
      description: 'Locate hospitals and clinics with specialized equipment and expertise for disability care',
      path: '/hospitals'
    },
    {
      icon: '🤝',
      title: 'Volunteer Network',
      description: 'Connect with trained volunteers ready to assist with daily activities and companionship',
      path: '/volunteers'
    },
  ];

  const features = [
    {
      title: 'Real-time Search',
      description: 'Instantly find accessible locations near you',
      icon: '🔍'
    },
    {
      title: 'Verified Reviews',
      description: 'Read reviews from community members about accessibility',
      icon: '⭐'
    },
    {
      title: 'Emergency Support',
      description: '24/7 access to emergency assistance and helplines',
      icon: '🚨'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      text: 'This platform helped me find accessible shops I never knew existed in my area. Game changer!',
      rating: 5
    },
    {
      name: 'Michael Chen',
      text: 'Finding volunteers through this site has made my daily life so much easier. Highly recommend!',
      rating: 5
    }
  ];

  const handleNavigation = (path) => {
    setIsSidebarOpen(false);
    navigate(path);
  };

  return (
    <div className="home-container">
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
              className="nav-item"
              onClick={() => handleNavigation(item.path)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-text">{item.title}</span>
              <span className="nav-indicator"></span>
            </button>
          ))}
        </nav>

        {/* Update this part in your Home component */}
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

      {/* Voice Button */}
      <div className={`voice-button-container ${isListening ? 'listening' : ''}`}>
        <button 
          className="voice-button"
          onClick={toggleVoice}
          aria-label={isListening ? 'Stop voice recognition' : 'Start voice recognition'}
        >
          {isListening ? (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15.5C14.21 15.5 16 13.71 16 11.5V6C16 3.79 14.21 2 12 2C9.79 2 8 3.79 8 6V11.5C8 13.71 9.79 15.5 12 15.5Z" fill="currentColor"/>
              <path d="M19 11.5C19 15.09 16.09 18 12.5 18H12C8.41 18 5.5 15.09 5.5 11.5H3.5C3.5 15.64 6.64 19.04 10.74 19.84V23H13.26V19.84C17.36 19.04 20.5 15.64 20.5 11.5H19Z" fill="currentColor"/>
              <rect x="9" y="4" width="6" height="10" rx="3" fill="white" className="voice-animation"/>
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 15.5C14.21 15.5 16 13.71 16 11.5V6C16 3.79 14.21 2 12 2C9.79 2 8 3.79 8 6V11.5C8 13.71 9.79 15.5 12 15.5Z" fill="currentColor"/>
              <path d="M19 11.5C19 15.09 16.09 18 12.5 18H12C8.41 18 5.5 15.09 5.5 11.5H3.5C3.5 15.64 6.64 19.04 10.74 19.84V23H13.26V19.84C17.36 19.04 20.5 15.64 20.5 11.5H19Z" fill="currentColor"/>
            </svg>
          )}
        </button>
        <div className="voice-tooltip">
          {isListening ? 'Listening... Click to stop' : 'Click to use voice commands'}
        </div>
        {isListening && (
          <div className="voice-ripple">
            <span></span>
            <span></span>
            <span></span>
          </div>
        )}
      </div>

      {/* Voice Transcript */}
      {showTranscript && (
        <div className="voice-transcript">
          <div className="transcript-header">
            <span>Voice Recognition</span>
            <button onClick={() => setShowTranscript(false)}>×</button>
          </div>
          <div className="transcript-content">
            {transcript || 'Listening for commands...'}
          </div>
          <div className="voice-commands">
            <p>Try saying: "Find shops", "Go to shops", "Scroll down", "Go to top"</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className={`main-content ${isSidebarOpen ? 'shifted' : ''}`}>
        {/* Hero Section */}
        <section id="home" className="hero-section">
          <div className="hero-content" data-aos="fade-up">
            <h1 className="hero-title">
              <TypingText 
                text="Find Accessible Places,"
                speed={50}
                onComplete={() => setFirstLineComplete(true)}
              />
              <br />
              {firstLineComplete && (
                <span className="highlight typing-highlight">
                  <TypingText 
                    text=" Connect with Support"
                    speed={50}
                    onComplete={() => setTypingComplete(true)}
                  />
                </span>
              )}
              {!typingComplete && <span className="typing-cursor">|</span>}
            </h1>
            <p className="hero-subtitle subtitle-fade-in">
              Your comprehensive platform to discover disability-friendly shops, 
              specialized healthcare facilities, and connect with helpful volunteers
            </p>
            <div className="hero-buttons buttons-fade-in">
              <button 
                className="btn btn-primary" 
                onClick={() => navigate('/shops')}
                data-aos="fade-right" 
                data-aos-delay="200"
              >
                Start Searching
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => navigate('/volunteers')}
                data-aos="fade-left" 
                data-aos-delay="200"
              >
                Find Volunteers
              </button>
            </div>
          </div>
          <div className="hero-image" data-aos="fade-left" data-aos-delay="300">
            <div className="image-wrapper">
              <img 
                src={heroImage} 
                alt="Person with disability being assisted"
                className="hero-img"
              />
              <div className="image-overlay"></div>
              <div className="floating-elements">
                <div className="floating-circle circle-1"></div>
                <div className="floating-circle circle-2"></div>
                <div className="floating-circle circle-3"></div>
                <div className="floating-icon icon-1">🏪</div>
                <div className="floating-icon icon-2">🏥</div>
                <div className="floating-icon icon-3">🤝</div>
              </div>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="about-section">
          <div className="container">
            <div className="about-content">
              <div className="about-text" data-aos="fade-right">
                <h2 className="section-title">Your Accessibility Companion</h2>
                <p className="about-description">
                  We understand the challenges of finding truly accessible places and services. 
                  Our platform bridges the gap between people with disabilities and the resources 
                  they need - from wheelchair-accessible shops to specialized medical facilities 
                  and caring volunteers ready to help.
                </p>
                <div className="features-list">
                  {features.map((feature, index) => (
                    <div key={index} className="feature-item" data-aos="fade-up" data-aos-delay={index * 100}>
                      <span className="feature-icon">{feature.icon}</span>
                      <div>
                        <h4>{feature.title}</h4>
                        <p>{feature.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="about-image" data-aos="fade-left">
                <div className="stats-container">
                  <div className="stat-item" data-aos="zoom-in" data-aos-delay="100">
                    <h3>1000+</h3>
                    <p>Accessible Locations</p>
                  </div>
                  <div className="stat-item" data-aos="zoom-in" data-aos-delay="200">
                    <h3>500+</h3>
                    <p>Active Volunteers</p>
                  </div>
                  <div className="stat-item" data-aos="zoom-in" data-aos-delay="300">
                    <h3>50+</h3>
                    <p>Partner Hospitals</p>
                  </div>
                  <div className="stat-item" data-aos="zoom-in" data-aos-delay="400">
                    <h3>24/7</h3>
                    <p>Support Available</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="services-section">
          <div className="container">
            <h2 className="section-title text-center" data-aos="fade-up">
              How We Help You
            </h2>
            <p className="section-subtitle text-center" data-aos="fade-up" data-aos-delay="100">
              Comprehensive solutions to make your daily life easier and more independent
            </p>
            <div className="services-grid">
              {services.map((service, index) => (
                <div 
                  key={index} 
                  className="service-card" 
                  data-aos="flip-left" 
                  data-aos-delay={index * 100}
                >
                  <div className="service-icon">{service.icon}</div>
                  <h3>{service.title}</h3>
                  <p>{service.description}</p>
                  <button 
                    className="learn-more-btn" 
                    onClick={() => navigate(service.path)}
                  >
                    Explore Now →
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="how-it-works-section">
          <div className="container">
            <h2 className="section-title text-center" data-aos="fade-up">
              How It Works
            </h2>
            <div className="steps-container">
              <div className="step" data-aos="fade-right" data-aos-delay="100">
                <div className="step-number">1</div>
                <h3>Search or Browse</h3>
                <p>Enter your location and what you're looking for - shops, hospitals, or volunteers</p>
              </div>
              <div className="step-connector"></div>
              <div className="step" data-aos="fade-up" data-aos-delay="200">
                <div className="step-number">2</div>
                <h3>Filter by Needs</h3>
                <p>Use filters for wheelchair access, elevator availability, assistance services, and more</p>
              </div>
              <div className="step-connector"></div>
              <div className="step" data-aos="fade-left" data-aos-delay="300">
                <div className="step-number">3</div>
                <h3>Connect & Visit</h3>
                <p>Get directions, contact volunteers, or book appointments directly through our platform</p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="testimonials-section">
          <div className="container">
            <h2 className="section-title text-center" data-aos="fade-up">
              Community Stories
            </h2>
            <div className="testimonials-grid">
              {testimonials.map((testimonial, index) => (
                <div 
                  key={index} 
                  className="testimonial-card" 
                  data-aos="fade-up" 
                  data-aos-delay={index * 150}
                >
                  <div className="stars">
                    {'⭐'.repeat(testimonial.rating)}
                  </div>
                  <p className="testimonial-text">"{testimonial.text}"</p>
                  <h4 className="testimonial-name">- {testimonial.name}</h4>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section" data-aos="zoom-in">
          <div className="container">
            <div className="cta-content">
              <h2>Ready to Explore Your City?</h2>
              <p>Join thousands finding accessible places and connecting with helpful volunteers</p>
              <div className="cta-buttons">
                <button 
                  className="btn btn-white"
                  onClick={() => navigate('/shops')}
                >
                  Find Places Near Me
                </button>
                <button 
                  className="btn btn-white-outline"
                  onClick={() => navigate('/volunteers')}
                >
                  Become a Volunteer
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
