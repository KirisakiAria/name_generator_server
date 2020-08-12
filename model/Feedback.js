const mongoose = require('mongoose')
const Schema = mongoose.Schema

const feedbackSchema = new Schema({
  uid: String,
  tel: String,
  content: String,
  time: Date,
})

const Feedback = mongoose.model('Feedback', feedbackSchema)

module.exports = Feedback
