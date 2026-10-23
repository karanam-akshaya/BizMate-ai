
import { useEffect, useState } from "react";
import {
  Link,
  Navigate,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
const API_URL = "https://bizmate-ai-o5j7.onrender.com/api/news";

const CATEGORIES = [
  {
    value: "startups",
    title: "Startups & Entrepreneurship",
    description: "New businesses, founders, funding and business ideas.",
    icon: "🚀",
  },
  {
    value: "markets",
    title: "Business & Markets",
    description: "Companies, markets, the economy and finance.",
    icon: "📈",
  },
  {
    value: "technology",
    title: "Technology & Innovation",
    description: "AI, technology companies and new innovations.",
    icon: "💡",
  },
  {
    value: "small-business",
    title: "Small Businesses",
    description: "Small businesses, MSMEs and growth opportunities.",
    icon: "🏪",
  },
  {
    value: "ecommerce",
    title: "E-commerce",
    description: "Online stores, digital selling and customer trends.",
    icon: "🛒",
  },
  {
    value: "agriculture",
    title: "Agriculture & Farming",
    description: "Agribusiness, farming technology and rural enterprises.",
    icon: "🌱",
  },
];

const SUCCESS_STORIES = [
  {
    id: "falguni-nayar",
    title: "Falguni Nayar — Founder of Nykaa",
    category: "Beauty & E-commerce",
    source: "Nykaa",
    sourceUrl: "https://www.nykaa.com/",
    description:
      "Falguni Nayar founded Nykaa in 2012 after working in investment banking. Nykaa built a beauty and lifestyle retail business with an online presence and other retail channels.",
    content:
      "Falguni Nayar founded Nykaa in 2012 after a career in investment banking. Nykaa developed a beauty and lifestyle retail business. Explain the business model, customer needs, online retail, brand building and lessons for beginners using only facts that are supported by these details.",
    lesson:
      "Understand customer needs, build trust and create a clear value proposition.",
  },
  {
    id: "narayana-murthy",
    title: "N. R. Narayana Murthy — Co-founder of Infosys",
    category: "Information Technology",
    source: "Infosys",
    sourceUrl: "https://www.infosys.com/about.html",
    description:
      "N. R. Narayana Murthy co-founded Infosys in 1981 with six other engineers. Infosys became an international IT services and consulting company.",
    content:
      "N. R. Narayana Murthy co-founded Infosys in 1981 with six other engineers. Infosys operates in information technology services and consulting. Explain the IT services business model, teamwork, customer service and lessons for beginners using only supported facts.",
    lesson:
      "Build useful skills, work with a capable team and consistently serve customer needs.",
  },
  {
    id: "kiran-mazumdar-shaw",
    title: "Kiran Mazumdar-Shaw — Founder of Biocon",
    category: "Biotechnology",
    source: "Biocon",
    sourceUrl: "https://www.biocon.com/",
    description:
      "Kiran Mazumdar-Shaw founded Biocon in 1978. The company began in industrial enzymes and later expanded into biotechnology and biopharmaceuticals.",
    content:
      "Kiran Mazumdar-Shaw founded Biocon in 1978. The company began in industrial enzymes and later expanded into biotechnology and biopharmaceuticals. Explain this business development, the role of technical expertise and lessons for beginners without inventing personal struggles or achievements.",
    lesson:
      "Develop expertise, identify a market need and build on a strong technical foundation.",
  },
];

function safeUrl(value) {
  if (!value) return "";

  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) ? url.href : "";
  } catch {
    return "";
  }
}

