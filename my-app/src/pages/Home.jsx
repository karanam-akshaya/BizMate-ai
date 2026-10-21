import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="page home-page">
      {/* Hero Section */}
      <section className="home-hero">
        <div className="home-hero-inner">
          <div className="hero-content">
            <div className="hero-eyebrow">
              <span className="eyebrow-dot"></span>
              AI-POWERED BUSINESS ASSISTANT
            </div>

            <h1>
              Build your business
              <br />
              with <span>clarity and confidence.</span>
            </h1>

            <p className="hero-text">
              Whether you're starting a new idea or growing an existing
              business, BizMate AI helps you make informed decisions with
              practical, AI-powered insights.
            </p>

            <div className="hero-buttons">
              <Link to="/start-business" className="primary-btn hero-primary">
                Start Your Business
                <span aria-hidden="true">→</span>
              </Link>

              <Link
                to="/improve-business"
                className="secondary-btn hero-secondary"
              >
                Grow My Business
                <span aria-hidden="true">↗</span>
              </Link>
            </div>

            <div className="hero-trust">
              <span className="trust-check">✓</span>
              Practical recommendations
              <span className="trust-divider">•</span>
              Simple guidance
              <span className="trust-divider">•</span>
              AI-powered insights
            </div>
          </div>

          {/* Right-side visual panel */}
          <div className="hero-visual">
            <div className="visual-glow"></div>

            <div className="dashboard-card">
              <div className="dashboard-top">
                <div>
                  <p className="dashboard-label">YOUR BUSINESS JOURNEY</p>
                  <h3>Ideas into action</h3>
                </div>

                <div className="dashboard-icon">✦</div>
              </div>

              <div className="dashboard-highlight">
                <div className="highlight-icon">💡</div>
                <div>
                  <p className="highlight-label">YOUR NEXT BIG IDEA</p>
                  <h4>Start with a smarter plan</h4>
                  <p className="highlight-description">
                    Explore your idea, audience, costs, and opportunities.
                  </p>
                </div>
              </div>

              <div className="journey-list">
                <div className="journey-item">
                  <div className="journey-number">01</div>
                  <div className="journey-copy">
                    <h4>Understand your idea</h4>
                    <p>Discover your business opportunity</p>
                  </div>
                  <span className="journey-arrow">↗</span>
                </div>

                <div className="journey-item">
                  <div className="journey-number">02</div>
                  <div className="journey-copy">
                    <h4>Plan your next move</h4>
                    <p>Review costs, customers, and risks</p>
                  </div>
                  <span className="journey-arrow">↗</span>
                </div>

                <div className="journey-item">
                  <div className="journey-number">03</div>
                  <div className="journey-copy">
                    <h4>Take action</h4>
                    <p>Turn useful insights into next steps</p>
                  </div>
                  <span className="journey-arrow">↗</span>
                </div>
              </div>

              <div className="dashboard-bottom">
                <span className="status-dot"></span>
                Your business journey starts here
              </div>
            </div>

            <div className="floating-note">
              <div className="floating-note-icon">✓</div>
              <div>
                <strong>Make informed decisions</strong>
                <p>One step at a time</p>
              </div>
            </div>
          </div>
        </div>

        <div className="hero-bottom-line"></div>
      </section>

      {/* Intro Section */}
      <section className="home-intro section-container">
        <div className="section-eyebrow">
          <span></span>
          ONE PLATFORM, TWO PATHS
        </div>

        <h2>
          Where are you in your
          <span> business journey?</span>
        </h2>

        <p className="section-description">
          Choose the path that matches your goals. Get focused guidance
          designed around your business needs.
        </p>
      </section>

      {/* Business Option Cards */}
      <section className="business-options section-container">
        <article className="business-option-card start-card">
          <div className="option-card-top">
            <div className="option-icon start-icon" aria-hidden="true">
              <span>↗</span>
            </div>

            <span className="option-tag">FOR NEW IDEAS</span>
          </div>

          <h3>Start a Business</h3>

          <p className="option-subtitle">
            Turn your idea into a well-informed business plan.
          </p>

          <p className="option-description">
            Explore your business idea, target customers, local opportunities,
            estimated costs, competition, and potential risks before you begin.
          </p>

          <ul className="option-list">
            <li>
              <span>✓</span> Business idea evaluation
            </li>
            <li>
              <span>✓</span> Target customer insights
            </li>
            <li>
              <span>✓</span> Startup costs and risk guidance
            </li>
          </ul>

          <Link to="/start-business" className="option-action start-action">
            Explore Start Business
            <span aria-hidden="true">→</span>
          </Link>

          <div className="option-card-decoration start-decoration"></div>
        </article>

        <article className="business-option-card improve-card">
          <div className="option-card-top">
            <div className="option-icon improve-icon" aria-hidden="true">
              <span>⌁</span>
            </div>

            <span className="option-tag improve-tag">FOR EXISTING BUSINESSES</span>
          </div>

          <h3>Improve My Business</h3>

          <p className="option-subtitle">
            Find practical ways to strengthen and grow your business.
          </p>

          <p className="option-description">
            Identify possible improvements in marketing, customer experience,
            sales, operations, and business growth with actionable suggestions.
          </p>

          <ul className="option-list">
            <li>
              <span>✓</span> Marketing and sales ideas
            </li>
            <li>
              <span>✓</span> Customer experience improvements
            </li>
            <li>
              <span>✓</span> Growth opportunities and next steps
            </li>
          </ul>

          <Link
            to="/improve-business"
            className="option-action improve-action"
          >
            Explore Business Growth
            <span aria-hidden="true">→</span>
          </Link>

          <div className="option-card-decoration improve-decoration"></div>
        </article>
      </section>

      {/* How It Works */}
      <section className="how-it-works">
        <div className="section-container">
          <div className="how-heading">
            <div className="section-eyebrow">
              <span></span>
              HOW BIZMATE AI WORKS
            </div>

            <h2>
              From questions to
              <span> clear next steps.</span>
            </h2>

            <p className="section-description">
              A simple process to help you understand your options and plan
              your next business move.
            </p>
          </div>

          <div className="steps-grid">
            <article className="step-card">
              <div className="step-number">01</div>
              <div className="step-icon">✎</div>
              <h3>Share your details</h3>
              <p>
                Answer a few questions about your business idea, goals,
                customers, or current challenges.
              </p>
            </article>

            <article className="step-card">
              <div className="step-number">02</div>
              <div className="step-icon">✦</div>
              <h3>Get AI insights</h3>
              <p>
                Receive an AI-generated analysis with useful suggestions
                based on the information you provide.
              </p>
            </article>

            <article className="step-card">
              <div className="step-number">03</div>
              <div className="step-icon">↗</div>
              <h3>Plan your next step</h3>
              <p>
                Review the recommendations and choose practical actions that
                suit your business situation.
              </p>
            </article>
          </div>
        </div>
      </section>

      {/* Business News Section */}
      <section className="news-section section-container">
        <div className="news-panel">
          <div className="news-panel-content">
            <div className="section-eyebrow news-eyebrow">
              <span></span>
              STAY INFORMED
            </div>

            <h2>
              Stay connected with
              <span> the business world.</span>
            </h2>

            <p>
              Explore business headlines and updates to help you stay aware of
              market developments and new opportunities.
            </p>

            <Link to="/news" className="primary-btn news-button">
              Explore Business News
              <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="news-illustration" aria-hidden="true">
            <div className="news-circle circle-one"></div>
            <div className="news-circle circle-two"></div>

            <div className="news-document">
              <div className="document-header">
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className="document-title-line"></div>
              <div className="document-line"></div>
              <div className="document-line short-line"></div>

              <div className="document-chart">
                <div className="chart-bar bar-one"></div>
                <div className="chart-bar bar-two"></div>
                <div className="chart-bar bar-three"></div>
                <div className="chart-bar bar-four"></div>
                <div className="chart-bar bar-five"></div>
              </div>

              <div className="document-line"></div>
              <div className="document-line short-line"></div>
            </div>

            <div className="news-floating-icon">↗</div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="home-cta section-container">
        <div>
          <p className="cta-eyebrow">YOUR NEXT CHAPTER STARTS HERE</p>
          <h2>Have a business goal in mind?</h2>
          <p>
            Start exploring your options with BizMate AI and take your next
            step with greater clarity.
          </p>
        </div>

        <Link to="/start-business" className="cta-button">
          Get Started
          <span aria-hidden="true">→</span>
        </Link>
      </section>
    </div>
  );
}

export default Home;