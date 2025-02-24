import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { api } from '../services/api';
import { Movie } from '../interfaces/Movie';

interface ModalProps {
  message: string;
  onConfirm?: () => void;
  onClose: () => void;
}

export const ManageMovies = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [editingMovie, setEditingMovie] = useState<Movie | null>(null);
  const [title, setTitle] = useState('');
  const [genre, setGenre] = useState('');
  const [duration, setDuration] = useState('');
  const [rating, setRating] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalAction, setModalAction] = useState<(() => void) | undefined>(undefined);

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = () => {
    api.get('/movies').then(res => setMovies(res.data));
  };

  const resetForm = () => {
    setEditingMovie(null);
    setTitle('');
    setGenre('');
    setDuration('');
    setRating('');
  };

  const saveMovie = () => {
    const payload = { title, genre, duration: Number(duration), rating };

    if (editingMovie) {
      api.put(`/movies/${editingMovie.id}`, payload)
        .then(() => {
          setModalMessage('Película actualizada.');
          setShowModal(true);
          fetchMovies();
          resetForm();
        })
        .catch(err => {
          setModalMessage(err.response.data.error || 'Error al actualizar');
          setShowModal(true);
        });
    } else {
      api.post('/movies', payload)
        .then(() => {
          setModalMessage('Película agregada.');
          setShowModal(true);
          fetchMovies();
          resetForm();
        })
        .catch(err => {
          setModalMessage(err.response.data.error || 'Error al agregar');
          setShowModal(true);
        });
    }
  };

  const confirmDeleteMovie = (id: string) => {
    setModalMessage('¿Eliminar película?');
    setModalAction(() => () => deleteMovie(id));
    setShowModal(true);
  };

  const deleteMovie = (id: string) => {
    api.delete(`/movies/${id}`)
      .then(() => {
        setShowModal(false); 
        setTimeout(() => {
          setModalMessage('Película eliminada.');
          setModalAction(undefined);
          setShowModal(true);
        }, 300);
        fetchMovies();
      })
      .catch(err => {
        setShowModal(false);
        setTimeout(() => {
          setModalMessage(err.response.data.error || 'Error al eliminar');
          setModalAction(undefined);
          setShowModal(true);
        }, 300);
      });
  };
  

  const startEditing = (movie: Movie) => {
    setEditingMovie(movie);
    setTitle(movie.title);
    setGenre(movie.genre);
    setDuration(movie.duration.toString());
    setRating(movie.rating);
  };

  const Modal = ({ message, onConfirm, onClose }: ModalProps) => (
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