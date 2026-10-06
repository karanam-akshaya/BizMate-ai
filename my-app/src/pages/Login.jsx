function Login() {
  return (
    <div className="login-page">

      <div className="login-box">

        <p className="badge">WELCOME BACK</p>

        <h1>Login</h1>

        <p>
          Access your saved business analyses and insights.
        </p>

        <input
          type="email"
          placeholder="Email address"
        />

        <input
          type="password"
          placeholder="Password"
        />

        <button className="primary-btn">
          Login
        </button>

      </div>

    </div>
  )
}

export default Login