import { useState } from "react"

function StartBusiness() {
  const questions = [
    {
      id: "businessIdea",
      question: "What is your business idea?",
      type: "text",
      placeholder: "Example: Coffee shop, clothing store, bakery..."
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
      question: "What location do you prefer?",
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
      question: "What type of business are you interested in?",
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
      options: [
        "Yes",
        "No",
        "Some Experience"
      ]
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
        "Not Sure"
      ]
    },
    {
      id: "businessSize",
      question: "What size of business are you planning?",
      type: "options",
      options: [
        "Small",
        "Medium",
        "Large",
        "Not Decided"
      ]
    }
  ]

  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [answer, setAnswer] = useState("")

  const question = questions[currentQuestion]

  const saveAnswer = (value) => {
    setAnswer(value)

    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [question.id]: value
    }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)

      const nextQuestion = questions[currentQuestion + 1]
      setAnswer(answers[nextQuestion.id] || "")
    } else {
      console.log("All Answers:", answers)
      alert("Questions completed! AI analysis will be connected next.")
    }
  }

  const handleSkip = () => {
    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [question.id]: ""
    }))

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)

      const nextQuestion = questions[currentQuestion + 1]
      setAnswer(answers[nextQuestion.id] || "")
    } else {
      console.log("All Answers:", answers)
      alert("Questions completed! AI analysis will be connected next.")
    }
  }

  const handleBack = () => {
    if (currentQuestion > 0) {
      const previousQuestion = questions[currentQuestion - 1]

      setCurrentQuestion(currentQuestion - 1)
      setAnswer(answers[previousQuestion.id] || "")
    }
  }

  const progress = ((currentQuestion + 1) / questions.length) * 100

  return (
    <div className="business-question-page">

      <div className="question-container">

        {/* Header */}
        <div className="question-header">
          <p className="badge">START A BUSINESS</p>

          <h1>
            Let's understand your
            <span> business idea.</span>
          </h1>

          <p className="question-subtitle">
            Answer a few simple questions and our AI will analyze
            the business opportunity for you.
          </p>
        </div>

        {/* Progress */}
        <div className="progress-section">

          <div className="progress-info">
            <span>
              Question {currentQuestion + 1} of {questions.length}
            </span>

            <span>
              {Math.round(progress)}%
            </span>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

        </div>

        {/* Question */}
        <div className="question-card">

          <h2>{question.question}</h2>

          {/* Text Input */}
          {question.type === "text" && (
            <input
              type="text"
              value={answer}
              onChange={(e) => saveAnswer(e.target.value)}
              placeholder={question.placeholder}
              className="business-input"
            />
          )}

          {/* Options */}
          {question.type === "options" && (
            <div className="business-options">

              {question.options.map((option) => (
                <button
                  key={option}
                  className={
                    answer === option
                      ? "option-button selected"
                      : "option-button"
                  }
                  onClick={() => saveAnswer(option)}
                >
                  {option}

                  {answer === option && (
                    <span>✓</span>
                  )}
                </button>
              ))}

            </div>
          )}

          {/* Navigation */}
          <div className="question-actions">

            <button
              className="back-button"
              onClick={handleBack}
              disabled={currentQuestion === 0}
            >
              ← Back
            </button>

            <div className="right-actions">

              <button
                className="skip-button"
                onClick={handleSkip}
              >
                Skip
              </button>

              <button
                className="next-button"
                onClick={handleNext}
              >
                {currentQuestion === questions.length - 1
                  ? "Analyze My Business →"
                  : "Next →"}
              </button>

            </div>

          </div>

        </div>

        <p className="skip-info">
          You can skip any question. We'll use the information you provide.
        </p>

      </div>

    </div>
  )
}

export default StartBusiness