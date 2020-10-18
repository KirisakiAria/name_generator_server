const mongoose = require('mongoose')
const Schema = mongoose.Schema

const InspirationSchema = new Schema({
  chinese: {
    title: String,
    author: String,
    content: String,
  },
  japanese: {
    title: String,
    author: String,
    content: String,
  },
  date: Date,
  likedUsers: [String],
})

const Inspiration = mongoose.model('Inspiration', InspirationSchema)

module.exports = Inspiration
