import { jwtDecode } from "jwt-decode";

export const setToken = (accessToken) => {
  if (accessToken) {
    const decoded = decodeToken(accessToken);

    if (decoded?.role === "zablokowany") {
      return;
    }

    sessionStorage.setItem("accessToken", accessToken);

    if (decoded?.sub) {
      sessionStorage.setItem("userId", decoded.sub);
    }

    if (decoded?.role) {
      sessionStorage.setItem("role", decoded.role);
    }

    if (decoded?.email) {
      sessionStorage.setItem("email", decoded.email);
    }
  }
};

export const getAccessToken = () => sessionStorage.getItem("accessToken");
export const getUserId = () => sessionStorage.getItem("userId");
export const getRole = () => sessionStorage.getItem("role");
export const getEmail = () => sessionStorage.getItem("email");

export const removeTokens = () => {
  sessionStorage.removeItem("accessToken");
  sessionStorage.removeItem("userId");
  sessionStorage.removeItem("role");
  sessionStorage.removeItem("email");
};

export const isAuthenticated = () => {
  const userId = getUserId();
  const role = getRole();
  return Boolean(userId && role && role !== "zablokowany");
};

export const decodeToken = (token) => {
  try {
    return jwtDecode(token);
  } catch (error) {
    return null;
  }
};
