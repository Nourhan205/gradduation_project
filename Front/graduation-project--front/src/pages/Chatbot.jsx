/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from "react";
import "../styles/chatbot.css";


import { FaUser, FaRobot , FaTelegramPlane , } from "react-icons/fa";

function Chatbot() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Hello! I'm your AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Typing Effect Function
  const typeWriter = (fullText) => {
    let index = 0;

    const interval = setInterval(() => {
      setMessages((prev) => {
        const last = prev[prev.length - 1];
        const updatedMessages = [...prev];
        updatedMessages[updatedMessages.length - 1] = {
          ...last,
          text: last.text + fullText[index]
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

  // Send message to backend
  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("http://localhost:5000/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input })
      });

      const data = await res.json();
      const botFullText = data.reply || "Sorry, I couldn't understand that.";

      // Add empty bot message bubble first
      setMessages((prev) => [...prev, { sender: "bot", text: "" }]);

      // Start typing effect
      typeWriter(botFullText);

    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: " Error connecting to server." }
      ]);
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

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

            <div className={`message-bubble ${msg.sender}`}>
              {msg.text}
            </div>

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
        <button onClick={sendMessage} className="send-btn">
    <FaTelegramPlane size={22} />
</button>

      </div>
    </div>
  );
}

export default Chatbot;