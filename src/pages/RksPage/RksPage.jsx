import React, { useState, useEffect } from "react";
import axios from "axios";
import UserStats from "../../components/Admin/UserStats";
import "./RksPage.scss";
import UpdateUserStanowisko from "../../components/Admin/UpdateUserStanowisko.jsx";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const RksPage = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [blocks, setBlocks] = useState([]);
  const [users, setUsers] = useState([]);
  const [hardestLectureByBlock, setHardestLectureByBlock] = useState({});
  const [hardestBlock, setHardestBlock] = useState(null);
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

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [blocksRes, hardestBlockRes] = await Promise.all([
          axios.post(`${API_BASE_URL}/blocks/role`, {
            roleName: selectedRole,
          }),
          axios.post(`${API_BASE_URL}/blocks/most-difficult/role`, {
            roleName: selectedRole,
          }),
        ]);

        setBlocks(blocksRes.data || []);
        setHardestLectureByBlock({});
        setHardestBlock(hardestBlockRes.data || null);
      } catch (err) {
        setError("Błąd podczas ładowania bloków lub najtrudniejszego bloku");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
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
    setHardestBlock(null);
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
      setError(err.response?.data?.message || "Błąd podczas ładowania lekcji");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rks-page">
      <div className="user-stats">
        <h2>📊 Statystyki użytkowników</h2>
        <UserStats users={users} />
      </div>
      <div className="component-container">
          <UpdateUserStanowisko users={users} setUsers={setUsers} />
        </div>

      <div className="role-selector">
        <h2>📚 Statystyki lekcji i bloków</h2>
        <label htmlFor="role-select">Wybierz rolę:</label>
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

      {selectedRole && hardestBlock && (
        <div className="hardest-block-container">
          <h2>🔥 Najtrudniejszy blok dla roli: {selectedRole}</h2>
          <p><strong>Tytuł:</strong> {hardestBlock.title}</p>
          <p><strong>Całkowita liczba prób:</strong> {hardestBlock.totalAttempts}</p>
        </div>
      )}

      {selectedRole && !loading && blocks.length > 0 ? (
        <div className="blocks-list">
          <h3>📦 Bloki dla roli: {selectedRole}</h3>
          <ul>
            {blocks.map((block) => (
              <li
                key={block.id}
                onClick={() => handleBlockClick(block.id)}
                className="block-item"
              >
                <h4>{block.title}</h4>
                {hardestLectureByBlock[block.id] && (
                  <div className="hardest-lecture">
                    <h5>📘 Najtrudniejsza lekcja</h5>
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
                        <p><strong>Użytkownik z największą liczbą prób:</strong></p>
                        <p>Imię: {hardestLectureByBlock[block.id].topUser.name}</p>
                        <p>Email: {hardestLectureByBlock[block.id].topUser.email}</p>
                        <p>Próby: {hardestLectureByBlock[block.id].topUser.attempts}</p>
                      </div>
                    ) : (
                      <p>Brak danych o użytkowniku</p>
                    )}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        !loading &&
        selectedRole && <div>Brak bloków dla wybranej roli</div>
      )}
    </div>
  );
};

export default RksPage;
