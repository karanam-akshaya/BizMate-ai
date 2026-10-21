import { useState } from "react"

const questions = [
  {
    id: "businessIdea",
    question: "What is your business idea?",
    type: "text",
    placeholder: "Example: Coffee shop, clothing store..."
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
      "Above ₹25 Lakhs"
    ]
  },
  {
    id: "location",
    question: "Where do you want to start your business?",
    type: "text",
    placeholder: "Example: Vijayawada, Hyderabad..."
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
      "Everyone"
    ]
  },
  {
    id: "businessType",
    question: "What type of business interests you?",
    type: "options",
    options: [
      "Retail",
      "Food & Beverage",
      "Service",
      "Technology",
      "Manufacturing",
      "Online Business",
      "Not Sure"
    ]
  },
  {
    id: "experience",
    question: "Do you have previous business experience?",
    type: "options",
    options: ["Yes", "No", "Some Experience"]
  },
  {
    id: "goal",
    question: "What is your main business goal?",
    type: "options",
    options: [
      "High Profit",
      "Stable Income",
      "Business Growth",
      "Side Business",
      "Build a Brand",
      "Not Sure"
    ]
  },
  {
    id: "businessSize",
    question: "What size of business are you planning?",
    type: "options",
    options: ["Small", "Medium", "Large", "Not Decided"]
  }
]

function parseAnalysis(raw) {
  let cleaned = raw.trim()

  cleaned = cleaned
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "")
    .trim()

  const firstBrace = cleaned.indexOf("{")
  const lastBrace = cleaned.lastIndexOf("}")

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("The AI returned an invalid report. Please try again.")
  }

  return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1))
}

