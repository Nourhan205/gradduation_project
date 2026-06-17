import React, { useState } from "react";
import "../styles/Chatbot.css";

import {
  FaRobot,
  FaUserCircle,
  FaPaperPlane,
  FaBars,
} from "react-icons/fa";

// 🔹 Change this to your real backend URL (e.g. an env variable in production)
const API_URL = "http://localhost:5000";

export default function Chatbot() {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [showRoadmap, setShowRoadmap] = useState(false);

  const [roadmapData] = useState({
    currentTopic: "No topic selected",
    progress: 0,
    nextTopic: "Waiting for roadmap",
  });

  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Hi! I'm EduPick AI Assistant. Ask me anything about your learning roadmap.",
    },
  ]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const question = input;

    setMessages((prev) => [
      ...prev,
      {
        type: "user",
        text: question,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      // 🔹 FIXED: this call used to be commented out (demo mode only).
      // 🔹 FIXED: body key is now "message" to match what the Flask
      //    /chatbot route reads (it used to send "question").
      const res = await fetch(`${API_URL}/chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: question,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: data.error || "Sorry, something went wrong. Please try again.",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            type: "bot",
            text: data.answer,
            suggestions: data.suggestions,
          },
        ]);
      }
    } catch (err) {
      console.log(err);
      setMessages((prev) => [
        ...prev,
        {
          type: "bot",
          text: "Couldn't reach the server. Please check your connection and try again.",
        },
      ]);
    } finally {
      // 🔹 FIXED: this was missing for the real-API path, so the
      // "AI is thinking..." indicator would have stayed on forever.
      setLoading(false);
    }
  };

  const handleSuggestion = (text) => {
    setInput(text);
  };

  return (
    <div className="chat-page">
      <div className="header">
        <div className="brand">
          <img
            className="logo"
            src="/src/assets/logo.png"
            alt="EduPick AI"
          />

          <div>
            <h2>EduPick AI</h2>
            <span>Learning Assistant</span>
          </div>
        </div>

        <button
          className="roadmap-btn"
          onClick={() => setShowRoadmap(!showRoadmap)}
        >
          <FaBars className="menu-icon" />
          <span>Roadmap</span>
        </button>
      </div>

      <div className="chat-body">
        <div
          className={`roadmap-panel ${
            showRoadmap ? "open" : ""
          }`}
        >
          <h3>Roadmap Progress</h3>

          <div className="card">
            <h4>Current Topic</h4>

            <p>{roadmapData.currentTopic}</p>

            <div className="bar">
              <div
                className="fill"
                style={{
                  width: `${roadmapData.progress}%`,
                }}
              />
            </div>

            <span>
              {roadmapData.progress}% Completed
            </span>
          </div>

          <div className="card">
            <h4>Next Topic</h4>
            <p>{roadmapData.nextTopic}</p>
          </div>
        </div>

        <div className="messages">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`message ${msg.type}`}
            >
              <div className="avatar">
                {msg.type === "bot" ? (
                  <FaRobot />
                ) : (
                  <FaUserCircle />
                )}
              </div>

              <div className="bubble">
                <p>{msg.text}</p>

                {msg.suggestions?.length > 0 && (
                  <div className="suggestions">
                    {msg.suggestions.map(
                      (s, index) => (
                        <button
                          key={index}
                          onClick={() =>
                            handleSuggestion(s)
                          }
                        >
                          {s}
                        </button>
                      )
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="loading">
              AI is thinking...
            </div>
          )}
        </div>
      </div>

      <div className="input-area">
        <div className="input-wrapper">
          <input
            value={input}
            placeholder="Ask anything..."
            onChange={(e) =>
              setInput(e.target.value)
            }
            onKeyDown={(e) =>
              e.key === "Enter" &&
              sendMessage()
            }
          />

          <button
            className="send-btn"
            onClick={sendMessage}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
}