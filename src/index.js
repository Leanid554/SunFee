import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import { store } from "./store/store";
import Navbar from "./components/Navbar/Navbar";
import MainPage from "./pages/MainPage/MainPage";
import VideoPage from "./pages/VideoPage/VideoPage";
import BlockPage from "./pages/BlockPage/BlockPage";
import TestPage from "./pages/TestPage/TestPage";
import AdminPage from "./pages/AdminPage/AdminPage";
import LoginPage from "./pages/Login/LoginPage";
import WebSocket from "./components/WebSocket";
import ProtectedRoute from "./components/ProtectedRoute";
import { isAuthenticated } from "./pages/Login/TokenUtils";
import RksPage from "./pages/RksPage/RksPage";

function App() {
  const [auth, setAuth] = useState(isAuthenticated());

  useEffect(() => {
    const checkAuth = () => setAuth(isAuthenticated());

    window.addEventListener("storage", checkAuth);
    return () => window.removeEventListener("storage", checkAuth);
  }, []);

  return (
    <>
      <WebSocket />
      <Navbar setAuth={setAuth} />
      <Routes>
        {!auth ? (
          <>
            <Route path="/login" element={<LoginPage setAuth={setAuth} />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <>
            <Route path="/" element={<Navigate to="/main" />} />
            <Route path="/main" element={<MainPage />} />
            <Route path="/block/:blockId" element={<BlockPage />} />
            <Route
              path="/lectures/:id/block/:blockId"
              element={<BlockPage />}
            />
            <Route path="/video/:id" element={<VideoPage />} />
            <Route path="/test/:blockId" element={<TestPage />} />
            <Route
              path="/admin"
              element={<ProtectedRoute element={<AdminPage />} />}
            />
            <Route path="*" element={<Navigate to="/main" />} />
            <Route path="/rkspage" element={<RksPage />} />

          </>
        )}
      </Routes>
    </>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <Router>
      <App />
    </Router>
  </Provider>
);
