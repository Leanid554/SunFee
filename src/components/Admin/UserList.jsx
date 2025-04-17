import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";
const USERS_PER_PAGE = 10;

const UserList = ({ users = [] }) => {
  const [userList, setUserList] = useState(users);
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState({});
  const [filterRole, setFilterRole] = useState("");
  const [sortBy, setSortBy] = useState({ field: "createdAt", order: "asc" });
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/roles/all`);
        setRoles(response.data);
      } catch (error) {
        console.error("Error fetching roles:", error);
        alert("Błąd przy pobieraniu ról");
      }
    };

    fetchRoles();
  }, []);

  const fetchUsers = async (resetPage = false) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/users`);
      let updatedUserList = response.data;

      if (filterRole) {
        updatedUserList = updatedUserList.filter(
          (user) => user.role?.name === filterRole
        );
      }

      setUserList(updatedUserList);
      if (resetPage) {
        setCurrentPage(1);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      alert("Błąd przy pobieraniu użytkowników");
    }
  };

  useEffect(() => {
    fetchUsers();
    const intervalId = setInterval(() => fetchUsers(), 5000);
    return () => clearInterval(intervalId);
  }, [filterRole]);

  const handleBlockUser = async (userId) => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/roles/assign/${userId}/zablokowany`
      );
      if (response.status === 200) {
        alert("Użytkownik został zablokowany!");
        await fetchUsers();
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      alert("Błąd przy блокowaniu użytkownika");
    }
  };

  const handleUnblockUser = async (userId) => {
    const newRole = selectedRole[userId];
    if (!newRole) {
      alert("Proszę wybrać rolę przed odblokowaniem");
      return;
    }
    try {
      const response = await axios.post(
        `${API_BASE_URL}/roles/assign/${userId}/${newRole}`
      );
      if (response.status === 200) {
        alert("Użytkownik został odblokowany i rola została zmieniona!");
        await fetchUsers();
      }
    } catch (error) {
      console.error("Error unblocking user:", error);
      alert("Błąd przy odblokowywaniu użytkownika");
    }
  };

  const handleRoleChange = (userId, role) => {
    setSelectedRole((prev) => ({
      ...prev,
      [userId]: role,
    }));
  };

  const handleSort = () => {
    setSortBy((prev) => ({
      field: "createdAt",
      order: prev.order === "asc" ? "desc" : "asc",
    }));
  };

  const handleRoleFilterChange = (e) => {
    const selectedRole = e.target.value;
    setFilterRole(selectedRole);

    if (!selectedRole) {
      fetchUsers(true);
      return;
    }

    const filtered = userList.filter(
      (user) => user.role?.name === selectedRole
    );
    setUserList(filtered);
    setCurrentPage(1);
  };

  const handleShowAll = () => {
    setFilterRole("");
    fetchUsers(true);
  };

  const sortedUsers = [...userList].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return sortBy.order === "asc" ? dateA - dateB : dateB - dateA;
  });

  const totalPages = Math.ceil(sortedUsers.length / USERS_PER_PAGE);
  const startIdx = (currentPage - 1) * USERS_PER_PAGE;
  const currentUsers = sortedUsers.slice(startIdx, startIdx + USERS_PER_PAGE);

  return (
    <div className="admin-section">
      <h3>👥 Lista użytkowników</h3>

      <div style={{ marginBottom: "1rem" }}>
        <label>Filtruj według roli: </label>
        <select value={filterRole} onChange={handleRoleFilterChange}>
          <option value="">-- Wybierz rolę --</option>
          {roles.map((role) => (
            <option key={role.name} value={role.name}>
              {role.name}
            </option>
          ))}
        </select>
        <button onClick={handleShowAll}>🔄 Pokaż wszystkich</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>E-mail</th>
            <th>Rola</th>
            <th>
              Data utworzenia{" "}
              <button onClick={handleSort}>
                {sortBy.order === "asc" ? "⬆️" : "⬇️"}
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
              <td>{user.role?.name || "Brak roli"}</td>
              <td>
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("pl-PL", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "Brak daty"}
              </td>
              <td>
                {user.role?.name === "zablokowany" ? (
                  <div>
                    <select
                      value={selectedRole[user.id] || ""}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                    >
                      <option value="">Wybierz rolę</option>
                      {roles
                        .filter((role) => role.name !== "zablokowany")
                        .map((role) => (
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
