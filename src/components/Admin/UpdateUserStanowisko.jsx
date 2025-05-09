import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const stanowiskoOptions = [
  "Konsultant ds. Umawiania Spotkań",
  "Doradca ds. Bezpośrednich Spotkań",
  "Młodszy Doradca Energetyczny",
  "Doradca Energetyczny",
];

const UpdateUserStanowisko = ({ users, setUsers }) => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [stanowisko, setStanowisko] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpdateStanowisko = async () => {
    if (!selectedUserId || !stanowisko) {
      setError("Wybierz użytkownika i stanowisko");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await axios.put(`${API_BASE_URL}/users/${selectedUserId}/stanowisko`, {
        stanowisko,
      });
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === parseInt(selectedUserId) ? { ...user, stanowisko } : user
        )
      );
      alert("Stanowisko zaktualizowane pomyślnie");
      setSelectedUserId("");
      setStanowisko("");
    } catch (err) {
      setError("Błąd podczas aktualizacji stanowiska");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-stanowisko component-container">
      <h4>
        Zaktualizuj stanowisko użytkownika (Opcja tylko dla Doradców
        Energetycznych)
      </h4>
      <div className="select-container">
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          disabled={loading}
        >
          <option value="">Wybierz użytkownika</option>
          {users
            .filter((user) => user.role.name === "Doradca Energetyczny")
            .map((user) => (
              <option key={user.id} value={user.id}>
                {user.email} (ID: {user.id}, Stanowisko: {user.stanowisko})
              </option>
            ))}
        </select>
      </div>

      <div className="select-container">
        <select
          value={stanowisko}
          onChange={(e) => setStanowisko(e.target.value)}
          disabled={loading}
        >
          <option value="">Wybierz nowe stanowisko</option>
          {stanowiskoOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        onClick={handleUpdateStanowisko}
        disabled={loading}
        className="update-btn"
      >
        {loading ? "Aktualizowanie..." : "Zaktualizuj"}
      </button>
    </div>
  );
};

export default UpdateUserStanowisko;
