require('dotenv').config()
const mongoose = require('mongoose')
/*
const BadArgumentErrorFunction = ()=>{
 console.log(`incorrect argument structure, the correct command structure is: node mongo.js yourpassword name number for adding new contacts, or node mongo.js yourpassword for finding existing ones `)
 process.exit(1)
}
*/
const url = process.env.MONGODB_URI
mongoose.set('strictQuery', false)
mongoose.connect(url, { family: 4 })
  .then(() => {
    console.log('connected to mongoDB')
  }).catch(error => {
    console.log('error connecting to mongo', error.message)
  })

const ContactSchema = new mongoose.Schema({
  name:{
    type: String,
    minLength: [3, 'field needs to have at least 3 characters'],
    required: [true, 'field is required to be filled out']
  },
  number:{
    type: String,
    validate: {
      validator: (n) => {
        return /\d{2,3}-\d{6}/.test(n)
      },
      message: props => `${props.value} is not a valid phone number, 
            phone numbers must have 2-3 digits followed by a - and then a minimum of 6 digits`
    },
    required: [true, 'field is required to be filled out']
  }
})
/*
const addedContact = new Contact({
    name: Name,
    number: PhoneNumber,
})
if(process.argv.length === 5){
addedContact.save().then(result => {
    console.log(`note successfully saved`, result)
    console.log( `added ${Name}, number: ${PhoneNumber} to the phonebook`)
    mongoose.connection.close()
})
}else{
if(process.argv.length === 3){
    Contact.find({}).then(result => {
        result.forEach(note => {
            console.log(note)
        })
        mongoose.connection.close()
    })
}else{
BadArgumentErrorFunction()
}
}
*/
ContactSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})
const Contact = mongoose.model('Contact', ContactSchema)

module.exports = Contact