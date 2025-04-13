import { useEffect, useState, useCallback } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { movieService } from '../services/movieService';
import { IMovie } from '../interfaces/IMovie';
import { IModalPropsForm } from '../interfaces/IModalProps';

type ApiError = {
  response?: {
    data?: {
      error?: string;
    };
  };
};

export const ManageMovies = () => {
  const [movies, setMovies] = useState<IMovie[]>([]);
  const [editingMovie, setEditingMovie] = useState<IMovie | null>(null);
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [duration, setDuration] = useState('');
  const [rating, setRating] = useState('');
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalAction, setModalAction] = useState<(() => void) | undefined>(undefined);

  const fetchMovies = useCallback(async () => {
    try {
      const data = await movieService.getAll();
      setMovies(data);
    } catch {
      showErrorModal('Error al cargar las películas');
    }
  }, []);

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  const resetForm = () => {
    setEditingMovie(null);
    setTitle('');
    setGenre('');
    setDuration('');
    setRating('');
  };

  const showErrorModal = (message: string) => {
    setModalMessage(message);
    setModalAction(undefined);
    setShowModal(true);
  };

  const showSuccessModal = (message: string) => {
    setModalMessage(message);
    setModalAction(undefined);
    setShowModal(true);
  };

  const saveMovie = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const payload = { 
        title, 
        genre, 
        duration: Number(duration), 
        rating 
      };

      if (editingMovie) {
        await movieService.update(editingMovie.id, payload);
        showSuccessModal('Película actualizada.');
      } else {
        await movieService.create(payload);
        showSuccessModal('Película agregada.');
      }

      await fetchMovies();
      resetForm();
    } catch (error: unknown) {
      const apiError = error as ApiError;
      showErrorModal(apiError?.response?.data?.error || 'Error al guardar la película');
    } finally {
      setLoading(false);
    }
  };

  const confirmDeleteMovie = (id: string) => {
    setModalMessage('¿Eliminar película?');
    setModalAction(() => () => deleteMovie(id));
    setShowModal(true);
  };

  const deleteMovie = async (id: string) => {
    try {
      await movieService.delete(id);
      setShowModal(false);
      
      setTimeout(() => {
        showSuccessModal('Película eliminada.');
        fetchMovies();
      }, 300);
    } catch (error: unknown) {
      const apiError = error as ApiError;
      setShowModal(false);
      setTimeout(() => {
        showErrorModal(apiError?.response?.data?.error || 'Error al eliminar');
      }, 300);
    }
  };

  const startEditing = (movie: IMovie) => {
    setEditingMovie(movie);
    setTitle(movie.title);
    setGenre(movie.genre);
    setDuration(movie.duration.toString());
    setRating(movie.rating);
  };

  const Modal = ({ message, onConfirm, onClose }: IModalPropsForm) => (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 backdrop-blur-md"
    style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <p className="text-center text-lg mb-4">{message}</p>
        <div className="flex justify-center gap-4">
          {onConfirm && (
            <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => { onConfirm(); onClose(); }}>
              Confirmar
            </button>
          )}
          <button className="bg-purple-500 text-white px-4 py-2 rounded" onClick={onClose}>Cerrar</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold">📽 Administrar Películas</h2>

      <div className="my-4 space-y-2">
        <input className="border p-2 w-full rounded" placeholder="Título" value={title} onChange={e => setTitle(e.target.value)} />
        <input className="border p-2 w-full rounded" placeholder="Género" value={genre} onChange={e => setGenre(e.target.value)} />
        <input className="border p-2 w-full rounded" placeholder="Duración (min)" type="number" value={duration} onChange={e => setDuration(e.target.value)} />
        <input className="border p-2 w-full rounded" placeholder="Clasificación" value={rating} onChange={e => setRating(e.target.value)} />

        <button className={`text-white p-2 rounded w-full ${editingMovie ? 'bg-yellow-500' : 'bg-green-500'}`} onClick={saveMovie}>
          {editingMovie ? 'Actualizar Película' : 'Agregar Película'}
        </button>

        {editingMovie && (
          <button className="bg-gray-400 text-white p-2 rounded w-full" onClick={resetForm}>
            Cancelar Edición
          </button>
        )}
      </div>

      <div>
        {movies.map(movie => (
          <div key={movie.id} className="flex justify-between items-center border rounded p-2 my-2">
            <span>{movie.title} ({movie.genre}) - {movie.duration} min</span>
            <div className="space-x-2 flex items-center">
              <button className="bg-purple-400 hover:bg-purple-500 text-white px-3 py-1 rounded flex items-center" onClick={() => startEditing(movie)} title="Editar">
                <Pencil className="w-4 h-4" />
              </button>
              <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center" onClick={() => confirmDeleteMovie(movie.id)} title="Eliminar">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showModal && <Modal message={modalMessage} onConfirm={modalAction} onClose={() => setShowModal(false)} />}
    </div>
  );
};