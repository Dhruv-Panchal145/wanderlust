const Listing = require("../models/listing");
const Review = require("../models/review");


module.exports.renderReview = async(req,res) => {
  let listing = await Listing.findById(req.params.id);
  let newReview = new Review(req.body.review);

   newReview.author = req.user._id;   

  listing.reviews.push(newReview);

if (!req.body.review.rating) {
  req.body.review.rating = 1;
}  

  await newReview.save();
  await listing.save();
 
 console.log("new review saved");
 req.flash("success", "New Review Created !");
   res.redirect(`/listing/${req.params.id}`); 
}

module.exports.destoryReview = async (req, res) => {
    let { id, reviewId } = req.params;

    await Listing.findByIdAndUpdate(id, {
        $pull: { reviews: reviewId }
    });

    await Review.findByIdAndDelete(reviewId);

    req.flash("success", "New Reiview  Deleted !");

    res.redirect(`/listing/${id}`);
}