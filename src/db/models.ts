export enum BookingStatus {
  CONFIRMED = "CONFIRMED",
  CANCELED = "CANCELED",
}

export interface Booking {
  bookingID: string;
  bookID: string;
  userID: string;
  quantity: number;
  status: BookingStatus;
}

export interface Books {
  bookID: string;
  title: string;
  price: number;
  bookQuantity: number;
}

export interface Orders {
  orderID: string;
  bookID: string;
  userID: string;
  quantity: number;
  status: BookingStatus;
}

export interface User {
  userID: string;
  userName: string;
}