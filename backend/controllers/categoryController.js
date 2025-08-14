const express = require('express');
const { Category, Book, Author } = require('../models');
const router = express.Router();

/**
 * GET /api/v1/categories
 * Mendapatkan semua kategori
 */
router.get('/', async (req, res) => {
  try {
    const { include_books } = req.query;
    
    let options = {
      order: [['name', 'ASC']]
    };

    // Include books jika diminta
    if (include_books === 'true') {
      options.include = [{
        model: Book,
        as: 'books',
        include: [{
          model: Author,
          as: 'authors',
          through: { attributes: ['role', 'contribution_percentage'] }
        }]
      }];
    }

    const categories = await Category.findAll(options);

    res.status(200).json({
      success: true,
      message: 'Categories retrieved successfully',
      data: categories,
      count: categories.length
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve categories',
      error: error.message
    });
  }
});

/**
 * GET /api/v1/categories/:id
 * Mendapatkan kategori berdasarkan ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { include_books } = req.query;

    let options = {
      where: { id }
    };

    if (include_books === 'true') {
      options.include = [{
        model: Book,
        as: 'books',
        include: [{
          model: Author,
          as: 'authors',
          through: { attributes: ['role', 'contribution_percentage'] }
        }]
      }];
    }

    const category = await Category.findOne(options);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Category retrieved successfully',
      data: category
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve category',
      error: error.message
    });
  }
});

/**
 * POST /api/v1/categories
 * Membuat kategori baru
 */
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required'
      });
    }

    const category = await Category.create({
      name: name.trim()
    });

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to create category',
      error: error.message
    });
  }
});

/**
 * PUT /api/v1/categories/:id
 * Update kategori
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    if (name) {
      category.name = name.trim();
    }

    await category.save();

    res.status(200).json({
      success: true,
      message: 'Category updated successfully',
      data: category
    });

  } catch (error) {
    res.status(400).json({
      success: false,
      message: 'Failed to update category',
      error: error.message
    });
  }
});

/**
 * DELETE /api/v1/categories/:id
 * Hapus kategori
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has books
    const bookCount = await Book.count({
      where: { category_id: id }
    });

    if (bookCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It has ${bookCount} book(s) associated.`,
        book_count: bookCount
      });
    }

    await category.destroy();

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to delete category',
      error: error.message
    });
  }
});

module.exports = router;
