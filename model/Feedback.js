const mongoose = require('mongoose')
const Schema = mongoose.Schema

const feedbackSchema = new Schema({
  feedback: String,
})

const Feedback = mongoose.model('Feedback', feedbackSchema)

module.exports = Feedback
