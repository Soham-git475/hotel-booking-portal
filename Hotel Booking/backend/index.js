require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

pool.getConnection()
    .then(conn => {
        console.log('Connected to MySQL via XAMPP');
        conn.release();
    })
    .catch(err => console.error('Database connection failed:', err));

app.get('/api/hotels', async (req, res) => {
    const { location, checkIn, checkOut } = req.query;
    
    if (!location || !checkIn || !checkOut) {
        return res.status(400).json({ error: 'Missing search parameters' });
    }

    try {
        const query = `
            SELECT h.*, r.id as room_id 
            FROM hotels h
            JOIN rooms r ON h.id = r.hotel_id
            WHERE h.location LIKE ?
            AND r.id NOT IN (
                SELECT room_id FROM bookings
                WHERE (check_in_date < ? AND check_out_date > ?)
                AND (status = 'CONFIRMED' OR (status = 'PENDING' AND expires_at > NOW()))
            )
        `;
        const [rows] = await pool.query(query, [`%${location}%`, checkOut, checkIn]);
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Database error' });
    }
});

app.get('/api/hotels/:id', async (req, res) => {
    try {
        const [hotel] = await pool.query('SELECT * FROM hotels WHERE id = ?', [req.params.id]);
        if (!hotel.length) return res.status(404).json({ error: 'Hotel not found' });
        res.json(hotel[0]);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.post('/api/bookings/lock', async (req, res) => {
    const { hotelId, roomId, checkIn, checkOut } = req.body;
    const connection = await pool.getConnection();
    
    try {
        await connection.beginTransaction();

        // 1. Fetch price securely on the backend
        const [hotelRows] = await connection.query('SELECT price_per_night FROM hotels WHERE id = ?', [hotelId]);
        if (!hotelRows.length) throw new Error('Hotel not found');
        
        const pricePerNight = hotelRows[0].price_per_night;
        const inDate = new Date(checkIn);
        const outDate = new Date(checkOut);
        const nights = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
        const totalAmount = nights * pricePerNight;

        // 2. Check for race conditions
        const [existing] = await connection.query(`
            SELECT * FROM bookings 
            WHERE room_id = ? 
            AND (check_in_date < ? AND check_out_date > ?)
            AND (status = 'CONFIRMED' OR (status = 'PENDING' AND expires_at > NOW()))
            FOR UPDATE
        `, [roomId, checkOut, checkIn]);

        if (existing.length > 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'Room just got booked by someone else.' });
        }

        const bookingRef = uuidv4();
        const expiresAt = new Date(Date.now() + 5 * 60000);

        await connection.query(`
            INSERT INTO bookings (booking_ref, hotel_id, room_id, check_in_date, check_out_date, total_amount, status, expires_at)
            VALUES (?, ?, ?, ?, ?, ?, 'PENDING', ?)
        `, [bookingRef, hotelId, roomId, checkIn, checkOut, totalAmount, expiresAt]);

        await connection.commit();
        res.json({ bookingRef, expiresAt, totalAmount });
    } catch (err) {
        await connection.rollback();
        console.error(err);
        res.status(500).json({ error: 'Failed to lock room' });
    } finally {
        connection.release();
    }
});

app.post('/api/bookings/confirm', async (req, res) => {
    const { bookingRef, guestName, guestEmail } = req.body;
    
    try {
        const [result] = await pool.query(`
            UPDATE bookings 
            SET guest_name = ?, guest_email = ?, status = 'CONFIRMED', expires_at = NULL
            WHERE booking_ref = ? AND status = 'PENDING' AND expires_at > NOW()
        `, [guestName, guestEmail, bookingRef]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ error: 'Booking session expired or invalid.' });
        }
        res.json({ success: true, bookingRef });
    } catch (err) {
        res.status(500).json({ error: 'Failed to confirm booking' });
    }
});

app.get('/api/bookings/:ref', async (req, res) => {
    const { email } = req.query;
    try {
        const [booking] = await pool.query(`
            SELECT b.*, h.name as hotel_name, h.location 
            FROM bookings b
            JOIN hotels h ON b.hotel_id = h.id
            WHERE b.booking_ref = ? AND b.guest_email = ? AND b.status = 'CONFIRMED'
        `, [req.params.ref, email]);
        
        if (!booking.length) return res.status(404).json({ error: 'Booking not found' });
        res.json(booking[0]);
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

app.delete('/api/bookings/:ref', async (req, res) => {
    const { email } = req.query;
    try {
        const [result] = await pool.query(`
            UPDATE bookings SET status = 'CANCELLED' 
            WHERE booking_ref = ? AND guest_email = ? AND status = 'CONFIRMED'
        `, [req.params.ref, email]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Booking not found or already cancelled' });
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Database error' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});