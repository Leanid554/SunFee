import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const UserPassword = ({ users, onPasswordChange }) => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (users.length > 0 && !selectedUserId) {
      setSelectedUserId(users[0].id);
    }
  }, [users]);

  const handlePasswordChange = async () => {
    setSuccess("");

    if (newPassword !== confirmPassword) {
      alert("Hasła się nie zgadzają!");
      return;
    }

    try {
      setLoading(true);

      const response = await axios.put(
        `${API_BASE_URL}/users/${selectedUserId}/password`,
        {
          password: newPassword,
        }
      );

      console.log("Server response:", response);

      setSuccess("✅ Hasło zostało pomyślnie zmienione!");
      setNewPassword("");
      setConfirmPassword("");
      onPasswordChange();
    } catch (err) {
      console.error("Request error:", err);
      alert("❌ Wystąpił błąd podczas zmiany hasła");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: "1rem" }}>
      <button onClick={() => setVisible((prev) => !prev)}>
        {visible ? "🔽 Ukryj zmianę hasła" : "🔒 Zmień hasło użytkownika"}
      </button>

      {visible && (
        <div style={{ marginTop: "1rem", border: "1px solid #ccc", padding: "1rem", borderRadius: "8px" }}>
          <h4>Zmiana hasła</h4>

          <div style={{ marginBottom: "0.5rem" }}>
            <label>Użytkownik: </label>
            <select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              disabled={loading || users.length === 0}
            >
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.email || user.username || `Użytkownik ${user.id}`}
                </option>
              ))}
            </select>
          </div>

          <div>
            <input
              type="password"
              placeholder="Nowe hasło"
              value={newPassword}
              onChange={(e) => {
                setNewPassword(e.target.value);
                setSuccess("");
              }}
              disabled={loading}
              style={{ marginRight: "0.5rem" }}
            />
            <input
              type="password"
              placeholder="Potwierdź hasło"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                setSuccess("");
              }}
              disabled={loading}
            />
          </div>

          {success && <p style={{ color: "green", marginTop: "0.5rem" }}>{success}</p>}

          <button
            onClick={handlePasswordChange}
            disabled={loading || !newPassword || !confirmPassword}
            style={{ marginTop: "0.5rem" }}
          >
            {loading ? "Zmiana..." : "Zmień hasło"}
          </button>
        </div>
      )}
    </div>
  );
};

export default UserPassword;
