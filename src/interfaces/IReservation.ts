interface IReservation {
  seats: string[];
}

export interface IReservationPayload extends IReservation {
  movieTitle: string;
  roomName: string;
  schedule: string;
}

export interface IReservationConfirm extends IReservation {
  id: string;
  movieId: string;
  roomId: string;
  schedule: string;
  title: string;
  name: string;
}
