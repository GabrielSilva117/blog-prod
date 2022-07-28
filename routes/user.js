const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/User')
const User = mongoose.model('users')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const res = require('express/lib/response')

router.get('/register', (req, res) => {
  res.render('users/register')
})

router.post('/register/new', (req, res) => {
  let error = []

  if(!req.body.name){
    error.push({text:'Invalid name'})
  }

  if(!req.body.email){
    error.push({text:'Invalid email'})
  }

  if(!req.body.password || !req.body.password2){
    error.push({text:'Invalid password'})
  }

  if(req.body.password.length < 4){
    error.push({text:'The password is too short'})
  }

  if(req.body.password2 != req.body.password){
    error.push({text:'Wrong password! Repeat the same password'})
  }

  if(error.length > 0){
    res.render('users/register', {error: error})
    console.log(req.body.name, req.body.email)
  }else{
    User.findOne({email: req.body.email}).lean().then(users => {
      if(users){
        req.flash('error_msg', 'This email is already in use with another account, try another email!')
        res.redirect('/users/register')
      }else{
        const newUser = {
          name: req.body.name,
          email: req.body.email,
          password: req.body.password,
        }
    
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err){
              req.flash('error_msg', 'An error ocurred saving the user')
              res.redirect('/users/register')
            }
            newUser.password = hash
    
            new User(newUser).save().then(() => {
              req.flash('success_msg', 'User created with success')
              res.redirect('/')
            }).catch(err => {
              req.flash('error_msg', 'An error occurred during the user creation, try again!')
              res.redirect('/users/register')
            })
          })
        })
      }
    }).catch(err => {
      req.flash('error_msg', 'An error ocurred')
      res.redirect('/')
    })    
  }
})

router.get('/login', (req, res) => {
  res.render('users/login')
})

router.post('/login/on', (req, res, next) => {
  passport.authenticate('local', { 
    successRedirect: '/',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next)
})

router.get('/logout', (req, res) => {
  req.logout(err => {
    if(err) throw(err)
    req.flash('success_msg', 'Disconnected with success')
    res.redirect('/')
  })
})


module.exports = router