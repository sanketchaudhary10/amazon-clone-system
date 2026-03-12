# Amazon Clone System (LLD Exercise)

This project implements a simplified Amazon-like ordering system using TypeScript.
The goal was to design a clean Low-Level Design (LLD) with proper separation of
models, business logic, and API controllers.

The system supports:

- Adding books to inventory
- Adding books to cart
- Placing orders
- Canceling orders
- Updating inventory correctly

This project is implemented using an in-memory database and simple controllers
to focus on business logic and system design.

---

## Problem Statement

Design a simplified e-commerce backend system that supports:

- Adding books to inventory
- Users adding books to cart
- Placing orders
- Canceling orders
- Preventing invalid inventory usage

The system must ensure:

- No order can exceed available inventory
- Inventory updates correctly when order is placed
- Inventory is restored when order is canceled
- Orders belong to the correct user
- Cart must be validated before placing order

---

## System Design

The system is divided into 3 main layers: controllers → service → models

### Controllers

- Handle API input
- Validate request body
- Call service methods
- Return response

Location: src/api/src/controllers

### Service Layer

Contains core business logic.

Responsible for:

- Inventory validation
- Order creation
- Cart handling
- Cancel logic

Location: src/api/src/logic/amazon-booking-service.ts

### Models

Defines data structures used by the system.

Location: src/db/models.ts

---

## Data Flow
Client → Controller → AmazonService → InMemoryDB(Map)

Example:
POST /cart
→ addToCartController
→ AmazonService.addToCart()
→ bookingsDB updated

POST /orders
→ placeOrderController
→ AmazonService.placeOrder()
→ booksDB updated
→ ordersDB updated

PATCH /orders/cancel
→ cancelOrderController
→ AmazonService.cancelOrder()
→ booksDB restored

---

## Inventory Logic

Inventory is stored in: booksDB: Map<string, Books>

When placing order:
if (booking.quantity > book.bookQuantity)
throw error

book.bookQuantity -= booking.quantity

When canceling order: book.bookQuantity += order.quantity

This ensures inventory is always consistent.

---

## Why Cart → Booking → Order

I separated the flow into 3 stages:

### 1. Cart (Booking)

Temporary reservation

addToCart()
→ bookingsDB

### 2. Order

Final confirmed purchase
placeOrder()
→ ordersDB

### 3. Cancel

Reverts inventory
cancelOrder()
→ restore inventory

This design allows:

- Validation before order
- Safe inventory update
- Clean cancel logic
- Realistic e-commerce flow

---

## Why In-Memory Database

For this exercise, Maps are used instead of a real database.
Map<string, Books>
Map<string, Booking>
Map<string, Orders>
Map<string, User>

Reason:

- Faster to implement
- Focus on business logic
- Easy to test
- No external dependencies

In real system, this would be:

- DynamoDB / PostgreSQL / MySQL
- With transactions / locks

---

## How to Extend

This system can be extended with:

### Multiple books per order

Change: Orders → bookID → bookItems[]

### Cart expiration (TTL)

Add:

createdAt
expiresAt

### Payment status

Add enum:
PENDING
PAID
FAILED
CANCELED

### Concurrency safety

Use:

- DB transactions
- Conditional writes
- Locks

### Real database

Replace Maps with:

- Repository layer
- DB adapter

---

## Folder Structure
amazon-clone-system
└─ src
├─ api
│ └─ src
│ ├─ controllers
│ ├─ logic
│ └─ infra
├─ db
│ └─ models.ts
└─ ui

---

## Notes

Focus areas:

- Clean service logic
- Correct inventory handling
- Proper separation of layers
- Simple but realistic flow

---


## Repository Structure:
```
amazon-clone-system
└─ src
   ├─ api
   │  └─ src
   │     ├─ controllers
   │     │  ├─ add-books-controller.ts
   │     │  ├─ add-to-cart-controller.ts
   │     │  ├─ place-order-controller.ts
   │     │  └─ cancel-order-controller.ts
   │     ├─ logic
   │     │  └─ amazon-booking-service.ts
   │     └─ infra
   │        └─ swagger-definitions.yaml
   ├─ db
   │  └─ models.ts
   └─ ui

```