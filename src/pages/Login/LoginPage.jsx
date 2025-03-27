import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import axios from "axios";
import LoginForm from "../../components/Login/LoginForm";
import { setToken, decodeToken } from "./TokenUtils";
import "./index.scss";

const API_URL = process.env.REACT_APP_API_URL;

function LoginPage({ setAuth }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    server: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    setErrors((prevErrors) => ({
      ...prevErrors,
      [name]: "",
      server: "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ email: "", password: "", server: "" });
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/auth/login`, formData, {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      });

      if (response.status === 201) {
        const { accessToken } = response.data;
        const decoded = decodeToken(accessToken);

        if (decoded?.role === "zablokowany") {
          setErrors((prevErrors) => ({
            ...prevErrors,
            server: "Twoje konto zostało zablokowane.",
          }));
          setLoading(false);
          return;
        }

        setToken(accessToken);
        setAuth(true);
        navigate("/main");
      }
    } catch (error) {
      setErrors((prevErrors) => ({
        ...prevErrors,
        server: error.message.includes("ERR_NETWORK")
          ? "Błąd sieci. Spróbuj ponownie później."
          : error.response?.data?.message ||
            "Nieprawidłowy adres e-mail lub hasło.",
      }));
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="form">
        <LoginForm
          formData={formData}
          errors={errors}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
}

export default LoginPage;
