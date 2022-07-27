if(process.env.NODE_ENV == 'production'){
  module.exports = {mongoURI: 'mongodb+srv://Kleiner:7355608%Gbf@cluster0.gc2k2.mongodb.net/test'}
}else{
  module.exports = {mongoURI: 'mongodb://localhost/blogapp'}
}