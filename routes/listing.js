const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const Joi = require('joi');
const { isLoggedIn, isOwner, validationListing } = require("../middleware");


const listingController = require("../controllers/listing.js");

const multer  = require('multer')
const { storage } = require("../cloudConfig.js")
const upload = multer({ storage })

router
.route("/")
//Index Route
.get(wrapAsync(listingController.index))
// this is Create Route
.post(
   isLoggedIn,
   upload.single("listing[image]"),
    validationListing,
   wrapAsync(listingController.createListing)
);


// change start
// Search Route
router.get("/search", wrapAsync(listingController.search)
);
// chage end

 //Create: New & Create Route
 // this is new route
router.get("/new", isLoggedIn,listingController.renderNewform);

router
.route("/:id")
 // Read:Show Route
.get( 
  wrapAsync (listingController.showListing)  
)
// update route
.put(
   isLoggedIn,
   isOwner,
      upload.single("listing[image]"),
  validationListing,
  wrapAsync(listingController.updateListing)
)
//Delete Route
.delete(
   isLoggedIn,
   isOwner,
  wrapAsync (listingController.destroyListing) 
);


 // Edit Route
 router.get(
  "/:id/edit", 
  isLoggedIn,
  isOwner,
  wrapAsync (listingController.editListing)
);


module.exports = router;