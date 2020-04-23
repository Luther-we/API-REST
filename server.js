const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const path = require('path')
const colors = require('colors')
const cors = require('./middleware/CORS')
const errors = require('./middleware/errors')
const productRoutes = require('./routes/products')
const orderRoutes = require('./routes/order')
const userRoutes = require('./routes/user')
const infoConsole = require('./console')

mongoose.connect(
  process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
  }
)
  .then(() => infoConsole('Jarvis a accès à sa mémoire'))
  .catch((e) => console.log('Jarvis rencontre quelques problèmes avec Mongo ', e))

const app = express()

// --> MIDDLEWARES
app.use('/uploads/' ,express.static('uploads'))
app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())
app.use(morgan('dev'))
app.use(cors)

// --> ROUTES
app.use('/products', productRoutes)
app.use('/order', orderRoutes)
app.use('/user', userRoutes)

app.get('/', (req, res, next) => {
  res.send('Jarvis pour vous servir')
})

app.use(errors.error404)

app.use(errors.sendError)

app.listen(8081, () => console.log(colors.red.underline('Jarvis API peut servir')))
