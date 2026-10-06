function Home() {
  return (
    <div className="page">

      <section className="hero">

        <div className="hero-content">

          <p className="badge">
            AI-POWERED BUSINESS ASSISTANT
          </p>

          <h1>
            Make smarter
            <span> business decisions.</span>
          </h1>

          <p className="hero-text">
            Turn your business ideas and problems into
            clear, practical decisions with AI-powered insights.
          </p>

          <div className="hero-buttons">

            <a href="/start-business" className="primary-btn">
              Start a Business →
            </a>

            <a href="/improve-business" className="secondary-btn">
              Improve My Business
            </a>

          </div>

        </div>

      </section>


      <section className="features">

        <div className="section-heading">
          <p>WHAT WE DO</p>
          <h2>Your business, smarter.</h2>
        </div>


        <div className="feature-grid">

          <a href="/start-business" className="feature-card">

            <div className="feature-icon">🚀</div>

            <h3>Start a Business</h3>

            <p>
              Analyze your business idea, location,
              market potential, competition and risks
              before you start.
            </p>

            <span>Explore →</span>

          </a>


          <a href="/improve-business" className="feature-card">

            <div className="feature-icon">📈</div>

            <h3>Improve My Business</h3>

            <p>
              Get practical strategies, offers,
              marketing ideas and growth suggestions
              for your existing business.
            </p>

            <span>Improve →</span>

          </a>

        </div>

      </section>


      <section className="news-preview">

        <div>
          <p>STAY INFORMED</p>
          <h2>Today's Business Headlines</h2>
        </div>

        <a href="/news" className="text-btn">
          View all news →
        </a>

      </section>

    </div>
  )
}

export default Home