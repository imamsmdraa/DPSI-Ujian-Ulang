const express = require('express');
const { Author, Book, BookAuthor, Category } = require('../models');
const router = express.Router();

/**
 * GET /api/v1/authors
 * Mendapatkan semua author dengan pagination dan filter
 */
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      include_books = 'false' 
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = {};
    
    // Search functionality
    if (search) {
      whereClause.name = {
        [require('sequelize').Op.like]: `%${search}%`
      };
    }

    let options = {
      where: whereClause,
      limit: parseInt(limit),
      offset: offset,
      order: [['name', 'ASC']]
    };

    // Include books jika diminta
    if (include_books === 'true') {
      options.include = [{
        model: Book,
        as: 'books',
        through: { 
          attributes: ['role', 'contribution_percentage'],
          as: 'bookAuthor'
        },
        include: [{
          model: Category,
          as: 'category'
        }]
      }];
    }

    const { count, rows: authors } = await Author.findAndCountAll(options);

    res.status(200).json({
      success: true,
      message: 'Authors retrieved successfully',
      data: authors,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / parseInt(limit)),
        total_items: count,
        items_per_page: parseInt(limit)
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve authors',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/authors/:id
 * Mendapatkan author berdasarkan ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { include_books = 'true' } = req.query;

    let options = {
      where: { id }
    };

    if (include_books === 'true') {
      options.include = [{
        model: Book,
        as: 'books',
        through: { 
          attributes: ['role', 'contribution_percentage'],
          as: 'bookAuthor'
        },
        include: [{
          model: Category,
          as: 'category'
        }]
      }];
    }

    const author = await Author.findOne(options);

    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }

    // Tambahkan statistik author
    const stats = {
      total_books: await BookAuthor.count({
        where: { author_id: id }
      }),
      roles: await BookAuthor.findAll({
        where: { author_id: id },
        attributes: ['role'],
        group: ['role']
      })
    };

    res.status(200).json({
      success: true,
      message: 'Author retrieved successfully',
      data: author,
      stats: stats
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve author',
      error: error.message
    });
  }
});

/**
 * POST /api/v1/authors
 * Membuat author baru
 */
router.post('/', async (req, res) => {
  try {
    const { name, biography } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Author name is required'
      });
    }

    const author = await Author.create({
      name: name.trim(),
      biography: biography?.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Author created successfully',
      data: author
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create author',
      error: error.message
    });
  }
});

/**
 * PUT /api/v1/authors/:id
 * Update author
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, biography } = req.body;

    const author = await Author.findByPk(id);

    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }

    // Update fields
    if (name) author.name = name.trim();
    if (biography !== undefined) author.biography = biography?.trim() || null;

    await author.save();

    res.status(200).json({
      success: true,
      message: 'Author updated successfully',
      data: author
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update author',
      error: error.message
    });
  }
});

/**
 * DELETE /api/v1/authors/:id
 * Hapus author
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const author = await Author.findByPk(id);

    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }

    // Check if author has books
    const bookCount = await BookAuthor.count({
      where: { author_id: id }
    });

    if (bookCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete author. They have ${bookCount} book(s) associated.`,
        book_count: bookCount
      });
    }

    await author.destroy();

    res.status(200).json({
      success: true,
      message: 'Author deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete author',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/authors/:id/books
 * Mendapatkan semua buku dari author tertentu
 */
router.get('/:id/books', async (req, res) => {
  try {
    const { id } = req.params;

    // Verify author exists
    const author = await Author.findByPk(id);
    if (!author) {
      return res.status(404).json({
        success: false,
        message: 'Author not found'
      });
    }

    const books = await Book.findAll({
      include: [
        {
          model: Author,
          as: 'authors',
          where: { id },
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
      message: `Books by ${author.name} retrieved successfully`,
      data: {
        author: author,
        books: books,
        total_books: books.length
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve author books',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/authors/stats/productive
 * Mendapatkan author paling produktif
 */
router.get('/stats/productive', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const productiveAuthors = await Author.findAll({
      include: [{
        model: BookAuthor,
        as: 'bookAuthors',
        attributes: []
      }],
      attributes: [
        'id',
        'name',
        'biography',
        [require('sequelize').fn('COUNT', require('sequelize').col('bookAuthors.book_id')), 'book_count']
      ],
      group: ['Author.id'],
      order: [[require('sequelize').literal('book_count'), 'DESC']],
      limit: parseInt(limit)
    });

    res.status(200).json({
      success: true,
      message: 'Most productive authors retrieved successfully',
      data: productiveAuthors
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve productive authors',
      error: error.message
    });
  }
});

module.exports = router;
