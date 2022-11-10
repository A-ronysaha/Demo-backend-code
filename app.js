let express = require("express");
let app = express();
let overRide = require("method-override");
let ejsMate = require("ejs-mate");

let path = require("path");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
app.engine("ejs", ejsMate);

let mongoose = require("mongoose");
mongoose
  .connect("mongodb://127.0.0.1:27017/yelpCamp")
  .then(() => {
    console.log("CONNECTION ESTD !!!");
  })
  .catch((err) => {
    console.log("OH NO ERROR !!!");
    console.log(err);
  });

let Error = require("./error");
let Campground = require("./models/campground");
let Review = require("./models/review");
// const { estimatedDocumentCount } = require("./models/campground");
app.use(express.urlencoded({ extended: true }));
app.use(overRide("_method"));

app.get("/", (req, res) => {
  res.render("home");
});

app.get("/campgrounds", async (req, res) => {
  let result = await Campground.find({});
  res.render("campgrounds/index", { result });
});

app.get("/campgrounds/new", (req, res) => {
  res.render("campgrounds/new");
});

app.post("/campgrounds", async (req, res) => {
  let another = new Campground(req.body);
  await another.save();
  res.redirect(`/campgrounds/${another._id}`);
});

app.get("/campgrounds/:id", async (req, res, next) => {
  let id = await Campground.findById(req.params.id).populate("reviews");
  if (!id) {
    return next(new Error("errorrrrr!!!!"));
  }
  res.render("campgrounds/id", { id });
});

app.get("/campgrounds/:id/edit", async (req, res) => {
  let edit = await Campground.findById(req.params.id);
  res.render("campgrounds/edit", { edit });
});

app.put("/campgrounds/:id", async (req, res) => {
  let put = await Campground.findByIdAndUpdate(req.params.id, req.body, {
    runValidators: true,
    new: true,
  });
  res.redirect(`/campgrounds/${put._id}`);
});

app.delete("/campgrounds/:id", async (req, res) => {
  let dlt = await Campground.findByIdAndDelete(req.params.id);
  res.redirect("/campgrounds");
});

app.post("/campgrounds/:id/reviews", async (req, res) => {
  let thatId = await Campground.findById(req.params.id);
  let newReview = new Review(req.body.review);
  thatId.reviews.push(newReview);
  await newReview.save();
  await thatId.save();
  res.redirect(`/campgrounds/${thatId._id}`);
  //res.send('review')
});

app.use((err, req, res, next) => {
  res.send("OHH BOYY SOMETHING WENT WRONG!!!");
});

app.listen(1419, () => {
  console.log("LISTENING");
});
