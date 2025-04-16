import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const USERS_PER_PAGE = 10;

const UserList = ({ users }) => {
  const [userList, setUserList] = useState(users);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState({});
  const [filterRole, setFilterRole] = useState("");
  const [sortBy, setSortBy] = useState({ field: "id", order: "asc" });
  const [currentPage, setCurrentPage] = useState(1);

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
      setCurrentPage(1); // reset to page 1 after reload
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

  const handleSort = (field) => {
    setSortBy((prev) => ({
      field,
      order: prev.field === field && prev.order === "asc" ? "desc" : "asc",
    }));
  };

  const handleFilterByRole = () => {
    if (!filterRole) return;
    const filtered = users.filter((user) => user.role.name === filterRole);
    setUserList(filtered);
    setCurrentPage(1);
  };

  const sortedUsers = [...userList].sort((a, b) => {
    const { field, order } = sortBy;
    if (field === "role") {
      return order === "asc"
        ? a.role.name.localeCompare(b.role.name)
        : b.role.name.localeCompare(a.role.name);
    }
    if (field === "id") {
      return order === "asc" ? a.id - b.id : b.id - a.id;
    }
    return 0;
  });

  const totalPages = Math.ceil(sortedUsers.length / USERS_PER_PAGE);
  const startIdx = (currentPage - 1) * USERS_PER_PAGE;
  const currentUsers = sortedUsers.slice(startIdx, startIdx + USERS_PER_PAGE);

  return (
    <div className="admin-section">
      <h3>👥 Lista użytkowników</h3>

      <div style={{ marginBottom: "1rem" }}>
        <label>Filtruj według roli: </label>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value)}
        >
          <option value="">-- Wybierz rolę --</option>
          {roles.map((role) => (
            <option key={role.name} value={role.name}>
              {role.name}
            </option>
          ))}
        </select>
        <button onClick={handleFilterByRole}>Pokaż użytkowników z rolą</button>
        <button onClick={fetchUsers} style={{ marginLeft: "1rem" }}>
          🔄 Pokaż wszystkich
        </button>
      </div>

      <table>
        <thead>
          <tr>
            <th>
              ID{" "}
              <button onClick={() => handleSort("id")}>
                {sortBy.field === "id"
                  ? sortBy.order === "asc"
                    ? "⬆️"
                    : "⬇️"
                  : "↕️"}
              </button>
            </th>
            <th>E-mail</th>
            <th>
              Rola{" "}
              <button onClick={() => handleSort("role")}>
                {sortBy.field === "role"
                  ? sortBy.order === "asc"
                    ? "⬆️"
                    : "⬇️"
                  : "↕️"}
              </button>
            </th>
            <th>Akcje</th>
          </tr>
        </thead>
        <tbody>
          {currentUsers.map((user) => (
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
                        marginLeft: "5px",
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

      {/* Pagination */}
      <div style={{ marginTop: "1rem" }}>
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          ⬅️ Poprzednia
        </button>
        <span style={{ margin: "0 10px" }}>
          Strona {currentPage} z {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Następna ➡️
        </button>
      </div>
    </div>
  );
};

export default UserList;
