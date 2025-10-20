import React, { useState } from "react";
import {
  FaGraduationCap,
  FaLaptopCode,
  FaRobot,
  FaChartLine,
  FaDownload,
  FaSave,
} from "react-icons/fa";
// import {
//   VerticalTimeline,
//   VerticalTimelineElement,
// } from "react-vertical-timeline-component";
// import "react-vertical-timeline-component/style.min.css";
import { jsPDF } from "jspdf";
import { useNavigate } from "react-router-dom";
import "../styles/Roadmap.css";

function Roadmap() {
  const navigate = useNavigate();
  const [interests, setInterests] = useState("");
  const [level, setLevel] = useState("");
  const [goal, setGoal] = useState("");
  const [roadmap, setRoadmap] = useState([]);
  const [loading, setLoading] = useState(false);

  const BackEnd_url = "";
  
  const StaticRoadmap = ()=> {
    let generatedRoadmap = [];

    if (interests.toLowerCase().includes("ai")) {
      generatedRoadmap = [
        { step: "Learn Python fundamentals", icon: <FaLaptopCode /> },
        { step: "Study Machine Learning basics", icon: <FaRobot /> },
        { step: "Build a simple image classification project", icon: <FaGraduationCap /> },
        { step: "Explore PyTorch or TensorFlow", icon: <FaChartLine /> },
      ];
    } else if (interests.toLowerCase().includes("web")) {
      generatedRoadmap = [
        { step: "Start with HTML & CSS", icon: <FaLaptopCode /> },
        { step: "Learn JavaScript", icon: <FaGraduationCap /> },
        { step: "Learn React or Vue", icon: <FaRobot /> },
        { step: "Build a full web project", icon: <FaChartLine /> },
      ];
    } else {
      generatedRoadmap = [
        { step: "Revise basic programming concepts", icon: <FaLaptopCode /> },
        { step: "Identify your preferred learning domain", icon: <FaChartLine /> },
        { step: "Start introductory courses", icon: <FaGraduationCap /> },
      ];
    }

    setRoadmap(generatedRoadmap);
  };


  function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);

    const requestData = { interests, level, goal };

    if (BackEnd_url) {
      fetch(BackEnd_url + "/api/roadmap", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestData),
      })
        .then((response) => {
          if (!response.ok) throw new Error("Server error");
          return response.json();
        })
        .then((data) => {
          setLoading(false);
          setRoadmap(data.steps);
        })
        .catch(() => {
          setLoading(false);
          StaticRoadmap();
        });
    } else {
      setLoading(false);
      StaticRoadmap();
    }
  }


  function handleDownloadpdf() {
    if (!roadmap || roadmap.length === 0) return;

    const doc = new jsPDF({
      unit: "pt",
      format: "a4",
      putOnlyUsedFonts: true,
    });

    const marginLeft = 40;
    const pageWidth = doc.internal.pageSize.getWidth();
    const maxLineWidth = pageWidth - marginLeft * 2;
    let cursorY = 60;
    const lineHeight = 18;

    doc.setFillColor(0, 123, 255);
    doc.rect(0, 0, pageWidth, 48, "F");
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.text("Personalized Roadmap", marginLeft, 36);

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    cursorY = 90;
    doc.text(`Interests: ${interests || "-"}`, marginLeft, cursorY);
    cursorY += lineHeight;
    doc.text(`Level: ${level || "-"}`, marginLeft, cursorY);
    cursorY += lineHeight;
    doc.text(`Goal: ${goal || "-"}`, marginLeft, cursorY);
    cursorY += lineHeight * 1.5;

    doc.setFontSize(12);
    for (let i = 0; i < roadmap.length; i++) {
      const rawText =
        typeof roadmap[i] === "string"
          ? roadmap[i]
          : roadmap[i].step || JSON.stringify(roadmap[i]);
      const prefix = `${i + 1}. `;
      const wrapped = doc.splitTextToSize(prefix + rawText, maxLineWidth);
      doc.text(wrapped, marginLeft, cursorY);
      cursorY += lineHeight * wrapped.length;

      const pageHeight = doc.internal.pageSize.getHeight();
      if (cursorY + 60 > pageHeight) {
        doc.addPage();
        cursorY = 60;
      }
    }

    const now = new Date();
    const timestamp = now.toISOString().slice(0, 19).replace(/[:T]/g, "-");
    doc.save(`Personalized_Roadmap_${timestamp}.pdf`);
  }

  function handleSave() {
    if (!roadmap || roadmap.length === 0) return;


    const requestData = { interests, level, goal, roadmap };

    fetch(BackEnd_url + "/api/roadmap", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestData),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to save roadmap");
        return res.json();
      })
      .then(() => {
        navigate("/dashboard");
      })
      .catch((err) => {
        console.error(err);
        alert("Error saving roadmap. Please try again later.");
      });
  }

  return (
    <div className="roadmap-container">
      <h2 className="page-title"> Personalized Roadmap Generator</h2>

      <form className="roadmap-form" onSubmit={handleSubmit}>
        <label>Your Interests:</label>
        <input
          type="text"
          value={interests}
          onChange={(e) => setInterests(e.target.value)}
          placeholder="e.g. AI, Web, Cybersecurity..."
        />

        <label>Your Current Level:</label>
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">Select your level</option>
          <option value="beginner">Beginner</option>
          <option value="intermediate">Intermediate</option>
          <option value="advanced">Advanced</option>
        </select>

        <label>Your Goal:</label>
        <input
          type="text"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
          placeholder="e.g. Become an AI Engineer"
        />

        <button type="submit">Generate Roadmap</button>
      </form>

      {loading && <p>Generating your roadmap...</p>}

      {roadmap.length > 0 && (
        <div className="roadmap-timeline">
          <h3>Your Learning Plan:</h3>
          {/* <VerticalTimeline>
            {roadmap.map((item, index) => (
              <VerticalTimelineElement
                key={index}
                contentStyle={{ background: "#e3f2fd", color: "#000" }}
                contentArrowStyle={{ borderRight: "7px solid #90caf9" }}
                iconStyle={{ background: "#007bff", color: "#fff" }}
                icon={item.icon}
              >
                <h4>{item.step}</h4>
              </VerticalTimelineElement>
            ))}
          </VerticalTimeline> */}
          
            <div className="simple-timeline">
              {roadmap.map((item, index) => (
              <div key={index} className="timeline-step">
               <div className="step-number">{index + 1}</div>
               <div className="step-icon">
                {item.icon}
               </div>
               <div className="step-content">
              <h4>{item.step}</h4>
             </div>
             </div>
      ))}
    </div>
          <div className="roadmap-actions">
            <button className="download-btn" onClick={handleDownloadpdf}>
              <FaDownload /> Download Roadmap
            </button>
            <button className="save-btn" onClick={handleSave}>
              <FaSave /> Save to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Roadmap;
