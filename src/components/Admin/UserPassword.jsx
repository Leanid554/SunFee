import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const UserPassword = ({ users, onPasswordChange }) => {
  const [selectedUserId, setSelectedUserId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (users.length > 0 && !selectedUserId) {
      setSelectedUserId(users[0].id);
    }
  }, [users]);

  const handlePasswordChange = async () => {
    setSuccess("");

    if (newPassword !== confirmPassword) {
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

      setSuccess("Hasło zostało pomyślnie zmienione!");
      setNewPassword("");
      setConfirmPassword("");
      onPasswordChange();
    } catch (err) {
      console.error("Request error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h4>Zmiana hasła</h4>

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

      <input
        type="password"
        placeholder="Nowe hasło"
        value={newPassword}
        onChange={(e) => {
          setNewPassword(e.target.value);
          setSuccess("");
        }}
        disabled={loading}
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

      {success && <p style={{ color: "green" }}>{success}</p>}

      <button onClick={handlePasswordChange} disabled={loading}>
        {loading ? "Zmiana..." : "Zmień hasło"}
      </button>
    </div>
  );
};

export default UserPassword;
