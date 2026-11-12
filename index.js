//structure and methods used are, as to be expected, mostly sourced from the course's content
console.log("run works")
require(`dotenv`).config()
const Contact = require(`./models/contact`)
const DateModel = require(`./models/info`)
const express = require('express')
const morgan = require('morgan')
const app = express()
//contacts content
let contacts = [
    { 
      "id": "1",
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": "2",
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": "3",
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": "4",
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    },
    {
      "id": "5",
      "name": "testing addition",
      "number": "8402-8922"
    }
]
/*get
the request logger below exists for learning purposes

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

*/
app.use(express.static('dist'))
app.use(express.json())
/* so morgan was logging a line i didn't recognize, after googling i learned from the search gemini,
it was the default get performed by chrome devtools 
decided to use the skip method mentioned in the documentation to, well, skip it, gemini helped with how to specify the url object
since I was still confused after reading the documentation, source for the fix was morgan middleware article on express.js website
*/

morgan.token(`data`, (req, res)=>{return JSON.stringify(req.body)})
morgan.token(`statusMessage`, (req, res)=>{return res.statusMessage})

app.use(morgan(`:method :url :status :res[content-length] - :response-time ms :data :statusMessage`,{
  skip: (req, res) => {return req.url.includes(`/.well-known/appspecific/com.chrome.devtools.json`)}
}))
//app.use(requestLogger)

//gets contacts
app.get('/api/persons', (request, response, next)=>{
  Contact.find({}).then(contact=>{
   console.log(contact.length)
   response.json(contact)
  }).catch(error =>{ 
  console.log(error.message)
  next(error)
})
  
})
//finds a specific contact
app.get('/api/persons/:id',(request, response, next)=>{
  const id = request.params.id
  Contact.findById(id).then(contact=>{
  if(contact){
  response.json(contact)
  }else{
    response.status(404).end()
  }
}).catch(error =>{ 
  console.log(error.message)
  next(error)
})
})

//deletes contacts
app.delete('/api/persons/:id',(request, response, next)=>{
  const id = request.params.id
  Contact.findByIdAndDelete(id).then(contact=>{
  response.status(204).end()
}).catch(error =>{ 
  console.log(error.message)
  next(error)
})
})

//datetime display methods given by googles search gemini
app.get('/info', (request, response)=>{
const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
const DateTime = new Date().toLocaleString('en-US', timeZone)
  Contact.find({}).then(documents=>{
  // for some reason the rest client extension will return the <br/> in the text instead of just using it to skip the line, 
  // however opening the link in the browser shows it skipping the line as intended
   const info = `the phonebook has info for ${documents.length} people`
   const Query = {info: info, Date: DateTime}
   const infoDocument = DateModel.findOneAndReplace({}, Query,{
    returnDocument: `after`,
    upsert:true
   }).then(infoDoc=>{
    response.json(infoDoc)
   }).catch(error =>{ 
  console.log(error.message)
  next(error)
   })
  })
})

//googled how to scale math.random and how many numbers in a given range, answer was given by search gemini
const randomID = ()=> String(Math.floor(Math.random() * 10000))

app.put('/api/persons/:id', (request, response, next)=>{
const {name, number} = request.body

Contact.findById(request.params.id).then(addedContact=>{
if(!addedContact){
    return response.status(400).json({
    error: "given user does not exist"
  })
}

 addedContact.name = name
 addedContact.number = number
//save() only updates modified properties of existing documents instead of creating a new whole new document.
 addedContact.save().then(updatedContact=>{
  response.json(updatedContact)
 })
 .catch(error =>{ 
  console.log(error.message)
  next(error)
 })
})
})

/* ok i had not seen the instructions to ignore the duplicate filter at this stage before making it 
and i just realised that the frontend filter servers that purpose already
buuut ima still leave it here for learning purposes
even if its not needed, at least right now */
//handles post
app.post('/api/persons', (request, response, next)=>{
const body = request.body
if(!body.name && !body.number){
  // simple validation in case they are both empty because that would trigger both validation messages from mongoose
  return response.status(400).send({error: `both name and number fields need to be filled out`})
}
     const NewContact = new Contact({
      name : body.name,
      number : body.number,
    })
    NewContact.save().then(contact=>{
    response.json(contact)
    })
    .catch(error =>{ 
  console.log(error.message)
  next(error)
    })
})
//handles unknown endpoints
const unknownEndpoint = (request, response) => {
  response.status(404).send({error: `unknown endpoint`})
}
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  }else if(error.name === 'ValidationError'){
    return response.status(400).send({error: error.message})
  }

  next(error)
}
app.use(errorHandler)

//port being listened to
const PORT = process.env.PORT || 3001
app.listen(PORT, ()=> {
console.log(`server running on port ${PORT}`);
})