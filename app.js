if(process.env.NODE_ENV  != "production") {
require('dotenv').config()
}



const express = require("express");
const app = express();
const mongoose = require('mongoose');
const path = require("path");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError.js");
const Joi = require('joi');
const session = require("express-session");
const MongoStore = require("connect-mongo").default;
const flash = require("connect-flash");
const passport = require("passport");
const LocalStategy = require("passport-local");
const User = require("./models/user.js");

const dbUrl = process.env.ATLASTDB;

if (!dbUrl) {
  throw new Error("ATLASTDB environment variable is not set!");
}

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error",(err) => {
   console.log("ERROR IN MONGO SESSION STORE",err);  
})

const sessionOption = {
   store,
  secret: process.env.SECRET, 
  resave: false, 
  saveUninitialized: true,
   cookie: {
       expires: Date.now() + 7  *24 * 60 * 60 * 1000,
       maxAge:  7  *24 * 60 * 60 * 1000,
       httpOnly: true,
   },
};



const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");




main()
.then(() => {
    console.log("connected to DB")
}).catch(err => console.log(err));


async function main() {
  await mongoose.connect(dburl);
}


const ejsmate = require("ejs-mate")


app.set("view engine","ejs");
app.set("views",path.join(__dirname,"views"));
app.engine("ejs", ejsmate);

app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname,"/public")));


app.use(session(sessionOption));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
res.locals.success = req.flash("success");
res.locals.error = req.flash("error")
res.locals.currUser = req.user;
   next();
});

// app.get("/demouser", async (req,res) => {
//     let fakeUser = new User ({
//      email: "dhruv23@mgmail.com",
//      username:"Dhruvpanchal"
//     });

//  let registeredUser = await User.register(fakeUser, "helloword");
//    res.send(registeredUser);
// });


app.use("/listing", listingRouter);
app.use("/listing/:id/reviews",reviewRouter);
app.use("/", userRouter);


// app.get("/testListing", async (req,res) => {
//    let sampleListing = new Listing({
//    title: "Beach Villa",
//    description: "Beautiful villa near the beach",k
//    price: 3000,
//    location: "Goa",
//    country: "India",
//    category: "Villa"
//    });

//   await sampleListing.save();
//   console.log("sample was saved");
//   res.send("succesful testing");
// });

// app.get("/" , (req,res) =>{
//     res.send("route working");
// })

// 404 handler
app.use((req,res,next)=>{
   next(new ExpressError(404,"Page Not Found!"));
});

// Error handler
app.use((err,req,res,next)=>{
  let {statusCode=500,message="Something went wrong"} = err;
  res.status(statusCode).render("error.ejs", { message });
  // res.status(statusCode).send(message);
});

app.listen(8080, () =>{
   console.log("server is listing to port 8080");
}); 