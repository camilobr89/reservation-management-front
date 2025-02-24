import { useState } from 'react';
import { api } from '../services/api';

interface Reservation {
  id: string;
  movieId: string;
  roomId: string;
  schedule: string;
  seats: string[];
  title: string;
  name: string;
}

export const UserReservations = () => {
  const [email, setEmail] = useState('');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [error, setError] = useState('');
  const [modalMessage, setModalMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<string | null>(null);

  const fetchReservations = () => {
    api.get(`/reservations/user/${email}`)
      .then(res => {
        setReservations(res.data);
        setError('');
      })
      .catch(err => {
        setReservations([]);
        setError(err.response?.data?.error || 'Error desconocido');
      });
  };

  const confirmCancelReservation = (id: string) => {
    setReservationToCancel(id);
    setModalMessage('¿Seguro deseas cancelar esta reserva?');
    setShowModal(true);
  };

  const cancelReservation = () => {
    if (!reservationToCancel) return;
    setModalLoading(true);

    api.delete(`/reservations/${reservationToCancel}`)
      .then(() => {
        setModalMessage('Reserva cancelada exitosamente.');
        fetchReservations();
      })
      .catch(err => {
        setModalMessage(err.response?.data?.error || 'Error al cancelar reserva');
      })
      .finally(() => {
        setModalLoading(false);
        setReservationToCancel(null);
      });
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">📖 Tus Reservas</h2>
      <div className="flex gap-2">
        <input
          className="border rounded p-2 w-full"
          placeholder="Ingresa tu correo"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          className="bg-purple-500 text-white px-4 py-2 rounded"
          onClick={fetchReservations}
        >
          Consultar
        </button>
      </div>

      {error && <div className="text-red-500 mt-2">{error}</div>}

      <div className="mt-4">
        {reservations.map((reserva) => (
          <div key={reserva.id} className="border p-3 rounded mb-2">
            <p><strong>Película:</strong> {reserva.title}</p>
            <p><strong>Sala:</strong> {reserva.name}</p>
            <p><strong>Fecha y Hora:</strong> {reserva.schedule}</p>
            <p><strong>Asientos:</strong> {reserva.seats.join(', ')}</p>

            <button
              className="bg-red-500 text-white px-3 py-1 rounded mt-2"
              onClick={() => confirmCancelReservation(reserva.id)}
            >
              Cancelar Reserva
            </button>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 backdrop-blur-md"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
          <div className="bg-white p-8 rounded-xl shadow-lg">
            <p className="text-center text-lg mb-4">{modalMessage}</p>

            <div className="flex justify-center gap-2">
              {reservationToCancel && !modalLoading && (
                <button
                  className="bg-red-500 text-white px-4 py-2 rounded"
                  onClick={cancelReservation}
                >
                  Confirmar
                </button>
              )}
              <button
                className="bg-purple-500 text-white px-4 py-2 rounded"
                onClick={() => {
                  setShowModal(false);
                  setReservationToCancel(null);
                }}
              >
                Cerrar
              </button>
            </div>

            {modalLoading && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto mt-4" />}
          </div>
        </div>
      )}
    </div>
  );
};
