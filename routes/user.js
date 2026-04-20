const express = require("express");
const router = express.Router({ mergeParams: true });
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");


router
.route("/signup")
// signup get req..
.get(userController.signup)
//signup post req..
.post(wrapAsync(userController.rendersignup)
);


router
.route("/login")
// log in get req..
.get(userController.login)
//logi in post req..
.post(
   saveRedirectUrl,
passport.authenticate("local", 
    { failureRedirect: '/login',
         failureFlash: true }) ,
    userController.renderLogin
);

  router.get("/logout", userController.logout);

module.exports = router;