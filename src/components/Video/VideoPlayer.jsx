import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL;

const VideoPlayer = React.forwardRef((props, ref) => {
  const { id } = useParams();
  const [selectedLecture, setSelectedLecture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setError("Błąd: Nie znaleziono identyfikatora wykładu");
      setLoading(false);
      return;
    }

    const fetchLectureDetails = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/lectures/${id}/details`
        );

        setSelectedLecture(response.data);
      } catch (err) {
        console.error("Błąd ładowania wykładu:", err);
        setError("Nie udało się pobrać danych wykładu.");
      } finally {
        setLoading(false);
      }
    };

    fetchLectureDetails();
  }, [id]);

  if (loading) return <p>Pobieranie wideo....</p>;
  if (error) return <p>{error}</p>;
  if (!selectedLecture) return <p>Nie znaleziono wykładu.</p>;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <h1>{selectedLecture.title}</h1>
      {selectedLecture.videoUrl ? (
        <video
          ref={ref}
          {...props}
          style={{ width: "100%", display: "block" }}
          controls
          controlsList="nodownload"
          onContextMenu={(e) => e.preventDefault()} // Блокировка ПКМ
          onKeyDown={(e) => {
            if (e.ctrlKey && (e.key === "s" || e.key === "S")) {
              e.preventDefault();
            }
          }} // Блокировка Ctrl + S
          draggable="false" // Отключение перетаскивания
        >
          <source
            src={`${API_BASE_URL}${selectedLecture.videoUrl}`}
            type="video/mp4"
          />
          Twoja przeglądarka nie obsługuje wideo.
        </video>
      ) : (
        <p>Nie przesłano żadnego materiału wideo.</p>
      )}
    </div>
  );
});

export default VideoPlayer;
