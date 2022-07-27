module.exports = {
  iAdmin: (req, res, next) => {
    if(req.isAuthenticated()){
      return next()
    }
    req.flash('error_msg', 'You must to be a Admin to acess here')
    res.redirect('/')
  }
}