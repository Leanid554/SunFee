import React, { useState, useEffect } from "react";
import axios from "axios";
import UserStats from "../../components/Admin/UserStats";
import "./RksPage.scss";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const RksPage = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [users, setUsers] = useState([]);
  const [hardestLectureByBlock, setHardestLectureByBlock] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${API_BASE_URL}/roles/all`);
        setRoles(response.data || []);
      } catch (err) {
        setError("Błąd podczas ładowania ról");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchRoles();
  }, []);

  useEffect(() => {
    if (!selectedRole) return;

    const fetchBlocksByRole = async () => {
      try {
        setLoading(true);
        const response = await axios.post(`${API_BASE_URL}/blocks/role`, {
          roleName: selectedRole,
        });
        setBlocks(response.data || []);
        setHardestLectureByBlock({});
      } catch (err) {
        setError("Błąd podczas ładowania bloków");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlocksByRole();
  }, [selectedRole]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users`);
        setUsers(response.data || []);
      } catch (err) {
        console.error("Błąd podczas ładowania użytkowników", err);
      }
    };

    fetchUsers();
  }, []);

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
    setBlocks([]);
    setHardestLectureByBlock({});
    setError(null);
  };

  const handleBlockClick = async (blockId) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get(
        `${API_BASE_URL}/lectures/hardest/block/${blockId}`
      );
      setHardestLectureByBlock((prev) => ({
        ...prev,
        [blockId]: response.data,
      }));
    } catch (err) {
      setError(err.response.data.message);
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rks-page">
      <div className="user-stats">
        <h2>Statystyki użytkowników</h2>
        <UserStats users={users} />
      </div>

      <h1>Bloki według ról</h1>

      <div className="role-selector">
        <label htmlFor="role-select">Wybierz rolę: </label>
        <select
          id="role-select"
          value={selectedRole}
          onChange={handleRoleChange}
          disabled={loading || roles.length === 0}
        >
          <option value="">-- Wybierz rolę --</option>
          {roles.map((role) => (
            <option key={role.id} value={role.name}>
              {role.name}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && <div className="loading">Ładowanie...</div>}

      {selectedRole && !loading && blocks.length > 0 ? (
        <div className="blocks-list">
          <h2>Bloki dla roli: {selectedRole}</h2>
          <ul>
            {blocks.map((block) => (
              <li
                key={block.id}
                onClick={() => handleBlockClick(block.id)}
                className="block-item"
              >
                <h3>{block.title}</h3>
                {hardestLectureByBlock[block.id] && (
                  <div className="hardest-lecture">
                    <h4>Najtrudniejsza lekcja</h4>
                    <p>
                      <strong>Tytuł:</strong>{" "}
                      {hardestLectureByBlock[block.id].title}
                    </p>
                    <p>
                      <strong>Całkowita liczba prób:</strong>{" "}
                      {hardestLectureByBlock[block.id].totalAttempts}
                    </p>
                    <p>
                      <strong>Średnia liczba prób:</strong>{" "}
                      {hardestLectureByBlock[block.id].averageAttempts}
                    </p>
                    {hardestLectureByBlock[block.id].topUser ? (
                      <div>
                        <p>
                          <strong>Najwięcej prób:</strong>
                        </p>
                        <p>
                          Użytkownik:{" "}
                          {hardestLectureByBlock[block.id].topUser.name}
                        </p>
                        <p>
                          Email: {hardestLectureByBlock[block.id].topUser.email}
                        </p>
                        <p>
                          Próby:{" "}
                          {hardestLectureByBlock[block.id].topUser.attempts}
                        </p>
                      </div>
                    ) : (
                      <p>Brak danych o użytkowniku z największą liczbą prób</p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        !loading && selectedRole && <div>Brak bloków dla wybranej roli</div>
      )}
    </div>
  );
};

export default RksPage;
