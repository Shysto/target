function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        //req.flash('error_msg', ' you are not logged in');
        res.redirect('/users/login'); //Redirection to view login if user isn't logged in
    }
}

// Manage the acces to view login if a user is already logged in
function isLoggedIn(req, res, next) {
    if (!req.isAuthenticated()) {
        next();
    } else {
        req.flash('error_msg', 'You are already logged in');
        res.redirect('/users'); //Redirection to view index if user is already login 
    }
}

module.exports = { ensureAuthenticated, isLoggedIn};
