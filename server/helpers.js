// sends a proper error message back to the frontend
function handleError(res, err) {
  console.log('Error:', err.message);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ message: messages.join(', ') });
  }
  if (err.code === 11000) {
    return res.status(400).json({ message: 'This value already exists. Please use a different one.' });
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ message: 'Invalid id.' });
  }
  res.status(500).json({ message: 'Something went wrong on the server.' });
}

module.exports = { handleError };
