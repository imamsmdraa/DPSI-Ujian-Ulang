-- =========================================
-- Database Script Berdasarkan ERD Diagram
-- Toko Buku Online dengan Relasi Many-to-Many
-- =========================================

-- Membuat database
CREATE DATABASE IF NOT EXISTS bookstore_db;
USE bookstore_db;

-- Menghapus tabel jika sudah ada (untuk testing)
DROP TABLE IF EXISTS book_author;
DROP TABLE IF EXISTS book;
DROP TABLE IF EXISTS author;
DROP TABLE IF EXISTS category;

-- =========================================
-- 1. TABEL CATEGORY (Harus dibuat pertama)
-- =========================================
CREATE TABLE category (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT uk_category_name UNIQUE (name)
);

-- =========================================
-- 2. TABEL AUTHOR 
-- =========================================
CREATE TABLE author (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    biography TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Constraints
    CONSTRAINT chk_author_name_length CHECK (LENGTH(name) >= 2)
);

-- =========================================
-- 3. TABEL BOOK (Membutuhkan category sudah ada)
-- =========================================
CREATE TABLE book (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    published_date DATE,
    category_id VARCHAR(50),
    isbn VARCHAR(20) UNIQUE,
    price DECIMAL(10,2) DEFAULT 0.00,
    stock INT DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Foreign Key Constraints
    CONSTRAINT fk_book_category 
        FOREIGN KEY (category_id) 
        REFERENCES category(id) 
        ON UPDATE CASCADE 
        ON DELETE SET NULL,
    
    -- Check Constraints
    CONSTRAINT chk_book_title_length CHECK (LENGTH(title) >= 1),
    CONSTRAINT chk_book_price CHECK (price >= 0),
    CONSTRAINT chk_book_stock CHECK (stock >= 0),
    CONSTRAINT chk_published_date CHECK (published_date <= CURDATE())
);

