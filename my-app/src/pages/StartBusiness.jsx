
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const API_URL =  "https://bizmate-ai-1.onrender.com/api/business/analyze";

function StartBusiness() {
  const questions = [
    {
      id: "businessIdea",
      question: "What is your business idea?",
      type: "text",
      placeholder: "Example: Coffee shop, clothing store, bakery...",
    },
    {
      id: "budget",
      question: "What is your approximate budget?",
      type: "options",
      options: [
        "Below ₹1 Lakh",
        "₹1 - ₹5 Lakhs",
        "₹5 - ₹10 Lakhs",
        "₹10 - ₹25 Lakhs",
        "Above ₹25 Lakhs",
      ],
    },
    {
      id: "location",
      question: "What location do you prefer?",
      type: "text",
      placeholder: "Example: Vijayawada, Hyderabad...",
    },
    {
      id: "customers",
      question: "Who are your target customers?",
      type: "options",
      options: [
        "Students",
        "Families",
        "Working Professionals",
        "Children",
        "Tourists",
        "Everyone",
      ],
    },
    {
      id: "businessType",
      question: "What type of business are you interested in?",
      type: "options",
      options: [
        "Retail",
        "Food & Beverage",
        "Service",
        "Technology",
        "Manufacturing",
        "Online Business",
        "Not Sure",
      ],
    },
    {
      id: "experience",
      question: "Do you have previous business experience?",
      type: "options",
      options: ["Yes", "No", "Some Experience"],
    },
    {
      id: "goal",
      question: "What is your main goal?",
      type: "options",
      options: [
        "High Profit",
        "Stable Income",
        "Business Growth",
        "Side Business",
        "Build a Brand",
        "Not Sure",
      ],
    },
    {
      id: "businessSize",
      question: "What size of business are you planning?",
      type: "options",
      options: ["Small", "Medium", "Large", "Not Decided"],
    },
  ];

  const topics = [
    {
      id: "customers",
      title: "Target Customers",
      description: "Understand your ideal customers and their needs.",
      icon: "👥",
    },
    {
      id: "market",
      title: "Market & Competition",
      description: "Explore competitors and business opportunities.",
      icon: "📊",
    },
    {
      id: "costs",
      title: "Startup Costs",
      description: "Estimate your initial investment and expenses.",
      icon: "💰",
    },
    {
      id: "marketing",
      title: "Marketing Strategy",
      description: "Discover ways to attract your first customers.",
      icon: "📣",
    },
    {
      id: "risks",
      title: "Risks & Solutions",
      description: "Identify possible challenges and solutions.",
      icon: "🛡️",
    },
    {
      id: "action-plan",
      title: "30-Day Action Plan",
      description: "Get a practical plan to start your business.",
      icon: "📅",
    },
    {
      id: "ideas",
      title: "Explore More Ideas",
      description: "Find five alternative ideas suited to your answers.",
      icon: "💡",
    },
    {
      id: "full-report",
      title: "Full Business Report",
      description: "Get a detailed report and a 30-day action plan.",
      icon: "📄",
    },
  ];

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [answer, setAnswer] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [analysis, setAnalysis] = useState("");

  const [selectedTopic, setSelectedTopic] = useState("");
  const [topicAnalysis, setTopicAnalysis] = useState("");
  const [topicLoading, setTopicLoading] = useState(false);
  const [topicError, setTopicError] = useState("");

  // Keep the latest submitted answers available for retries.
  const [submittedAnswers, setSubmittedAnswers] = useState({});

  const question = questions[currentQuestion];

  const saveAnswer = (value) => {
    setAnswer(value);

    setAnswers((previous) => ({
      ...previous,
      [question.id]: value,
    }));

    setError("");
  };

  // Include all questionnaire details in the existing API request.
  const buildRequestData = (finalAnswers, topic = "") => {
    const businessIdea = [
      `Business idea: ${
        finalAnswers.businessIdea?.trim() || "Not specified"
      }`,
      `Business type: ${
        finalAnswers.businessType || "Not specified"
      }`,
      `Previous experience: ${
        finalAnswers.experience || "Not specified"
      }`,
      `Main goal: ${finalAnswers.goal || "Not specified"}`,
      `Planned business size: ${
        finalAnswers.businessSize || "Not specified"
      }`,
    ].join("\n");

    return {
      businessIdea,
      location: finalAnswers.location?.trim() || "Not specified",
      budget: finalAnswers.budget || "Not specified",
      targetAudience: finalAnswers.customers || "Not specified",
      topic,
    };
  };

  // Call the Spring Boot endpoint and validate its response.
  const callBusinessAPI = async (requestData) => {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestData),
    });

    const responseText = await response.text();

    let data;

    try {
      data = responseText ? JSON.parse(responseText) : {};
    } catch {
      throw new Error(
        `The backend returned an invalid response (HTTP ${response.status}).`
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message ||
          data.error ||
          `Request failed with status ${response.status}.`
      );
    }

    if (typeof data.analysis !== "string" || !data.analysis.trim()) {
      throw new Error(
        "The server returned an empty analysis. Please try again."
      );
    }

    return data.analysis.trim();
  };

  // Generate the initial verdict, all seven sections, and recommendations.
  const handleAnalyze = async (finalAnswers) => {
    if (loading) return;

    if (!finalAnswers.businessIdea?.trim()) {
      setError("Please enter your business idea before analyzing.");
      setCurrentQuestion(0);
      setAnswer(finalAnswers.businessIdea || "");
      return;
    }

    setLoading(true);
    setError("");
    setAnalysis("");

    setSelectedTopic("");
    setTopicAnalysis("");
    setTopicError("");

    setSubmittedAnswers({ ...finalAnswers });

    try {
      const requestData = buildRequestData(finalAnswers, "");
      const result = await callBusinessAPI(requestData);

      // Display the entire report returned by Gemini.
      // Do not remove or duplicate any report sections here.
      setAnalysis(result);
    } catch (err) {
      console.error("Business analysis error:", err);

      setError(
        err.message === "Failed to fetch"
          ? "Cannot connect to Spring Boot. Make sure the backend is running on port 8080."
          : err.message || "Unable to analyze your business."
      );
    } finally {
      setLoading(false);
    }
  };

  // Generate a separate answer for the selected topic.
  const handleTopicClick = async (topic) => {
    if (topicLoading || loading) return;

    setSelectedTopic(topic.id);
    setTopicAnalysis("");
    setTopicError("");
    setTopicLoading(true);

    try {
      const requestData = buildRequestData(
        submittedAnswers,
        topic.title
      );

      const result = await callBusinessAPI(requestData);

      setTopicAnalysis(result);
    } catch (err) {
      console.error("Topic analysis error:", err);

      setTopicError(
        err.message === "Failed to fetch"
          ? "Cannot connect to Spring Boot. Check that the backend is running."
          : err.message || "Unable to generate this answer."
      );
    } finally {
      setTopicLoading(false);
    }
  };

  // Move to the next question or submit the questionnaire.
  const handleNext = () => {
    if (loading) return;

    setError("");

    const updatedAnswers = {
      ...answers,
      [question.id]: answer,
    };

    setAnswers(updatedAnswers);

    if (currentQuestion < questions.length - 1) {
      const nextQuestion = questions[currentQuestion + 1];

      setCurrentQuestion(currentQuestion + 1);
      setAnswer(updatedAnswers[nextQuestion.id] || "");
    } else {
      handleAnalyze(updatedAnswers);
    }
  };

  // Skip the current question.
  const handleSkip = () => {
    if (loading) return;

    setError("");

    const updatedAnswers = {
      ...answers,
      [question.id]: "",
    };

    setAnswers(updatedAnswers);

    if (currentQuestion < questions.length - 1) {
      const nextQuestion = questions[currentQuestion + 1];

      setCurrentQuestion(currentQuestion + 1);
      setAnswer(updatedAnswers[nextQuestion.id] || "");
    } else {
      handleAnalyze(updatedAnswers);
    }
  };

  // Return to the previous question.
  const handleBack = () => {
    if (currentQuestion > 0 && !loading) {
      const previousQuestion = questions[currentQuestion - 1];

      setCurrentQuestion(currentQuestion - 1);
      setAnswer(answers[previousQuestion.id] || "");
      setError("");
    }
  };

  // Let the user edit answers and generate a new report.
  const handleReviewAnswers = () => {
    if (topicLoading || loading) return;

    setAnalysis("");
    setSelectedTopic("");
    setTopicAnalysis("");
    setTopicError("");
    setError("");

    setCurrentQuestion(0);
    setAnswer(answers[questions[0].id] || "");
  };

  // Retry the failed topic using the same submitted answers.
  const handleRetryTopic = () => {
    const topic = topics.find((item) => item.id === selectedTopic);

    if (topic) {
      handleTopicClick(topic);
    }
  };

  // Close a topic response without affecting the initial report.
  const handleCloseTopic = () => {
    setSelectedTopic("");
    setTopicAnalysis("");
    setTopicError("");
  };

  const progress =
    ((currentQuestion + 1) / questions.length) * 100;

  const selectedTopicTitle =
    topics.find((item) => item.id === selectedTopic)?.title || "";

  return (
    <div className="business-question-page">
      <div className="question-container">
        {/* Page header */}
        <div className="question-header">
          <p className="badge">START A BUSINESS</p>

          <h1>
            Let's understand your
            <span> business idea.</span>
          </h1>

          <p className="question-subtitle">
            Answer a few simple questions and BizMate AI will assess
            your business idea and suggest practical next steps.
          </p>
        </div>

        {/* Questionnaire */}
        {!analysis && (
          <>
            <div className="progress-section">
              <div className="progress-info">
                <span>
                  Question {currentQuestion + 1} of {questions.length}
                </span>

                <span>{Math.round(progress)}%</span>
              </div>

              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="question-card">
              <h2>{question.question}</h2>

              {question.type === "text" && (
                <input
                  type="text"
                  value={answer}
                  onChange={(event) => saveAnswer(event.target.value)}
                  placeholder={question.placeholder}
                  className="business-input"
                  disabled={loading}
                />
              )}

              {question.type === "options" && (
                <div className="business-options">
                  {question.options.map((option) => (
                    <button
                      key={option}
                      type="button"
                      className={
                        answer === option
                          ? "option-button selected"
                          : "option-button"
                      }
                      onClick={() => saveAnswer(option)}
                      disabled={loading}
                    >
                      {option}
                      {answer === option && <span>✓</span>}
                    </button>
                  ))}
                </div>
              )}

              <div className="question-actions">
                <button
                  type="button"
                  className="back-button"
                  onClick={handleBack}
                  disabled={currentQuestion === 0 || loading}
                >
                  ← Back
                </button>

                <div className="right-actions">
                  <button
                    type="button"
                    className="skip-button"
                    onClick={handleSkip}
                    disabled={loading}
                  >
                    Skip
                  </button>

                  <button
                    type="button"
                    className="next-button"
                    onClick={handleNext}
                    disabled={loading}
                  >
                    {currentQuestion === questions.length - 1
                      ? "Analyze My Business →"
                      : "Next →"}
                  </button>
                </div>
              </div>
            </div>

            <p className="skip-info">
              You can skip questions you are unsure about.
              Your answers help personalize your assessment.
            </p>
          </>
        )}

        {/* Initial analysis loading */}
        {loading && (
          <div className="loading-message" role="status">
            <h2>Analyzing your business idea...</h2>

            <p>
              BizMate AI is reviewing your answers, preparing all seven
              sections, and creating your personalized recommendations.
            </p>
          </div>
        )}

        {/* Initial analysis error */}
        {error && (
          <div className="error-message" role="alert">
            <p>{error}</p>

            <button
              type="button"
              className="next-button"
              onClick={() => handleAnalyze(answers)}
              disabled={loading}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Results */}
        {analysis && (
          <div className="analysis-result">
            {/* Initial report: all seven sections and final recommendations */}
            <div className="analysis-header">
              <p className="badge">YOUR BUSINESS ANALYSIS</p>

              <h2>Your Business at a Glance</h2>

              <p>
                Your business verdict, seven-section analysis,
                final recommendations, and suggested alternatives.
              </p>
            </div>

            <div className="analysis-content overall-assessment analysis-report">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {analysis}
              </ReactMarkdown>
            </div>

            {/* Separate topic actions */}
            <div className="topic-section">
              <h2>Want to Explore Further?</h2>

              <p>
                Your initial report already includes all seven business
                sections and recommendations. Select a card below to
                explore a specific topic or discover alternative ideas.
              </p>

              <div className="topic-grid">
                {topics.map((topic) => (
                  <button
                    key={topic.id}
                    type="button"
                    className={
                      selectedTopic === topic.id
                        ? "topic-card selected"
                        : "topic-card"
                    }
                    onClick={() => handleTopicClick(topic)}
                    disabled={topicLoading || loading}
                    aria-pressed={selectedTopic === topic.id}
                  >
                    <span className="topic-icon" aria-hidden="true">
                      {topic.icon}
                    </span>

                    <span className="topic-card-text">
                      <strong>{topic.title}</strong>
                      <span>{topic.description}</span>
                    </span>

                    <span className="topic-arrow" aria-hidden="true">
                      →
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Selected topic loading */}
            {topicLoading && (
              <div className="loading-message" role="status">
                <h3>Preparing: {selectedTopicTitle}</h3>

                <p>
                  BizMate AI is preparing a separate answer based on
                  your business idea, location, budget, customers,
                  experience, and goals.
                </p>
              </div>
            )}

            {/* Selected topic error */}
            {topicError && (
              <div className="error-message" role="alert">
                <p>{topicError}</p>

                <button
                  type="button"
                  className="next-button"
                  onClick={handleRetryTopic}
                  disabled={topicLoading}
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Selected topic answer */}
            {topicAnalysis && !topicLoading && (
              <div className="analysis-content topic-answer">
                <div className="topic-answer-header">
                  <h2>{selectedTopicTitle}</h2>

                  <button
                    type="button"
                    className="back-button"
                    onClick={handleCloseTopic}
                  >
                    Close
                  </button>
                </div>

                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {topicAnalysis}
                </ReactMarkdown>
              </div>
            )}

            {/* Report actions */}
            <div className="report-actions">
              <button
                type="button"
                className="next-button"
                onClick={() => window.print()}
              >
                Print / Save as PDF
              </button>

              <button
                type="button"
                className="back-button"
                onClick={handleReviewAnswers}
                disabled={topicLoading || loading}
              >
                Review My Answers
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default StartBusiness;
