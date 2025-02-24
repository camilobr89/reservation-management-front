import { useEffect, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { api } from '../services/api';

interface Room {
  id: string;
  name: string;
  capacity: number;
}

interface ModalProps {
  message: string;
  onConfirm?: () => void;
  onClose: () => void;
}

export const ManageRooms = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');

  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalAction, setModalAction] = useState<(() => void) | undefined>(undefined);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = () => {
    api.get('/rooms').then(res => setRooms(res.data));
  };

  const resetForm = () => {
    setEditingRoom(null);
    setName('');
    setCapacity('');
  };

  const saveRoom = () => {
    const payload = { name, capacity: Number(capacity) };

    if (editingRoom) {
      api.put(`/rooms/${editingRoom.id}`, payload)
        .then(() => {
          setModalMessage('Sala actualizada.');
          setShowModal(true);
          fetchRooms();
          resetForm();
        })
        .catch(err => {
          setModalMessage(err.response.data.error || 'Error al actualizar');
          setShowModal(true);
        });
    } else {
      api.post('/rooms', payload)
        .then(() => {
          setModalMessage('Sala agregada.');
          setShowModal(true);
          fetchRooms();
          resetForm();
        })
        .catch(err => {
          setModalMessage(err.response.data.error || 'Error al agregar');
          setShowModal(true);
        });
    }
  };

  const confirmDeleteRoom = (id: string) => {
    setModalMessage('¿Eliminar sala?');
    setModalAction(() => () => deleteRoom(id));
    setShowModal(true);
  };

  const deleteRoom = (id: string) => {
    api.delete(`/rooms/${id}`)
      .then(() => {
        setShowModal(false);
        setTimeout(() => {
          setModalMessage('Sala eliminada.');
          setModalAction(undefined);
          setShowModal(true);
        }, 300);
        fetchRooms();
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

  const startEditing = (room: Room) => {
    setEditingRoom(room);
    setName(room.name);
    setCapacity(room.capacity.toString());
  };

  const Modal = ({ message, onConfirm, onClose }: ModalProps) => (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 backdrop-blur-md"
    style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
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
      <h2 className="text-2xl font-bold">🏛️ Administrar Salas</h2>

      <div className="my-4 space-y-2">
        <input className="border p-2 w-full rounded" placeholder="Nombre de la sala" value={name} onChange={e => setName(e.target.value)} />
        <input className="border p-2 w-full rounded" placeholder="Capacidad" type="number" value={capacity} onChange={e => setCapacity(e.target.value)} />

        <button className={`text-white p-2 rounded w-full ${editingRoom ? 'bg-yellow-500' : 'bg-green-500'}`} onClick={saveRoom}>
          {editingRoom ? 'Actualizar Sala' : 'Agregar Sala'}
        </button>

        {editingRoom && (
          <button className="bg-gray-400 text-white p-2 rounded w-full" onClick={resetForm}>
            Cancelar Edición
          </button>
        )}
      </div>

      <div>
        {rooms.map(room => (
          <div key={room.id} className="flex justify-between items-center border rounded p-2 my-2">
            <span>{room.name} - Capacidad: {room.capacity}</span>
            <div className="space-x-2 flex items-center">
              <button className="bg-purple-400 hover:bg-purple-500 text-white px-3 py-1 rounded flex items-center" onClick={() => startEditing(room)} title="Editar">
                <Pencil className="w-4 h-4" />
              </button>

              <button className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center" onClick={() => confirmDeleteRoom(room.id)} title="Eliminar">
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
