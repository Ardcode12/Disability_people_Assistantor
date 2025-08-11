import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import './Shops.css';

// Libraries to load from Google Maps. 'places' is essential for nearbySearch and getDetails.
const libraries = ['places'];

// --- Constants defined outside the component for performance ---
const shopTypeMapping = {
  'all': null,
  'grocery': ['supermarket', 'grocery_or_supermarket'],
  'pharmacy': ['pharmacy', 'drugstore'],
  'clothing': ['clothing_store'],
  'electronics': ['electronics_store']
};

// --- Helper Functions ---

// Helper function to get a user-friendly shop type from Google Places types array
const getShopType = (types) => {
  if (!types) return 'Store';
  if (types.includes('supermarket') || types.includes('grocery_or_supermarket')) return 'Grocery';
  if (types.includes('pharmacy') || types.includes('drugstore')) return 'Pharmacy';
  if (types.includes('clothing_store')) return 'Clothing';
  if (types.includes('electronics_store')) return 'Electronics';
  if (types.includes('restaurant')) return 'Restaurant';
  if (types.includes('cafe')) return 'Cafe';
  return 'Store';
};

// Calculates the distance between two geographical points (Haversine formula)
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return distance.toFixed(1);
};


const Shops = () => {
  // --- State Management ---
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState(null);
  const [userLocation, setUserLocation] = useState({ lat: 28.6139, lng: 77.2090 }); // Default: Delhi
  const [mapCenter, setMapCenter] = useState({ lat: 28.6139, lng: 77.2090 });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [placesService, setPlacesService] = useState(null);
  const [showShopDetails, setShowShopDetails] = useState(false);
  
  // Voice recognition states
  const [isListening, setIsListening] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  
  const mapRef = useRef(null);
  
  // --- API Calls ---

  // Function to search for nearby places, memoized with useCallback for performance.
  const searchNearbyPlaces = useCallback((service, location, filter, search) => {
    if (!service) return;

    setIsLoading(true);
    
    const types = shopTypeMapping[filter];
    const request = {
      location: location,
      radius: 5000, // 5km radius
      keyword: search || undefined, // Use search term as keyword
    };

    // Add type filter if a specific category (not 'all') is selected
    if (types && filter !== 'all') {
      request.type = types[0];
    }

    service.nearbySearch(request, (results, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
        const formattedShops = results.map((place) => ({
          id: place.place_id,
          name: place.name,
          type: getShopType(place.types),
          address: place.vicinity,
          coordinates: {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng()
          },
          rating: place.rating || 0,
          openNow: place.opening_hours?.open_now,
          placeId: place.place_id,
          photo: place.photos?.[0] ? 
            place.photos[0].getUrl({ maxWidth: 300, maxHeight: 200 }) : 
            `https://via.placeholder.com/300x200/cccccc/666666?text=${encodeURIComponent(place.name)}`,
          priceLevel: place.price_level,
          userRatingsTotal: place.user_ratings_total
        }));
        setShops(formattedShops);
      } else {
        setShops([]); // Clear shops if no results or an error occurred
      }
      setIsLoading(false);
    });
  }, []); // Empty dependency array because the function itself doesn't depend on component state

  // Function to get detailed information for a specific place
  const getPlaceDetails = useCallback((placeId, callback) => {
    if (!placesService) return;

    const request = {
      placeId: placeId,
      fields: ['name', 'formatted_address', 'formatted_phone_number', 
               'opening_hours', 'website', 'rating', 'reviews', 
               'photos', 'types', 'wheelchair_accessible_entrance']
    };

    placesService.getDetails(request, (place, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK) {
        callback(place);
      }
    });
  }, [placesService]); // This function depends on placesService

  // --- Effects ---

  // Get user's current location on initial component mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { lat: latitude, lng: longitude };
          setUserLocation(newLocation);
          setMapCenter(newLocation);
        },
        (error) => {
          console.error("Error getting location:", error);
          // Keep default location if user denies permission
          setIsLoading(false);
        }
      );
    } else {
      setIsLoading(false);
    }
  }, []);

  // Re-run search when search term, filter, or location changes
  useEffect(() => {
    if (placesService && userLocation) {
      searchNearbyPlaces(placesService, userLocation, selectedFilter, searchTerm);
    }
  }, [searchTerm, selectedFilter, placesService, userLocation, searchNearbyPlaces]);

  // --- Event Handlers ---

  // Called when the Google Map is loaded and ready
  const onMapLoad = useCallback((map) => {
    mapRef.current = map;
    const service = new window.google.maps.places.PlacesService(map);
    setPlacesService(service);
  }, []);

  // Handle clicking on a shop from the list or map
  const handleShopClick = (shop) => {
    setMapCenter(shop.coordinates);
    
    // Fetch detailed information for the modal
    getPlaceDetails(shop.placeId, (details) => {
      const detailedShop = {
        ...shop,
        phone: details.formatted_phone_number || 'Not available',
        website: details.website || null,
        openHours: details.opening_hours?.weekday_text?.join('\n') || 'Hours not available',
        description: `${shop.type} • ${shop.userRatingsTotal || 0} reviews`,
        accessibility: {
          wheelchairAccess: details.wheelchair_accessible_entrance, // This will be true, false, or undefined
        }
      };
      setSelectedShop(detailedShop);
      setShowShopDetails(true);
    });
  };
  
  const handleGetDirections = (shop) => {
    if (!shop) return;
    const origin = `${userLocation.lat},${userLocation.lng}`;
    const destination = `${shop.coordinates.lat},${shop.coordinates.lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}`;
    window.open(url, '_blank');
  };

  // --- Voice Recognition ---
  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in your browser. Please use Chrome or Edge.');
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognition.continuous = false; // Set to false to stop after one command
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setVoiceTranscript('');
      setShowVoiceModal(true);
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
      setVoiceTranscript(finalTranscript || interimTranscript);
      if (finalTranscript) handleVoiceCommand(finalTranscript);
    };

    recognition.onerror = (event) => console.error('Speech recognition error:', event.error);
    recognition.onend = () => setIsListening(false);

    recognition.start();
    window.currentRecognition = recognition;
  };

  const stopListening = () => {
    if (window.currentRecognition) {
      window.currentRecognition.stop();
    }
    setShowVoiceModal(false);
  };
  
  const handleVoiceCommand = (command) => {
      command = command.toLowerCase().trim();
      if (command.includes('search for')) {
          setSearchTerm(command.replace('search for', '').trim());
      } else if (command.includes('show pharmacies')) {
          setSelectedFilter('pharmacy');
      } else if (command.includes('show groceries')) {
          setSelectedFilter('grocery');
      } else if (command.includes('show clothing')) {
          setSelectedFilter('clothing');
      } else if (command.includes('show electronics')) {
          setSelectedFilter('electronics');
      } else if (command.includes('show all')) {
          setSelectedFilter('all');
      } else if (command.includes('clear search')) {
          setSearchTerm('');
      } else if (command.includes('directions to')) {
          const shopName = command.replace('directions to', '').trim();
          const shopToDirect = shops.find(s => s.name.toLowerCase().includes(shopName));
          if (shopToDirect) handleGetDirections(shopToDirect);
      }
      
      // Close modal after a command is processed
      setTimeout(() => setShowVoiceModal(false), 1500);
  };
  
  // --- Render ---

  // Check if API key is available
  if (!process.env.REACT_APP_GOOGLE_MAPS_API_KEY) {
    return (
      <div className="error-container">
        <h1>Configuration Error</h1>
        <p>Google Maps API key is missing. Please add it to your .env file.</p>
      </div>
    );
  }

  return (
    <div className="shops-container">
      <header className="shops-header">
        <div className="header-content">
          <h1 className="header-title">Accessible Shops Near You</h1>
          <button onClick={isListening ? stopListening : startListening} className={`voice-btn ${isListening ? 'listening' : ''}`} aria-label="Voice commands">
            <svg className="voice-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
          </button>
        </div>
      </header>

      <div className="search-filters-section">
        <div className="search-filters-container">
          <div className="search-box">
            <input type="text" placeholder="Search shops, locations, or services..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input" />
            {searchTerm && (<button className="clear-search-btn" onClick={() => setSearchTerm('')}>×</button>)}
          </div>
          <div className="filter-buttons">
            {Object.keys(shopTypeMapping).map(filterKey => (
              <button key={filterKey} onClick={() => setSelectedFilter(filterKey)} className={`filter-btn ${selectedFilter === filterKey ? 'active' : ''}`}>
                {filterKey.charAt(0).toUpperCase() + filterKey.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="main-content">
        <div className="content-grid">
          <div className="shop-list-container">
            <div className="shop-list-header">
              <h2>{isLoading ? 'Searching...' : `${shops.length} Shops Found`}</h2>
            </div>
            <div className="shop-list">
              {isLoading ? (
                <div className="loading-container"><div className="loading-spinner"></div><p>Finding shops near you...</p></div>
              ) : shops.length === 0 ? (
                <div className="no-results"><p>No shops found. Try adjusting your search or filters.</p></div>
              ) : (
                shops.map((shop) => (
                  <div key={shop.id} className="shop-card" onClick={() => handleShopClick(shop)} tabIndex="0">
                    <div className="shop-card-content">
                      <img src={shop.photo} alt={shop.name} className="shop-image" onError={(e) => { e.target.src = `https://via.placeholder.com/300x200/cccccc/666666?text=${encodeURIComponent(shop.name)}`; }}/>
                      <div className="shop-info">
                        <h3 className="shop-name">{shop.name}</h3>
                        <p className="shop-meta">{shop.type} • {shop.address}</p>
                        <div className="shop-details">
                          <div className="rating"><span className="star">★</span><span className="rating-value">{shop.rating.toFixed(1)}</span></div>
                          <span className="distance">• {calculateDistance(userLocation.lat, userLocation.lng, shop.coordinates.lat, shop.coordinates.lng)} km</span>
                          {shop.openNow !== undefined && (<span className={`open-status ${shop.openNow ? 'open' : 'closed'}`}>• {shop.openNow ? 'Open' : 'Closed'}</span>)}
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="map-container">
            <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY} libraries={libraries}>
              <GoogleMap mapContainerStyle={{ width: '100%', height: '100%' }} center={mapCenter} zoom={14} options={{ disableDefaultUI: true, zoomControl: true }} onLoad={onMapLoad}>
                <Marker position={userLocation} icon={{ url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }} title="Your Location"/>
                {shops.map((shop) => (<Marker key={shop.id} position={shop.coordinates} onClick={() => handleShopClick(shop)} title={shop.name}/>))}
                {selectedShop && (
                  <InfoWindow position={selectedShop.coordinates} onCloseClick={() => setSelectedShop(null)}>
                    <div className="map-info-window">
                      <h3>{selectedShop.name}</h3>
                      <p>{selectedShop.address}</p>
                      <button onClick={() => handleGetDirections(selectedShop)} className="directions-btn">Get Directions</button>
                    </div>
                  </InfoWindow>
                )}
              </GoogleMap>
            </LoadScript>
          </div>
        </div>
      </main>

      {showShopDetails && selectedShop && (
        <div className="modal-overlay" onClick={() => setShowShopDetails(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedShop.name}</h2>
              <button onClick={() => setShowShopDetails(false)} className="modal-close-btn"><svg className="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
            <div className="modal-body">
              <img src={selectedShop.photo} alt={selectedShop.name} className="modal-image" onError={(e) => { e.target.src = `https://via.placeholder.com/600x400/cccccc/666666?text=${encodeURIComponent(selectedShop.name)}`; }}/>
              <div className="modal-info-grid">
                <div className="info-section">
                  <h3>Contact & Address</h3>
                  <p className="info-text">{selectedShop.address}</p>
                  <p className="info-text">{selectedShop.phone}</p>
                  {selectedShop.website && (<p className="info-text"><a href={selectedShop.website} target="_blank" rel="noopener noreferrer">Visit Website</a></p>)}
                </div>
                <div className="info-section">
                  <h3>Business Hours</h3>
                  <p className="info-text" style={{ whiteSpace: 'pre-line' }}>{selectedShop.openHours}</p>
                </div>
              </div>
              <div className="accessibility-section">
                <h3>Accessibility Features</h3>
                <p className="accessibility-note">Note: This information is provided by Google and may not be complete. Contact the business directly to confirm.</p>
                <div className="accessibility-grid">
                  <div className={`accessibility-item ${selectedShop.accessibility?.wheelchairAccess === true ? 'available' : (selectedShop.accessibility?.wheelchairAccess === false ? 'unavailable' : 'unknown')}`}>
                    <span className="accessibility-icon">♿</span><span>Wheelchair Access</span>
                  </div>
                  <div className="accessibility-item unknown"><span className="accessibility-icon">🛗</span><span>Elevator</span></div>
                  <div className="accessibility-item unknown"><span className="accessibility-icon">🅿️</span><span>Accessible Parking</span></div>
                  <div className="accessibility-item unknown"><span className="accessibility-icon">🚻</span><span>Accessible Restroom</span></div>
                  <div className="accessibility-item unknown"><span className="accessibility-icon">⠃</span><span>Braille Signage</span></div>
                  <div className="accessibility-item unknown"><span className="accessibility-icon">🔊</span><span>Audio Assistance</span></div>
                </div>
              </div>
              <div className="modal-actions">
                <button onClick={() => handleGetDirections(selectedShop)} className="action-btn primary-btn">Get Directions</button>
                {selectedShop.phone !== 'Not available' && (<button onClick={() => window.open(`tel:${selectedShop.phone}`)} className="action-btn secondary-btn">Call Shop</button>)}
              </div>
            </div>
          </div>
        </div>
      )}

      {showVoiceModal && (
        <div className="voice-modal">
          <div className="voice-modal-header"><h3>Voice Commands</h3><button onClick={stopListening} className="voice-modal-close">×</button></div>
          {isListening && (<div className="voice-status"><div className="voice-indicator"><div className="pulse-dot"></div><span>Listening...</span></div><p className="voice-transcript">{voiceTranscript || "Say a command..."}</p></div>)}
          <div className="voice-commands-list"><p className="commands-title">Try saying:</p><ul><li>"Search for cafes"</li><li>"Show pharmacies"</li><li>"Directions to [shop name]"</li></ul></div>
        </div>
      )}
    </div>
  );
};

export default Shops;

