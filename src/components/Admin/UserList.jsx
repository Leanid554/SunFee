import React, { useState } from "react";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000"; // Убедитесь, что API URL правильный

const UserList = ({ users }) => {
  const [selectedRole, setSelectedRole] = useState({}); // Для отслеживания выбранной роли для каждого пользователя

  const handleBlockUser = async (userId) => {
    try {
      // Отправляем запрос на изменение роли пользователя на "zablokowany"
      const response = await axios.post(
        `${API_BASE_URL}/roles/assign/${userId}/zablokowany`
      );
      if (response.status === 200) {
        alert("Użytkownik został zablokowany!");
      }
    } catch (error) {
      console.error("Ошибка при блокировке пользователя:", error);
      alert("Błąd przy blokowaniu użytkownika");
    }
  };

  const handleUnblockUser = async (userId) => {
    const newRole = selectedRole[userId]; // Получаем выбранную роль для разблокированного пользователя

    try {
      // Отправляем запрос на изменение роли на выбранную
      const response = await axios.post(
        `${API_BASE_URL}/roles/assign/${userId}/${newRole}`
      );
      if (response.status === 200) {
        alert("Użytkownik został odblokowany i rola została zmieniona!");
      }
    } catch (error) {
      console.error("Ошибка при разбанивании пользователя:", error);
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
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.email}</td>
              <td>{user.role.name}</td>
              <td>
                {/* Если роль "zablokowany", показываем "Odblokuj" с выбором роли */}
                {user.role.name === "zablokowany" ? (
                  <div>
                    <select
                      value={selectedRole[user.id] || ""}
                      onChange={(e) =>
                        handleRoleChange(user.id, e.target.value)
                      }
                    >
                      <option value="">Wybierz rolę</option>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                      {/* Можете добавить другие роли сюда */}
                    </select>
                    <button onClick={() => handleUnblockUser(user.id)}>
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
