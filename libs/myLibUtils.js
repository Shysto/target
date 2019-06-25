function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        next();
    } else {
        //req.flash('error_msg', ' you are not logged in');
        res.redirect('/users/login'); //Permet de rediriger vers la route login si l'utilisateur n'est pas connecté.
    }
}

module.exports = { ensureAuthenticated };
