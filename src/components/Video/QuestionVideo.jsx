import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import "./QuestionVideo.scss";

const API_BASE_URL = process.env.REACT_APP_API_URL;

function QuestionVideo({ lectureId, videoRef, onAnswerChange, onVideoCompleted }) {
  const [questions, setQuestions] = useState([]);
  const [activeQuestion, setActiveQuestion] = useState(null);
  const [answeredQuestions, setAnsweredQuestions] = useState(new Set());
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const countdownTimerRef = useRef(null);
  const [loading, setLoading] = useState(true); // Для управления состоянием загрузки вопросов

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/questions/lecture/${lectureId}`);
        if (response.data.length > 3) {
          const shuffled = response.data.sort(() => 0.5 - Math.random());
          setQuestions(shuffled.slice(0, 3));
        } else {
          setQuestions(response.data);
        }
      } catch (err) {
        console.error("Błąd ładowania pytania:", err);
      } finally {
        setLoading(false); // Завершаем загрузку после получения вопросов
      }
    };

    fetchQuestions();
  }, [lectureId]);

  useEffect(() => {
    if (!videoRef.current || questions.length === 0 || loading) return;

    const checkTime = () => {
      const currentTime = Math.floor(videoRef.current.currentTime);
      const questionToShow = questions.find(
        (q) => q.timeInSeconds === currentTime && !answeredQuestions.has(q.id)
      );

      if (questionToShow) {
        videoRef.current.pause();
        videoRef.current.controls = false;
        setActiveQuestion(questionToShow);
        setTimeLeft(30);

        if (countdownTimerRef.current) {
          clearInterval(countdownTimerRef.current);
        }

        countdownTimerRef.current = setInterval(() => {
          setTimeLeft((prev) => {
            if (prev <= 1) {
              clearInterval(countdownTimerRef.current);
              handleTimeout(questionToShow.id); // Если время вышло — обработка таймаута
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    };

    const handleVideoEnd = () => {
      onVideoCompleted();
    };

    const videoElement = videoRef.current;
    videoElement.addEventListener("timeupdate", checkTime);
    videoElement.addEventListener("ended", handleVideoEnd);

    return () => {
      videoElement.removeEventListener("timeupdate", checkTime);
      videoElement.removeEventListener("ended", handleVideoEnd);
      if (countdownTimerRef.current) {
        clearInterval(countdownTimerRef.current);
      }
    };
  }, [questions, answeredQuestions, videoRef, onVideoCompleted, loading]);

  const handleAnswer = (questionId, selectedOption) => {
    const question = questions.find((q) => q.id === questionId);
    if (!question) return;

    const isCorrect = question.answer === selectedOption;
    if (isCorrect) {
      setCorrectAnswers((prev) => prev + 1);
    }

    setAnsweredQuestions((prev) => new Set([...prev, questionId]));
    setActiveQuestion(null);
    videoRef.current.controls = true;
    if (videoRef.current) videoRef.current.play();

    onAnswerChange(correctAnswers + (isCorrect ? 1 : 0));

    if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }
  };

  const handleTimeout = (questionId) => {
    setAnsweredQuestions((prev) => new Set([...prev, questionId])); // Добавляем вопрос в отвеченные
    setActiveQuestion(null);
    videoRef.current.controls = true;
    if (videoRef.current) videoRef.current.play();
  };

  return (
    <div>
      {loading ? (
        <div className="loading">Загрузка вопросов...</div>
      ) : (
        activeQuestion && (
          <div className="question-modal">
            <div className="modal-content">
              <p>
                <strong>Pytanie:</strong> {activeQuestion.question}
              </p>
              <p className="countdown">Zostało czasu: {timeLeft} sek.</p>
              <ul className="answer-list">
                {activeQuestion.options.map((option, index) => (
                  <li key={index} onClick={() => handleAnswer(activeQuestion.id, option)}>
                    {option}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )
      )}
    </div>
  );
}

export default QuestionVideo;
