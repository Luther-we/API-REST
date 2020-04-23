const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../models/user')

router.post('/signup', (req, res, next) => {
  User.find({email: req.body.email})
  .exec()
  .then((doc) => {
    if (doc.length >=1) {
      res.status(409).json({
        message: 'This email exists '
      })
    } else {
      bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
          return res.status(500).json({
            error: err
          })
        } else {
          const user = new User({
            _id: new mongoose.Types.ObjectId(),
            email: req.body.email,
            password: hash
        })
  
        user.save()
        .then(result => {
          res.status(201).json({
            message: 'User create',
            result
          })
        })
        .catch (err => {
          res.status(500).json({
            message: 'Create not work',
            error: err
          })
        })
      }
    })
    }
  })
  .catch(err => {
    res.status(500).json({
     
    })
  })
})

router.post('/login', function (req, res, next) {
  User.findOne({ email: req.body.email})
  .exec()
  .then(user => {
    console.log('========++> ', user)
    if (!user) {
      return res.status(404).json({
        message: 'Mail not found, user doesn\'t exist'
      })
    } else {
      bcrypt.compare(req.body.password, user && user.password || 0, (err, result) => {
        if (err) {
          return res.status(404).json({
            message: 'Password not match'
          })
        }

        if (result) {
          const token = jwt.sign({
            email: user.email,
            userId: user._id
          }, process.env.JWT_KEY,
          {
            expiresIn: "1h"
          },

          )
          return res.status(200).json({
            message: 'Auth successfull',
            token: token
          })
        }
        
        return res.status(401).json({
          message: 'Auth fail'
        })
      })
    }


  })
  .catch()
})



router.delete('/:userId', function (req, res, next) {
  User.remove({ _id: req.params.userId})
  .exec()
  .then(rep => {
    res.status(200).json({
      message: 'User deletec',
      reponse: rep
    })
  })
  .catch(err => {
    res.status(500).json({
      error: err
    })
  })
})



module.exports = router
