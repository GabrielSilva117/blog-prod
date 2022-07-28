if(process.env.NODE_ENV == 'production'){
  module.exports = {mongoURI: 'mongodb+srv://gabriel:7355608@blog-prod.ptztxjg.mongodb.net/?retryWrites=true&w=majority'}
}else{
  module.exports = {mongoURI: 'mongodb://localhost/blogapp'}
}


