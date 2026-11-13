import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Book from './pages/Book';
import Manage from './pages/Manage';

export default function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/">Search Hotels</Link>
        <Link to="/manage">Manage Bookings</Link>
      </nav>
      <div className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<Book />} />
          <Route path="/manage" element={<Manage />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}