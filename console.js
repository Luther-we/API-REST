const colors = require('colors')

const infoConsole = (txt) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(colors.inverse(txt))
  }
}



module.exports = infoConsole