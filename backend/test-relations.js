// Script untuk menambah data test dan memastikan relasi berfungsi
const { Book, Author, Category, BookAuthor } = require('./models');

async function addTestData() {
  try {
    // Update books dengan category_id
    await Book.update(
      { category_id: 'CAT001' }, 
      { where: { id: 'BOO001' } }
    );
    
    await Book.update(
      { category_id: 'CAT001' }, 
      { where: { id: 'BOO002' } }
    );

    console.log('✅ Books updated with categories');

    // Tambah kembali relasi book-author yang hilang
    await BookAuthor.destroy({ where: {} }); // Clear existing
    
    const bookAuthorData = [
      {
        book_id: 'BOO001',
        author_id: 'AUT001',
        role: 'Primary Author',
        contribution_percentage: 100,
        created_at: new Date()
      },
      {
        book_id: 'BOO002', 
        author_id: 'AUT003',
        role: 'Primary Author',
        contribution_percentage: 100,
        created_at: new Date()
      }
    ];

    await BookAuthor.bulkCreate(bookAuthorData);
    console.log('✅ Book-Author relations added');

    // Cek relasi book_author sudah ada
    const bookAuthors = await BookAuthor.findAll();
    console.log('📚 Book-Author relations:', bookAuthors.length);
    
    if (bookAuthors.length > 0) {
      bookAuthors.forEach(ba => {
        console.log(`- Book ${ba.book_id} by Author ${ba.author_id}`);
      });
    }

    // Test query dengan include
    const booksWithRelations = await Book.findAll({
      include: [
        {
          model: Author,
          as: 'authors',
          through: { 
            attributes: ['role', 'contribution_percentage'],
            as: 'bookAuthor'
          }
        },
        {
          model: Category,
          as: 'category'
        }
      ]
    });

    console.log('\n📖 Books with relations:');
    booksWithRelations.forEach(book => {
      console.log(`- ${book.title}`);
      console.log(`  Category: ${book.category?.name || 'None'}`);
      console.log(`  Authors: ${book.authors.length}`);
      book.authors.forEach(author => {
        console.log(`    - ${author.name} (${author.bookAuthor?.role})`);
      });
      console.log('');
    });

  } catch (error) {
    console.error('❌ Error:', error);
  }
}

addTestData();
