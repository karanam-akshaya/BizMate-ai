import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'

import Home from "./pages/Home"
import StartBusiness from "./pages/StartBusiness"
import ImproveBusiness from "./pages/ImproveBusiness"
import BusinessNews from "./pages/News.jsx"
import About from "./pages/About"
import Login from "./pages/Login"

function App() {
  return (
    <BrowserRouter>

      <nav className="navbar">

        <Link to="/" className="logo">
          Business<span>Assistant</span>
        </Link>

        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/start-business">Start a Business</Link>
          <Link to="/improve-business">Improve My Business</Link>
          <Link to="/news">Business News</Link>
          <Link to="/about">About</Link>
        </div>

        <Link to="/login" className="login-btn">
          Login
        </Link>

      </nav>

      <Routes>

        <Route path="/" element={<Home />} />

        <Route
          path="/start-business"
          element={<StartBusiness />}
        />

        <Route
          path="/improve-business"
          element={<ImproveBusiness />}
        />

        <Route
          path="/news"
          element={<BusinessNews />}
        />

        <Route
          path="/about"
          element={<About />}
        />

        <Route
          path="/login"
          element={<Login />}
        />

      </Routes>

    </BrowserRouter>
  )
}

export default App