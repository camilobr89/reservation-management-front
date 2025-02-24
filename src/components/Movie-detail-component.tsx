import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../services/api";
import { Movie } from "../interfaces/Movie";


export const MovieDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [movie, setMovie] = useState<Movie | null>(null);

  useEffect(() => {
    api.get(`/movies/${id}`)
      .then(response => setMovie(response.data))
      .catch(() => navigate("/"));
  }, [id, navigate]);

  if (!movie) return <p className="text-white">Cargando película...</p>;

  return (
    <div className="text-white p-6 bg-gray-800 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold">{movie.title}</h2>
      <p><strong>Género:</strong> {movie.genre}</p>
      <p><strong>Duración:</strong> {movie.duration} min</p>
      <p><strong>Clasificación:</strong> {movie.rating}</p>
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        onClick={() => navigate(`/reservation/${id}`)}
      >
        Reservar Asientos
      </button>
    </div>
  );
};
