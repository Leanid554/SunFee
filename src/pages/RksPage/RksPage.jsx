import React, { useState, useEffect } from "react";
import axios from "axios";
import UserStats from "../../components/Admin/UserStats";
import "./RksPage.scss";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const RksPage = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/users`);
        setUsers(response.data || []); 
      } catch (error) {
        
      }
    };

    fetchUsers();
  }, []);

  return (
    <div className="rks-page">
      <h1>Statystyki użytkowników</h1>
      <UserStats users={users} />
    </div>
  );
};

export default RksPage;
