const request = require('supertest');
const express = require('express');

const app = express();
app.use(express.json());

app.post('/api/test/calculate', (req, res) => {
    const { checkIn, checkOut, pricePerNight } = req.body;
    const inDate = new Date(checkIn);
    const outDate = new Date(checkOut);
    
    if (inDate >= outDate) return res.status(400).json({ error: 'Invalid dates' });
    
    const nights = Math.ceil((outDate - inDate) / (1000 * 60 * 60 * 24));
    res.json({ totalAmount: nights * pricePerNight });
});

describe('Booking Logic Tests', () => {
    it('should correctly calculate total amount for valid dates', async () => {
        const res = await request(app)
            .post('/api/test/calculate')
            .send({ checkIn: '2026-12-01', checkOut: '2026-12-05', pricePerNight: 2000 });
        expect(res.statusCode).toEqual(200);
        expect(res.body.totalAmount).toEqual(8000);
    });

    it('should fail if check-out is before check-in', async () => {
        const res = await request(app)
            .post('/api/test/calculate')
            .send({ checkIn: '2026-12-05', checkOut: '2026-12-01', pricePerNight: 2000 });
        expect(res.statusCode).toEqual(400);
    });
});