if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const session = require('express-session')
const flash = require('connect-flash')
const passport = require('passport')
const localStrategy = require('passport-local')
const User = require('./models/User')
//express set up
const express = require('express')
const app = express()
//mongo database setup
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose')
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/PassionFlow';
mongoose.connect(dbUrl).then(() => {
    console.log("CONNECTED!!");
}).catch(err => {
    console.log("CONNECTION FAILED!!");
    console.log(err);
});
//security requirements 
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const cors = require('cors');
app.use(cors());



const ExpressErrorHandler = require("./Utility/ExpressErrorHandler");
const path = require('path')
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json());
const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: process.env.SECRET
    }
});
const sessionConfig = {
    secret: 'vintage',
    resave: false,
    store: store,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        secure: false, // Make sure secure is false for HTTP in development
        httpOnly: true, // Optional, prevents JavaScript access to cookies
    }
};

app.use(session(sessionConfig))
app.use(flash())
//authentification init with passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())
app.use(helmet())
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://cdn.maptiler.com/",
    "https://code.jquery.com/"
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://cdn.jsdelivr.net",
    "https://code.jquery.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdnjs.cloudflare.com/"
];
const connectSrcUrls = [
    "https://api.maptiler.com/",
    "https://code.jquery.com/"
];
const fontSrcUrls = ["https://cdnjs.cloudflare.com"];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"], // Default allow 'self'
            connectSrc: ["'self'", ...connectSrcUrls], // Adjust for external API calls
            scriptSrc: [
                "'self'",
                "'unsafe-inline'", // Allows inline scripts and event handlers (use cautiously)
                ...scriptSrcUrls,
            ],
            scriptSrcAttr: ["'self'", "'unsafe-inline'"], // Allows inline event handlers (e.g., `onclick`)
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls], // Styles
            workerSrc: ["'self'", "blob:"], // For web workers
            objectSrc: ["'none'"], // Prevent embedding objects
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/drcfc3chz/", // Replace with your Cloudinary account
                "https://icon-library.com/images",
                "https://images.igdb.com/igdb/",
                "https://i.ytimg.com/vi/m8i5JuwI_V0/hqdefault.jpg",
                "https://api.maptiler.com/",
                "https://www.pluggedin.com/",
                "https://pngimg.com/uploads/pacman/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls], // For fonts
        },
    })
);


app.use('/', function (req, res, next) {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    res.locals.info = req.flash('info')
    next()
})
//ROUTES and routes require
const usersRoutes = require('./routes/users')
app.use("/", usersRoutes)
const gamesRoutes = require('./routes/games')
app.use("/games", gamesRoutes)
const profileRoutes = require('./routes/profile');
app.use("/profile", profileRoutes)


app.get('/', (req, res) => {
    res.render('home')
})

app.all('*', (req, res, next) => {
    next(new ExpressErrorHandler("Not Found!", 404))
})
//error handling 
app.use((err, req, res, next) => {
    const { message = "mhmmm...how ??", status = 500 } = err;
    res.status(status)
    res.render('error', { err })
})
const port = 3001
app.listen(port, () => console.log(`Example app listening on port ${port}!`))
