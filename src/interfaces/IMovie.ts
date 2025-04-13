export  interface IMoviePayload {
  title: string;
  genre: string;
  duration: number;
  rating: string;
}

export interface IMovie extends IMoviePayload {
    id: string;
}
