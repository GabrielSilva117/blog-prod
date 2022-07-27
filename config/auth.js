const LocalStrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')


//User Model
require('../models/User')
const User = mongoose.model('users')


module.exports = passport => {

  passport.use('local', new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
    User.findOne({email: email}).then(user => {
      if(!user){
        return done(null, false, {message: 'This account doesn´t exist!'})
      }
      bcrypt.compare(password, user.password, (err, work) => {
        if(work){
          return done(null, user)
        }else{
          return done(null, false, {message: 'Invalid password'})
        }
      })
    }).catch(err => {
      if(err) throw(err)
    })
  }))

  passport.serializeUser((user, done) => {
    done(null, user.id)
  })

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user)
    })
  })
}
