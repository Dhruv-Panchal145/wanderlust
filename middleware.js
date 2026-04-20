const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const ExpressError = require("./utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const {  } = require("./schema.js");
const Joi = require('joi');
module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        // redirectUrl save
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must be logged in");
        return res.redirect("/login");
    }
    next();
};

module.exports.saveRedirectUrl = (req,res,next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
    }
    next();
}


module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params; // ✅ get id

  let listing = await Listing.findById(id); // ✅ works now

  if (!listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this listing");
    return res.redirect(`/listing/${id}`);
  }

  next(); // ✅ MUST
};

module.exports.validationListing = (req,res,next) => {
 const { error } = listingSchema.validate(req.body);

 if(error) {
      let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
 } else {
  next();
 }
}

module.exports.validationReview = (req,res,next) => {
 const { error } = reviewSchema.validate(req.body);

 if(error) {
      let errMsg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(400, errMsg);
 } else {
  next();
 }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  let { id, reviewId } = req.params;

  let review = await Review.findById(reviewId);

  if (!review) {
    req.flash("error", "Review not found");
    return res.redirect(`/listing/${id}`);
  }

  if (!review.author || !review.author.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the author of this review");
    return res.redirect(`/listing/${id}`);
  }

  next();
};