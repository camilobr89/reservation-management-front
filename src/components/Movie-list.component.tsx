import { useEffect, useState } from "react";
import { api } from "../services/api";

interface Movie {
  id: string;
  title: string;
  genre: string;
  duration: number;
  rating: string;
}

interface Room {
  id: string;
  name: string;
  capacity: number;
}

interface Reservation {
  seat: string;
}

export const MoviesList = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [reservedSeats, setReservedSeats] = useState<string[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [userEmail, setUserEmail] = useState<string>("");
  const [step, setStep] = useState(1); // Control de pasos

  const availableTimes = ["14:00", "17:00", "20:00"]; // Horarios fijos

  const toggleSeatSelection = (seat: string) => {
    if (reservedSeats.includes(seat)) {
        alert("Este asiento ya está reservado.");
        return;
    }
    setSelectedSeats(prevSeats =>
        prevSeats.includes(seat) ? prevSeats.filter(s => s !== seat) : [...prevSeats, seat]
    );
};


  useEffect(() => {
    api.get("/movies").then(response => setMovies(response.data));
    api.get("/rooms").then(response => setRooms(response.data)); // Obtener salas
  }, []);

  // Cargar asientos reservados cuando se elige sala
  useEffect(() => {
    if (selectedRoom) {
      api.get(`/reservations?roomId=${selectedRoom.id}`).then(response => {
        setReservedSeats(response.data.map((res: Reservation) => res.seat));
      });
    }
  }, [selectedRoom]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4 text-white text-center">🍿 Cartelera de Películas</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {movies.map(movie => (
          <div
            key={movie.id}
            className="bg-gray-800 text-white p-4 rounded-lg shadow-lg cursor-pointer hover:bg-gray-700 transition-all"
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
            <h2 className="text-xl font-bold mb-2">{movie.title}</h2>
            <p><strong>Género:</strong> {movie.genre}</p>
            <p><strong>Duración:</strong> {movie.duration} min</p>
            <p><strong>Clasificación:</strong> {movie.rating}</p>
          </div>
        ))}
      </div>

      {/* ✅ Modal */}
      {selectedMovie && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="bg-gray-900 p-6 rounded-lg shadow-lg w-96">
            {/* ✅ Paso 1: Selección de horario y sala */}
            {step === 1 && (
              <>
                <h2 className="text-2xl font-bold text-white">{selectedMovie.title}</h2>
                <p className="text-gray-400"><strong>Género:</strong> {selectedMovie.genre}</p>

                <h3 className="mt-4 text-lg text-white">Selecciona un horario:</h3>
                <div className="flex gap-2 mt-2">
                  {availableTimes.map(time => (
                    <button
                      key={time}
                      className={`px-3 py-1 rounded ${selectedTime === time ? "bg-blue-500 text-white" : "bg-gray-700 text-gray-300"}`}
                      onClick={() => setSelectedTime(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>


                <h3 className="mt-4 text-lg text-white">Selecciona una sala:</h3>
                <div className="flex flex-col gap-2 mt-2">
                  {rooms.map(room => (
                    <button
                    key={room.id}
                    className={`px-3 py-1 rounded ${selectedRoom?.id === room.id ? "bg-green-500" : "bg-gray-700"}`}
                    onClick={() => {
                        setSelectedRoom(room);
                        // Ahora verificamos si ya se eligió un horario antes de permitir continuar
                        if (!selectedTime) {
                            alert("Debes seleccionar un horario antes de continuar.");
                        }
                    }}
                  >
                    {room.name} (Capacidad: {room.capacity})
                  </button>                  
                  ))}
                </div>

                <div className="flex justify-between mt-4">
                  <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={() => setSelectedMovie(null)}>Cerrar</button>
                  <button
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={() => {
                      if (selectedTime && selectedRoom) {
                        setStep(2);
                      } else {
                        alert("Selecciona un horario y una sala.");
                      }
                    }}
                  >
                    Reservar Asientos
                  </button>
                </div>
              </>
            )}

            {/* ✅ Paso 2: Selección de asiento */}
            {step === 2 && selectedRoom && (
              <>
                <h2 className="text-2xl font-bold text-white">Selecciona tu asiento</h2>
                <div className="grid grid-cols-5 gap-2 mt-4">
                  {Array.from({ length: selectedRoom.capacity }, (_, i) => `A${i + 1}`).map(seat => (
                    <button
                      key={seat}
                      className={`w-10 h-10 rounded ${
                        reservedSeats.includes(seat) ? "bg-red-500 cursor-not-allowed text-white" : 
                        selectedSeats.includes(seat) ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"
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
                    className="px-4 py-2 bg-blue-500 text-white rounded"
                    onClick={() => setStep(3)}
                    disabled={!selectedSeats}
                  >
                    Continuar
                  </button>
                </div>
              </>
            )}

            {/* ✅ Paso 3: Ingresar Email y Confirmar Reserva */}
            {step === 3 && (
              <>
                <h2 className="text-2xl font-bold text-white">Ingresa tu correo</h2>
                <input
                  type="email"
                  className="w-full p-2 mt-2 rounded bg-gray-700 text-white"
                  placeholder="tu@email.com"
                  value={userEmail}
                  onChange={e => setUserEmail(e.target.value)}
                />

                <div className="flex justify-between mt-4">
                  <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={() => setStep(2)}>Atrás</button>
                  <button
                    className="px-4 py-2 bg-green-500 text-white rounded"
                    onClick={() => {
                      api.post("/reservations", {
                        movieId: selectedMovie.id,
                        roomId: selectedRoom?.id,
                        seats: selectedSeats, // Ahora enviamos un array de asientos
                        userEmail,
                        schedule: selectedTime
                    })
                    .then(() => {
                        alert("Reserva confirmada, revisa tu correo!");
                        setSelectedMovie(null);
                    })
                    .catch((error) => {
                        console.error("❌ Error al enviar reserva:", error);
                        alert("Hubo un error al realizar la reserva. Inténtalo nuevamente.");
                    });
                    
                    }}
                    disabled={!userEmail}
                  >
                    Confirmar Reserva
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
