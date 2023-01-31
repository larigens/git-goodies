const router = require('express').Router();
const categoryRoutes = require('./category-routes');
const productRoutes = require('./product-routes');
const tagRoutes = require('./tag-routes');

// Prefix all routes 
router.use('/categories', categoryRoutes); // defined in `category-routes.js` with `/categories
router.use('/products', productRoutes); // defined in `product-routes.js` with `/products
router.use('/tags', tagRoutes); // defined in `tag-routes.js` with `/tags

module.exports = router;
