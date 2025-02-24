import './App.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { ManageMovies } from './components/Movie-form.component';
import { ManageRooms } from './components/Room-list.component';
import { MoviesList } from './components/Movie-list.component';
import { UserReservations } from './components/Reservation-confirmation-component';
import { ReservationReports } from './components/Report-detail-component';

function App() {
  return (
    <BrowserRouter>
      <nav className="p-4 bg-gray-900 text-white flex justify-between items-center">
        <details className="dropdown">
          <summary className="cursor-pointer text-xl">☰ Menú</summary>
          <ul className="p-2 shadow bg-gray-800 rounded">
            <li><Link to="/" className="block px-4 py-2">🎬 Cartelera</Link></li>
            <li><Link to="/manage" className="block px-4 py-2">🛠️ Administrar Películas</Link></li>
            <li><Link to="/manage/rooms" className="block px-4 py-2">🏛️ Administrar Salas</Link></li>
            <li><Link to="/reservations" className="block px-4 py-2">📖 Tus Reservas</Link></li>
            <li><Link to="/reservation-reports" className="block px-4 py-2">📊 Reporte de Reservas</Link></li>
          </ul>
        </details>
      </nav>

      <div className="container mx-auto p-4">
        <Routes>
          <Route path="/" element={<MoviesList />} />
          <Route path="/manage" element={<ManageMovies />} />
          <Route path="/manage/rooms" element={<ManageRooms />} />
          <Route path="/reservations" element={<UserReservations />} />
          <Route path="/reservation-reports" element={<ReservationReports />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
