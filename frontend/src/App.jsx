import { useEffect, useMemo, useState } from "react";
import axios from "axios";

const skills = [
  "JavaScript",
  "TypeScript",
  "Node.js",
  "React",
  "Express",
  "REST",
  "SQL",
  "Git",
  "Docker",
  "CI/CD",
];

function App() {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [projectError, setProjectError] = useState("");

  const [message, setMessage] = useState("");
  const [chatLog, setChatLog] = useState([]);
  const [sending, setSending] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const sessionId = useMemo(
    () => `session-${Date.now().toString(36)}`,
    []
  );

  useEffect(() => {
    const loadProjects = async () => {
      setLoadingProjects(true);
      setProjectError("");
      try {
        const res = await axios.get("/api/projects");
        setProjects(res.data || []);
      } catch (error) {
        console.error(error);
        setProjectError("Could not load projects right now.");
      } finally {
        setLoadingProjects(false);
      }
    };

    loadProjects();
  }, []);

  const sendMessage = async () => {
    if (!message.trim()) return;
    const outgoing = { role: "you", text: message.trim() };
    setChatLog((log) => [...log, outgoing]);
    setMessage("");
    setSending(true);
    try {
      const res = await axios.post("/api/chat", {
        message: outgoing.text,
        sessionId,
      });
      const replyText =
        res.data?.text ||
        res.data?.answer ||
        res.data?.message ||
        "Received a response.";
      setChatLog((log) => [...log, { role: "bot", text: replyText }]);
    } catch (error) {
      console.error(error);
      setChatLog((log) => [
        ...log,
        { role: "bot", text: "Sorry, I could not reach the chatbot right now." },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page">
      <header>
        <div className="logo">jxtnz • Portfolio</div>
        <nav>
          <a href="#home">Home</a>
          <a href="#about">About</a>
          <a href="#projects">Projects</a>
          <a href="#skills">Skills</a>
        </nav>
      </header>

      <section id="home" className="hero">
        <div>
          <p className="pill">Software Developer</p>
          <h1>Building useful tools and clean experiences.</h1>
          <p className="muted">
            Welcome! Explore highlighted GitHub projects pulled live from
            jxtnz&apos;s profile, browse core skills, and chat with the Flowise
            assistant for questions.
          </p>
        </div>
        <div className="card">
          <strong>At a glance</strong>
          <p className="muted">
            Full-stack projects in JavaScript/TypeScript, RESTful APIs with
            Express, and frontends with React.
          </p>
          <div className="skills-list">
            {skills.slice(0, 6).map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </div>
      </section>

      <section id="about">
        <h2>About</h2>
        <div className="card">
          <p className="muted">
            jxtnz is a builder focused on practical solutions. Recent work spans
            APIs with Express/TypeORM, frontends with React, and monitoring
            tooling. Collaboration, code quality, and thoughtful UX are the
            guiding principles.
          </p>
        </div>
      </section>

      <section id="projects" className="projects">
        <h2>Projects</h2>
        {loadingProjects && <p className="muted">Loading latest repos…</p>}
        {projectError && <p className="muted">{projectError}</p>}
        {!loadingProjects && !projectError && (
          <div className="grid">
            {projects.map((project) => (
              <a
                href={project.url}
                key={project.id}
                target="_blank"
                rel="noreferrer"
              >
                <div className="card">
                  <strong>{project.name}</strong>
                  <p className="muted">
                    {project.description || "No description provided."}
                  </p>
                  <div className="project-meta muted">
                    <span>{project.language || "N/A"}</span>
                    <span>★ {project.stars}</span>
                  </div>
                  <p className="muted">
                    Updated: {new Date(project.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </a>
            ))}
          </div>
        )}
      </section>

      <section id="skills">
        <h2>Skills</h2>
        <div className="card">
          <p className="muted">
            Focused on shipping reliable, maintainable code across the stack.
          </p>
          <div className="skills-list">
            {skills.map((skill) => (
              <span key={skill}>{skill}</span>
            ))}
          </div>
        </div>
      </section>

      <footer>Built with React, Express, and Flowise.</footer>

      {/* Floating chatbot widget on home page */}
      <button
        className="chat-fab"
        type="button"
        onClick={() => setIsChatOpen((open) => !open)}
      >
        💬
      </button>

      {isChatOpen && (
        <div className="chat-widget">
          <div className="chat-widget-header">
            <div>
              <div className="chat-widget-title">Portfolio Assistant</div>
              <div className="chat-widget-subtitle">
                Ask about projects, skills, and this portfolio.
              </div>
            </div>
            <button
              type="button"
              className="chat-widget-close"
              onClick={() => setIsChatOpen(false)}
            >
              ✕
            </button>
          </div>
          <div className="chat-log">
            {chatLog.length === 0 && (
              <p className="muted">
                Hello! I&apos;m Justin Morales&apos; portfolio assistant. What would
                you like to know?
              </p>
            )}
            {chatLog.map((entry, idx) => (
              <div className="chat-message" key={`${entry.role}-${idx}`}>
                <strong>{entry.role === "you" ? "You" : "Assistant"}</strong>
                <span>{entry.text}</span>
              </div>
            ))}
          </div>
          <textarea
            placeholder="Ask about tech stack, projects, skills, system architecture..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <div className="chat-actions">
            <button onClick={sendMessage} disabled={sending}>
              {sending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

