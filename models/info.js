 require(`dotenv`).config()
const mongoose = require('mongoose')

const url = process.env.MONGODB_URI
mongoose.set(`strictQuery`, false)
mongoose.connect(url, {family: 4})

const DateSchema = new mongoose.Schema({
    info:String,
    Date:String,
})

DateSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const DateModel = mongoose.model(`DateModel`, DateSchema)

module.exports = DateModel

 