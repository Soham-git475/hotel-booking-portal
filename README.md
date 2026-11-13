# Hotel Booking Portal

A modern, full-stack hotel booking application featuring real-time availability checking, a commercial-grade checkout flow, and a temporary booking lockdown mechanism to prevent race conditions.

## Prerequisites
- **Node.js**: v18 or higher
- **MySQL**: via XAMPP or standalone (v8.0+ recommended)
- **Git**: To clone the repository

## Step-by-Step Setup Instructions

### 1. Database Setup
1. Start the **Apache** and **MySQL** modules in your XAMPP Control Panel.
2. Open phpMyAdmin (`http://localhost/phpmyadmin`) and create a new database named `hotel_booking_db`.
3. Import the provided `database.sql` file to create the tables (`hotels`, `rooms`, `bookings`) and populate the sample inventory.

### 2. Backend Setup
1. Open a terminal and navigate to the `backend` directory:
   ```bash
   cd backend

Install the dependencies:
npm install

Create a .env file in the backend directory with your database credentials:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=hotel_booking_db
PORT=5000

Start the backend server:
npm start

Open a new terminal window and navigate to the frontend directory:
cd frontend
npm install
Start the Vite development server:
npm run dev

To run the automated backend tests for booking logic and date validation:
cd backend
npm test
