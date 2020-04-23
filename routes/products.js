const express = require('express')
const router = express('router')
const mongoose = require('mongoose')
const multer = require('multer')
const checkAuth = require('../middleware/check-auth')

const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, './uploads/')
  },
  filename: function(req, file, cb) {
    cb(null, Date.now() + file.originalname)
  }
})

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true)
  } else {
    cb(null, false)
  }
}

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
})

const Product = require('../models/product')

router.get('/', (req, res, next) => {
  Product.find()
  .select("name price _id productImage")
  .exec()
  .then(docs => {
    const response = {
      count: docs.length,
      products: docs.map(doc => {
        return {
          name: doc.name,
          price: doc.price,
          productImage: doc.productImage,
          _id: doc._id,
          request: {
            type: 'GET',
            url: 'http://localhost:8081/products/' + doc._id
          }
        }
      })
    }
      res.status(200).json(response)
  })
  .catch(err => {
    res.status(500).json({
      error: err
    })
  })
})

router.post('/', checkAuth, upload.single('productImage'), (req, res, next) => {
  console.log('file ?', req.file)
  console.log('files ?', req.files)
  const { name, price } = req.body
  

  const product = new Product({
    _id: new mongoose.Types.ObjectId,
    name,
    price,
    productImage: req.file.path
  })

  product.save()
    .then(result => {
      res.status(201).json({
        message: 'Created product successfully',
        createProduct: {
          productId: result._id,
          name: result.name,
          price: result.price,
          request : {
            type: 'GET',
            url: 'http://localhost:8081/products/' + result._id
          }
        }
      })
    })
    .catch(err => {
      res.status(500).json({
        error: err
      })
    })

  
})

router.get('/:productId', (req, res, next) => {
  console.log('ProductId', req.params)
  const id = req.params.productId;
  Product.findById(id)
    .select('name price_id productImage')
    .exec()
    .then(doc => { 
      console.log('Obtenu ===>  ', doc)
      if (doc) {
        res.status(200).json({
          product: doc,
          request: {
            type: 'GET',
            url: 'http://localhost/products/'
          }
        })
      } else {
        res.status(404).json({
          message: 'No valid entry found for provided ID',
          id
        })
      }
    })
    .catch(err => {
      console.log('Erreur ===>  ', err)
      res.status(500).json({error: err})
    })
})

router.patch('/:productId', (req, res, next) => {
  const id = req.params.productId
  const updateOps = {}
  for (const ops of req.body) {
    console.log('ops ===> ', ops)
    updateOps[ops.propName] = ops.value
  }
  console.log('UPDATE OPS', updateOps)
  Product.update({ _id: id }, { $set: updateOps })
  .exec()
  .then(result => {
    console.log(result)
    res.status(200).json({
      message: 'Product updated',
      request: {
        type: 'GET',
        url: 'http://localhost/products/' + id
      }
    })
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({
      error: err
    })
  })
})

router.delete('/:productId', (req, res, next) => {
  const id = req.params.productId
  Product.remove({ _id: id })
  .exec()
  .then(result => {
    res.status(200).json(result)
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({
      error: err
    })
  })
  
  
  res.status(200).json({
    message: 'Delete product'
  })
})

module.exports = router
