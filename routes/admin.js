const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Category')
const Category = mongoose.model('category')
require('../models/Posts')
const Post = mongoose.model("posts")
const {iAdmin} = require('../helpers/iAdmin')

router.get('/', iAdmin, (req, res) => {
  Post.find().lean().populate('category').sort({date: 'desc'}).then(posts => {
    res.render('index', {posts: posts})
  })
})

router.get('/category', iAdmin, (req, res) => {
  Category.find().lean().sort({date: 'desc'}).then((category) => {
    res.render('admin/category', {category: category})
  }).catch(err => {
    console.log(err)
  })   
})

router.get('/category/add', iAdmin, (req, res) => {
  res.render('admin/addcategory')
})

router.post('/category/new', iAdmin, (req, res) => {

  var error = []

  if(!req.body.name){
    error.push({text: 'Invalid Name'})
  }

  if(!req.body.slug){
    error.push({text: 'Invalid Slug'})
  }

  if(req.body.name.length <= 3){
    error.push({text: 'The category name is too short'})
  }

  if(error.length > 0){
    res.render('admin/addcategory', {error: error})
  }else{
    const newCategory = {
      name: req.body.name,
      slug: req.body.slug
    }
    new Category(newCategory).save().then(()=>{
      req.flash('success_msg', 'Category created with success!!')
      res.redirect('/admin/category')
    }).catch(err => {
      req.flash('error_msg', "An error occurred, try again!")
      res.redirect('/admin')
    })
  }
})

router.get('/category/edit/:id', iAdmin, (req, res) => {
  Category.findOne({_id:req.params.id}).lean().then(category => {
    res.render('admin/editcategory', {category: category})  
  }).catch(err =>{
    req.flash('error_msg', 'This category doesn´t exist')
    res.redirect('/admin/category')
  })
})

router.post('/category/edit', iAdmin, (req,res) => {
  
  let error = []

  if(!req.body.name){
    error.push({text: 'Invalid name'})
  }
  if(!req.body.slug){
    error.push({text: 'Invalid slug'})
  }
  if(req.body.name.length <= 3){
    error.push({text: 'The name is too short'})
  }
  if(error.length > 0){
    Category.findOne({_id: req.body.id}).lean().then(category => {
      res.render('admin/editcategory', {error: error, category:category})
    })      
  }else{
    Category.findOne({_id: req.body.id}).then(category =>{
      category.name = req.body.name
      category.slug = req.body.slug
      category.save().then(() => {
        req.flash('success_msg', 'Category edited with success')
        res.redirect('/admin/category')
      }).catch(err => {
        console.log(err)
        req.flash('error_msg', 'An error occured during the category edit!')
        res.redirect('/admin/category')
      })
    }).catch(err => {
      console.log(err)
      req.flash('error_msg', 'An error occured saving the category edit!')
      res.redirect('/admin/category')
    })}
})

router.get('/category/delete/:id', iAdmin, (req, res) => {
  Category.findOneAndDelete({_id: req.params.id}).then(() => {
    req.flash('success_msg', 'Category deleted with success!')
    res.redirect('/admin/category')
  }).catch(err => {
    req.flash('error_msg', 'An error occured deleting the category, try again!')
    res.redirect('/admin/category')
  })
})

router.get('/posts', iAdmin, (req, res) => {
  Post.find().populate('category').lean().sort({date: 'desc'}).then(posts => {
    res.render('admin/posts', {posts: posts})    
  }).catch(err => {
    console.log('An error occurred' + err)
  })
})

router.get('/posts/add', iAdmin, (req, res) => {
  Category.find().lean().then(category => {
    res.render('admin/addpost', {category: category})
  }).catch(err => {
    req.flash('error_msg', 'An erro ocurred during the post creation, try again!')
    res.redirect('/admin/posts')
  })
})

