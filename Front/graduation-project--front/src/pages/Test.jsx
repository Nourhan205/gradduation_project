import React from 'react';
import '../styles/test.css';
import { useNavigate } from "react-router-dom";

const Test = () => {
  const navigate = useNavigate();
  return (
    <div className="test-page">
    <div className="chat-header">
        EduPick <br />
        <span>Always here to help</span>
      </div>
    <div className='test-actions'>
        <button className='main-btn' onClick={() => navigate("/test/main-test")}>Test</button>
        <button className='secondary-btn' onClick={() => navigate("/test/previous-results")}>Previous results</button>
    </div>
    </div>
  );
};

export default Test;