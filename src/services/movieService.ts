import { api } from './api';
import { IMovie } from '../interfaces/IMovie';
import { IMoviePayload } from '../interfaces/IMovie';

export const movieService = {
  getAll: async (): Promise<IMovie[]> => {
    const response = await api.get('/movies');
    return response.data;
  },

  create: async (payload: IMoviePayload): Promise<IMovie> => {
    const response = await api.post('/movies', payload);
    return response.data;
  },

  update: async (id: string, payload: IMoviePayload): Promise<IMovie> => {
    const response = await api.put(`/movies/${id}`, payload);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/movies/${id}`);
  }
}; 