-- =========================================
-- 4. TABEL BOOK_AUTHOR (Junction Table untuk Many-to-Many)
-- =========================================
CREATE TABLE book_author (
    book_id VARCHAR(50) NOT NULL,
    author_id VARCHAR(50) NOT NULL,
    role ENUM('Primary Author', 'Co-Author', 'Editor', 'Translator') DEFAULT 'Primary Author',
    contribution_percentage DECIMAL(5,2) DEFAULT 100.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Composite Primary Key
    PRIMARY KEY (book_id, author_id),
    
    -- Foreign Key Constraints
    CONSTRAINT fk_book_author_book 
        FOREIGN KEY (book_id) 
        REFERENCES book(id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE,
    
    CONSTRAINT fk_book_author_author 
        FOREIGN KEY (author_id) 
        REFERENCES author(id) 
        ON UPDATE CASCADE 
        ON DELETE CASCADE,
    
    -- Check Constraints
    CONSTRAINT chk_contribution_percentage 
        CHECK (contribution_percentage > 0 AND contribution_percentage <= 100)
);

-- =========================================
-- Membuat Index untuk Optimasi Query
-- =========================================

-- Index untuk pencarian berdasarkan judul buku
CREATE INDEX idx_book_title ON book(title);

-- Index untuk pencarian berdasarkan tanggal publikasi
CREATE INDEX idx_book_published_date ON book(published_date);

-- Index untuk pencarian berdasarkan kategori
CREATE INDEX idx_book_category ON book(category_id);

-- Index untuk pencarian berdasarkan nama author
CREATE INDEX idx_author_name ON author(name);

-- Index untuk pencarian berdasarkan nama kategori
CREATE INDEX idx_category_name ON category(name);

-- Index untuk relasi book_author
CREATE INDEX idx_book_author_book ON book_author(book_id);
CREATE INDEX idx_book_author_author ON book_author(author_id);

-- =========================================
-- Insert Data Sample untuk Testing
-- =========================================

-- Insert sample categories
INSERT INTO category (id, name) VALUES
('CAT001', 'Fiction'),
('CAT002', 'Non-Fiction'),
('CAT003', 'Science'),
('CAT004', 'Technology'),
('CAT005', 'History'),
('CAT006', 'Biography'),
('CAT007', 'Education'),
('CAT008', 'Religion');

-- Insert sample authors
INSERT INTO author (id, name, biography) VALUES
('AUT001', 'Andrea Hirata', 'Penulis Indonesia terkenal dengan karya Laskar Pelangi'),
('AUT002', 'Tere Liye', 'Penulis novel populer Indonesia dengan banyak karya bestseller'),
('AUT003', 'Pramoedya Ananta Toer', 'Sastrawan Indonesia pemenang berbagai penghargaan internasional'),
('AUT004', 'Dee Lestari', 'Novelis dan penyanyi Indonesia, dikenal dengan serial Supernova'),
('AUT005', 'Ahmad Tohari', 'Sastrawan Indonesia yang dikenal dengan karya berlatar budaya Jawa'),
('AUT006', 'Habiburrahman El Shirazy', 'Penulis novel islami terkenal'),
('AUT007', 'Eka Kurniawan', 'Penulis kontemporer Indonesia dengan gaya penulisan unik'),
('AUT008', 'Leila S. Chudori', 'Jurnalis dan novelis Indonesia');

-- Insert sample books
INSERT INTO book (id, title, published_date, category_id, isbn, price, stock, description) VALUES
('BOO001', 'Laskar Pelangi', '2005-08-15', 'CAT001', '978-602-291-290-7', 75000.00, 50, 'Novel tentang perjuangan anak-anak di Belitung untuk bersekolah'),
('BOO002', 'Bumi Manusia', '1980-06-01', 'CAT001', '978-602-291-018-7', 80000.00, 30, 'Novel sejarah tentang kehidupan di masa kolonial Belanda'),
('BOO003', 'Ayat-Ayat Cinta', '2004-12-01', 'CAT001', '978-979-22-2815-4', 65000.00, 40, 'Novel islami tentang cinta dan kehidupan mahasiswa Indonesia di Mesir'),
('BOO004', 'Supernova: Ksatria, Puteri dan Bintang Jatuh', '2001-03-15', 'CAT001', '978-979-22-1234-5', 70000.00, 25, 'Novel fiksi ilmiah tentang cinta dan fisika kuantum'),
('BOO005', 'Ronggeng Dukuh Paruk', '1982-01-01', 'CAT001', '978-979-22-5678-9', 60000.00, 35, 'Novel tentang kehidupan seorang penari ronggeng di Jawa'),
('BOO006', 'Cantik Itu Luka', '2002-10-15', 'CAT001', '978-979-22-9876-1', 85000.00, 20, 'Novel magis realis tentang sejarah Indonesia'),
('BOO007', 'Pulang', '2012-05-20', 'CAT001', '978-979-22-4567-8', 90000.00, 15, 'Novel tentang diaspora Indonesia dan pencarian identitas'),
('BOO008', 'Bintang', '2017-11-10', 'CAT001', '978-602-291-555-7', 72000.00, 60, 'Novel fantasi adventure populer');

-- Insert relasi many-to-many book-author
INSERT INTO book_author (book_id, author_id, role, contribution_percentage) VALUES
-- Laskar Pelangi - Andrea Hirata
('BOO001', 'AUT001', 'Primary Author', 100.00),

-- Bumi Manusia - Pramoedya Ananta Toer
('BOO002', 'AUT003', 'Primary Author', 100.00),

-- Ayat-Ayat Cinta - Habiburrahman El Shirazy
('BOO003', 'AUT006', 'Primary Author', 100.00),

-- Supernova - Dee Lestari
('BOO004', 'AUT004', 'Primary Author', 100.00),

-- Ronggeng Dukuh Paruk - Ahmad Tohari
('BOO005', 'AUT005', 'Primary Author', 100.00),

-- Cantik Itu Luka - Eka Kurniawan
('BOO006', 'AUT007', 'Primary Author', 100.00),

-- Pulang - Leila S. Chudori
('BOO007', 'AUT008', 'Primary Author', 100.00),

-- Bintang - Tere Liye (contoh kolaborasi dengan co-author)
('BOO008', 'AUT002', 'Primary Author', 70.00),
('BOO008', 'AUT004', 'Co-Author', 30.00);

-- =========================================
-- Query Testing untuk Validasi Relasi Many-to-Many
-- =========================================

-- 1. Menampilkan semua buku dengan author dan kategorinya
SELECT 
    b.id as book_id,
    b.title,
    c.name as category,
    GROUP_CONCAT(
        CONCAT(a.name, ' (', ba.role, ' - ', ba.contribution_percentage, '%)')
        ORDER BY ba.contribution_percentage DESC
        SEPARATOR '; '
    ) as authors,
    b.published_date,
    CONCAT('Rp ', FORMAT(b.price, 0)) as price,
    b.stock
FROM book b
LEFT JOIN category c ON b.category_id = c.id
LEFT JOIN book_author ba ON b.id = ba.book_id
LEFT JOIN author a ON ba.author_id = a.id
GROUP BY b.id, b.title, c.name, b.published_date, b.price, b.stock
ORDER BY b.published_date DESC;

-- 2. Menampilkan semua buku dari author tertentu
SELECT 
    a.name as author_name,
    b.title,
    c.name as category,
    ba.role,
    ba.contribution_percentage,
    b.published_date
FROM author a
JOIN book_author ba ON a.id = ba.author_id
JOIN book b ON ba.book_id = b.id
LEFT JOIN category c ON b.category_id = c.id
WHERE a.name LIKE '%Tere Liye%'
ORDER BY b.published_date;

-- 3. Menampilkan buku yang memiliki lebih dari satu author (kolaborasi)
SELECT 
    b.title,
    COUNT(ba.author_id) as total_authors,
    GROUP_CONCAT(
        CONCAT(a.name, ' (', ba.role, ')')
        ORDER BY ba.contribution_percentage DESC
        SEPARATOR ', '
    ) as all_authors
FROM book b
JOIN book_author ba ON b.id = ba.book_id
JOIN author a ON ba.author_id = a.id
GROUP BY b.id, b.title
HAVING total_authors > 1
ORDER BY total_authors DESC;

-- 4. Menampilkan statistik author berdasarkan jumlah buku
SELECT 
    a.name as author_name,
    COUNT(ba.book_id) as total_books,
    AVG(ba.contribution_percentage) as avg_contribution,
    GROUP_CONCAT(ba.role SEPARATOR ', ') as roles
FROM author a
LEFT JOIN book_author ba ON a.id = ba.author_id
GROUP BY a.id, a.name
ORDER BY total_books DESC, avg_contribution DESC;

-- 5. Menampilkan buku berdasarkan kategori dengan informasi author
SELECT 
    c.name as category_name,
    COUNT(DISTINCT b.id) as total_books,
    COUNT(DISTINCT ba.author_id) as total_authors,
    GROUP_CONCAT(DISTINCT a.name ORDER BY a.name SEPARATOR ', ') as all_authors
FROM category c
LEFT JOIN book b ON c.id = b.category_id
LEFT JOIN book_author ba ON b.id = ba.book_id
LEFT JOIN author a ON ba.author_id = a.id
GROUP BY c.id, c.name
ORDER BY total_books DESC;

-- =========================================
-- Stored Procedures untuk Operasi Umum
-- =========================================

DELIMITER //

-- Procedure untuk menambah buku baru dengan author
CREATE PROCEDURE AddBookWithAuthor(
    IN p_book_id VARCHAR(50),
    IN p_title VARCHAR(500),
    IN p_published_date DATE,
    IN p_category_id VARCHAR(50),
    IN p_isbn VARCHAR(20),
    IN p_price DECIMAL(10,2),
    IN p_stock INT,
    IN p_description TEXT,
    IN p_author_id VARCHAR(50),
    IN p_role ENUM('Primary Author', 'Co-Author', 'Editor', 'Translator'),
    IN p_contribution DECIMAL(5,2)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Insert book
    INSERT INTO book (id, title, published_date, category_id, isbn, price, stock, description)
    VALUES (p_book_id, p_title, p_published_date, p_category_id, p_isbn, p_price, p_stock, p_description);
    
    -- Insert book-author relationship
    INSERT INTO book_author (book_id, author_id, role, contribution_percentage)
    VALUES (p_book_id, p_author_id, p_role, p_contribution);
    
    COMMIT;
END //

-- Procedure untuk mencari buku berdasarkan keyword
CREATE PROCEDURE SearchBooks(
    IN p_keyword VARCHAR(255)
)
BEGIN
    SELECT 
        b.id,
        b.title,
        c.name as category,
        GROUP_CONCAT(a.name SEPARATOR ', ') as authors,
        b.published_date,
        b.price,
        b.stock
    FROM book b
    LEFT JOIN category c ON b.category_id = c.id
    LEFT JOIN book_author ba ON b.id = ba.book_id
    LEFT JOIN author a ON ba.author_id = a.id
    WHERE b.title LIKE CONCAT('%', p_keyword, '%')
       OR a.name LIKE CONCAT('%', p_keyword, '%')
       OR c.name LIKE CONCAT('%', p_keyword, '%')
    GROUP BY b.id, b.title, c.name, b.published_date, b.price, b.stock
    ORDER BY b.title;
END //

DELIMITER ;

-- =========================================
-- Views untuk Query yang Sering Digunakan
-- =========================================

-- View untuk menampilkan buku lengkap dengan informasi author dan kategori
CREATE VIEW vw_books_complete AS
SELECT 
    b.id as book_id,
    b.title,
    b.isbn,
    b.published_date,
    b.price,
    b.stock,
    b.description,
    c.id as category_id,
    c.name as category_name,
    a.id as author_id,
    a.name as author_name,
    a.biography as author_biography,
    ba.role as author_role,
    ba.contribution_percentage
FROM book b
LEFT JOIN category c ON b.category_id = c.id
LEFT JOIN book_author ba ON b.id = ba.book_id
LEFT JOIN author a ON ba.author_id = a.id;

-- View untuk statistik ringkas
CREATE VIEW vw_bookstore_stats AS
SELECT 
    (SELECT COUNT(*) FROM book) as total_books,
    (SELECT COUNT(*) FROM author) as total_authors,
    (SELECT COUNT(*) FROM category) as total_categories,
    (SELECT COUNT(*) FROM book_author) as total_book_author_relationships,
    (SELECT COUNT(DISTINCT book_id) FROM book_author GROUP BY book_id HAVING COUNT(*) > 1) as books_with_multiple_authors;

-- =========================================
-- Triggers untuk Audit dan Validasi
-- =========================================

-- Trigger untuk memvalidasi bahwa setiap buku harus memiliki minimal satu author
DELIMITER //

CREATE TRIGGER tr_book_must_have_author
AFTER INSERT ON book
FOR EACH ROW
BEGIN
    -- Check akan dilakukan melalui aplikasi atau constraint terpisah
    -- Karena MySQL tidak mendukung deferred constraint checking
    INSERT INTO book_author (book_id, author_id, role) 
    SELECT NEW.id, 'AUT999', 'Primary Author'
    WHERE NOT EXISTS (SELECT 1 FROM book_author WHERE book_id = NEW.id)
    AND NOT EXISTS (SELECT 1 FROM author WHERE id = 'AUT999');
END //

DELIMITER ;

-- =========================================
-- Test untuk memastikan relasi Many-to-Many berfungsi
-- =========================================

-- Test 1: Tambah author baru ke buku yang sudah ada
INSERT INTO book_author (book_id, author_id, role, contribution_percentage)
VALUES ('BOO001', 'AUT002', 'Editor', 10.00);

-- Test 2: Verify many-to-many relationship
SELECT 
    'Test Many-to-Many Relationship' as test_name,
    b.title,
    COUNT(ba.author_id) as author_count,
    GROUP_CONCAT(a.name SEPARATOR ', ') as authors
FROM book b
JOIN book_author ba ON b.id = ba.book_id
JOIN author a ON ba.author_id = a.id
WHERE b.id = 'BOO001'
GROUP BY b.id, b.title;

-- =========================================
-- Dokumentasi Schema
-- =========================================

/*
STRUKTUR DATABASE:

1. CATEGORY
   - id (VARCHAR(50), PK): Unique identifier untuk kategori
   - name (VARCHAR(100)): Nama kategori buku
   - created_at, updated_at: Timestamp untuk audit

2. AUTHOR
   - id (VARCHAR(50), PK): Unique identifier untuk author
   - name (VARCHAR(255)): Nama lengkap author
   - biography (TEXT): Biografi author
   - created_at, updated_at: Timestamp untuk audit

3. BOOK
   - id (VARCHAR(50), PK): Unique identifier untuk buku
   - title (VARCHAR(500)): Judul buku
   - published_date (DATE): Tanggal publikasi
   - category_id (VARCHAR(50), FK): Referensi ke category
   - isbn (VARCHAR(20)): International Standard Book Number
   - price (DECIMAL(10,2)): Harga buku
   - stock (INT): Jumlah stok
   - description (TEXT): Deskripsi buku
   - created_at, updated_at: Timestamp untuk audit

4. BOOK_AUTHOR (Junction Table)
   - book_id (VARCHAR(50), FK): Referensi ke book
   - author_id (VARCHAR(50), FK): Referensi ke author
   - role (ENUM): Peran author dalam buku
   - contribution_percentage (DECIMAL(5,2)): Persentase kontribusi
   - created_at: Timestamp untuk audit
   - PRIMARY KEY: (book_id, author_id)

RELASI:
- BOOK : CATEGORY (Many-to-One)
- BOOK : AUTHOR (Many-to-Many melalui BOOK_AUTHOR)

FITUR:
- Full referential integrity dengan FK constraints
- Cascade operations untuk update/delete
- Check constraints untuk validasi data
- Indexes untuk optimasi query
- Views untuk kemudahan query
- Stored procedures untuk operasi umum
- Sample data lengkap untuk testing
*/
