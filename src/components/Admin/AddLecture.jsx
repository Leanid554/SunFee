import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const AddLecture = ({ blocks, lectures, setLectures, addLectureToState }) => {
  const [newLecture, setNewLecture] = useState({ blockId: "", title: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addLecture = async () => {
    if (!newLecture.blockId || newLecture.title.trim() === "") return;

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE_URL}/lectures`, {
        title: newLecture.title,
        blockId: parseInt(newLecture.blockId),
      });

      addLectureToState(response.data);
      setNewLecture({ blockId: "", title: "" });
    } catch (err) {
      setError("Błąd podczas dodawania lekcji");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-section">
      <h3>📖 Dodaj wykład</h3>

      {error && <p style={{ color: "red" }}>{error}</p>}

      <select
        value={newLecture.blockId}
        onChange={(e) =>
          setNewLecture({ ...newLecture, blockId: e.target.value })
        }
      >
        <option value="">Wybierz blok</option>
        {blocks.length > 0 ? (
          blocks.map((block) => (
            <option key={block.id} value={block.id}>
              {block.title}
            </option>
          ))
        ) : (
          <option disabled>Ładowanie bloków...</option>
        )}
      </select>

      <input
        type="text"
        placeholder="Tytuł wykładu"
        value={newLecture.title}
        onChange={(e) =>
          setNewLecture({ ...newLecture, title: e.target.value })
        }
      />

      <button onClick={addLecture} disabled={loading}>
        {loading ? "Tworzenie..." : "➕ Dodać"}
      </button>
    </div>
  );
};

export default AddLecture;
