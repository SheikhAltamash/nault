module.exports.isLogggedIn = (req, res, next) =>
{
    if (!req.isAuthenticated()){
        req.session.redirectUrl = req.originalUrl;

        req.flash("error", "Login required");
        return res.redirect("/login");
    }
    next();
}

module.exports.saveRedirectUrl = (req, res, next) =>
{
    if (req.session.redirectUrl) { 
        res.locals.redirectUrl = req.session.redirectUrl;
    }

    
    next();
}
