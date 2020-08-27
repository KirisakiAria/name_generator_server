const mongoose = require('mongoose')
const Schema = mongoose.Schema

const adminSchema = new Schema({
  uid: Number,
  avatar: String,
  username: String,
  password: String,
  secretCode: String,
})

const Admin = mongoose.model('Admin', adminSchema)

module.exports = Admin
