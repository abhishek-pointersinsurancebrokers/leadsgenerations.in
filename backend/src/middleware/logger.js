
//middleware/logger.js
module.exports = (req, res, next) => {
  console.log(`\n=== REQUEST LOG ===`);
  console.log(`Method: ${req.method}`);
  console.log(`URL: ${req.url}`);
  console.log(`Body:`, req.body);
  console.log(`===================\n`);
  next();
};