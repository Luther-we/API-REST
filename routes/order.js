const express = require('express')
const router = express('router')
const mongoose = require('mongoose')
const checkAuth = require('../middleware/check-auth')

const Order = require('../models/order')
const Product = require('../models/product')

const OrderController = require('../controllers/orders')

router.get('/', checkAuth, OrderController.orders_get_all)

router.post('/', (req, res, next) => {
  const productId = req.body.productId
  // console.log('============> ', req.body.productId)
  Product.findById(productId)
    .then(product => {
      if (!product) {
        return res.status(404).json({
          message: "Product not found"
        });
      }
      const order = new Order({
        _id: mongoose.Types.ObjectId(),
        quantity: req.body.quantity,
        product: productId
      });
      return order.save();
    })
    .then(result => {
      console.log(result);
      res.status(201).json({
        message: "Order stored",
        createdOrder: {
          _id: result._id,
          product: result.product,
          quantity: result.quantity
        },
        request: {
          type: "GET",
          url: "http://localhost:3000/orders/" + result._id
        }
      });
    })
    .catch(err => {
      console.log(err);
      res.status(500).json({
        error: err
      });
    });
})

router.get('/:orderId', (req, res, next) => {
  const orderId = req.params.orderId
  Order.findById(orderId)
  .exec()
  .then(doc => {
    res.status(200).json({
      orderId: doc._id,
      quantity: doc.quantity,
      productId: doc.productId,
      request: {
        type: 'GET',
        url: 'http://localhost:8081/' + doc._id
      }
    })
  })
  .catch(err => console.log(err))
})

router.patch('/:orderId', (req, res, next) => {
  
    res.status(200).json({
      message: 'Product updated'
    })
})

router.delete('/:orderId', (req, res, next) => {
  
    res.status(200).json('hello')
})

module.exports = router
