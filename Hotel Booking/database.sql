-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 13, 2026 at 01:53 PM
-- Server version: 10.11.16-MariaDB
-- PHP Version: 8.5.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `hotel_booking_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `bookings`
--

CREATE TABLE `bookings` (
  `booking_ref` varchar(36) NOT NULL,
  `hotel_id` int(11) NOT NULL,
  `room_id` int(11) NOT NULL,
  `guest_name` varchar(255) DEFAULT NULL,
  `guest_email` varchar(255) DEFAULT NULL,
  `check_in_date` date NOT NULL,
  `check_out_date` date NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('PENDING','CONFIRMED','CANCELLED') DEFAULT 'PENDING',
  `expires_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bookings`
--

INSERT INTO `bookings` (`booking_ref`, `hotel_id`, `room_id`, `guest_name`, `guest_email`, `check_in_date`, `check_out_date`, `total_amount`, `status`, `expires_at`, `created_at`) VALUES
('49a275ac-0344-4aba-b607-aba90d15553a', 11, 11, NULL, NULL, '2026-11-14', '2026-11-21', 52500.00, 'PENDING', '2026-11-13 12:37:06', '2026-11-13 12:32:06'),
('be64e99b-739b-41eb-a694-395a6479328f', 15, 15, 'sk', 'sk@sk.sk', '2026-11-14', '2026-11-21', 84000.00, 'CANCELLED', NULL, '2026-11-13 12:30:54');

-- --------------------------------------------------------

--
-- Table structure for table `hotels`
--

CREATE TABLE `hotels` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `location` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `amenities` text DEFAULT NULL,
  `price_per_night` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `hotels`
--

INSERT INTO `hotels` (`id`, `name`, `location`, `description`, `amenities`, `price_per_night`) VALUES
(1, 'The Azure Stay', 'Mumbai', 'Modern business hotel in the city center with skyline views.', 'WiFi, Pool, Gym', 4500.00),
(2, 'Seaside Retreat', 'Mumbai', 'Cozy rooms with a breathtaking view of the Arabian Sea.', 'WiFi, Breakfast, Beach Access', 5500.00),
(3, 'Urban Pods Bandra', 'Mumbai', 'Compact, tech-enabled rooms for solo travelers.', 'WiFi, Workspace, Cafe', 2500.00),
(4, 'Grand Heritage Colaba', 'Mumbai', 'Experience vintage luxury and history in South Mumbai.', 'WiFi, Spa, Fine Dining', 8500.00),
(5, 'Airport Transit Express', 'Mumbai', 'Convenient stay just 5 minutes from T2 Terminal.', 'WiFi, 24/7 Dining, Shuttle', 3500.00),
(6, 'Mountain View Inn', 'Pune', 'Quiet getaway surrounded by the Sahyadri nature.', 'WiFi, Trekking, Breakfast', 3000.00),
(7, 'Koregaon Park Suites', 'Pune', 'Premium suites in the heart of the city.', 'WiFi, Pool, Gym', 5000.00),
(8, 'Deccan Boutique Hotel', 'Pune', 'Cultural heritage with modern amenities.', 'WiFi, Library, Restaurant', 4000.00),
(9, 'Hinjewadi Tech Inn', 'Pune', 'Perfect for business trips and IT professionals.', 'WiFi, Workspace, Gym', 3200.00),
(10, 'Viman Nagar Central', 'Pune', 'Vibrant stay near shopping centers and nightlife.', 'WiFi, Bar, Breakfast', 3800.00),
(11, 'Palm Beach Resort', 'Goa', 'Beachfront property with direct access to the sand and surf.', 'WiFi, Spa, Beach Access', 7500.00),
(12, 'Baga Surf House', 'Goa', 'Lively stay close to popular shacks and water sports.', 'WiFi, Bar, Pool', 4200.00),
(13, 'Anjuna Backpacker Hostel', 'Goa', 'Budget-friendly and highly social environment for travelers.', 'WiFi, Cafe, Events', 1200.00),
(14, 'Panjim Heritage Stay', 'Goa', 'Restored Portuguese villa in the Latin Quarter.', 'WiFi, Breakfast, Library', 5000.00),
(15, 'South Goa Luxury Villas', 'Goa', 'Private luxury and tranquility away from the crowds.', 'WiFi, Private Pool, Chef', 12000.00),
(16, 'Orange City Hotel', 'Nagpur', 'Central location ideal for family and business stays.', 'WiFi, Restaurant, Parking', 3500.00),
(17, 'Ambazari Lake View', 'Nagpur', 'Peaceful rooms overlooking the lake.', 'WiFi, Breakfast, Garden', 4000.00),
(18, 'Wardha Road Transit', 'Nagpur', 'Quick access to the airport and industrial hubs.', 'WiFi, 24/7 Dining, Gym', 2800.00),
(19, 'Sitabuldi Central Inn', 'Nagpur', 'Budget hotel right in the main shopping district.', 'WiFi, AC, Room Service', 1800.00),
(20, 'Nagpur Heritage', 'Nagpur', 'Classic architecture with comfortable modern upgrades.', 'WiFi, Pool, Banquet', 4500.00),
(21, 'Tech Park Suites', 'Bangalore', 'Modern stay located right inside the IT corridor.', 'WiFi, Workspace, Gym', 4800.00),
(22, 'MG Road Boutique', 'Bangalore', 'Luxury boutique hotel surrounded by pubs and shopping.', 'WiFi, Spa, Bar', 6500.00),
(23, 'Koramangala Stay', 'Bangalore', 'Cozy and green stay in the startup hub of the city.', 'WiFi, Cafe, Terrace', 3200.00),
(24, 'Indiranagar Pods', 'Bangalore', 'Smart micro-hotel for young professionals and travelers.', 'WiFi, AC, Lounge', 2200.00),
(25, 'Whitefield Business Hotel', 'Bangalore', 'Premium corporate hotel with extensive meeting facilities.', 'WiFi, Pool, Fine Dining', 7000.00);

-- --------------------------------------------------------

--
-- Table structure for table `rooms`
--

CREATE TABLE `rooms` (
  `id` int(11) NOT NULL,
  `hotel_id` int(11) NOT NULL,
  `room_number` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `rooms`
--

INSERT INTO `rooms` (`id`, `hotel_id`, `room_number`) VALUES
(1, 1, '101'),
(2, 2, '201'),
(3, 3, '301'),
(4, 4, '401'),
(5, 5, '501'),
(6, 6, '601'),
(7, 7, '701'),
(8, 8, '801'),
(9, 9, '901'),
(10, 10, '1001'),
(11, 11, '1101'),
(12, 12, '1201'),
(13, 13, '1301'),
(14, 14, '1401'),
(15, 15, '1501'),
(16, 16, '1601'),
(17, 17, '1701'),
(18, 18, '1801'),
(19, 19, '1901'),
(20, 20, '2001'),
(21, 21, '2101'),
(22, 22, '2201'),
(23, 23, '2301'),
(24, 24, '2401'),
(25, 25, '2501');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `bookings`
--
ALTER TABLE `bookings`
  ADD PRIMARY KEY (`booking_ref`),
  ADD KEY `hotel_id` (`hotel_id`),
  ADD KEY `room_id` (`room_id`);

--
-- Indexes for table `hotels`
--
ALTER TABLE `hotels`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `rooms`
--
ALTER TABLE `rooms`
  ADD PRIMARY KEY (`id`),
  ADD KEY `hotel_id` (`hotel_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `hotels`
--
ALTER TABLE `hotels`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- AUTO_INCREMENT for table `rooms`
--
ALTER TABLE `rooms`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=26;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `bookings`
--
ALTER TABLE `bookings`
  ADD CONSTRAINT `bookings_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`),
  ADD CONSTRAINT `bookings_ibfk_2` FOREIGN KEY (`room_id`) REFERENCES `rooms` (`id`);

--
-- Constraints for table `rooms`
--
ALTER TABLE `rooms`
  ADD CONSTRAINT `rooms_ibfk_1` FOREIGN KEY (`hotel_id`) REFERENCES `hotels` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