function formatDate(value) {
  if (!value) return "Date unavailable";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Date unavailable";

  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function slugify(value = "") {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function getTitle(article) {
  return article?.title || "Business news";
}

function getDescription(article) {
  return (
    article?.description ||
    "Read the original report for more information."
  );
}

function getErrorMessage(error) {
  if (error?.name === "AbortError") return "";

  if (error instanceof TypeError) {
    return "Cannot connect to the backend. Make sure Spring Boot is running on port 8080.";
  }

  return error?.message || "Something went wrong. Please try again.";
}

async function fetchArticles(category, signal) {
  const response = await fetch(
    `${API_URL}?category=${encodeURIComponent(category)}`,
    { signal }
  );

  if (!response.ok) {
    throw new Error(`Unable to load news (HTTP ${response.status}).`);
  }

  const data = await response.json();
  return Array.isArray(data.articles) ? data.articles : [];
}

async function fetchAiExplanation(article) {
  const params = new URLSearchParams({
    title: article.title || "",
    description: article.description || "",
    content: article.content || "",
    source: article.source || "",
  });

  const response = await fetch(`${API_URL}/summary?${params.toString()}`);

  if (!response.ok) {
    let message = `AI explanation failed (HTTP ${response.status}).`;

    try {
      const data = await response.json();
      if (data.message) message = data.message;
    } catch {
      // Keep the default message if the response is not JSON.
    }

    throw new Error(message);
  }

  const data = await response.json();

  if (!data.summary || !data.summary.trim()) {
    throw new Error("The AI service returned an empty explanation.");
  }

  return data.summary;
}

function NewsLayout({ children }) {
  const location = useLocation();

  const navigation = [
    { label: "Top Headlines", path: "/news/headlines", icon: "📰" },
    { label: "Business Types", path: "/news/types", icon: "📊" },
    {
      label: "Success Stories",
      path: "/news/success-stories",
      icon: "🏆",
    },
  ];

  return (
    <div className="biz-news">
      <style>{`
        .biz-news {
          --green: #176b52;
          --green-dark: #10533f;
          --ink: #202b28;
          --muted: #63716a;
          --border: #e0e9e3;
          color: var(--ink);
          background: #f6f9f7;
          min-height: 100vh;
          padding-bottom: 36px;
          font-family: Inter, system-ui, -apple-system, "Segoe UI", sans-serif;
        }

        .biz-news * { box-sizing: border-box; }
        .biz-news a { text-decoration: none; }
        .biz-news button, .biz-news input { font: inherit; }
        .biz-news button { cursor: pointer; }

        .bn-container {
          width: min(1120px, calc(100% - 36px));
          margin: 0 auto;
        }

        .bn-top {
          background: #fff;
          border-bottom: 1px solid var(--border);
        }

        .bn-top-inner {
          min-height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 18px;
        }

        .bn-brand {
          color: var(--green) !important;
          font-size: 20px;
          font-weight: 850;
          white-space: nowrap;
        }

        .bn-nav {
          display: flex;
          flex-wrap: wrap;
          gap: 7px;
        }

        .bn-nav a {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 13px;
          border: 1px solid transparent;
          border-radius: 9px;
          color: #52615a;
          font-size: 13px;
          font-weight: 750;
          transition: background .2s, color .2s;
        }

        .bn-nav a:hover {
          background: #eef6f1;
          color: var(--green);
        }

        .bn-nav a.active {
          color: #fff;
          background: var(--green);
          border-color: var(--green);
        }

        .bn-hero {
          padding: 30px 0;
          background: linear-gradient(115deg, #e5f3e9, #f5faf6);
          border-bottom: 1px solid #e3eee6;
        }

        .bn-eyebrow {
          color: var(--green);
          font-size: 11px;
          font-weight: 850;
          letter-spacing: 1.2px;
          text-transform: uppercase;
        }

        .bn-hero h1 {
          margin: 9px 0;
          font-size: clamp(27px, 4vw, 38px);
          line-height: 1.25;
        }

        .bn-hero p {
          max-width: 730px;
          margin: 0;
          color: #56675e;
          font-size: 14px;
          line-height: 1.8;
        }

        .bn-main { padding-top: 27px; }

        .bn-section-heading {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 19px;
        }

        .bn-section-heading h2 {
          margin: 0 0 6px;
          font-size: 24px;
          line-height: 1.35;
        }

        .bn-section-heading p {
          margin: 0;
          color: var(--muted);
          font-size: 13px;
          line-height: 1.7;
        }

        .bn-tag {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          padding: 5px 9px;
          border-radius: 20px;
          background: #e8f4ed;
          color: var(--green);
          font-size: 11px;
          font-weight: 800;
        }

        .bn-search-row {
          display: flex;
          gap: 10px;
          margin-bottom: 21px;
        }

        .bn-search {
          flex: 1;
          min-width: 0;
          padding: 12px 14px;
          border: 1px solid #d9e4dc;
          border-radius: 9px;
          background: #fff;
          outline: none;
          font-size: 14px;
        }

        .bn-search:focus {
          border-color: var(--green);
          box-shadow: 0 0 0 3px #176b5215;
        }

        .bn-button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 10px 14px;
          border: 1px solid var(--green);
          border-radius: 8px;
          background: var(--green);
          color: #fff !important;
          font-size: 13px;
          font-weight: 750;
          text-align: center;
          transition: background .2s;
        }

        .bn-button:hover { background: var(--green-dark); }
        .bn-button:disabled { opacity: .6; cursor: wait; }

        .bn-button-outline {
          background: #fff;
          color: var(--green) !important;
        }

        .bn-button-outline:hover { background: #edf6f0; }

        .bn-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 17px;
        }

        .bn-card {
          display: flex;
          flex-direction: column;
          min-width: 0;
          padding: 21px;
          border: 1px solid var(--border);
          border-radius: 13px;
          background: #fff;
          box-shadow: 0 3px 12px #18372808;
        }

        .bn-card h3 {
          margin: 0 0 10px;
          font-size: 18px;
          line-height: 1.5;
          overflow-wrap: anywhere;
        }

        .bn-meta {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 9px;
          margin-bottom: 12px;
          color: var(--muted);
          font-size: 12px;
        }

        .bn-description {
          margin: 0 0 14px;
          color: #5c6b63;
          font-size: 14px;
          line-height: 1.8;
          overflow-wrap: anywhere;
        }

        .bn-ai {
          margin-top: 12px;
          padding: 16px;
          border: 1px solid #d8e9de;
          border-radius: 10px;
          background: #f3f9f5;
        }

        .bn-ai-title {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 0 0 11px;
          color: var(--green);
          font-size: 15px;
          font-weight: 850;
        }

        .bn-markdown {
          color: #34473c;
          font-size: 14px;
          line-height: 1.85;
          overflow-wrap: anywhere;
        }

        .bn-markdown h1,
        .bn-markdown h2,
        .bn-markdown h3 {
          margin: 17px 0 8px;
          color: #203b2d;
          font-size: 16px;
          line-height: 1.5;
        }

        .bn-markdown h1:first-child,
        .bn-markdown h2:first-child,
        .bn-markdown h3:first-child {
          margin-top: 0;
        }

        .bn-markdown p { margin: 0 0 11px; }
        .bn-markdown strong { color: #174d38; font-weight: 800; }
        .bn-markdown ul, .bn-markdown ol {
          padding-left: 22px;
          margin: 7px 0 14px;
        }

        .bn-markdown li { margin-bottom: 7px; padding-left: 2px; }

        .bn-ai-error {
          margin-top: 12px;
          padding: 13px;
          border: 1px solid #f0d6d0;
          border-radius: 9px;
          background: #fff8f6;
          color: #873c30;
          font-size: 13px;
          line-height: 1.7;
        }

        .bn-links {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
          margin-top: 17px;
          padding-top: 13px;
          border-top: 1px solid #edf1ee;
        }

        .bn-link {
          color: var(--green) !important;
          font-size: 13px;
          font-weight: 800;
        }

        .bn-link:hover { text-decoration: underline; }

        .bn-category-icon {
          margin-bottom: 12px;
          font-size: 28px;
        }

        .bn-state {
          padding: 28px 18px;
          border: 1px solid var(--border);
          border-radius: 12px;
          background: #fff;
          text-align: center;
        }

        .bn-state h3 { margin: 0 0 8px; }
        .bn-state p {
          color: var(--muted);
          font-size: 14px;
          line-height: 1.7;
        }

        .bn-back {
          display: inline-block;
          margin-bottom: 18px;
          color: var(--green) !important;
          font-size: 13px;
          font-weight: 800;
        }

        .bn-detail {
          max-width: 850px;
          margin: 0 auto;
          padding: 25px;
          border: 1px solid var(--border);
          border-radius: 14px;
          background: #fff;
        }

        .bn-detail h1 {
          margin: 14px 0;
          font-size: clamp(25px, 4vw, 34px);
          line-height: 1.4;
          overflow-wrap: anywhere;
        }

        .bn-footer {
          padding-top: 32px;
          color: var(--muted);
          text-align: center;
          font-size: 12px;
          line-height: 1.8;
        }

        @media (max-width: 760px) {
          .bn-top-inner {
            align-items: flex-start;
            flex-direction: column;
            padding: 14px 0;
          }

          .bn-grid { grid-template-columns: 1fr; }
          .bn-hero { padding: 24px 0; }
        }

        @media (max-width: 480px) {
          .bn-container { width: calc(100% - 24px); }
          .bn-nav { width: 100%; gap: 4px; }
          .bn-nav a { padding: 9px 8px; font-size: 11px; }
          .bn-search-row { flex-direction: column; }
          .bn-card, .bn-detail { padding: 16px; }
        }
      `}</style>

      <header className="bn-top">
        <div className="bn-container bn-top-inner">
          <Link to="/news/headlines" className="bn-brand">
            BizMate-AI <span style={{ color: "#26372e" }}>| Business News</span>
          </Link>

          <nav className="bn-nav" aria-label="Business news sections">
            {navigation.map((item) => {
              const active =
                location.pathname === item.path ||
                (item.path === "/news/types" &&
                  location.pathname.startsWith("/news/types/"));

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={active ? "active" : ""}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <section className="bn-hero">
        <div className="bn-container">
          <div className="bn-eyebrow">Stay informed · Learn business</div>
          <h1>Business news, made simple.</h1>
          <p>
            Understand today's business developments, explore different
            industries, and learn from entrepreneurs. Get clear explanations,
            useful business concepts, and links to original sources.
          </p>
        </div>
      </section>

      <main className="bn-container bn-main">{children}</main>

      <footer className="bn-container bn-footer">
        BizMate-AI Business News
        <br />
        AI explanations are generated from information supplied to the
        application. Visit the original source for complete reporting.
      </footer>
    </div>
  );
}

function SectionHeading({ title, description, count }) {
  return (
    <div className="bn-section-heading">
      <div>
        <h2>{title}</h2>
        <p>{description}</p>
      </div>

      {count !== undefined && (
        <span className="bn-tag">{count} articles</span>
      )}
    </div>
  );
}

function LoadingState({ message = "Loading business news..." }) {
  return (
    <div className="bn-state" role="status">
      <h3>{message}</h3>
      <p>Please wait a moment.</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className="bn-state" role="alert">
      <h3>Unable to load news</h3>
      <p>{message}</p>
      <button className="bn-button" onClick={onRetry}>
        Try Again
      </button>
    </div>
  );
}

function EmptyState({ search }) {
  return (
    <div className="bn-state">
      <h3>No matching news found</h3>
      <p>
        {search
          ? "Try another company, topic or keyword."
          : "There are no articles available in this category right now."}
      </p>
    </div>
  );
}

function AiExplanation({ article, heading = "Understand This News" }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateExplanation() {
    setLoading(true);
    setError("");

    try {
      const result = await fetchAiExplanation(article);
      setSummary(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      {!summary && !loading && (
        <button
          type="button"
          className="bn-button bn-button-outline"
          onClick={generateExplanation}
        >
          ✨ Explain This News
        </button>
      )}

      {summary && !loading && (
        <div className="bn-ai">
          <h4 className="bn-ai-title">
            <span>✦</span> {heading}
          </h4>

          <div className="bn-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {summary}
            </ReactMarkdown>
          </div>

          <button
            type="button"
            className="bn-button bn-button-outline"
            onClick={generateExplanation}
            style={{ marginTop: 8 }}
          >
            Regenerate Explanation
          </button>
        </div>
      )}

      {loading && (
        <div className="bn-ai" role="status">
          <h4 className="bn-ai-title">✦ BizMate-AI is explaining the news</h4>
          <p className="bn-description" style={{ marginBottom: 0 }}>
            Preparing the main events, business concepts and useful points...
          </p>
        </div>
      )}

      {error && (
        <div className="bn-ai-error" role="alert">
          <strong>Unable to generate the explanation</strong>
          <p>{error}</p>
          <button
            className="bn-button bn-button-outline"
            onClick={generateExplanation}
            disabled={loading}
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}

function ArticleCard({ article, category }) {
  const title = getTitle(article);
  const originalUrl = safeUrl(article.url);

  return (
    <article className="bn-card">
      <div className="bn-meta">
        <span className="bn-tag">{article.source || "Business News"}</span>
        <span>{formatDate(article.publishedAt)}</span>
      </div>

      <h3>{title}</h3>
      <p className="bn-description">{getDescription(article)}</p>

      <AiExplanation article={article} />

      <div className="bn-links">
        <Link
          className="bn-link"
          to={`/news/headlines/${encodeURIComponent(slugify(title))}`}
          state={{ article, category }}
        >
          Explore details →
        </Link>

        {originalUrl && (
          <a
            className="bn-link"
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Explore More — Original Article ↗
          </a>
        )}
      </div>
    </article>
  );
}

function ArticleGrid({ articles, category, search }) {
  const filtered = articles.filter((article) => {
    const text = [
      article.title,
      article.description,
      article.source,
      article.category,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return text.includes(search.trim().toLowerCase());
  });

  if (!filtered.length) return <EmptyState search={search.trim()} />;

  return (
    <div className="bn-grid">
      {filtered.map((article, index) => (
        <ArticleCard
          key={`${article.url || article.title || "news"}-${index}`}
          article={article}
          category={category}
        />
      ))}
    </div>
  );
}

function HeadlinesPage() {
  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadNews() {
      setLoading(true);
      setError("");

      try {
        setArticles(await fetchArticles("top", controller.signal));
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    loadNews();
    return () => controller.abort();
  }, [refreshKey]);

  return (
    <>
      <SectionHeading
        title="Top Headlines"
        description="Important business news, explained for beginners."
        count={articles.length}
      />

      <div className="bn-search-row">
        <input
          className="bn-search"
          type="search"
          placeholder="Search headlines, companies or topics..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search headlines"
        />

        <button
          className="bn-button"
          onClick={() => setRefreshKey((key) => key + 1)}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={() => setRefreshKey((key) => key + 1)}
        />
      ) : (
        <ArticleGrid articles={articles} category="top" search={search} />
      )}
    </>
  );
}

function BusinessTypesPage() {
  return (
    <>
      <SectionHeading
        title="Business Types"
        description="Choose an industry to understand its latest developments and opportunities."
      />

      <div className="bn-grid">
        {CATEGORIES.map((category) => (
          <article className="bn-card" key={category.value}>
            <div className="bn-category-icon">{category.icon}</div>
            <h3>{category.title}</h3>
            <p className="bn-description">{category.description}</p>

            <div className="bn-links">
              <Link
                className="bn-link"
                to={`/news/types/${category.value}`}
              >
                Explore this industry →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </>
  );
}

function CategoryNewsPage() {
  const { category } = useParams();
  const categoryInfo = CATEGORIES.find(
    (item) => item.value === category
  );

  const [articles, setArticles] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadCategoryNews() {
      setLoading(true);
      setError("");
      setArticles([]);

      try {
        setArticles(await fetchArticles(category, controller.signal));
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    if (categoryInfo) {
      loadCategoryNews();
    } else {
      setLoading(false);
    }

    return () => controller.abort();
  }, [category, categoryInfo, refreshKey]);

  if (!categoryInfo) {
    return (
      <div className="bn-state">
        <h3>Category not found</h3>
        <Link className="bn-link" to="/news/types">
          Browse business types →
        </Link>
      </div>
    );
  }

  return (
    <>
      <Link className="bn-back" to="/news/types">
        ← All business types
      </Link>

      <SectionHeading
        title={categoryInfo.title}
        description={categoryInfo.description}
        count={articles.length}
      />

      <div className="bn-search-row">
        <input
          className="bn-search"
          type="search"
          placeholder={`Search ${categoryInfo.title.toLowerCase()}...`}
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          aria-label="Search category news"
        />

        <button
          className="bn-button"
          onClick={() => setRefreshKey((key) => key + 1)}
          disabled={loading}
        >
          ↻ Refresh
        </button>
      </div>

      {loading ? (
        <LoadingState />
      ) : error ? (
        <ErrorState
          message={error}
          onRetry={() => setRefreshKey((key) => key + 1)}
        />
      ) : (
        <ArticleGrid
          articles={articles}
          category={category}
          search={search}
        />
      )}
    </>
  );
}

function ArticleDetailPage() {
  const { slug } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const passedArticle = location.state?.article;
  const passedCategory = location.state?.category || "top";

  const [article, setArticle] = useState(
    passedArticle && slugify(getTitle(passedArticle)) === slug
      ? passedArticle
      : null
  );
  const [loading, setLoading] = useState(!article);
  const [error, setError] = useState("");

  useEffect(() => {
    if (article) {
      setLoading(false);
      return;
    }

    const controller = new AbortController();

    async function findArticle() {
      setLoading(true);
      setError("");

      try {
        const categories = [
          passedCategory,
          "top",
          ...CATEGORIES.map((item) => item.value),
        ];

        let found = null;

        for (const category of [...new Set(categories)]) {
          const results = await fetchArticles(category, controller.signal);

          found = results.find(
            (item) => slugify(getTitle(item)) === slug
          );

          if (found) break;
        }

        if (!found) {
          throw new Error(
            "This article is no longer available. Return to the news list and try again."
          );
        }

        setArticle(found);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(getErrorMessage(err));
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }

    findArticle();
    return () => controller.abort();
  }, [slug, article, passedCategory]);

  if (loading) return <LoadingState message="Loading article details..." />;

  if (error || !article) {
    return (
      <div className="bn-state">
        <h3>Article unavailable</h3>
        <p>{error || "The requested article could not be loaded."}</p>
        <button className="bn-button" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  const originalUrl = safeUrl(article.url);

  return (
    <article className="bn-detail">
      <Link
        className="bn-back"
        to={
          passedCategory === "top"
            ? "/news/headlines"
            : `/news/types/${passedCategory}`
        }
      >
        ← Back to news
      </Link>

      <div className="bn-meta">
        <span className="bn-tag">{article.source || "Business News"}</span>
        <span>{formatDate(article.publishedAt)}</span>
      </div>

      <h1>{getTitle(article)}</h1>
      <p className="bn-description">{getDescription(article)}</p>

      <AiExplanation
        article={article}
        heading="Understand This News"
      />

      {originalUrl && (
        <div className="bn-links">
          <a
            className="bn-button"
            href={originalUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Explore More — Read Full Article ↗
          </a>
        </div>
      )}
    </article>
  );
}

function SuccessStoryCard({ story }) {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function explainStory() {
    setLoading(true);
    setError("");

    try {
      const result = await fetchAiExplanation({
        title: story.title,
        description: story.description,
        content: story.content,
        source: story.source,
      });

      setSummary(result);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  const sourceUrl = safeUrl(story.sourceUrl);

  return (
    <article className="bn-card">
      <div className="bn-meta">
        <span className="bn-tag">{story.category}</span>
        <span>Entrepreneur profile</span>
      </div>

      <h3>{story.title}</h3>
      <p className="bn-description">{story.description}</p>

      <p className="bn-description">
        <strong>Lesson for beginners:</strong> {story.lesson}
      </p>

      {!summary && (
        <button
          className="bn-button bn-button-outline"
          onClick={explainStory}
          disabled={loading}
        >
          {loading ? "Explaining the journey..." : "✦ Explain This Journey"}
        </button>
      )}

      {loading && (
        <div className="bn-ai" role="status">
          <h4 className="bn-ai-title">Preparing the business journey...</h4>
          <p className="bn-description" style={{ marginBottom: 0 }}>
            Creating a beginner-friendly explanation.
          </p>
        </div>
      )}

      {error && (
        <div className="bn-ai-error" role="alert">
          <strong>Unable to explain this story</strong>
          <p>{error}</p>
          <button
            className="bn-button bn-button-outline"
            onClick={explainStory}
            disabled={loading}
          >
            Try Again
          </button>
        </div>
      )}

      {summary && !loading && (
        <div className="bn-ai">
          <h4 className="bn-ai-title">✦ Business Journey Explained</h4>

          <div className="bn-markdown">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {summary}
            </ReactMarkdown>
          </div>

          <button
            className="bn-button bn-button-outline"
            onClick={explainStory}
            style={{ marginTop: 8 }}
          >
            Regenerate Explanation
          </button>
        </div>
      )}

      <div className="bn-links">
        {sourceUrl && (
          <a
            className="bn-link"
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            Explore More — Company Source ↗
          </a>
        )}
      </div>
    </article>
  );
}

function SuccessStoriesPage() {
  return (
    <>
      <SectionHeading
        title="Business Success Stories"
        description="Learn about real entrepreneurs, their businesses and useful lessons for your own journey."
      />

      <div className="bn-grid">
        {SUCCESS_STORIES.map((story) => (
          <SuccessStoryCard key={story.id} story={story} />
        ))}
      </div>

      <p className="bn-description" style={{ marginTop: 20 }}>
        These are introductory profiles, not complete biographies. The AI
        explanations use the facts supplied to the application. Follow the
        company source links to learn more about each business.
      </p>
    </>
  );
}

export default function News() {
  return (
    <NewsLayout>
      <Routes>
        <Route index element={<Navigate to="headlines" replace />} />
        <Route path="headlines" element={<HeadlinesPage />} />
        <Route path="headlines/:slug" element={<ArticleDetailPage />} />
        <Route path="types" element={<BusinessTypesPage />} />
        <Route path="types/:category" element={<CategoryNewsPage />} />
        <Route path="success-stories" element={<SuccessStoriesPage />} />
        <Route path="*" element={<Navigate to="headlines" replace />} />
      </Routes>
    </NewsLayout>
  );
}
