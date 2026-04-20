const Listing = require("../models/listing");;

// this is change st

async function geocodeLocation(location, country) {
  const apiKey = "v1.public.eyJqdGkiOiIyM2M1ZGY4YS02MDc2LTRkNzItOGI0Ni1lZjk4ZmU2NDc1YmQifRdMhDfZ7Xzn1405hj7oSa-fuOmNr4IxSHBgl8gDn9FXixwLX19wf9GYRceApEGqtAX-_0hgkobHjEm9Ain8sfNSaxGgJPcr_sRdQJ5bMRdqHjGhB0VY6tGQ7FUuWi9W7-J-SR4CKQ9r-jlpg2_ob1QRkr4DvBK3vF6m_HpBcF1hZsNGQ30C5olYaMyktjlYsmQevALJjn6VX2p7V_7gFmv9Jven74JZIE_-TyeUvhhoJJZfO55Tz-zi4_mCmyKbJX6-dEfZ-X8EP-ztLO3bqvOZANLiWebquNw8wEFJEMTZL4y-hVlFcPRowWpmprvUFG91vHmt5wdPPnUUQ62sMek.Njg1MGZlZTUtYTI2ZS00MDdlLWJjNDktMDNmZDlkNzVmMjQ0";
  const region = "ap-south-1";
  
  const address = `${location}, ${country}`;
  const encoded = encodeURIComponent(address);
  
  // 
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


// module.exports.index = async (req,res) => {
//   // change start
//     const { category } = req.query;

//   let filter = {};
//   if (category) {
//     filter.category = category;
//   }
//   // chages end

//   const allListing =  await Listing.find({});
//   res.render("listing/index.ejs", { allListing })
//  }


module.exports.index = async (req, res) => {
  const { category } = req.query;

  let filter = {};
  if (category) {
    filter.category = category;
  }

  const allListing = await Listing.find(filter);
  
  res.render("listing/index.ejs", { allListing, currCategory: category || null });
};

//chage start
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
//chage end

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
 //    let {title,discription,image,price,country,location} = req.body
 //    let listing = req.body.listing;
 // if(!req.body.listing) {
 //   throw new ExpressError(400,"Send valid data for listing");
 // }
 let url = req.file.path;
 let filename = req.file.filename

 const newListing =   new Listing(req.body.listing);
 newListing.owner = req.user._id;
 newListing.image = {url,filename};

 // this is change st
  const coords = await geocodeLocation(newListing.location, newListing.country);
  newListing.geometry = { type: "Point", coordinates: coords };
// this is change ed

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
   originalImageUrl =  originalImageUrl.replace("/upload", "/upload/w_250")

      res.render("listing/edit.ejs", {listing, originalImageUrl});
  }

  module.exports.updateListing = async (req, res) => {
    let { id } = req.params;

    // copy incoming data
    let updateData = { ...req.body.listing };

    // 🔥 If image is empty, don't update it (old image will stay)
    if (updateData.image === "" || updateData.image === null) {
      delete updateData.image;
    }

// this is change st
if(updateData.location || updateData.country) {
    const listing = await Listing.findById(id);
    const loc = updateData.location || listing.location;
    const country = updateData.country || listing.country;
    const coords = await geocodeLocation(loc, country);
    updateData.geometry = { type: "Point", coordinates: coords };
  }
    // this is change ed


    // 🔥 Update in DB
    let listing = await Listing.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    });

   if(typeof req.file !== "undefined") {
     let url = req.file.path;
 let filename = req.file.filename
 listing.image = { url,filename };
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