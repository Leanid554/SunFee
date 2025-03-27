import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const UserList = ({ users }) => {
  const [userList, setUserList] = useState(users);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState({});

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/roles/all`);
        setRoles(response.data);
      } catch (error) {
        alert("Błąd przy pobieraniu ról");
      }
    };

    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      setUserList(response.data);
    } catch (error) {
      alert("Błąd przy pobieraniu użytkowników");
    }
  };

  useEffect(() => {
    const intervalId = setInterval(fetchUsers, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleBlockUser = async (userId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/roles/assign/${userId}/zablokowany`
      );
      if (response.status === 200) {
        alert("Użytkownik został zablokowany!");
        fetchUsers();
      }
    } catch (error) {
      alert("Błąd przy blokowaniu użytkownika");
    }
  };

  const handleUnblockUser = async (userId) => {
    const newRole = selectedRole[userId];

    try {
      const response = await axios.post(
        `${API_BASE_URL}/roles/assign/${userId}/${newRole}`
      );
      if (response.status === 200) {
        alert("Użytkownik został odblokowany i rola została zmieniona!");
        fetchUsers();
      }
    } catch (error) {
      alert("Błąd przy odblokowywaniu użytkownika");
    }
  };

  const handleRoleChange = (userId, role) => {
    setSelectedRole((prev) => ({
      ...prev,
      [userId]: role,
    }));
  };

  return (
    <div className="admin-section">
      <h3>👥 Lista użytkowników</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>E-mail</th>
            <th>Rola</th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {userList.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>{user.role.name}</td>
              <td>
                {user.role.name === "zablokowany" ? (
                  <div>
                    <select
                      value={selectedRole[user.id] || ""}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                    >
                      <option value="">Wybierz rolę</option>
                      {roles.map((role) => (
                        <option key={role.name} value={role.name}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleUnblockUser(user.id)}
                      style={{
                        backgroundColor: "green",
                        color: "white",
                        border: "none",
                        padding: "5px 10px",
                        cursor: "pointer",
                      }}
                    >
                      Odblokuj
                    </button>
                  </div>
                ) : (
                  <button onClick={() => handleBlockUser(user.id)}>
                    Zablokuj
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UserList;
