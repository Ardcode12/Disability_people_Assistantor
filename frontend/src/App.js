import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Shops from './components/Shops';
import Volunteers from './components/Volunteers';
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import './App.css';

// Placeholder components for other routes
const Hospitals = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>Hospitals Page</h1>
    <p>Coming soon...</p>
  </div>
);



const Navigation = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>Navigation Page</h1>
    <p>Coming soon...</p>
  </div>
);

const Contact = () => (
  <div style={{ padding: '2rem', textAlign: 'center' }}>
    <h1>Contact Page</h1>
    <p>Coming soon...</p>
  </div>
);

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shops" element={<Shops />} />
          <Route path="/hospitals" element={<Hospitals />} />
          <Route path="/volunteers" element={<Volunteers />} />
          <Route path="/navigation" element={<Navigation />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/signin" element={<SignIn />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
