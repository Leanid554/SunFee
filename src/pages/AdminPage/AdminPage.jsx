import React, { useState, useEffect } from "react";
import axios from "axios";
import AddBlock from "../../components/Admin/AddBlock";
import AddLecture from "../../components/Admin/AddLecture";
import AddUser from "../../components/Admin/AddUser";
import UserList from "../../components/Admin/UserList";
import UploadVideo from "../../components/Admin/UploadVideo";
import QuestionVideo from "../../components/Admin/QuestionVideo.jsx";
import VideoQuestEdit from "../../components/Admin/VideoQuestEdit.jsx";
import UserStats from "../../components/Admin/UserStats";
import UtworzTest from "../../components/Admin/UtworzTest";
import TestQuestion from "../../components/Admin/TestQuestion";
import TestQuestionEdit from "../../components/Admin/TestQuestionEdit";
import UserPassword from "../../components/Admin/UserPassword.jsx";
import UpdateUserStanowisko from "../../components/Admin/UpdateUserStanowisko.jsx";
import "./index.scss";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const AdminPage = () => {
  const [blocks, setBlocks] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [users, setUsers] = useState([]);
  const [testList, setTestList] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [roleBlocks, setRoleBlocks] = useState([]);
  const [hardestLectureByBlock, setHardestLectureByBlock] = useState({});
  const [hardestBlock, setHardestBlock] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("content");
  const [selectedLectureId, setSelectedLectureId] = useState(null);
  const [selectedBlockTestId, setSelectedBlockTestId] = useState(null);
  const [editingTestId, setEditingTestId] = useState(null);
  const [blocksVisible, setBlocksVisible] = useState(false);
  const [lecturesVisible, setLecturesVisible] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchBlocks();
    fetchLectures();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      setUsers(response.data);
    } catch (error) {
      alert("Błąd podczas pobierania użytkowników");
    }
  };

  const fetchBlocks = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/blocks`);
      setBlocks(response.data);
      fetchTests(response.data);
    } catch (error) {
      alert("Błąd podczas odbierania bloków");
    }
  };

  const fetchLectures = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/lectures`);
      setLectures(response.data);
    } catch (error) {
      alert("Nie udało się otrzymać lekcji");
    }
  };

  const fetchTests = async (blocks) => {
    try {
      const tests = [];
      for (const block of blocks) {
        try {
          const response = await axios.get(
            `${API_BASE_URL}/block-test/${block.id}`
          );
          if (response.data) {
            tests.push(response.data);
          }
        } catch (error) {}
      }
      setTestList(tests);
    } catch (error) {
      alert("Błąd przy pobieraniu testów");
    }
  };

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

  useEffect(() => {
    if (!selectedRole) {
      setRoleBlocks([]);
      setHardestBlock(null);
      return;
    }

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

        setRoleBlocks(blocksRes.data || []);
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

  const deleteLecture = async (lectureId) => {
    try {
      await axios.delete(`${API_BASE_URL}/lectures/${lectureId}`);
      setLectures(lectures.filter((lecture) => lecture.id !== lectureId));
      alert("Lekcja usunięta");
    } catch (error) {
      alert("Błąd przy usunięciu lekcji");
    }
  };

  const deleteBlock = async (blockId) => {
    try {
      await axios.delete(`${API_BASE_URL}/blocks/${blockId}`);
      setBlocks(blocks.filter((block) => block.id !== blockId));
      alert("Blok został pomyślnie usunięty");
    } catch (error) {
      alert("Błąd przy usunięciu bloku");
    }
  };

  const getBlockTitle = (blockId) => {
    const block = blocks.find((block) => block.id === blockId);
    return block ? block.title : "Nieznany blok";
  };

  const addTestToList = (test) => {
    setTestList((prevTestList) => [...prevTestList, test]);
  };

  const addLectureToState = (newLecture) => {
    setLectures((prevLectures) => [...prevLectures, newLecture]);
  };

  const handleRoleChange = (event) => {
    setSelectedRole(event.target.value);
    setRoleBlocks([]);
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

  const renderContentManagement = () => (
    <div className="content-management">
      <h3>🛠 Dodawanie treści</h3>
      <div className="management-section">
        <div className="component-container">
          <AddBlock blocks={blocks} setBlocks={setBlocks} />
        </div>
        <div className="component-container">
          <AddLecture
            blocks={blocks}
            lectures={lectures}
            setLectures={setLectures}
            addLectureToState={addLectureToState}
          />
        </div>
      </div>

      <h3>📦 Zarządzanie blokami</h3>
      <div className="management-section">
        <div className="component-container">
          <button
            onClick={() => setBlocksVisible(!blocksVisible)}
            className="toggle-btn"
          >
            {blocksVisible ? "Ukryj" : "Pokaż"}
          </button>
        </div>
        {blocksVisible && (
          <div className="component-container">
            {blocks.length > 0 ? (
              <ul className="item-list">
                {blocks.map((block) => (
                  <li key={block.id} className="item">
                    <span>
                      {block.title} (ID: {block.id})
                    </span>
                    <button
                      onClick={() => deleteBlock(block.id)}
                      className="delete-btn"
                    >
                      Usuń
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p>Brak bloków</p>
            )}
          </div>
        )}
      </div>

      <h3>📚 Zarządzanie wykładami</h3>
      <div className="management-section">
        <div className="component-container">
          <button
            onClick={() => setLecturesVisible(!lecturesVisible)}
            className="toggle-btn"
          >
            {lecturesVisible ? "Ukryj" : "Pokaż"}
          </button>
        </div>
        {lecturesVisible && (
          <div className="component-container">
            {lectures.length > 0 ? (
              <ul className="item-list">
                {lectures.map((lecture) => (
                  <li key={lecture.id} className="item">
                    <button
                      onClick={() =>
                        setSelectedLectureId(
                          selectedLectureId === lecture.id ? null : lecture.id
                        )
                      }
                      className="toggle-btn"
                    >
                      {selectedLectureId === lecture.id ? "Ukryj" : "Pokaż"}{" "}
                      {lecture.title}
                    </button>
                    {selectedLectureId === lecture.id && (
                      <div className="lecture-details component-container">
                        <p>
                          <strong>{lecture.title}</strong> (ID: {lecture.id}) |
                          Blok: {getBlockTitle(lecture.blockId)}
                        </p>
                        <div className="lecture-actions">
                          <div className="component-container">
                            <button
                              onClick={() => deleteLecture(lecture.id)}
                              className="delete-btn"
                            >
                              Usuń
                            </button>
                          </div>
                          <div className="component-container">
                            <UploadVideo lectureId={lecture.id} />
                          </div>
                          <div className="component-container">
                            <QuestionVideo lectureId={lecture.id} />
                          </div>
                          <div className="component-container">
                            <VideoQuestEdit lectureId={lecture.id} />
                          </div>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p>Brak wykładów</p>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderUserManagement = () => (
    <div className="user-management">
      <h3>👤 Zarządzanie użytkownikami</h3>
      <div className="management-section">
        <div className="component-container">
        <AddUser
            users={users}
            setUsers={setUsers}
            roles={roles}
            setRoles={setRoles}
          />
        </div>
        <div className="component-container">
          <UpdateUserStanowisko users={users} setUsers={setUsers} />
        </div>
        <div className="component-container">
          <h4>Lista użytkowników (Doradca Energetyczny)</h4>
          <UserList
            users={users.filter(
              (user) => user.role.name === "Doradca Energetyczny"
            )}
          />
        </div>
        <div className="component-container">
          <h4>Zarządzanie hasłami</h4>
          <UserPassword users={users} />
        </div>
      </div>
    </div>
  );

  const renderTestManagement = () => (
    <div className="test-management">
      <h3>📝 Zarządzanie testami</h3>
      <div className="management-section">
        <div className="component-container">
          <h4>Utwórz nowy test</h4>
          <UtworzTest
            blocks={blocks}
            setSelectedBlockTestId={setSelectedBlockTestId}
            addTestToList={addTestToList}
          />
        </div>
        <div className="component-container">
          <h4>Wybierz blok</h4>
          <div className="select-container">
            <select
              onChange={(e) => {
                setSelectedBlockTestId(e.target.value);
                setEditingTestId(null);
              }}
              value={selectedBlockTestId || ""}
            >
              <option value="">Wybierz blok</option>
              {blocks.length > 0 ? (
                blocks.map((block) => (
                  <option key={block.id} value={block.id}>
                    {block.title} (ID: {block.id})
                  </option>
                ))
              ) : (
                <option value="">Brak dostępnych bloków</option>
              )}
            </select>
          </div>
        </div>

        {selectedBlockTestId && (
          <div className="component-container">
            <h4>Wybierz test</h4>
            <div className="select-container">
              <select
                onChange={(e) => setEditingTestId(e.target.value)}
                value={editingTestId || ""}
              >
                <option value="">Wybierz test</option>
                {testList.filter(
                  (test) => test.blockId === Number(selectedBlockTestId)
                ).length > 0 ? (
                  testList
                    .filter(
                      (test) => test.blockId === Number(selectedBlockTestId)
                    )
                    .map((test) => {
                      const block = blocks.find((b) => b.id === test.blockId);
                      const blockTitle = block ? block.title : "Nieznany blok";
                      return (
                        <option key={test.id} value={test.id}>
                          Test dla bloku "{blockTitle}" - {test.title} (ID:{" "}
                          {test.id})
                        </option>
                      );
                    })
                ) : (
                  <option value="">
                    Brak dostępnych testów dla wybranego bloku
                  </option>
                )}
              </select>
            </div>
          </div>
        )}

        {selectedBlockTestId && editingTestId && (
          <div className="test-edit-section">
            <div className="component-container">
              <h4>Dodawanie pytań</h4>
              <TestQuestion
                blockId={selectedBlockTestId}
                testId={editingTestId}
              />
            </div>
            <div className="component-container">
              <h4>Edycja pytań testu</h4>
              <TestQuestionEdit
                blockId={selectedBlockTestId}
                testId={editingTestId}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStatsManagement = () => (
    <div className="stats-management">
      <div className="management-section">
        <div className="component-container">
          <UserStats users={users} />
        </div>
      </div>

      <h3>📈 Statystyki lekcji i bloków</h3>
      <div className="management-section">
        <div className="component-container">
          <div className="role-selector component-container">
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
        </div>

        {error && (
          <div className="component-container">
            <h4>Błąd</h4>
            <div className="error-message">{error}</div>
          </div>
        )}
        {loading && (
          <div className="component-container">
            <h4>Ładowanie</h4>
            <div className="loading">Ładowanie...</div>
          </div>
        )}

        {selectedRole && !loading && roleBlocks.length > 0 ? (
          <div className="component-container">
            <h4>Bloki dla roli: {selectedRole}</h4>
            <div className="blocks-list">
              <ul className="item-list">
                {roleBlocks.map((block) => (
                  <li
                    key={block.id}
                    onClick={() => handleBlockClick(block.id)}
                    className="block-item component-container"
                  >
                    <h5>{block.title}</h5>
                    {hardestLectureByBlock[block.id] && (
                      <div className="hardest-lecture">
                        <h6>Najtrudniejsza lekcja</h6>
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
                          <div className="component-container">
                            <p>
                              <strong>Najwięcej prób:</strong>
                            </p>
                            <p>
                              Użytkownik:{" "}
                              {hardestLectureByBlock[block.id].topUser.name}
                            </p>
                            <p>
                              Email:{" "}
                              {hardestLectureByBlock[block.id].topUser.email}
                            </p>
                            <p>
                              Próby:{" "}
                              {hardestLectureByBlock[block.id].topUser.attempts}
                            </p>
                          </div>
                        ) : (
                          <div className="component-container">
                            <p>
                              Brak danych o użytkowniku z największą liczbą prób
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          !loading &&
          selectedRole && (
            <div className="component-container">
              <h4>Brak danych</h4>
              <p>Brak bloków dla wybranej roli</p>
            </div>
          )
        )}

        {selectedRole && hardestBlock && (
          <div className="component-container hardest-block-container">
            <h4>🔥 Najtrudniejszy blok dla roli: {selectedRole}</h4>
            <p>
              <strong>Tytuł:</strong> {hardestBlock.title}
            </p>
            <p>
              <strong>Całkowita liczba prób:</strong>{" "}
              {hardestBlock.totalAttempts}
            </p>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="admin-page">
      <h2>📌 Panel Administratora</h2>
      <div className="tabs">
        <button
          className={activeTab === "content" ? "active" : ""}
          onClick={() => setActiveTab("content")}
        >
          Treści
        </button>
        <button
          className={activeTab === "users" ? "active" : ""}
          onClick={() => setActiveTab("users")}
        >
          Użytkownicy
        </button>
        <button
          className={activeTab === "tests" ? "active" : ""}
          onClick={() => setActiveTab("tests")}
        >
          Testy
        </button>
        <button
          className={activeTab === "stats" ? "active" : ""}
          onClick={() => setActiveTab("stats")}
        >
          Statystyki
        </button>
      </div>

      <div className="tab-content">
        {activeTab === "content" && renderContentManagement()}
        {activeTab === "users" && renderUserManagement()}
        {activeTab === "tests" && renderTestManagement()}
        {activeTab === "stats" && renderStatsManagement()}
      </div>
    </div>
  );
};

export default AdminPage;