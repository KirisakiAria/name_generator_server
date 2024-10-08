const mongoose = require('mongoose')
const Schema = mongoose.Schema

const NotificationSchema = new Schema({
  title: String,
  content: String,
  date: String,
})

const Notification = mongoose.model('Notification', NotificationSchema)

module.exports = Notification