router.post('/posts/new', iAdmin, (req, res) => {
  let error = []

  if(!req.body.title || req.body.title <= 3){
    error.push({text: 'Invalid title'} )
  }
  if(!req.body.slug){
    error.push({text:'Invalid Slug'})
  }
  if(!req.body.description){
    error.push({text:'Invalid description'})
  }
  if(!req.body.content){
    error.push({text:'Invalid content'})
  }
  if(req.body.category == 0 || req.body.category == -1){
    error.push({text:'Invalid category'})
  }
  if(error.length > 0){
    Category.find().lean().then(category => {
      res.render('admin/addpost', {error:error, category:category})
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
      req.flash('success_msg', 'Post created with success')
      res.redirect('/admin/posts')
    }).catch(err => {
      req.flash('error_msg', 'An error ocurred during the post creation')
      res.redirect('/admin/posts')
    })
  }
})

router.get('/posts/edit/:id', iAdmin,  (req, res) => {
  Post.findOne({_id: req.params.id}).lean().then(posts => {
    Category.find().lean().then(category => {
      res.render('admin/editpost', ({posts: posts, category: category}))
    })    
  }).catch(err => {
    req.flash('error_msg', 'An error occured (Invalid post)')
    if(err) throw(err)
    console.log(err)
    res.redirect('/admin/posts')
  })
})

router.post('/posts/edit', iAdmin, (req, res) => {
  let error = []

  if(!req.body.title || req.body.title <= 3){
    error.push({text: 'Invalid title'} )
  }
  if(!req.body.slug){
    error.push({text:'Invalid Slug'})
  }
  if(!req.body.description){
    error.push({text:'Invalid description'})
  }
  if(!req.body.content){
    error.push({text:'Invalid content'})
  }
  if(req.body.category == 0 || req.body.category == -1){
    error.push({text:'Invalid category'})
  }
  if(error.length > 0){
    Post.findOne({_id: req.body.id}).lean().then(posts => {
      Category.find().lean().then(category => {
        res.render('admin/editpost', {error:error, category:category, posts:posts})
    })
    })}else{
      Post.findOne({_id: req.body.id}).then(posts => {
        posts.title = req.body.title,
        posts.slug = req.body.slug,
        posts.description = req.body.description,
        posts.content = req.body.content,
        posts.category = req.body.category
        posts.save().then(()=>{
          req.flash('success_msg', 'Post edited with success!')
          res.redirect('/admin/posts')
        }).catch(err => {
          req.flash('error_msg', 'An error occured during the post edition')
          req.redirect('/admin/posts')
        }).catch(err => {
          req.flash('error_msg', 'An error ocurred saving the post edit')
          res.redirect('/admin/posts')
        })
      })
    }    
})

router.get('/posts/delete/:id', iAdmin, (req,res) => {
  Post.findOneAndDelete({_id: req.params.id}).lean().then(() => {
    req.flash('success_msg', 'Post deleted with success!')
    res.redirect('/admin/posts')
  }).catch(err => {
    req.flash('error_msg', 'An error ocurred during the post deletion, try again!')
    res.redirect('/admin/posts')
  })
})

router.get('/posts/read/:id', (req,res) => {
  Post.findOne({_id: req.params.id}).lean().then(posts => {
    if(posts){
      res.render('readpost', {posts: posts})
    }else{
      req.flash('error_msg', 'An error ocurred, try again')
      res.redirect('/admin')
    }    
  }).catch(err =>{
    req.flash('error_msg', 'This post doesn´t exist')
    res.redirect('/admin')
  })
})

router.get('/category/list/:id', iAdmin, (req, res) => {
  Category.findOne({_id: req.params.id}).lean().then(category => {
    if(category){
        Post.find({category: category._id}).lean().then(posts => {
          res.render('categorylist', {category: category, posts: posts})
        }).catch(err => {
          req.flash('error_msg', 'An error ocurred listing the categories')
          res.redirect('/admin/category')
        })
      }else{
        req.flash('error_msg', 'This category doesn´t exist')
        res.redirect('/admin/category')
      }}).catch(err => {
          req.flash('error_msg', 'Invalid category')
          res.redirect('/admin/category')
  })
})


module.exports = router