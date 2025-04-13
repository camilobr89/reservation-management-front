import { useEffect, useState } from "react";
import { api } from "../services/api";
import { IMovie } from "../interfaces/IMovie";
import { IRoom } from "../interfaces/IRoom";
import { IReservationPayload } from "../interfaces/IReservation";
import { IModalProps } from "../interfaces/IModalProps";
import { isValidEmail } from "../utils/validators";
import { AVAILABLE_TIMES } from "../constants/schedules";

export const MoviesList = () => {
  const [movies, setMovies] = useState<IMovie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<IMovie | null>(null);
  const [rooms, setRooms] = useState<IRoom[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<IRoom | null>(null);
  const [reservedSeats, setReservedSeats] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [modalMessage, setModalMessage] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 7);
  const maxAllowedDate = maxDate.toISOString().split('T')[0];

  const toggleSeatSelection = (seat: string) => {
    if (reservedSeats.includes(seat)) {
      return;
    }
    setSelectedSeats(prevSeats =>
      prevSeats.includes(seat) ? prevSeats.filter(s => s !== seat) : [...prevSeats, seat]
    );
  };

  useEffect(() => {
    api.get("/movies").then(response => setMovies(response.data));
    api.get("/rooms").then(response => setRooms(response.data));
  }, []);

  useEffect(() => {
    if (selectedRoom && selectedTime && selectedDate) {
      const schedule = `${selectedDate} ${selectedTime}`;
      api.get(`/reservations?roomId=${selectedRoom.id}&schedule=${encodeURIComponent(schedule)}`)
        .then(response => {
          const occupiedSeats = response.data.flatMap((res: IReservationPayload) => res.seats || []);
          setReservedSeats(occupiedSeats);
        })
        .catch(error => {
          console.error("Error al cargar reservaciones:", error);
          setReservedSeats([]);
        });
    } else {
      setReservedSeats([]);
    }
  }, [selectedRoom, selectedTime, selectedDate]);
  
  const Modal = ({ message, loading, onClose }: IModalProps) => (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 backdrop-blur-md"
    style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <div className="bg-white p-8 rounded-xl shadow-lg">
        <p className="text-center text-lg mb-4">{message}</p>
        {!loading && (
          <button className="mt-4 bg-purple-500 text-white px-4 py-2 rounded" onClick={onClose}>
            Cerrar
          </button>
        )}
        {loading && <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto" />}
      </div>
    </div>
  );  

  return (
    <div className="container mx-auto p-6 bg-white min-h-screen">
      <h1 className="text-4xl font-bold mb-6 text-gray-800 text-center">🎬 Cartelera de Películas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {movies.map(movie => (
          <div
            key={movie.id}
            className="bg-white border border-gray-300 text-gray-800 p-6 rounded-lg shadow-md cursor-pointer hover:bg-purple-100 transition-all"
            onClick={() => {
              setSelectedMovie(movie);
              setStep(1);
              setSelectedTime(null);
              setSelectedRoom(null);
              setReservedSeats([]);
              setSelectedSeats([]);
              setUserEmail("");
            }}
          >
            <h2 className="text-2xl font-bold mb-3">{movie.title}</h2>
            <p><strong>Género:</strong> {movie.genre}</p>
            <p><strong>Duración:</strong> {movie.duration} min</p>
            <p><strong>Clasificación:</strong> {movie.rating}</p>
          </div>
        ))}
      </div>

    {selectedMovie && (
        <div 
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-md"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
        >
    <div className="bg-white p-8 rounded-xl shadow-2xl w-96 border border-gray-300 transition-all duration-300">
      {step === 1 && (
        <>
          <h2 className="text-3xl font-bold text-gray-800 text-center">{selectedMovie.title}</h2>
          <p className="text-gray-600 text-center mb-4">
            <strong className="text-gray-700">Género:</strong> {selectedMovie.genre}
          </p>

          <h3 className="mt-4 text-lg font-semibold text-gray-800 text-center">Selecciona un horario:</h3>
          <div className="flex justify-center gap-3 mt-2">
            {AVAILABLE_TIMES.map(time => (
              <button
                key={time}
                className={`px-4 py-2 rounded-full transition-all ${
                  selectedTime === time ? "bg-purple-500 text-white" : "bg-gray-200 text-gray-800 hover:bg-purple-400"
                }`}
                onClick={() => setSelectedTime(time)}
              >
                {time}
              </button>
            ))}
          </div>

          <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-800 text-center">Selecciona una fecha:</h3>
          <input
            type="date"
            className="mt-2 block w-full p-2 rounded border border-gray-300"
            value={selectedDate}
            min={today}
            max={maxAllowedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        </div>

        <h3 className="mt-4 text-lg font-semibold text-gray-800 text-center">Selecciona una sala:</h3>
        <div className="flex flex-col gap-2 mt-2">
          {rooms.map(room => (
            <button
              key={room.id}
              className={`px-4 py-2 rounded-lg transition-all ${
                selectedRoom?.id === room.id ? "bg-green-500 text-white" : "bg-gray-200 text-gray-800 hover:bg-green-300"
              }`}
              onClick={() => setSelectedRoom(room)}
            >
              {room.name} (Capacidad: {room.capacity})
            </button>
          ))}
        </div>

          <div className="flex justify-between mt-4">
            <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={() => setSelectedMovie(null)}>Cerrar</button>
            <button
              className={`px-4 py-2 rounded transition ${
                selectedTime && selectedRoom
                  ? "bg-purple-400 text-white hover:bg-purple-500"
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
              onClick={() => selectedTime && selectedRoom && setStep(2)}
              disabled={!selectedTime || !selectedRoom}
            >
              Reservar Asientos
            </button>

          </div>
        </>
      )}

      {step === 2 && selectedRoom && (
        <>
          <h2 className="text-2xl font-bold text-white">Selecciona tu asiento</h2>
          <div className="grid grid-cols-5 gap-2 mt-4">
            {Array.from({ length: selectedRoom.capacity }, (_, i) => `A${i + 1}`).map(seat => (
              <button
                key={seat}
                className={`w-10 h-10 rounded ${
                  reservedSeats.includes(seat) ? "bg-gray-400 text-white cursor-not-allowed" : 
                  selectedSeats.includes(seat) ? "bg-green-500 text-white" : "bg-white text-gray-800 border border-gray-300 hover:bg-gray-100"
                }`}                    
                disabled={reservedSeats.includes(seat)}
                onClick={() => toggleSeatSelection(seat)}
              >
                {seat}
              </button>
            ))}
          </div>


          <div className="flex justify-between mt-4">
            <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={() => setStep(1)}>Atrás</button>
            <button
                className={`px-4 py-2 rounded transition ${
                  selectedSeats.length > 0
                    ? "bg-purple-400 text-white hover:bg-purple-500"
                    : "bg-gray-400 text-white cursor-not-allowed"
                }`}
                onClick={() => selectedSeats.length > 0 && setStep(3)}
                disabled={selectedSeats.length === 0}
              >
                Continuar
              </button>

          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h2 className="text-2xl font-bold text-white">Ingresa tu correo</h2>
          <input
              type="email"
              className={`w-full p-2 mt-2 rounded bg-white text-gray-800 border ${
                isEmailValid ? "border-gray-300" : "border-red-500"
              }`}
              placeholder="correo@email.com"
              value={userEmail}
              onChange={e => {
                setUserEmail(e.target.value);
                setIsEmailValid(isValidEmail(e.target.value));
              }}
            />

          <div className="flex justify-between mt-4">
            <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={() => setStep(2)}>Atrás</button>
            <button
              className={`px-4 py-2 rounded transition ${
                isValidEmail(userEmail)
                  ? "bg-purple-400 text-white hover:bg-purple-500"
                  : "bg-gray-400 text-white cursor-not-allowed"
              }`}
              onClick={() => {
                if (isValidEmail(userEmail)) {
                  setSelectedMovie(null);
                  setModalMessage("Realizando reserva, espera...");
                  setIsLoading(true);
                  setShowModal(true);
              
                  api.post("/reservations", {
                    movieId: selectedMovie?.id,
                    roomId: selectedRoom?.id,
                    seats: selectedSeats,
                    userEmail,
                    schedule: `${selectedDate} ${selectedTime}`,
                  })
                  .then(() => {
                    setModalMessage("🎟️ Reserva confirmada, revisa tu correo!");
                    setIsLoading(false);
                    setSelectedMovie(null);
                  })
                  .catch((error) => {
                    console.error("Error al enviar reserva:", error);
                    setModalMessage("Error al realizar la reserva. Inténtalo nuevamente.");
                    setIsLoading(false);
                  });
                }
              }}
              
              disabled={!isValidEmail(userEmail)}
            >
              Confirmar Reserva
            </button>

            {showModal && (
              <Modal
                message={modalMessage}
                loading={isLoading}
                onClose={() => {
                  setShowModal(false);
                  if (!isLoading && modalMessage.includes("confirmada")) {
                    setSelectedMovie(null);
                  }
                }}
              />
            )}

          </div>
        </>
      )}
      </div>
    </div>
  )}

    {showModal && ( <Modal message={modalMessage} loading={isLoading} onClose={() => setShowModal(false)}/>)}

  </div>
  );
};
