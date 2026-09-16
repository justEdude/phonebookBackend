//structure and methods used are, as to be expected, mostly sourced from the course's content
console.log("run works")
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
/*
the request logger below exists for learning purposes

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

*/
app.use(express.json())
app.use(express.static(`dist`))
/* so morgan was logging a line i didn't recognize, after googling i learned from the search gemini,
it was the default get performed by chrome devtools 
decided to use the skip method mentioned in the documentation to, well, skip it, gemini helped with how to specify the url object
since I was still confused after reading the documentation, source for the fix was morgan middleware article on express.js website
*/

morgan.token(`data`, (req, res)=>{return JSON.stringify(req.body)})

app.use(morgan(`:method :url :status :res[content-length] - :response-time ms :data`,{
  skip: (req, res) => {return req.url.includes(`/.well-known/appspecific/com.chrome.devtools.json`)}
}))
//app.use(requestLogger)

//gets contacts
app.get('/api/persons', (request, response)=>{
  response.json(contacts)
})
//finds a specific contact
app.get('/api/persons/:id',(request, response)=>{
  const id = request.params.id
  const contact = contacts.find(n => n.id === id)
  if(contact){
  response.json(contact)
  }else{
    response.status(404).end()
  }
})

//deletes contacts
app.delete('/api/persons/:id',(request, response)=>{
  const id = request.params.id
  contacts = contacts.filter(n => n.id !== id)
 response.status(204).end()
})

//datetime display methods given by googles search gemini
app.get('/info', (request, response)=>{
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
  
  // for some reason the rest client extension will return the <br/> in the text instead of just using it to skip the line, 
  // however opening the link in the browser shows it skipping the line as intended
  response.send(`the phonebook has info for ${contacts.length} people <br/>
    ${new Date().toLocaleString('en-US', timeZone)}
    ${timeZone}`)
  
})

//googled how to scale math.random and how many numbers in a given range, answer was given by search gemini
const randomID = ()=> {
  let newID =  Math.floor(Math.random() * 10000)
  return newID
}

//handles post
app.post('/api/persons', (request, response)=>{
const body = request.body
if(!body.name || !body.number){
  response.statusMessage = `a vital field was found to be missing, both name and number need to be filled out`
  return response.status(400).json({
    error: "could not add new contact, missing name or number fields"
  })
}else{
  const uniqueName =  contacts.find(n=> n.name === body.name)
  if(!uniqueName){
    const ToBeAdded = {
      id : randomID(),
      name : body.name,
      number : body.number,
    }
    contacts = contacts.concat(ToBeAdded)
    response.json(ToBeAdded)
  }else{
    response.statusMessage = `name already exists in the contacts list, name needs to be unique`
  return response.status(400).json({
    error: "name must be unique"
  })
  }
}
})
//handles unknown endpoints
const unknownEndpoint = (request, response) => {
  response.status(404).send({error: `unknown endpoint`})
}

app.use(unknownEndpoint)

//port being listened to
const PORT = process.env.PORT || 3001
app.listen(PORT, ()=> {
console.log(`server running on port ${PORT}`);
})