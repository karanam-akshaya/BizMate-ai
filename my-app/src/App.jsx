
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Link,
} from "react-router-dom";

import "./App.css";

import Home from "./pages/Home";
import StartBusiness from "./pages/StartBusiness";
import ImproveBusiness from "./pages/ImproveBusiness";
import BusinessNews from "./pages/News";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="navbar">
          <Link to="/" className="logo">
            <span className="logo-mark">B</span>
            <span>
              BizMate<span className="logo-ai"> AI</span>
            </span>
          </Link>

          <nav className="nav-links">
            <NavLink to="/" end>
              Home
            </NavLink>

            <NavLink to="/start-business">
              Start Business
            </NavLink>

            <NavLink to="/improve-business">
              Improve Business
            </NavLink>

            <NavLink to="/news">
              Business News
            </NavLink>

            <NavLink to="/about">
              About
            </NavLink>
          </nav>

          <Link to="/login" className="login-btn">
            Login
          </Link>
        </header>

        <main className="main-content">
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

            <Route path="/news/*" element={<BusinessNews />} />

            <Route path="/about" element={<About />} />

            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />

            <Route
              path="*"
              element={
                <section className="not-found">
                  <h1>Page not found</h1>
                  <Link to="/" className="primary-btn">
                    Return Home
                  </Link>
                </section>
              }
            />
          </Routes>
        </main>

        <footer className="site-footer">
          <span className="footer-brand">BizMate AI</span>
          <span>
            Make informed decisions. Build better businesses.
          </span>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;