function StartBusiness() {
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState(null)
  const [showIdeas, setShowIdeas] = useState(false)
  const [showLocations, setShowLocations] = useState(false)

  const question = questions[currentQuestion]

  const saveAnswer = (value) => {
    setAnswer(value)

    setAnswers((previous) => ({
      ...previous,
      [question.id]: value
    }))
  }

  const handleNext = () => {
    if (currentQuestion >= questions.length - 1) return

    const nextIndex = currentQuestion + 1

    setCurrentQuestion(nextIndex)
    setAnswer(answers[questions[nextIndex].id] || "")
    setError("")
  }

  const handleSkip = () => {
    const updatedAnswers = {
      ...answers,
      [question.id]: ""
    }

    setAnswers(updatedAnswers)
    setError("")

    if (currentQuestion < questions.length - 1) {
      const nextIndex = currentQuestion + 1

      setCurrentQuestion(nextIndex)
      setAnswer(updatedAnswers[questions[nextIndex].id] || "")
    } else {
      handleAnalyze(updatedAnswers)
    }
  }

  const handleBack = () => {
    if (currentQuestion === 0) return

    const previousIndex = currentQuestion - 1

    setCurrentQuestion(previousIndex)
    setAnswer(answers[questions[previousIndex].id] || "")
    setError("")
  }

  const handleAnalyze = async (submittedAnswers = null) => {
    const finalAnswers = {
      ...answers,
      ...(submittedAnswers || {}),
      [question.id]: submittedAnswers
        ? submittedAnswers[question.id] ?? ""
        : answer
    }

    if (!finalAnswers.businessIdea?.trim()) {
      setError("Please enter your business idea before generating the report.")
      return
    }

    setAnswers(finalAnswers)
    setLoading(true)
    setError("")
    setResult(null)

    try {
      const response = await fetch(
        "http://localhost:8080/api/business/answers",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(finalAnswers)
        }
      )

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(
          data.message || "Unable to generate your business analysis."
        )
      }

      const parsedResult = parseAnalysis(data.analysis)

      if (!parsedResult.verdict || !Array.isArray(parsedResult.keyFactors)) {
        throw new Error("The AI report is missing required information.")
      }

      setResult(parsedResult)
    } catch (err) {
      console.error("Business analysis error:", err)

      setError(
        err.message ||
          "Could not connect to the backend. Check that Spring Boot is running."
      )
    } finally {
      setLoading(false)
    }
  }

  const handleStartAgain = () => {
    setCurrentQuestion(0)
    setAnswers({})
    setAnswer("")
    setResult(null)
    setError("")
    setShowIdeas(false)
    setShowLocations(false)
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  if (result) {
    const verdictClass =
      result.verdict === "Very Good Idea"
        ? "verdict-good"
        : result.verdict === "Good Idea"
          ? "verdict-positive"
          : result.verdict === "High Risk"
            ? "verdict-risk"
            : "verdict-research"

    return (
      <div className="business-question-page">
        <div className="report-container">
          <header className="report-header">
            <p className="badge">YOUR BUSINESS INSIGHTS</p>

            <h1>
              Your idea.
              <span> Your opportunity.</span>
            </h1>

            <p className="question-subtitle">
              A quick, personalized overview to help you decide what to
              explore next.
            </p>
          </header>

          <section className="verdict-card">
            <div className="verdict-topline">
              <span className="verdict-icon">✦</span>
              <span>AI BUSINESS ASSESSMENT</span>
            </div>

            <div className={`verdict-pill ${verdictClass}`}>
              {result.verdict}
            </div>

            <h2>{answers.businessIdea}</h2>

            <p className="verdict-summary">{result.summary}</p>

            <p className="verdict-note">
              Preliminary assessment — validate local demand, costs, and
              competition before investing.
            </p>
          </section>

          <section className="report-section">
            <div className="report-section-heading">
              <div>
                <p className="section-eyebrow">AT A GLANCE</p>
                <h2>Business analysis</h2>
              </div>
              <span className="heading-decoration">✧</span>
            </div>

            <div className="analysis-grid">
              {(result.keyFactors || []).map((factor, index) => (
                <article className="factor-card" key={`${factor.label}-${index}`}>
                  <span className="factor-number">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <p>{factor.label}</p>
                  <h3>{factor.value}</h3>
                </article>
              ))}
            </div>
          </section>

          <section className="report-section explore-section">
            <div className="report-section-heading">
              <div>
                <p className="section-eyebrow">YOUR NEXT MOVE</p>
                <h2>Explore your opportunities</h2>
                <p className="section-description">
                  Discover alternative ideas and potential locations that
                  match your business goals.
                </p>
              </div>
            </div>

            <div className="explore-grid">
              <article className="explore-card ideas-explore">
                <div className="explore-icon">💡</div>
                <p className="explore-label">IDEA DISCOVERY</p>
                <h3>More great ideas</h3>
                <p>
                  Explore related businesses and compare their investment
                  needs and potential.
                </p>

                <button
                  type="button"
                  className="explore-button"
                  onClick={() => setShowIdeas((previous) => !previous)}
                  aria-expanded={showIdeas}
                >
                  {showIdeas ? "Hide Ideas ↑" : "Explore Ideas →"}
                </button>
              </article>

              <article className="explore-card locations-explore">
                <div className="explore-icon">📍</div>
                <p className="explore-label">LOCATION DISCOVERY</p>
                <h3>Promising locations</h3>
                <p>
                  Explore possible areas and learn what you should check
                  before choosing a location.
                </p>

                <button
                  type="button"
                  className="explore-button"
                  onClick={() => setShowLocations((previous) => !previous)}
                  aria-expanded={showLocations}
                >
                  {showLocations ? "Hide Locations ↑" : "Explore Locations →"}
                </button>
              </article>
            </div>

            {showIdeas && (
              <div className="explore-results">
                <div className="results-heading">
                  <span>✦</span>
                  <div>
                    <h3>Ideas worth exploring</h3>
                    <p>Compare these alternatives before making a decision.</p>
                  </div>
                </div>

                <div className="suggestion-grid">
                  {(result.ideas || []).map((idea, index) => (
                    <article className="suggestion-card" key={idea.name || index}>
                      <span className="suggestion-index">
                        IDEA {String(index + 1).padStart(2, "0")}
                      </span>
                      <h4>{idea.name}</h4>
                      <p>{idea.description}</p>
                      <div className="suggestion-detail">
                        <strong>Investment</strong>
                        <span>{idea.investment}</span>
                      </div>
                      <div className="suggestion-reason">
                        <strong>Why explore it?</strong>
                        <p>{idea.reason}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}

            {showLocations && (
              <div className="explore-results">
                <div className="results-heading">
                  <span>⌖</span>
                  <div>
                    <h3>Locations to investigate</h3>
                    <p>
                      Suggestions to validate through visits and local
                      competitor research.
                    </p>
                  </div>
                </div>

                <div className="suggestion-grid">
                  {(result.locations || []).map((location, index) => (
                    <article
                      className="suggestion-card location-card"
                      key={location.name || index}
                    >
                      <span className="suggestion-index">
                        LOCATION {String(index + 1).padStart(2, "0")}
                      </span>
                      <h4>{location.name}</h4>
                      <p>{location.description}</p>

                      <div className="suggestion-detail">
                        <strong>Potential customers</strong>
                        <span>{location.customers}</span>
                      </div>

                      <div className="suggestion-reason">
                        <strong>Before choosing</strong>
                        <p>{location.reason}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </section>

          <section className="pro-tips-section">
            <div className="tips-heading">
              <span className="tips-icon">✧</span>
              <div>
                <p className="section-eyebrow">A LITTLE EXTRA WISDOM</p>
                <h2>Pro tips for your business</h2>
              </div>
            </div>

            <div className="tips-list">
              {(result.proTips || []).map((tip, index) => (
                <div className="tip-item" key={`${tip}-${index}`}>
                  <span className="tip-check">✓</span>
                  <p>{tip}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="report-disclaimer">
            <strong>Remember:</strong> This AI report is a starting point,
            not a guarantee of success. Confirm local demand, investment
            requirements, licenses, and operating costs independently.
          </div>

          <button
            type="button"
            className="next-button restart-button"
            onClick={handleStartAgain}
          >
            ← Analyze Another Business
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="business-question-page">
      <div className="question-container">
        <header className="question-header">
          <p className="badge">START A BUSINESS</p>

          <h1>
            Let's understand your
            <span> business idea.</span>
          </h1>

          <p className="question-subtitle">
            Answer a few simple questions to receive your personalized
            business insights.
          </p>
        </header>

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
              className="business-input"
              placeholder={question.placeholder}
              value={answer}
              onChange={(event) => saveAnswer(event.target.value)}
              onKeyDown={(event) => {
                if (
                  event.key === "Enter" &&
                  currentQuestion < questions.length - 1
                ) {
                  handleNext()
                }
              }}
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

          {error && (
            <p role="alert" className="business-error">
              {error}
            </p>
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

              {currentQuestion < questions.length - 1 ? (
                <button
                  type="button"
                  className="next-button"
                  onClick={handleNext}
                  disabled={loading}
                >
                  Next →
                </button>
              ) : (
                <button
                  type="button"
                  className="next-button"
                  onClick={() => handleAnalyze()}
                  disabled={loading}
                >
                  {loading ? "Generating..." : "Analyze My Business →"}
                </button>
              )}
            </div>
          </div>

          {loading && (
            <div className="analysis-loading" role="status">
              <div className="loading-spinner" />
              <h3>Preparing your business insights...</h3>
              <p>
                We're organizing your analysis, alternative ideas, and
                location suggestions.
              </p>
            </div>
          )}
        </div>

        <p className="skip-info">
          You can skip optional questions and continue.
        </p>
      </div>
    </div>
  )
}

export default StartBusiness