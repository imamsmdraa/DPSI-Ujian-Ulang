# Use Case Specification - Sistem Manajemen Toko Buku Online
## SUB-CPMK-8: Desain Sistem dengan UML

### Use Case 1: Login User
**ID**: UC-001  
**Nama**: Login User  
**Aktor**: User, Admin  
**Deskripsi**: Pengguna melakukan autentikasi untuk masuk ke sistem  

**Precondition**: 
- Pengguna memiliki akun yang valid
- Sistem dalam keadaan aktif

**Main Flow**:
1. Pengguna mengakses halaman login
2. Sistem menampilkan form login (username/email dan password)
3. Pengguna memasukkan kredensial
4. Sistem memvalidasi kredensial
5. Sistem mengidentifikasi role pengguna (User/Admin)
6. Sistem memberikan akses sesuai role
7. Sistem menampilkan dashboard sesuai hak akses

**Alternative Flow**:
- 4a. Kredensial tidak valid:
  - 4a.1. Sistem menampilkan pesan error
  - 4a.2. Kembali ke step 2

**Postcondition**: 
- Pengguna berhasil login dan mendapat akses sesuai role
- Session pengguna aktif

---

### Use Case 2: Melihat Daftar Buku (Hanya Admin)
**ID**: UC-002  
**Nama**: Melihat Daftar Buku  
**Aktor**: Admin  
**Deskripsi**: Admin dapat melihat semua buku yang tersedia dalam sistem  

**Precondition**: 
- Admin telah login ke sistem
- Admin memiliki hak akses admin

**Main Flow**:
1. Admin memilih menu "Daftar Buku"
2. Sistem menampilkan daftar semua buku
3. Sistem menampilkan informasi: ID, Judul, Penulis, Kategori, Harga, Stok, Status
4. Admin dapat melakukan pencarian atau filter buku
5. Admin dapat melihat detail lengkap buku

**Alternative Flow**:
- 2a. Tidak ada buku dalam sistem:
  - 2a.1. Sistem menampilkan pesan "Tidak ada buku tersedia"
  - 2a.2. Sistem menyediakan opsi untuk menambah buku baru

**Postcondition**: 
- Admin dapat melihat informasi lengkap semua buku dalam sistem

---

### Use Case 3: Mengubah Data Buku (Hanya Admin)
**ID**: UC-003  
**Nama**: Mengubah Data Buku  
**Aktor**: Admin  
**Deskripsi**: Admin dapat mengubah informasi buku yang sudah ada dalam sistem  

**Precondition**: 
- Admin telah login ke sistem
- Admin memiliki hak akses admin
- Buku yang akan diubah sudah ada dalam sistem

**Main Flow**:
1. Admin melihat daftar buku
2. Admin memilih buku yang akan diubah
3. Sistem menampilkan form edit dengan data buku saat ini
4. Admin mengubah data yang diperlukan (Judul, Penulis, Kategori, Harga, Stok, Deskripsi, ISBN)
5. Admin menyimpan perubahan
6. Sistem memvalidasi data input
7. Sistem menyimpan perubahan ke database
8. Sistem menampilkan pesan konfirmasi berhasil

**Alternative Flow**:
- 6a. Data input tidak valid:
  - 6a.1. Sistem menampilkan pesan error validasi
  - 6a.2. Kembali ke step 4
- 7a. Gagal menyimpan ke database:
  - 7a.1. Sistem menampilkan pesan error
  - 7a.2. Data tidak tersimpan

**Postcondition**: 
- Data buku berhasil diperbarui dalam sistem
- Perubahan terlihat dalam daftar buku

---

### Use Case 4: Menghapus Buku (Hanya Admin)
**ID**: UC-004  
**Nama**: Menghapus Buku  
**Aktor**: Admin  
**Deskripsi**: Admin dapat menghapus buku dari sistem  

**Precondition**: 
- Admin telah login ke sistem
- Admin memiliki hak akses admin
- Buku yang akan dihapus sudah ada dalam sistem

**Main Flow**:
1. Admin melihat daftar buku
2. Admin memilih buku yang akan dihapus
3. Admin memilih opsi "Hapus Buku"
4. Sistem menampilkan dialog konfirmasi penghapusan
5. Admin mengkonfirmasi penghapusan
6. Sistem menghapus buku dari database
7. Sistem menampilkan pesan konfirmasi berhasil
8. Sistem memperbarui daftar buku

**Alternative Flow**:
- 5a. Admin membatalkan penghapusan:
  - 5a.1. Sistem membatalkan operasi
  - 5a.2. Buku tetap ada dalam sistem
- 6a. Gagal menghapus dari database:
  - 6a.1. Sistem menampilkan pesan error
  - 6a.2. Buku tetap ada dalam sistem

**Postcondition**: 
- Buku berhasil dihapus dari sistem
- Buku tidak lagi muncul dalam daftar buku

---

### Use Case 5: Logout
**ID**: UC-005  
**Nama**: Logout  
**Aktor**: User, Admin  
**Deskripsi**: Pengguna keluar dari sistem  

**Precondition**: 
- Pengguna telah login ke sistem

**Main Flow**:
1. Pengguna memilih opsi "Logout"
2. Sistem mengakhiri session pengguna
3. Sistem mengarahkan ke halaman login
4. Sistem menampilkan pesan konfirmasi logout

**Postcondition**: 
- Session pengguna berakhir
- Pengguna diarahkan ke halaman login

---

## Business Rules

1. **BR-001**: Hanya admin yang dapat mengakses fitur manajemen buku (melihat, mengubah, menghapus)
2. **BR-002**: Setiap buku harus memiliki ISBN yang unik
3. **BR-003**: Harga buku tidak boleh negatif
4. **BR-004**: Stok buku tidak boleh negatif
5. **BR-005**: Penghapusan buku harus dikonfirmasi untuk menghindari kesalahan
6. **BR-006**: Session login akan expired setelah periode tertentu untuk keamanan

## Non-Functional Requirements

1. **Performance**: Sistem harus dapat menangani minimal 100 concurrent users
2. **Security**: 
   - Password harus di-encrypt
   - Session management yang aman
   - Role-based access control
3. **Usability**: Interface yang user-friendly dan responsif
4. **Reliability**: System uptime minimal 99.5%
5. **Compatibility**: Support untuk browser modern (Chrome, Firefox, Safari, Edge)
