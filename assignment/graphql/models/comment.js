const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  text: { type: String, required: true },
  post: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true, index: true},
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true},
});

module.exports = mongoose.model('Comment', commentSchema);
