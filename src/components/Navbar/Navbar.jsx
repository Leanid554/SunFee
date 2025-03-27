import React from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import Logo from "../../assets/img/logo.png";
import "./index.scss";

export default function Navbar({ setAuth }) {
  const location = useLocation();
  const navigate = useNavigate();

  const userRole = sessionStorage.getItem("role");
  const email = sessionStorage.getItem("email");

  const handleLogout = () => {
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("role");
    sessionStorage.removeItem("userId");
    setAuth(false);
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <Link to="/main">
        <div className="navbar_logo">
          <img src={Logo} alt="Logo" />
        </div>
      </Link>

      <div className="navbar-right">
        {location.pathname !== "/login" &&
          location.pathname !== "/admin" &&
          userRole && (
            <div className="position-navbar">
              <div className="role">
                {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
              </div>
              <div className="email">{email}</div>
            </div>
          )}
        {userRole && location.pathname !== "/login" && (
          <button className="logout-button" onClick={handleLogout}>
            Logout
          </button>
        )}
        {userRole === "administrator" && location.pathname !== "/admin" && (
          <Link to="/admin" className="admin-button">
            Admin
          </Link>
        )}
      </div>
    </nav>
  );
}
