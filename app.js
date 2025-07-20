if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const joi = require("joi");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const path = require("path");
const passport = require("passport");
const passportLocal = require("passport-local");
const passportLocalMongoose = require("passport-local-mongoose");
const ejs = require("ejs"); 
const port = 8082;
const routerUser = require("./routes/user.js");
const flash = require("express-flash");
const User = require("./models/user.js");
const session = require("express-session");
const expressError = require("./utils/expressError.js");
const routerClassroom = require("./routes/classroom.js");
const routerSubject = require("./routes/subject.js");
const routerFolder = require("./routes/folder.js");
const mongoUrl = process.env.MONGO_URL;
const mongoStore = require("connect-mongo");
const cors = require("cors");
const axios = require("axios")
const { send } = require("vite");
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(cors());
app.use(express.json());
app.listen(port, (req, res) => {
  console.log("listening on port " + port);
});

if (!mongoUrl) {
  console.error("MongoDB connection URL is not provided.");
  process.exit(1);
}

const store = mongoStore.create({
  mongoUrl: mongoUrl,
  crypto: {
    secret: process.env.SESSION_SECRET,
  },
  touchAfter: 24 * 3600,
});
store.on("error", (e) => {
  console.log("Error: " + e);
});

const sessionOption = {
  store: store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 190 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};
async function main() {
  mongoose.connect(mongoUrl, {
    serverSelectionTimeoutMS: 3000
  });
}
// async function main(){
//   await mongoose.connect("mongodb://localhost:27017/nault");
// };
main()
  .then((res) => {
    console.log("Connection Sucessfull !");
  })
  .catch((err) => {
    console.log(err);
  });
app.get("/", (req, res, next) => {
  res.redirect("/classroom/enter");
});
app.get("/order", (req, res) => {
  res.render("./authenticate/order.ejs", { order: dummyOrderData });
});
app.use(flash());
app.use(session(sessionOption)); 
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  res.locals.deleteID;
  res.locals.showform = false;
  next();
});
app.use("/login", routerUser);
app.use("/classroom", routerClassroom);
app.use("/subject", routerSubject);

app.use("/", routerFolder);

app.all("*", async (req, res, next) => {
  next(new expressError(404, (message = "Something went wrong!")));
});
app.use((e, req, res, next) => {
  res.sendStatus(e.message);
});

app.get("*", (req, res) => {
  res.send("Page Not Found !!");
});
const dummyOrderData = {
  // This object represents the data structure that newOrder.toJSON() would produce
  id: "ORD987654XYZ", // Example Order ID
  user_id: 123, // Example User ID
  createdAt: new Date().toISOString(), // Use current time for testing
  status: "Processing",
  payment_status: "Paid",
  phonepe_order_id: "PHNPREF123456789ABC", // Example Reference ID
  payment_id: "pay_L1M2N3O4P5Q6R7", // Example Payment ID (optional)
  user: {
    // Nested user object - Ensure your newOrder.toJSON() includes this if needed by template
    name: "Ash Sheikh",
  },
  cart_items: [
    {
      // Item 1: With name customization, relative image URL
      quantity: 1,
      customized_name: "Happy Anniversary!",
      customized_image: null, // No image customization
      product: {
        title: "Personalized Photo Mug",
        price_inr: "499.00",
        productImages: [
          { image_url: "/images/mugs/photo_mug_generic.jpg" }, // Relative path
        ],
      },
    },
    {
      // Item 2: With image customization (absolute URL), no name
      quantity: 2,
      customized_name: null,
      customized_image:
        "https://via.placeholder.com/100x100.png?text=Custom+Logo", // Absolute URL
      product: {
        title: "Custom Logo T-Shirt (Large)",
        price_inr: "899.50",
        productImages: [
          { image_url: "/images/shirts/logo_shirt_template.png" }, // Relative path
        ],
      },
    },
    {
      // Item 3: No customization
      quantity: 1,
      customized_name: null,
      customized_image: null,
      product: {
        title: "Standard Keychain",
        price_inr: "150.00",
        productImages: [
          // Example with no image or placeholder
          { image_url: null },
        ],
      },
    },
  ],
  coupon: "WELCOME10", // Example coupon
  cj_total_price: 2448.0, // Example Subtotal (1*499 + 2*899.50 + 1*150)
  cj_total_after_discount: 2203.2, // Example price after 10% discount
  gst_amount: 396.58, // Example GST (e.g., 18% on discounted price)
  delivery_fee: 50.0, // Example delivery fee
  inr_total_price: 2649.78, // Example Grand Total (discounted + GST + delivery)
  delivery_address: {
    // Example Shipping Address
    id: 1,
    user_id: 123,
    address_line1: "123 Crazy Jump Lane",
    address_line2: "Apt 4B",
    city: "Innovation City",
    state: "Maharashtra",
    country: "India",
    postal_code: "440022",
    receiver_name: "Ash Sheikh",
    receiver_phone: "9876543210",
    type: "HOME",
    is_default: true,
    createdAt: "2024-05-10T10:00:00.000Z",
    updatedAt: "2024-05-10T10:00:00.000Z",
  },
  billing_address: {
    // Example Billing Address (can be same or different)
    id: 2,
    user_id: 123,
    address_line1: "456 Business Park Road",
    address_line2: null, // Optional field test
    city: "Commerce Town",
    state: "Maharashtra",
    country: "India",
    postal_code: "440011",
    receiver_name: "Ash Sheikh Billing", // Different receiver name test
    receiver_phone: "9988776655",
    type: "WORK",
    is_default: false,
    createdAt: "2024-05-11T11:00:00.000Z",
    updatedAt: "2024-05-11T11:00:00.000Z",
  },
  updatedAt: new Date().toISOString(),
  createdAt: new Date(Date.now() - 60000).toISOString(), // Order created a minute ago
};
