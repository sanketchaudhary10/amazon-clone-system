import { BookingStatus, Books, Booking, Orders, User } from "../../../db/models";

export class AmazonService {
    private booksDB = new Map<string, Books>();
    private bookingsDB = new Map<string, Booking>();
    private ordersDB = new Map<string, Orders>();
    private readonly usersDB: Map<string, User>;

    constructor(
        booksDB: Map<string, Books> = new Map<string, Books>(),
        bookingDB: Map<string, Booking> = new Map<string, Booking>(),
        ordersDB: Map<string, Orders> = new Map<string, Orders>(),
        usersDB: Map<string, User> = new Map<string, User>()
    ) {
        this.booksDB = booksDB;
        this.bookingsDB = bookingDB;
        this.ordersDB = ordersDB;
        this.usersDB = usersDB;
    }


    // addBooks() - adds books to inventory
    addBooks(
        bookID: string,
        title: string,
        price: number,
        bookQuantity: number
    ): Books {
        this.ensureNonEmptyString(bookID, "bookID");
        this.ensureNonEmptyString(title, "title");

        if (price < 0) {
            throw new Error("Price cannot be negative");
        }

        if (bookQuantity < 0) {
            throw new Error("Book quantity cannot be negative");
        }

        if (this.booksDB.has(bookID)) {
            throw new Error("Book already exists");
        }
        
        const newBook: Books = {
            bookID,
            title,
            price,
            bookQuantity
        }

        this.booksDB.set(bookID, newBook);
        return newBook;

    }

    // Adds a book to user's cart (creates a temporary booking)
    addToCart(
        bookID: string,
        userID: string,
        quantity: number,
        bookingID: string,
    ): Booking {
        this.ensureNonEmptyString(bookID, "bookID");
        this.ensureNonEmptyString(userID, "userID");
        this.ensureNonEmptyString(bookingID, "bookingID");

        if (quantity < 1) {
            throw new Error("Quantity must be at least 1");
        }

        const user = this.usersDB.get(userID);
        if (!user) {
            throw new Error("User not found");
        }

        const book = this.booksDB.get(bookID);
        if (!book) {
            throw new Error("Book not found");
        }

        if (book.bookQuantity < quantity) {
            throw new Error("Not enough books in stock");
        }

        const newBooking: Booking = {
            bookingID,
            bookID,
            userID,
            quantity,
            status: BookingStatus.CONFIRMED
        };

        this.bookingsDB.set(bookingID, newBooking);
        return newBooking;
    }

    // Places an order from cart and updates inventory
    placeOrder(
        orderID: string,
        userID: string,
        bookingID: string,
    ): Orders {
        this.ensureNonEmptyString(orderID, "orderID");
        this.ensureNonEmptyString(userID, "userID");
        this.ensureNonEmptyString(bookingID, "bookingID");

        // check if order already exists
        if (this.ordersDB.has(orderID)) {
            throw new Error("Order already exists");
        }

        const booking = this.bookingsDB.get(bookingID);
        if (!booking) {
            throw new Error("Booking not found");
        }

        if (booking.userID !== userID) {
            throw new Error("Booking does not belong to user");
        }

        if (booking.status !== BookingStatus.CONFIRMED) {
            throw new Error("Booking is not confirmed");
        } 

        const book = this.booksDB.get(booking.bookID);
        if (!book) {
            throw new Error("Book not found");
        }

        if (booking.quantity > book.bookQuantity) {
            throw new Error("Not enough books in stock");
        }

        const updatedBook: Books = {
            ...book,
            bookQuantity: book.bookQuantity - booking.quantity
        };

        this.booksDB.set(book.bookID, updatedBook);

        const newOrder: Orders = {
            orderID,
            bookID: booking.bookID,
            userID,
            status: BookingStatus.CONFIRMED,
            quantity: booking.quantity,
        };
        this.ordersDB.set(orderID, newOrder);
        this.bookingsDB.delete(bookingID);
        return newOrder;
    }
    
    // Cancels an order and restores inventory
    cancelOrder(orderID: string, userID: string): Orders { 
        this.ensureNonEmptyString(orderID, "orderID");
        this.ensureNonEmptyString(userID, "userID");
    
        const order = this.ordersDB.get(orderID);
        if (!order) {
            throw new Error("Order not found");
        }

        if (order.status !== BookingStatus.CONFIRMED) {
            throw new Error("Order is not confirmed");
        }

        if (order.userID !== userID) {
            throw new Error("Order does not belong to user");
        }

        const book = this.booksDB.get(order.bookID);
        if (!book) {
            throw new Error("Book not found");
        }

        const updatedBook: Books = {
            ...book,
            bookQuantity: book.bookQuantity + order.quantity
        };

        this.booksDB.set(book.bookID, updatedBook);

        const updatedOrder: Orders = {
            ...order,
            status: BookingStatus.CANCELED
        };

        this.ordersDB.set(orderID, updatedOrder);
        return updatedOrder;
    }

    // Utility function to validate string input
    private ensureNonEmptyString(value: string, fieldName: string): void {
        if (!value || value.trim() === "") {
            throw new Error(`${fieldName} cannot be empty`);
        }
    }
}

export const amazonService = new AmazonService();
export default amazonService;