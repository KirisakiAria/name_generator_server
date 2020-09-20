const mongoose = require('mongoose')
const Schema = mongoose.Schema

const applicationSchema = new Schema({
  secret: String,
  appName: String,
  packageName: String,
  buildNumber: String,
  version: String,
  downloadLink: String,
  downloadTimes: Number,
})

const Application = mongoose.model('Application', applicationSchema)

module.exports = Application
