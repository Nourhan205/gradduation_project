import { useState } from "react";
import React from "react";
import "../styles/Maintest.css";

export default function MainTest() {
  const questions = [
    {
      id: 1,
      question: "What kind of problems do you enjoy solving?",
      options: {
        A: "Logical or coding problems 💻",
        B: "Real-world systems (machines, structures) ⚙️",
        C: "Helping people with their issues 👥",
        D: "Understanding human behavior 📊",
        E: "Designing or creating something new 🎨",
        F: "Health-related or biological problems 🏥",
      },
    },
    {
      id: 2,
      question: "What activity sounds most interesting?",
      options: {
        A: "Building an app or website 💻",
        B: "Running a business or project 📊",
        C: "Designing a bridge or machine ⚙️",
        D: "Working in a hospital 🏥",
        E: "Creating art or digital designs 🎨",
        F: "Teaching or guiding others 👥",
      },
    },
    {
      id: 3,
      question: "What do you enjoy more?",
      options: {
        A: "Working with computers 💻",
        B: "Leading and organizing people 📊",
        C: "Fixing or building things ⚙️",
        D: "Caring for people 🏥",
        E: "Expressing ideas visually 🎨",
        F: "Explaining things to others 👥",
      },
    },
    {
      id: 4,
      question: "When learning something new, you prefer:",
      options: {
        A: "Tutorials and coding 💻",
        B: "Case studies and real scenarios 📊",
        C: "Hands-on building ⚙️",
        D: "Practical training (labs, clinics) 🏥",
        E: "Creative projects 🎨",
        F: "Discussions and explanations 👥",
      },
    },
    {
      id: 5,
      question: "What motivates you most?",
      options: {
        A: "Solving complex problems 💻",
        B: "Achieving business success 📊",
        C: "Building something useful ⚙️",
        D: "Saving or helping lives 🏥",
        E: "Creating something beautiful 🎨",
        F: "Helping others grow 👥",
      },
    },
    {
      id: 6,
      question: "Which environment do you prefer?",
      options: {
        A: "Working on a computer 💻",
        B: "Office / business environment 📊",
        C: "Workshops / field work ⚙️",
        D: "Hospitals / clinics 🏥",
        E: "Studio / creative space 🎨",
        F: "Classroom / community 👥",
      },
    },
    {
      id: 7,
      question: "What are you better at?",
      options: {
        A: "Logical thinking 💻",
        B: "Communication & negotiation 📊",
        C: "Problem-solving with tools ⚙️",
        D: "Understanding biology 🏥",
        E: "Creativity 🎨",
        F: "Empathy and listening 👥",
      },
    },
    {
      id: 8,
      question: "Which subject do you enjoy most?",
      options: {
        A: "Computer science / math 💻",
        B: "Business / economics 📊",
        C: "Physics ⚙️",
        D: "Biology 🏥",
        E: "Art / design 🎨",
        F: "Psychology / sociology 👥",
      },
    },
    {
      id: 9,
      question: "What kind of projects excite you?",
      options: {
        A: "Apps, AI, or tech systems 💻",
        B: "Business ideas 📊",
        C: "Engineering models ⚙️",
        D: "Medical case studies 🏥",
        E: "Creative portfolios 🎨",
        F: "Community or education projects 👥",
      },
    },
    {
      id: 10,
      question: "What role do you prefer in a team?",
      options: {
        A: "Technical problem solver 💻",
        B: "Leader or planner 📊",
        C: "Builder / implementer ⚙️",
        D: "Caregiver / supporter 🏥",
        E: "Designer 🎨",
        F: "Mentor 👥",
      },
    },
    {
      id: 11,
      question: "What would you enjoy daily?",
      options: {
        A: "Coding and debugging 💻",
        B: "Managing projects 📊",
        C: "Designing systems ⚙️",
        D: "Treating patients 🏥",
        E: "Creating designs 🎨",
        F: "Teaching people 👥",
      },
    },
    {
      id: 12,
      question: "Which describes you best?",
      options: {
        A: "Analytical 💻",
        B: "Strategic 📊",
        C: "Practical ⚙️",
        D: "Caring 🏥",
        E: "Creative 🎨",
        F: "Supportive 👥",
      },
    },
  ];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [selectedOption, setSelectedOption] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const isLastQuestion = currentQuestion === questions.length - 1;
  const q = questions[currentQuestion];
  const progress = ((currentQuestion + (selectedOption ? 1 : 0)) / questions.length) * 100;

  const handleSelect = (option) => {
    setSelectedOption(option);
  };

  const handleNext = () => {
    if (!selectedOption) return;
    const updatedAnswers = { ...answers, [q.id]: selectedOption };
    setAnswers(updatedAnswers);
    setSelectedOption(null);
    setCurrentQuestion(currentQuestion + 1);
  };

  const handleSubmit = async () => {
    if (!selectedOption) return;
    const finalAnswers = { ...answers, [q.id]: selectedOption };
    setAnswers(finalAnswers);
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answers: finalAnswers,
          totalQuestions: questions.length,
          submittedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setSelectedOption(null);
    setSubmitted(false);
    setError(null);
  };

  if (submitted) {
    return (
      <div className="ep-page">
        <div className="ep-card ep-success-card">
          <div className="ep-success-icon">🎉</div>
          <h2 className="ep-success-title">You're all set!</h2>
          <p className="ep-success-text">
            Your answers have been submitted. We're analyzing your profile to
            find the best educational path for you.
          </p>
          <button className="ep-btn ep-btn-primary" onClick={handleRestart}>
            Retake Quiz
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="ep-page">
      {/* Header */}
      <header className="ep-header">
        <div className="ep-logo">
          EduPick
        </div>
        <span className="ep-tagline">Find your path</span>
      </header>

      {/* Progress bar */}
      <div className="ep-progress-wrap">
        <div className="ep-progress-bar" style={{ width: `${progress}%` }} />
      </div>

      {/* Card */}
      <main className="ep-main">
        <div className="ep-card">
          <div className="ep-counter">
            <span className="ep-counter-current">{currentQuestion + 1}</span>
            <span className="ep-counter-sep">/</span>
            <span className="ep-counter-total">{questions.length}</span>
          </div>

          <h2 className="ep-question">{q.question}</h2>

          <div className="ep-options">
            {Object.entries(q.options).map(([key, value]) => (
              <button
                key={key}
                className={`ep-option ${selectedOption === key ? "ep-option--selected" : ""}`}
                onClick={() => handleSelect(key)}
              >
                <span className="ep-option-key">{key}</span>
                <span className="ep-option-label">{value}</span>
              </button>
            ))}
          </div>

          {error && <p className="ep-error">{error}</p>}

          <div className="ep-actions">
            {isLastQuestion ? (
              <button
                className="ep-btn ep-btn-submit"
                onClick={handleSubmit}
                disabled={!selectedOption || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="ep-spinner" />
                ) : (
                  "Submit Answers ✦"
                )}
              </button>
            ) : (
              <button
                className="ep-btn ep-btn-primary"
                onClick={handleNext}
                disabled={!selectedOption}
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}