import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import ForgetPassword from './pages/ForgetPassword';
import ResetPassword from './pages/ResetPassword';
import Roadmap from './pages/Roadmap';
import Chatbot from './pages/Chatbot';
import ComparisonTool from './pages/ComparisonTool';
import Home from './pages/Home';
import Test from './pages/Test';
import MainTest from './pages/MainTest';
import PerviousResults from './pages/PreivousResults';
import './App.css';

function App() {
  return (

      <Routes>
        {/* Landing/Home Page */}
        <Route path="/" element={<Home />} />

        {/* Auth Pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgetPassword" element={<ForgetPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Main Pages */}
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/roadmap" element={<Roadmap />} />
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/ComparisonTool" element={<ComparisonTool/>} />
        <Route path="/test" element={<Test />} />
        <Route path="/test/main-test" element={<MainTest />} />
        <Route path="/test/previous-results" element={<PerviousResults />} />

        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>

  );
}

export default App;




