import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import VideoPlayer from "../../components/Video/VideoPlayer";
import QuestionVideo from "../../components/Video/QuestionVideo";
import NavigationButtons from "../../components/Video/NavigationButtons";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import "./index.scss";

const API_BASE_URL = process.env.REACT_APP_API_URL;

function VideoPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [videoProgress, setVideoProgress] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [isVideoCompleted, setIsVideoCompleted] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef(null);

  useEffect(() => {
    setTimeout(() => setLoading(false), 2000);
  }, []);

  useEffect(() => {
    const updateTime = () => {
      if (videoRef.current) {
        setVideoProgress(videoRef.current.currentTime);
      }
    };

    const video = videoRef.current;
    if (video) {
      video.addEventListener("timeupdate", updateTime);
    }

    return () => {
      if (video) {
        video.removeEventListener("timeupdate", updateTime);
      }
    };
  }, []);

  const handleAnswerChange = (newCorrectAnswers) => {
    setCorrectAnswers(newCorrectAnswers);
  };

  const handleVideoCompleted = () => {
    setIsVideoCompleted(true);
  };

  const handleLectureComplete = async (passed) => {
    try {
      const userId = sessionStorage.getItem("userId");
      await axios.post(
        `${API_BASE_URL}/lectures/${id}/complete/${userId}`,
        { passed },
        { headers: { "Content-Type": "application/json" } }
      );

      navigate(`/blocks/${id}`);
    } catch (error) {
      setError("Błąd podczas zapisywania ukończenia lekcji!");
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="50vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className="video-page">
      <VideoPlayer ref={videoRef} className="video-center" />
      <QuestionVideo
        lectureId={id}
        videoRef={videoRef}
        onAnswerChange={handleAnswerChange}
        onVideoCompleted={handleVideoCompleted}
      />

      {isVideoCompleted &&
        (correctAnswers >= 3 ? (
          <button className="complete-lecture-btn" onClick={() => handleLectureComplete(true)}>
            ✅ Zaliczone
          </button>
        ) : (
          <button className="retry-lecture-btn" onClick={() => handleLectureComplete(false)}>
            ❌ Nie zaliczone
          </button>
        ))}

      {error && <div className="error-message">{error}</div>}

      <NavigationButtons videoId={id} onNext={() => navigate(`/video/${+id + 1}`)} />
    </div>
  );
}

export default VideoPage;
