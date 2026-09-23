const mongoose = require('mongoose')

if(process.argv.length < 3){
    console.log(`missing arguments, the correct command structure is: node mongo.js yourpassword name number for adding new contacts, or node mongo.js yourpassword for finding existing ones `)
    process.exit(1)
}
const Password = process.argv[2]
const Name = process.argv[3]
const PhoneNumber = process.argv[4]
//console.log(Password, Name, Number)

const url = `mongodb://dantonprettibcs_db_user:${Password}@ac-v0mdnhj-shard-00-00.apkny27.mongodb.net:27017,ac-v0mdnhj-shard-00-01.apkny27.mongodb.net:27017,ac-v0mdnhj-shard-00-02.apkny27.mongodb.net:27017/ContactList?ssl=true&replicaSet=atlas-sqgnfs-shard-0&authSource=admin&appName=Contacts`
mongoose.set(`strictQuery`, false)
mongoose.connect(url, {family: 4})

const ContactSchema = new mongoose.Schema({
    name:String,
    number:String,
})
const Contact = mongoose.model(`Contact`, ContactSchema)

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
    Contact.find({}).then(result => {
        result.forEach(note => {
            console.log(note)
        })
        mongoose.connection.close()
    })
}

