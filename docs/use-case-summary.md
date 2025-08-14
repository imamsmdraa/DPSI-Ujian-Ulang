# SUB-CPMK-8: Desain Sistem dengan UML
## Use Case Diagram - Sistem Manajemen Toko Buku Online

### Summary Fitur yang Diimplementasikan

| No | Use Case | Aktor | Deskripsi | Status |
|----|----------|-------|-----------|--------|
| 1 | Login User | User, Admin | Autentikasi pengguna untuk masuk ke sistem | ✅ Selesai |
| 2 | Melihat Daftar Buku | Admin | Admin dapat melihat semua buku dalam sistem | ✅ Selesai |
| 3 | Mengubah Data Buku | Admin | Admin dapat mengedit informasi buku | ✅ Selesai |
| 4 | Menghapus Buku | Admin | Admin dapat menghapus buku dari sistem | ✅ Selesai |

### Actor Hierarchy
```
User (Base Actor)
└── Admin (Specialized Actor)
    ├── Inherits: Login User
    └── Additional: View/Edit/Delete Books
```

### Use Case Relationships

#### Include Relationships
- **Login User** `<<include>>` **Validasi Kredensial**
- **Mengubah Data Buku** `<<include>>` **Melihat Daftar Buku**
- **Menghapus Buku** `<<include>>` **Melihat Daftar Buku**

#### Extend Relationships  
- **Admin** extends **User** (inheritance)

### Access Control Matrix

| Fitur | User | Admin |
|-------|------|-------|
| Login User | ✅ | ✅ |
| Melihat Daftar Buku | ❌ | ✅ |
| Mengubah Data Buku | ❌ | ✅ |
| Menghapus Buku | ❌ | ✅ |

### File yang Dibuat

1. **use-case-diagram.puml** - Diagram UML lengkap dengan styling
2. **use-case-simple.puml** - Diagram UML sederhana dan fokus  
3. **use-case-specification.md** - Spesifikasi detail setiap use case
4. **use-case-summary.md** - Summary dan dokumentasi (file ini)

### Cara Melihat Diagram

Untuk melihat diagram PlantUML:
1. Install extension PlantUML di VS Code
2. Buka file `.puml` 
3. Press `Alt+D` atau gunakan Preview PlantUML

### Validasi Requirements ✅

| Requirement | Implementation | Status |
|-------------|----------------|--------|
| 1. Login user | Use Case: Login User | ✅ |
| 2. Melihat daftar buku (hanya admin) | Use Case: Melihat Daftar Buku + Access Control | ✅ |
| 3. Mengubah data buku (hanya admin) | Use Case: Mengubah Data Buku + Access Control | ✅ |
| 4. Menghapus buku (hanya admin) | Use Case: Menghapus Buku + Access Control | ✅ |

**Status: SUB-CPMK-8 COMPLETED ✅**

### Design Principles Applied

1. **Separation of Concerns**: Setiap use case memiliki tanggung jawab yang jelas
2. **Access Control**: Role-based permissions (User vs Admin)
3. **Data Integrity**: Konfirmasi untuk operasi destructive (delete)
4. **User Experience**: Login sebagai entry point untuk semua fitur
5. **Security**: Authentication required untuk akses sistem
