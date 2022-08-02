
// Loading modules
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const admin = require('./routes/admin')
const path = require('path')
//const { application } = require('express')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
require('./models/Posts')
const Post = mongoose.model('posts')
require('./models/Category')
const Category = mongoose.model('category')
const users = require('./routes/user')
const passport = require('passport')
require('./config/auth')(passport)
const db = require('./config/db')

//Config
  // Session
      app.use(session({
        secret: 'nodecourse',
        resave: true,
        saveUninitialized: true
      }))
      app.use(passport.initialize())
      app.use(passport.session())      
      app.use(flash())
  // Middleware
      app.use((req, res, next) => {
        res.locals.success_msg = req.flash('success_msg')
        res.locals.error_msg = req.flash('error_msg')
        res.locals.error = req.flash('error')
        res.locals.user = req.user || null
        res.locals.iAdmin = req.iAdmin || null
        next()
      })
    
  // Body Parser --> Useless 
      app.use(bodyParser.urlencoded({extended: true}))
      app.use(bodyParser.json())
  // Handlebars
      app.engine('handlebars', handlebars.engine({
        defaultLayoyt: 'main',
        runtimeOptions: {
          allowProtoPropertiesByDefault: true,
          allowProtoMethodsByDefault: true,
        },
      }))
      app.set('view engine', 'handlebars')
      app.use(express.static('views/img'))
  // Mongoose
      mongoose.connect(db.mongoURI).then(() =>{
        console.log('Mongodb´s active')
      }).catch(err => {
        console.log('Mongodb failure' + err)
      })
  // Public
      app.use(express.static(path.join(__dirname, 'public')))
      /*
      app.use((req, res, next) => {
        console.log('Hi! i´m a middleware')
        next()
      })
      */
// Routes
  app.get('/', (req, res) => {
    Post.find().populate('category').lean().sort({date: 'desc'}).then(posts => {
      res.render('index', {posts: posts})      
    }).catch(err => {
      if(err)throw(err)
      req.flash('error_msg', 'An error ocurred listing the posts, try again!')
    })
  })

  app.get('/category', (req, res) => {
    Category.find().lean().sort({date: 'desc'}).then(category => {
      res.render('category', {category: category})
    }).catch(err => {
      req.flash('error_msg', 'An error ocurred listing the categories, try again!')
    })
  })

  app.get('/category/list/:id', (req, res) => {
    Category.findOne({_id: req.params.id}).lean().then(category => {
      if(category){
        Post.find({category: category._id}).lean().then(posts => {
          res.render('categorylist', {posts: posts, category: category})
        })
      }else{
        req.flash('error_msg', 'Invalid category')
        res.redirect('/category')
      }
    }).catch(err => {
      req.flash('error_msg', 'This category doesn´t exist')
      res.redirect('/category')
    })
  })

  app.get('/posts', (req,res) => {
    Post.find().lean().populate('category').sort({date: 'desc'}).then(posts => {
      res.render('post', {posts: posts})
    })
  })

  app.get('/posts/add', (req, res) => {
    Category.find().lean().then(category => {
      res.render('addpost', {category: category})
    })
  })

  app.post('/posts/new', (req, res) => {
    let error = []

    if(!req.body.title){
      error.push({text: 'Invalid Title! You must name yout post'})
    }

    if(req.body.title < 4){
      error.push({text: 'The title is too short'})
    }

    if(!req.body.slug){
      error.push({text: 'Invalid Slug! You must write a slug'})
    }

    if(!req.body.description){
      error.push({text: 'A description is obrigatory for every post!'})
    }

    if(!req.body.content){
      error.push({text: 'The content is obrigatory for every post!'})
    }

    if(req.body.category == 0){
      error.push({text: 'Invalid category! try again'})
    }

    if(error.length > 0){
      Category.find().then(category => {
        res.render('addpost', {error: error, category: category})
      })      
    }else{
      const newPost = {
        title: req.body.title,
        slug: req.body.slug,
        description: req.body.description,
        content: req.body.content,
        category: req.body.category
      }

      new Post(newPost).save().then(() => {
        req.flash('success_msg', 'Post created with success!')
        res.redirect('/posts')
      }).catch(err => {
        req.flash('error_msg', 'An error occurred saving the post, try again!')
        res.redirect('/posts')
      })
    }
  })

  app.use('/admin', admin)
  app.use('/users', users)

// Stuff
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running`)
})