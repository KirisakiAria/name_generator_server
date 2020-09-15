const mongoose = require('mongoose')
const Schema = mongoose.Schema

const applicationSchema = new Schema({
  secret: String,
  appName: String,
  packageName: String,
  buildNumber: String,
  version: String,
  downloadLink: String,
})

const Application = mongoose.model('Application', applicationSchema)

module.exports = Application
