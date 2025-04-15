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
import "./index.scss";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const AdminPage = () => {
  const [blocks, setBlocks] = useState([]);
  const [lectures, setLectures] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedLectureId, setSelectedLectureId] = useState(null);
  const [lecturesVisible, setLecturesVisible] = useState(false);
  const [blocksVisible, setBlocksVisible] = useState(false);
  const [usersVisible, setUsersVisible] = useState(false);
  const [statsVisible, setStatsVisible] = useState(false);
  const [testManagementVisible, setTestManagementVisible] = useState(false);
  const [testList, setTestList] = useState([]);
  const [selectedBlockTestId, setSelectedBlockTestId] = useState(null);
  const [editingTestId, setEditingTestId] = useState(null);
  const [selectedBlockId, setSelectedBlockId] = useState(null);

  // Новые состояния для статистики блоков
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState("");
  const [roleBlocks, setRoleBlocks] = useState([]);
  const [hardestLectureByBlock, setHardestLectureByBlock] = useState({});
  const [blockStatsVisible, setBlockStatsVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
    if (!selectedRole) return;

    const fetchBlocksByRole = async () => {
      try {
        setLoading(true);
        const response = await axios.post(`${API_BASE_URL}/blocks/role`, {
          roleName: selectedRole,
        });
        setRoleBlocks(response.data || []);
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
    <div className="admin-page">
      <h2>📌 Panel administratora</h2>

      <div className="dodawanie-container">
        <h3>🛠 Uzupełnienie</h3>
        <AddBlock blocks={blocks} setBlocks={setBlocks} />
        <AddLecture
          blocks={blocks}
          lectures={lectures}
          setLectures={setLectures}
          addLectureToState={addLectureToState}
        />
      </div>

      <div className="zarzadzanie-container">
        <h3>⚙ Zarządzanie</h3>
        <div className="admin-section">
          <h3>📦 Bloki</h3>
          <button onClick={() => setBlocksVisible(!blocksVisible)}>
            {blocksVisible ? "Ukryj" : "Pokaz"}
          </button>
          {blocksVisible && blocks.length > 0 && (
            <ul>
              {blocks.map((block) => (
                <li key={block.id}>
                  <strong>{block.title}</strong> (ID: {block.id})
                  <button onClick={() => deleteBlock(block.id)}>Usuń</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="admin-section">
          <h3>📚 Wykłady</h3>
          <button onClick={() => setLecturesVisible(!lecturesVisible)}>
            {lecturesVisible ? "Ukryj" : "Pokaz"}
          </button>
          {lecturesVisible && lectures.length > 0 && (
            <ul>
              {lectures.map((lecture) => (
                <li key={lecture.id}>
                  <button
                    onClick={() =>
                      setSelectedLectureId(
                        selectedLectureId === lecture.id ? null : lecture.id
                      )
                    }
                  >
                    {selectedLectureId === lecture.id ? "Ukryj" : "Pokaz"}{" "}
                    {lecture.title}
                  </button>
                  {selectedLectureId === lecture.id && (
                    <div>
                      <strong>{lecture.title}</strong> (ID: {lecture.id}) |
                      Block: {getBlockTitle(lecture.blockId)}
                      <button onClick={() => deleteLecture(lecture.id)}>
                        Usuń
                      </button>
                      <UploadVideo lectureId={lecture.id} />
                      <QuestionVideo lectureId={lecture.id} />
                      <VideoQuestEdit lectureId={lecture.id} />
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="admin-section">
          <h3>👤 Użytkowniki</h3>
          <button onClick={() => setUsersVisible(!usersVisible)}>
            {usersVisible ? "Ukryj" : "Pokaz"}
          </button>
          {usersVisible && <UserList users={users} />}
          {usersVisible && <UserPassword users={users} />}
        </div>
        <div className="admin-section">
          <h3>📊 Statystyki użytkownika</h3>
          <button onClick={() => setStatsVisible(!statsVisible)}>
            {statsVisible ? "Ukryj" : "Pokaz"}
          </button>
          {statsVisible && <UserStats users={users} />}
        </div>
        <div className="admin-section">
          <h3>📝 Testy</h3>
          <button
            onClick={() => setTestManagementVisible(!testManagementVisible)}
          >
            {testManagementVisible ? "Ukryj testy" : "Pokaz testy"}
          </button>
          {testManagementVisible && (
            <div>
              <UtworzTest
                blocks={blocks}
                setSelectedBlockTestId={setSelectedBlockTestId}
                addTestToList={addTestToList}
              />
              <div>
                <h4>Wybierz blok</h4>
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

              {selectedBlockTestId && (
                <div>
                  <h4>Wybierz test</h4>
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
                          const block = blocks.find(
                            (b) => b.id === test.blockId
                          );
                          const blockTitle = block
                            ? block.title
                            : "Nieznany blok";
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
              )}

              {selectedBlockTestId && editingTestId && (
                <div>
                  <h4>Dodawanie pytań</h4>
                  <TestQuestion
                    blockId={selectedBlockTestId}
                    testId={editingTestId}
                  />

                  <h4>Edycja pytań testu</h4>
                  <TestQuestionEdit
                    blockId={selectedBlockTestId}
                    testId={editingTestId}
                  />
                </div>
              )}
            </div>
          )}
        </div>
        {/* Новая секция для статистики блоков */}
        <div className="admin-section">
          <h3>📈 Statystyki bloków</h3>
          <button onClick={() => setBlockStatsVisible(!blockStatsVisible)}>
            {blockStatsVisible ? "Ukryj" : "Pokaz"}
          </button>
          {blockStatsVisible && (
            <div>
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

              {selectedRole && !loading && roleBlocks.length > 0 ? (
                <div className="blocks-list">
                  <h4>Bloki dla roli: {selectedRole}</h4>
                  <ul>
                    {roleBlocks.map((block) => (
                      <li
                        key={block.id}
                        onClick={() => handleBlockClick(block.id)}
                        className="block-item"
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
                              <div>
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
                                  {
                                    hardestLectureByBlock[block.id].topUser
                                      .attempts
                                  }
                                </p>
                              </div>
                            ) : (
                              <p>
                                Brak danych o użytkowniku z największą liczbą prób
                              </p>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;