const express = require('express');
const { Book, Author, Category, BookAuthor, sequelize } = require('../models');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const router = express.Router();

/**
 * GET /api/v1/books
 * Mendapatkan semua buku dengan pagination, filter, dan search
 */
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      category_id, 
      author_id,
      min_price,
      max_price,
      in_stock = 'all',
      sort_by = 'title',
      sort_order = 'ASC'
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = {};
    let includeAuthors = {
      model: Author,
      as: 'authors',
      through: { 
        attributes: ['role', 'contribution_percentage'],
        as: 'bookAuthor'
      }
    };

    // Search functionality
    if (search) {
      whereClause[sequelize.Sequelize.Op.or] = [
        { title: { [sequelize.Sequelize.Op.like]: `%${search}%` } },
        { description: { [sequelize.Sequelize.Op.like]: `%${search}%` } }
      ];
    }

    // Filter by category
    if (category_id) {
      whereClause.category_id = category_id;
    }

    // Filter by price range
    if (min_price) {
      whereClause.price = { ...whereClause.price, [sequelize.Sequelize.Op.gte]: min_price };
    }
    if (max_price) {
      whereClause.price = { ...whereClause.price, [sequelize.Sequelize.Op.lte]: max_price };
    }

    // Filter by stock
    if (in_stock === 'true') {
      whereClause.stock = { [sequelize.Sequelize.Op.gt]: 0 };
    } else if (in_stock === 'false') {
      whereClause.stock = 0;
    }

    // Filter by author
    if (author_id) {
      includeAuthors.where = { id: author_id };
      includeAuthors.required = true;
    }

    let options = {
      where: whereClause,
      include: [
        includeAuthors,
        {
          model: Category,
          as: 'category'
        }
      ],
      limit: parseInt(limit),
      offset: offset,
      order: [[sort_by, sort_order.toUpperCase()]],
      distinct: true // Important for correct count with associations
    };

    const { count, rows: books } = await Book.findAndCountAll(options);

    res.status(200).json({
      success: true,
      message: 'Books retrieved successfully',
      data: books,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / parseInt(limit)),
        total_items: count,
        items_per_page: parseInt(limit)
      },
      filters: {
        search,
        category_id,
        author_id,
        min_price,
        max_price,
        in_stock,
        sort_by,
        sort_order
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve books',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/books/:id
 * Mendapatkan buku berdasarkan ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findOne({
      where: { id },
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

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Book retrieved successfully',
      data: book
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve book',
      error: error.message
    });
  }
});

/**
 * POST /api/v1/books
 * Membuat buku baru dengan authors (Admin only)
 */
router.post('/', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { 
      title, 
      published_date, 
      category_id, 
      isbn, 
      price = 0, 
      stock = 0, 
      description,
      authors = [] // Array of { author_id, role, contribution_percentage }
    } = req.body;

    // Validation
    if (!title) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'Book title is required'
      });
    }

    if (authors.length === 0) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: 'At least one author is required'
      });
    }

    // Validate total contribution percentage
    const totalContribution = authors.reduce((sum, author) => 
      sum + (author.contribution_percentage || 100), 0
    );

    if (totalContribution > 100) {
      await transaction.rollback();
      return res.status(400).json({
        success: false,
        message: `Total contribution percentage cannot exceed 100%. Current total: ${totalContribution}%`
      });
    }

    // Create book
    const book = await Book.create({
      title: title.trim(),
      published_date,
      category_id,
      isbn,
      price: parseFloat(price),
      stock: parseInt(stock),
      description: description?.trim()
    }, { transaction });

    // Create book-author relationships
    const bookAuthors = authors.map(author => ({
      book_id: book.id,
      author_id: author.author_id,
      role: author.role || 'Primary Author',
      contribution_percentage: author.contribution_percentage || 100
    }));

    await BookAuthor.bulkCreate(bookAuthors, { transaction });

    await transaction.commit();

    // Fetch created book with associations
    const createdBook = await Book.findOne({
      where: { id: book.id },
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

    res.status(201).json({
      success: true,
      message: 'Book created successfully',
      data: createdBook
    });

  } catch (error) {
    await transaction.rollback();
    res.status(400).json({
      success: false,
      message: 'Failed to create book',
      error: error.message
    });
  }
});

/**
 * PUT /api/v1/books/:id
 * Update buku (Admin only)
 */
