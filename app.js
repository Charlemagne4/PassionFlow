if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}
//express set up
const express = require('express')
const app = express()
//mongo database setup
const mongoose = require('mongoose')
const ejs = require('ejs');
//routes require
const gamesRoutes = require('./routes/games')

const ExpressErrorHandler = require("./Utility/ExpressErrorHandler");
const path = require('path')
const ejsMate = require('ejs-mate')
const methodOverride = require('method-override')

const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/PassionFlow';
mongoose.connect(dbUrl).then(() => {
    console.log("CONNECTED!!");
}).catch(err => {
    console.log("CONNECTION FAILED!!");
    console.log(err);
});

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')))

//ROUTES
app.use("/games", gamesRoutes)


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
