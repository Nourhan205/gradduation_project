import React, { useState, useRef, useEffect } from "react";
import "../styles/chatbot.css";
import { FaUser, FaRobot, FaTelegramPlane } from "react-icons/fa";

function Chatbot({ backendUserName }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userPath, setUserPath] = useState(null); // 1: track only, 2: college + track
  const messagesEndRef = useRef(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Typing effect
  const typeWriter = (fullText) => {
    let index = 0;
    setMessages((prev) => [...prev, { sender: "bot", text: "" }]);
    setLoading(true);

    const interval = setInterval(() => {
      setMessages((prev) => {
        const updatedMessages = [...prev];
        const last = updatedMessages[updatedMessages.length - 1];
        updatedMessages[updatedMessages.length - 1] = {
          ...last,
          text: fullText.slice(0, index + 1) // show text progressively
        };
        return updatedMessages;
      });

      index++;
      if (index === fullText.length) {
        clearInterval(interval);
        setLoading(false);
      }
    }, 30);
  };

  const sendMessage = async (msg) => {
    if (!msg.trim()) return;
    const userMessage = { sender: "user", text: msg };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, pathType: userPath })
      });
      const data = await res.json();
      const botFullText = data.reply || "Sorry, I couldn't understand that.";
      typeWriter(botFullText);
    // eslint-disable-next-line no-unused-vars
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "Error connecting to server." }
      ]);
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage(input);
  };

  // Handle path selection
  const handlePathSelection = (path) => {
    setUserPath(path);
    const name = backendUserName || "User";
    let welcomeMsg = "";

    if (path === 1) {
      welcomeMsg = `Hello ${name}! We will help you choose the right track.`;
    } else {
      welcomeMsg = `Hello ${name}! We will help you choose the right university and track.`;
    }

    setMessages([]); // clear old messages
    typeWriter(welcomeMsg);
  };

  // Before user chooses path, show buttons
  if (!userPath) {
    return (
      <div className="chatbot-container">
        <div className="chat-header">
          EduPick <br />
          <span>Always here to help</span>
        </div>
        <div className="chat-window" style={{ padding: "20px" }}>
          <div className="path-selection">
            <p>Choose Your Path :</p>
            <button onClick={() => handlePathSelection(1)}> Need Recommendation for Tracks Only 🎯 </button>
            <button onClick={() => handlePathSelection(2)}>Need Recommendation for Tracks and University 🎓</button>
          </div>
        </div>
      </div>
    );
  }

  // After path selected, show normal chat
  return (
    <div className="chatbot-container">
      <div className="chat-header">
        EduPick <br />
        <span>Always here to help</span>
      </div>

      <div className="chat-window">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`message-row ${msg.sender === "user" ? "user" : "bot"}`}
          >
            {msg.sender === "bot" && <div className="icon bot-icon"><FaRobot /></div>}
            <div className={`message-bubble ${msg.sender}`}>{msg.text}</div>
            {msg.sender === "user" && <div className="icon user-icon"><FaUser /></div>}
          </div>
        ))}

        {loading && (
          <div className="loading-row">
            <div className="loading-bubble">Typing...</div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder="Type your message..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <button onClick={() => sendMessage(input)} className="send-btn">
          <FaTelegramPlane size={22} />
        </button>
      </div>
    </div>
  );
}

export default Chatbot;
