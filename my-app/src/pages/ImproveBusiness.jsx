
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

const FILE_API = "http://localhost:8080/api/files";
const BUSINESS_API = "http://localhost:8080/api/business/analyze";

function ImproveBusiness() {
  // File upload state
  const [userId, setUserId] = useState("1");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileMessage, setFileMessage] = useState("");

  // Business improvement form state
  const [businessName, setBusinessName] = useState("");
  const [businessType, setBusinessType] = useState("");
  const [location, setLocation] = useState("");
  const [budget, setBudget] = useState("Below ₹1 Lakh");
  const [customers, setCustomers] = useState("Everyone");
  const [problem, setProblem] = useState("");
  const [topic, setTopic] = useState("marketing strategy");

  // AI analysis state
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState("");
  const [analysisError, setAnalysisError] = useState("");

  // Load uploaded file information from the backend
  async function loadFiles() {
    setLoadingFiles(true);

    try {
      const response = await fetch(
        `${FILE_API}/user/${encodeURIComponent(userId)}`
      );

      if (!response.ok) {
        throw new Error("Could not load uploaded files.");
      }

      const data = await response.json();
      setUploadedFiles(Array.isArray(data) ? data : []);
    } catch (error) {
      setFileMessage(
        "Could not load files. Check that Spring Boot is running."
      );
    } finally {
      setLoadingFiles(false);
    }
  }

  useEffect(() => {
    loadFiles();
  }, []);

  // Upload a file and save its information in MySQL
  async function handleUpload(event) {
    event.preventDefault();

    if (!selectedFile) {
      setFileMessage("Please choose a file first.");
      return;
    }

    if (!userId.trim() || !/^\d+$/.test(userId)) {
      setFileMessage("Please enter a valid numeric user ID.");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setFileMessage("The file must be 10 MB or smaller.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("userId", userId);

    setUploading(true);
    setFileMessage("");

    try {
      const response = await fetch(`${FILE_API}/upload`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.message || result.error || "File upload failed."
        );
      }

      setFileMessage(result.message || "File uploaded successfully!");
      setSelectedFile(null);

      const fileInput = document.getElementById("bizmate-file-input");
      if (fileInput) fileInput.value = "";

      await loadFiles();
    } catch (error) {
      setFileMessage(
        error.message || "Upload failed. Check the backend."
      );
    } finally {
      setUploading(false);
    }
  }

  // Send the existing business details and problem to Spring Boot
  async function handleImprove(event) {
    event.preventDefault();

    if (!businessName.trim()) {
      setAnalysisError("Please enter your business name or description.");
      return;
    }

    if (!location.trim()) {
      setAnalysisError("Please enter your business location.");
      return;
    }

    if (!problem.trim()) {
      setAnalysisError("Please describe the main problem you want to solve.");
      return;
    }

    setAnalyzing(true);
    setAnalysis("");
    setAnalysisError("");

    const businessIdea = [
      `EXISTING BUSINESS: ${businessName.trim()}`,
      `BUSINESS TYPE: ${businessType || "Not specified"}`,
      `BUSINESS STAGE: This business already exists.`,
      `MAIN PROBLEM TO SOLVE: ${problem.trim()}`,
      "TASK: Focus on practical improvements for the existing business. Do not treat this as a request to start a new business.",
      "Recommend realistic changes, low-cost experiments, measurable goals, and a practical action plan.",
    ].join("\n");

    const requestData = {
      businessIdea,
      location: location.trim(),
      budget,
      targetAudience: customers,
      topic,
    };

    try {
      const response = await fetch(BUSINESS_API, {
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
        throw new Error("The AI returned an empty response. Please try again.");
      }

      setAnalysis(data.analysis.trim());
    } catch (error) {
      console.error("Business improvement error:", error);

      setAnalysisError(
        error.message === "Failed to fetch"
          ? "Cannot connect to Spring Boot. Make sure the backend is running on port 8080."
          : error.message || "Unable to generate improvement suggestions."
      );
    } finally {
      setAnalyzing(false);
    }
  }

  return (
    <div className="page simple-page">
      <p className="badge">IMPROVE MY BUSINESS</p>

      <h1>
        Find better ways to
        <span> grow your business.</span>
      </h1>

      <p>
        Describe your business challenges and get AI-generated
        suggestions to improve your business.
      </p>

      {/* Business improvement form */}
      <section
        style={{
          maxWidth: "700px",
          width: "100%",
          margin: "28px auto",
          padding: "24px",
          border: "1px solid #e5e7eb",
          borderRadius: "14px",
          textAlign: "left",
          boxSizing: "border-box",
        }}
      >
        <h2>Tell us about your business</h2>

        <form onSubmit={handleImprove}>
          <label style={labelStyle}>
            Business name or description
          </label>
          <input
            type="text"
            value={businessName}
            onChange={(event) => setBusinessName(event.target.value)}
            placeholder="Example: A small clothing store"
            required
            style={inputStyle}
          />

          <label style={labelStyle}>Business type</label>
          <select
            value={businessType}
            onChange={(event) => setBusinessType(event.target.value)}
            style={inputStyle}
          >
            <option value="">Select business type</option>
            <option value="Retail">Retail</option>
            <option value="Food & Beverage">Food & Beverage</option>
            <option value="Service">Service</option>
            <option value="Technology">Technology</option>
            <option value="Manufacturing">Manufacturing</option>
            <option value="Online Business">Online Business</option>
            <option value="Other">Other</option>
          </select>

          <label style={labelStyle}>Business location</label>
          <input
            type="text"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
            placeholder="Example: Visakhapatnam"
            required
            style={inputStyle}
          />

          <label style={labelStyle}>Available improvement budget</label>
          <select
            value={budget}
            onChange={(event) => setBudget(event.target.value)}
            style={inputStyle}
          >
            <option>Below ₹1 Lakh</option>
            <option>₹1 - ₹5 Lakhs</option>
            <option>₹5 - ₹10 Lakhs</option>
            <option>₹10 - ₹25 Lakhs</option>
            <option>Above ₹25 Lakhs</option>
          </select>

          <label style={labelStyle}>Target customers</label>
          <select
            value={customers}
            onChange={(event) => setCustomers(event.target.value)}
            style={inputStyle}
          >
            <option>Students</option>
            <option>Families</option>
            <option>Working Professionals</option>
            <option>Children</option>
            <option>Tourists</option>
            <option>Everyone</option>
          </select>

          <label style={labelStyle}>What would you like to improve?</label>
          <select
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
            style={inputStyle}
          >
            <option value="marketing strategy">Marketing and sales</option>
            <option value="target customers">Finding target customers</option>
            <option value="market & competition">Competition and market</option>
            <option value="risks & solutions">Problems and solutions</option>
            <option value="30-day action plan">30-day action plan</option>
          </select>

          <label style={labelStyle}>Describe your main problem</label>
          <textarea
            value={problem}
            onChange={(event) => setProblem(event.target.value)}
            placeholder="Example: Sales are low, customers are not returning, or marketing costs are too high."
            required
            rows={5}
            style={{
              ...inputStyle,
              resize: "vertical",
              fontFamily: "inherit",
            }}
          />

          <button
            type="submit"
            className="primary-btn"
            disabled={analyzing}
          >
            {analyzing ? "Analyzing your business..." : "Get Improvement Suggestions"}
          </button>
        </form>

        {analysisError && (
          <p role="alert" style={{ color: "#b91c1c", marginTop: "16px" }}>
            {analysisError}
          </p>
        )}

        {analyzing && (
          <p role="status" style={{ marginTop: "16px" }}>
            Please wait while the AI prepares your suggestions.
          </p>
        )}

        {analysis && (
          <div
            style={{
              marginTop: "28px",
              padding: "20px",
              border: "1px solid #d1d5db",
              borderRadius: "12px",
              overflowWrap: "anywhere",
            }}
          >
            <h2>AI Improvement Suggestions</h2>

            <div className="business-analysis">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {analysis}
              </ReactMarkdown>
            </div>
          </div>
        )}
      </section>

      {/* Existing file upload feature */}
      <section
        style={{
          maxWidth: "700px",
          width: "100%",
          margin: "28px auto",
          padding: "24px",
          border: "1px solid #e5e7eb",
          borderRadius: "14px",
          textAlign: "left",
          boxSizing: "border-box",
        }}
      >
        <h2>Upload business files</h2>
        <p>
          Upload relevant business documents and keep their records
          available in your account.
        </p>

        <form onSubmit={handleUpload}>
          <label htmlFor="bizmate-user-id" style={labelStyle}>
            User ID
          </label>

          <input
            id="bizmate-user-id"
            type="number"
            min="1"
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            required
            style={inputStyle}
          />

          <label htmlFor="bizmate-file-input" style={labelStyle}>
            Choose a document (maximum 10 MB)
          </label>

          <input
            id="bizmate-file-input"
            type="file"
            onChange={(event) =>
              setSelectedFile(event.target.files?.[0] || null)
            }
            style={{ display: "block", marginBottom: "18px" }}
          />

          <button
            type="submit"
            className="primary-btn"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Upload File"}
          </button>
        </form>

        {fileMessage && (
          <p role="status" style={{ marginTop: "16px" }}>
            {fileMessage}
          </p>
        )}

        <hr style={{ margin: "24px 0" }} />

        <h2>Your uploaded files</h2>

        <button
          type="button"
          className="primary-btn"
          onClick={loadFiles}
          disabled={loadingFiles}
          style={{ margin: "12px 0" }}
        >
          {loadingFiles ? "Loading..." : "Refresh Files"}
        </button>

        {uploadedFiles.length === 0 ? (
          <p>
            {loadingFiles
              ? "Loading your files..."
              : "No uploaded files found for this user yet."}
          </p>
        ) : (
          <ul style={{ paddingLeft: "20px" }}>
            {uploadedFiles.map((file) => (
              <li key={file.id} style={{ marginBottom: "12px" }}>
                <strong>{file.fileName}</strong>
                {file.fileType && <span> — {file.fileType}</span>}
                {file.uploadedAt && (
                  <small style={{ display: "block" }}>
                    Uploaded: {new Date(file.uploadedAt).toLocaleString()}
                  </small>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

const labelStyle = {
  display: "block",
  margin: "16px 0 6px",
  fontWeight: 500,
};

const inputStyle = {
  display: "block",
  width: "100%",
  padding: "10px",
  marginBottom: "12px",
  border: "1px solid #d1d5db",
  borderRadius: "6px",
  boxSizing: "border-box",
  fontSize: "15px",
};

export default ImproveBusiness;
