import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import AIChat from './AIChat';
import PdfConversation from './PdfConversation';
import './nav.css'; // Import the CSS file

const App = () => {
  return (
    <Router>
      <div>
        <nav className="navbar">
        <h3>Study Sage</h3>
          <Link to="/aichat" className="nav-link">
            Open AI Chat
          </Link>
          <Link to="/pdf" className="nav-link2">
            Open PDF
          </Link>
        </nav>

        <Routes>
          <Route path="/aichat" element={<AIChat />} />
          <Route path="/pdf" element={<PdfConversation />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;