router.put('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;
    const { 
      title, 
      published_date, 
      category_id, 
      isbn, 
      price, 
      stock, 
      description,
      authors // Array of { author_id, role, contribution_percentage }
    } = req.body;

    const book = await Book.findByPk(id, { transaction });

    if (!book) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Update book fields
    if (title) book.title = title.trim();
    if (published_date !== undefined) book.published_date = published_date;
    if (category_id !== undefined) book.category_id = category_id;
    if (isbn !== undefined) book.isbn = isbn;
    if (price !== undefined) book.price = parseFloat(price);
    if (stock !== undefined) book.stock = parseInt(stock);
    if (description !== undefined) book.description = description?.trim();

    await book.save({ transaction });

    // Update authors if provided
    if (authors && Array.isArray(authors)) {
      // Validate total contribution
      const totalContribution = authors.reduce((sum, author) => 
        sum + (author.contribution_percentage || 100), 0
      );

      if (totalContribution > 100) {
        await transaction.rollback();
        return res.status(400).json({
          success: false,
          message: `Total contribution percentage cannot exceed 100%. Current total: ${totalContribution}%`
        });
      }

      // Remove existing authors
      await BookAuthor.destroy({
        where: { book_id: id },
        transaction
      });

      // Add new authors
      const bookAuthors = authors.map(author => ({
        book_id: id,
        author_id: author.author_id,
        role: author.role || 'Primary Author',
        contribution_percentage: author.contribution_percentage || 100
      }));

      await BookAuthor.bulkCreate(bookAuthors, { transaction });
    }

    await transaction.commit();

    // Fetch updated book with associations
    const updatedBook = await Book.findOne({
      where: { id },
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

    res.status(200).json({
      success: true,
      message: 'Book updated successfully',
      data: updatedBook
    });

  } catch (error) {
    await transaction.rollback();
    res.status(400).json({
      success: false,
      message: 'Failed to update book',
      error: error.message
    });
  }
});

/**
 * DELETE /api/v1/books/:id
 * Hapus buku (Admin only)
 */
router.delete('/:id', authenticateToken, authorizeRoles('admin'), async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const { id } = req.params;

    const book = await Book.findByPk(id, { transaction });

    if (!book) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Delete book (BookAuthor akan terhapus otomatis karena CASCADE)
    await book.destroy({ transaction });

    await transaction.commit();

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully'
    });

  } catch (error) {
    await transaction.rollback();
    res.status(500).json({
      success: false,
      message: 'Failed to delete book',
      error: error.message
    });
  }
});

/**
 * POST /api/v1/books/:id/authors
 * Menambah author ke buku yang sudah ada
 */
router.post('/:id/authors', async (req, res) => {
  try {
    const { id } = req.params;
    const { author_id, role = 'Co-Author', contribution_percentage = 0 } = req.body;

    // Check if book exists
    const book = await Book.findByPk(id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Check if author exists
    const author = await Author.findByPk(author_id);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }

    // Check if relationship already exists
    const existingRelation = await BookAuthor.findOne({
      where: { book_id: id, author_id }
    });

    if (existingRelation) {
      return res.status(409).json({
        success: false,
        message: 'Author is already associated with this book'
      });
    }

    // Validate contribution percentage
    const validation = await BookAuthor.validateTotalContribution(id);
    if (validation.remaining < contribution_percentage) {
      return res.status(400).json({
        success: false,
        message: `Cannot add ${contribution_percentage}%. Only ${validation.remaining}% remaining.`,
        current_total: validation.total
      });
    }

    // Create relationship
    const bookAuthor = await BookAuthor.create({
      book_id: id,
      author_id,
      role,
      contribution_percentage
    });

    res.status(201).json({
      success: true,
      message: 'Author added to book successfully',
      data: bookAuthor
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to add author to book',
      error: error.message
    });
  }
});

/**
 * DELETE /api/v1/books/:id/authors/:author_id
 * Menghapus author dari buku
 */
router.delete('/:id/authors/:author_id', async (req, res) => {
  try {
    const { id, author_id } = req.params;

    const bookAuthor = await BookAuthor.findOne({
      where: { book_id: id, author_id }
    });

    if (!bookAuthor) {
      return res.status(404).json({
        success: false,
        message: 'Book-author relationship not found'
      });
    }

    // Check if this is the only author
    const authorCount = await BookAuthor.count({
      where: { book_id: id }
    });

    if (authorCount === 1) {
      return res.status(400).json({
        success: false,
        message: 'Cannot remove the only author from a book'
      });
    }

    await bookAuthor.destroy();

    res.status(200).json({
      success: true,
      message: 'Author removed from book successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to remove author from book',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/books/stats/popular
 * Mendapatkan buku populer (stok sedikit)
 */
router.get('/stats/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const popularBooks = await Book.findAll({
      where: {
        stock: { [sequelize.Sequelize.Op.gt]: 0 }
      },
      include: [
        {
          model: Author,
          as: 'authors',
          through: { attributes: ['role', 'contribution_percentage'] }
        },
        {
          model: Category,
          as: 'category'
        }
      ],
      order: [['stock', 'ASC']], // Stok sedikit = populer
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      message: 'Popular books retrieved successfully',
      data: popularBooks
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve popular books',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/books/stats/new-releases
 * Mendapatkan buku rilis terbaru
 */
router.get('/stats/new-releases', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const newBooks = await Book.findAll({
      include: [
        {
          model: Author,
          as: 'authors',
          through: { attributes: ['role', 'contribution_percentage'] }
        },
        {
          model: Category,
          as: 'category'
        }
      ],
      order: [['published_date', 'DESC']],
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      message: 'New release books retrieved successfully',
      data: newBooks
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve new release books',
      error: error.message
    });
  }
});

module.exports = router;
