import React, { useState } from "react";
import axios from "axios";
import "./UserStats.css";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const ITEMS_PER_PAGE = 10;

const UserStats = ({ users }) => {
  const [selectedEmail, setSelectedEmail] = useState("");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [activeSection, setActiveSection] = useState(null);
  const [visitPage, setVisitPage] = useState(1);

  const fetchStats = async () => {
    if (!selectedEmail) {
      alert("Wybierz użytkownika!");
      return;
    }

    setLoading(true);
    setError(null);
    setStats(null);
    setActiveSection(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/user-stats`, {
        email: selectedEmail,
      });
      setStats(response.data);
    } catch (err) {
      setError("Nie udało się załadować statystyk.");
    } finally {
      setLoading(false);
    }
  };

  const paginatedVisits = stats?.visits?.slice(
    (visitPage - 1) * ITEMS_PER_PAGE,
    visitPage * ITEMS_PER_PAGE
  );

  const totalVisitPages = Math.ceil(
    (stats?.visits?.length || 0) / ITEMS_PER_PAGE
  );

  const SectionButton = ({ name, label }) => (
    <button
      className={activeSection === name ? "active" : ""}
      onClick={() => setActiveSection(activeSection === name ? null : name)}
    >
      {label}
    </button>
  );

  return (
    <div className="user-stats">
      <h3>📊 Statystyka użytkowników</h3>

      <label>
        Wybierz użytkownika:
        <select
          value={selectedEmail}
          onChange={(e) => setSelectedEmail(e.target.value)}
        >
          <option value="">-- Wybierz --</option>
          {users.map((user) => (
            <option key={user.id} value={user.email}>
              {user.email}
            </option>
          ))}
        </select>
      </label>

      <button onClick={fetchStats}>📩 Uzyskaj statystyki</button>

      {loading && <p>Ładowanie...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {stats && (
        <div className="stats-sections">
          <div className="section-buttons">
            <SectionButton name="visits" label="📅 Wizyty" />
            <SectionButton name="blocks" label="📦 Bloki" />
            <SectionButton name="tests" label="📝 Testy" />
            <SectionButton name="lectures" label="📚 Wykłady" />
          </div>

          {activeSection === "visits" && (
            <div className="section-content">
              <h4>
                📅 Wizyty (Strona {visitPage} z {totalVisitPages})
              </h4>
              <ul>
                {paginatedVisits.map((visit, index) => (
                  <li key={index}>
                    Wejście: {new Date(visit.entryTime).toLocaleString()} |
                    Wyjście:{" "}
                    {visit.exitTime
                      ? new Date(visit.exitTime).toLocaleString()
                      : "Nadal w systemie"}
                  </li>
                ))}
              </ul>
              {totalVisitPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => setVisitPage((p) => Math.max(p - 1, 1))}
                    disabled={visitPage === 1}
                  >
                    ⬅
                  </button>
                  <span>
                    Strona {visitPage} z {totalVisitPages}
                  </span>
                  <button
                    onClick={() =>
                      setVisitPage((p) => Math.min(p + 1, totalVisitPages))
                    }
                    disabled={visitPage === totalVisitPages}
                  >
                    ➡
                  </button>
                </div>
              )}
            </div>
          )}

          {activeSection === "blocks" && (
            <div className="section-content">
              <h4>📦 Bloki</h4>
              <ul>
                {stats.blockVisits.map((block) => (
                  <li key={block.blockId}>
                    {block.block.title} |{" "}
                    {block.completed ? "✅ Zdany" : "❌ Nie zdany"}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeSection === "tests" && (
            <div className="section-content">
              <h4>📝 Testy</h4>
              <ul>
                {stats.blockTestProgress.map((test) => (
                  <li key={test.blockTestId}>
                    {test.blockTest.block.title} -{" "}
                    {test.passed
                      ? `✅ Zdany (Próby: ${test.attempts})`
                      : `❌ Nie zdany (Próby: ${test.attempts})`}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeSection === "lectures" && (
            <div className="section-content">
              <h4>📚 Wykłady</h4>
              <ul>
                {stats.lectureProgress.map((progress) => (
                  <li key={progress.lectureId}>
                    {progress.lecture.title} -{" "}
                    {progress.passed ? "✅ Zaliczone" : "❌ Nie zaliczone"}{" "}
                    (Próby: {progress.attempts})
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UserStats;
