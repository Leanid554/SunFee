import React, { useState, useEffect } from "react";
import axios from "axios";
import AddBlock from "../../components/Admin/AddBlock";
import AddLecture from "../../components/Admin/AddLecture";
import AddUser from "../../components/Admin/AddUser";
import UserList from "../../components/Admin/UserList";
import UploadVideo from "../../components/Admin/UploadVideo";
import QuestionVideo from "../../components/Admin/QuestionVideo.jsx";
import VideoQuestEdit from "../../components/Admin/VideoQuestEdit.jsx"; // Добавил новый компонент
import UserStats from "../../components/Admin/UserStats";
import UtworzTest from "../../components/Admin/UtworzTest";
import TestQuestion from "../../components/Admin/TestQuestion";
import TestQuestionEdit from "../../components/Admin/TestQuestionEdit";
import "./index.scss";
import UserPassword from "../../components/Admin/UserPassword.jsx";

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

  useEffect(() => {
    fetchUsers();
    fetchBlocks();
    fetchLectures();
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
          addLectureToState={addLectureToState} // Добавлено для обновления лекций
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
                      <VideoQuestEdit lectureId={lecture.id} />{" "}
                      {/* Новый компонент */}
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
      </div>
    </div>
  );
};

export default AdminPage;
