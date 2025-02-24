import { useState } from 'react';
import { api } from '../services/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface Reservation {
    movieTitle: string;
    roomName: string;
    schedule: string;
    seats: string[];
  }
  
  export const ReservationReports = () => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(false);
  
    const fetchReports = () => {
      setLoading(true);
      api.get(`/reservations/date-range?startDate=${startDate}&endDate=${endDate}`)
        .then(res => {
          setReservations(res.data);
          setLoading(false);
        })
        .catch(() => {
          alert('Error al cargar reportes');
          setLoading(false);
        });
    };
  
    // Estadísticas de películas más reservadas (usando movieTitle)
    const movieStats = reservations.reduce<Record<string, number>>((acc, curr) => {
      acc[curr.movieTitle] = (acc[curr.movieTitle] || 0) + curr.seats.length;
      return acc;
    }, {});
  
    const movieData = Object.entries(movieStats).map(([movieTitle, count]) => ({
      movieTitle, count
    }));
  
    // Estadísticas de horarios más populares (hora real)
    const timeStats = reservations.reduce<Record<string, number>>((acc, curr) => {
      const time = new Date(curr.schedule.replace(' ', 'T')).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      acc[time] = (acc[time] || 0) + curr.seats.length;
      return acc;
    }, {});
  
    const timeData = Object.entries(timeStats).map(([time, count]) => ({
      time, count
    }));
  
    const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042'];
  
    return (
      <div className="container mx-auto p-6">
        <h2 className="text-3xl font-bold mb-4">📊 Reporte de Reservas</h2>
  
        <div className="flex gap-4 mb-4">
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border p-2 rounded" />
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border p-2 rounded" />
          <button onClick={fetchReports} className="bg-purple-500 text-white px-4 py-2 rounded">Generar Reporte</button>
        </div>
  
        {loading && <p>Cargando datos...</p>}
  
        {!loading && reservations.length > 0 && (
          <>
            <h3 className="text-xl font-bold my-4">Películas más reservadas</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={movieData}>
                <XAxis dataKey="movieTitle" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
  
            <h3 className="text-xl font-bold my-4">Horarios más populares</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie dataKey="count" data={timeData} nameKey="time" label>
                  {timeData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </>
        )}
  
        {!loading && reservations.length === 0 && <p>No hay reservas en este rango de fechas.</p>}
      </div>
    );
  };
  