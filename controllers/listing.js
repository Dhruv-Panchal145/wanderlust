const Listing = require("../models/listing");

// this is change st

async function geocodeLocation(location, country) {
  const apiKey = process.env.AWS_TOKEN;
  const region = "ap-south-1";
  
  const address = `${location}, ${country}`;
  const encoded = encodeURIComponent(address);
  
  const url = `https://places.geo.${region}.amazonaws.com/v2/geocode?key=${apiKey}&query=${encoded}`;
  
  const response = await fetch(url);
  const data = await response.json();
  
  console.log("Geocode status:", response.status);
  console.log("Geocode data:", JSON.stringify(data));
  
  if(data.ResultItems && data.ResultItems.length > 0) {
    const coords = data.ResultItems[0].Position; // [lng, lat]
    return coords;
  }
  
  return [72.5714, 23.0225]; // fallback Ahmedabad
}
// this is change ed


module.exports.index = async (req, res) => {
  const { category } = req.query;

  let filter = {};
  if (category) {
    filter.category = category;
  }

  const allListing = await Listing.find(filter);
  
  res.render("listing/index.ejs", { allListing, currCategory: category || null });
};

module.exports.search = async (req, res) => {
  const { location, date, guests } = req.query;
  
  let filter = {};
  if(location) {
    filter.$or = [
      { location: { $regex: location, $options: "i" } },
      { country: { $regex: location, $options: "i" } },
      { title: { $regex: location, $options: "i" } },
    ];
  }

  const allListing = await Listing.find(filter);
  res.render("listing/index.ejs", { 
    allListing, 
    currCategory: null,
    searchQuery: location || ""
  });
}

module.exports.renderNewform = (req,res) => {
    res.render("listing/new.ejs");
}

module.exports.showListing = async (req,res) => {
    let { id } = req.params;
   const listing =  await Listing.findById(id)
   .populate({
    path: "reviews",
     populate : {
      path: "author",
    },
  })
   .populate("owner");

   if(!listing) {
    req.flash("error","Listing you requsted for does not exist");
     return res.redirect("/listing");
   }
   res.render("listing/show.ejs", { listing })
}

module.exports.createListing = async (req,res,next) => {
  const newListing = new Listing(req.body.listing);
  newListing.owner = req.user._id;

  // ✅ File upload hua hai toh Cloudinary image use karo
  if (req.file) {
    newListing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
  } else if (req.body.listing.image && req.body.listing.image.trim() !== "") {
    // ✅ URL dala hai toh woh use karo
    newListing.image = {
      url: req.body.listing.image,
      filename: null
    };
  } else {
    // ✅ Kuch nahi dala toh default image
    newListing.image = {
      url: "https://images.unsplash.com/photo-1625505826533-5c80aca7d157?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGdvYXxlbnwwfHwwfHx8MA%3D%3D&auto=format&fit=crop&w=800&q=60",
      filename: null
    };
  }

  // Geocode
  const coords = await geocodeLocation(newListing.location, newListing.country);
  newListing.geometry = { type: "Point", coordinates: coords };

  await newListing.save();
  req.flash("success", "New Listing Created !");
  res.redirect("/listing");
}

module.exports.editListing = async (req,res) => {
      let { id } = req.params;
   const listing =  await Listing.findById(id);
   if(!listing) {
    req.flash("error","Listing you requsted for does not exist");
     return res.redirect("/listing");
   }

  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace("/upload", "/upload/w_250")

     res.render("listing/edit.ejs", {listing, originalImageUrl});
}

module.exports.updateListing = async (req, res) => {
  let { id } = req.params;

  let updateData = { ...req.body.listing };

  // 🔥 If image is empty, don't update it (old image will stay)
  if (updateData.image === "" || updateData.image === null) {
    delete updateData.image;
  }

  if(updateData.location || updateData.country) {
    const listing = await Listing.findById(id);
    const loc = updateData.location || listing.location;
    const country = updateData.country || listing.country;
    const coords = await geocodeLocation(loc, country);
    updateData.geometry = { type: "Point", coordinates: coords };
  }

  let listing = await Listing.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true
  });

  if(typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    listing.image = { url, filename };
    await listing.save();
  }

  req.flash("success", "New Listing Upadated !");
  res.redirect(`/listing/${id}`);
}

module.exports.destroyListing = async (req,res) => {
    let { id } = req.params;
    let deleteListing = await Listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success", "New Listing Deleted !");
    res.redirect("/listing");
}