const Order = require('../models/order')
const checkAuth = require('../middleware/check-auth')

exports.orders_get_all = (req, res, next) => {
  Order.find()
    .select('product quantity _id')
    .exec()
    .then(docs => {
      res.status(200).json({
        count: docs.length,
        orders: docs.map(doc => (
          {
            orderId: doc._id,
            quantity: doc.quantity,
            productId: doc.productId,
            request: {
              type: 'GET',
              url: 'http://localhost:8081/' + doc._id
            }
          }
        )),
        
      })
    })
    .catch(err => {
      res.status(500).json({error: err})
    })
}