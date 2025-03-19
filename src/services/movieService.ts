import { api } from './api';
import { Movie } from '../interfaces/Movie';

interface MoviePayload {
  title: string;
  genre: string;
  duration: number;
  rating: string;
}

export const movieService = {
  getAll: async (): Promise<Movie[]> => {
    const response = await api.get('/movies');
    return response.data;
  },

  create: async (payload: MoviePayload): Promise<Movie> => {
    const response = await api.post('/movies', payload);
    return response.data;
  },

  update: async (id: string, payload: MoviePayload): Promise<Movie> => {
    const response = await api.put(`/movies/${id}`, payload);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/movies/${id}`);
  }
}; 