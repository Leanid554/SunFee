// UserPassword.jsx

import React, { useState } from 'react';
import axios from 'axios';

// Компонент для изменения пароля пользователя
const UserPassword = ({ userId, onPasswordChange }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  // Обработчик изменения пароля
  const handlePasswordChange = () => {
    if (newPassword !== confirmPassword) {
      setError('Hasła muszą być takie same');
      return;
    }

    // Запрос на изменение пароля
    axios
      .put(`/api/users/${userId}/password`, { password: newPassword })
      .then(response => {
        onPasswordChange(response.data);  // Оповещаем родительский компонент о том, что пароль изменен
        setNewPassword('');
        setConfirmPassword('');
      })
      .catch(err => {
        setError('Wystąpił błąd przy zmianie hasła');  // Сообщение об ошибке
      });
  };

  return (
    <div>
      <h4>Zmiana hasła</h4>
      <input
        type="password"
        placeholder="Nowe hasło"
        value={newPassword}
        onChange={(e) => setNewPassword(e.target.value)}  // Обновление значения нового пароля
      />
      <input
        type="password"
        placeholder="Potwierdź hasło"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}  // Обновление значения подтверждения пароля
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}  // Отображение ошибок, если они есть
      <button onClick={handlePasswordChange}>Zmień hasło</button>  // Кнопка для отправки запроса
    </div>
  );
};

export default UserPassword;
