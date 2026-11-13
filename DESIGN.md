---

### DESIGN.md

```markdown
# Design Write-Up

## 1. Architecture
The application utilizes a standard, decoupled 3-tier architecture:
*   **Frontend:** React (bootstrapped with Vite for performance) serving as a Single Page Application (SPA). It uses `react-router-dom` for seamless client-side navigation without page reloads.
*   **Backend:** Node.js with Express.js, providing RESTful APIs to handle business logic, date overlap calculations, and transaction safety.
*   **Database:** MySQL relational database. Chosen for its strong ACID compliance, which is critical for handling financial transactions and concurrent booking locks.

## 2. Database Design
The schema is normalized to ensure data integrity:
*   **`hotels`**: Stores static property metadata (`id`, `name`, `location`, `description`, `amenities`, `price_per_night`).
*   **`rooms`**: Represents physical inventory. Contains `id`, `hotel_id` (FK), and `room_number`. 
*   **`bookings`**: The central transactional table. Uses a `booking_ref` (UUID) as the primary key for security. Contains foreign keys to `hotels` and `rooms`, guest details, date ranges, and `total_amount`.
*   **Constraints & Enums**: The `bookings` table utilizes a `status` ENUM (`PENDING`, `CONFIRMED`, `CANCELLED`) and an `expires_at` timestamp to manage the lifecycle of a reservation.

## 3. API Design
*   `GET /api/hotels`: Searches available hotels based on location, ensuring the room's date range does not mathematically overlap with an active booking in the database.
*   `GET /api/hotels/:id`: Fetches specific hotel metadata for the property details page.
*   `POST /api/bookings/lock`: Initiates a database transaction to lock a room, securely calculates the total price on the server, and returns a 5-minute expiration timestamp.
*   `POST /api/bookings/confirm`: Finalizes a `PENDING` booking by attaching guest details and updating the status to `CONFIRMED`.
*   `GET /api/bookings/:ref`: Retrieves a confirmed booking to display the digital receipt.
*   `DELETE /api/bookings/:ref`: Updates a booking's status to `CANCELLED`, immediately releasing the room inventory for future searches.

## 4. Booking Logic
*   **Date Validation:** Enforced on both the client (preventing past dates or inverted check-out dates) and the server.
*   **Pricing:** Calculated strictly on the backend to prevent client-side manipulation. The server multiplies the hotel's `price_per_night` by the mathematical difference between the check-in and check-out dates.
*   **Availability Checks:** Evaluated using a SQL subquery that checks for overlapping intervals: `(check_in_date < requestedCheckOut AND check_out_date > requestedCheckIn)`. 
*   **Cancellation:** Soft-deletes the record by changing the status to `CANCELLED`, preserving historical data while freeing up the room's dates.

## 5. Design Decisions
*   **UUIDs for Bookings:** Used instead of auto-incrementing integers to prevent malicious users from guessing and accessing other users' booking receipts.
*   **Split Checkout UI:** Designed the frontend booking page to mimic commercial platforms (e.g., Airbnb) with a sticky price summary on the right and a guest detail form on the left, enhancing the professional feel of the UX.
*   **Vite over Create React App:** Chosen for significantly faster Hot Module Replacement (HMR) during development and optimized build times.

## 6. Simultaneous Bookings (Race Conditions)
Handling two users attempting to book the last available room simultaneously is managed at the database level. 
When a user hits the checkout page, the `POST /api/bookings/lock` endpoint initiates a MySQL transaction. It executes a `SELECT ... FOR UPDATE` query on the requested date range. This places a row-level lock on the overlapping records. If User A and User B request the same room at the exact same millisecond, the database forces User B's transaction to wait. Once User A's transaction commits (creating the lock), User B's query evaluates the new data, recognizes the room is no longer available, rolls back, and returns a 400 error to the frontend.

## 7. Surprise Feature: 5-Minute Booking Lockdown
**What the feature does:** 
When a user clicks "Reserve Room" and enters the checkout flow, the application temporarily locks that specific room for their selected dates for exactly 5 minutes. A countdown timer appears on their screen.

**Why I chose it:** 
It solves a highly frustrating real-world user problem: losing a room or ticket while in the middle of typing in credit card or personal details. It provides peace of mind during checkout and mimics the behavior of enterprise ticketing systems.

**How I implemented it:** 
When the checkout page loads, it calls `/api/bookings/lock`. The backend creates a record in the `bookings` table with a `status` of `PENDING` and an `expires_at` timestamp set 5 minutes into the future. 
*   If the user submits their details within 5 minutes, the backend updates the status to `CONFIRMED` and nullifies the expiration. 
*   If the timer expires, the frontend blocks submission. The backend requires no cron jobs or cleanup scripts; the primary availability SQL query simply ignores `PENDING` rows where `expires_at < NOW()`, meaning the room naturally reappears in search results the moment the 5 minutes pass.

## 8. Limitations and Improvements
**Limitations:**
*   The system currently supports only one room per hotel (as permitted by the core requirements).
*   Payments are simulated; there is no actual financial transaction.

**Improvements with more time:**
*   **Authentication:** Implement JWT (JSON Web Tokens) to allow users to log in, save their profiles, and view booking histories without needing their reference IDs.
*   **Payment Gateway:** Integrate the Stripe API to handle secure credit card processing before confirming a reservation.
*   **Containerization:** Add a `Dockerfile` and `docker-compose.yml` to spin up the Node backend, React frontend, and MySQL database instantly in isolated containers.
