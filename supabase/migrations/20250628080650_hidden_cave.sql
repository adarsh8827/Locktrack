-- Insert demo users
INSERT INTO users (name, email, password, role, created_at) VALUES 
('Super Admin', 'superadmin@excisemia.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'SUPERADMIN', CURRENT_TIMESTAMP),
('Admin User', 'admin@excisemia.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'ADMIN', CURRENT_TIMESTAMP),
('Tracking Team', 'tracking@excisemia.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2uheWG/igi.', 'TRACKING', CURRENT_TIMESTAMP);

-- Insert demo locks
INSERT INTO locks (lock_number, status, assigned_to, last_updated) VALUES 
('L001', 'AVAILABLE', NULL, CURRENT_TIMESTAMP),
('L002', 'IN_TRANSIT', 3, CURRENT_TIMESTAMP),
('L003', 'ON_REVERSE_TRANSIT', 3, CURRENT_TIMESTAMP),
('L004', 'REACHED', NULL, CURRENT_TIMESTAMP);

-- Insert demo schedules
INSERT INTO schedules (date, note, created_by, created_at) VALUES 
('2024-12-20', 'Regular inspection route', 2, CURRENT_TIMESTAMP),
('2024-12-21', 'Emergency response', 2, CURRENT_TIMESTAMP),
('2024-12-22', 'Maintenance check', 1, CURRENT_TIMESTAMP);

-- Insert demo trips
INSERT INTO trips (lock_id, schedule_id, start_time, end_time, distance_km, detention_mins, status) VALUES 
(2, 1, CURRENT_TIMESTAMP - INTERVAL '2' HOUR, NULL, 25.5, 30, 'ACTIVE'),
(3, 2, CURRENT_TIMESTAMP - INTERVAL '1' HOUR, NULL, 15.2, 45, 'ACTIVE'),
(4, 1, CURRENT_TIMESTAMP - INTERVAL '3' HOUR, CURRENT_TIMESTAMP - INTERVAL '1' HOUR, 32.1, 20, 'COMPLETED');

-- Insert demo remarks
INSERT INTO remarks (lock_id, user_id, user_name, message, timestamp) VALUES 
(1, 2, 'Admin User', 'Lock inspected and ready for deployment', CURRENT_TIMESTAMP - INTERVAL '1' HOUR),
(2, 3, 'Tracking Team', 'Started transit to destination', CURRENT_TIMESTAMP - INTERVAL '30' MINUTE),
(3, 3, 'Tracking Team', 'On reverse route, ETA 2 hours', CURRENT_TIMESTAMP - INTERVAL '15' MINUTE),
(4, 2, 'Admin User', 'Trip completed successfully', CURRENT_TIMESTAMP - INTERVAL '5' MINUTE);