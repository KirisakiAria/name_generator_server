const mongoose = require('mongoose')
const Schema = mongoose.Schema

const feedbackSchema = new Schema({
  tel: String,
  username: String,
  email: String,
  content: String,
  date: Date,
})

const Feedback = mongoose.model('Feedback', feedbackSchema)

module.exports = Feedback
