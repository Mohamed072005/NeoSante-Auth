require('dotenv').config()
const express = require('express');
const app = express();
const path = require('path');
const authRouter = require("./routes/auth.router");
const userRouter = require('./routes/user.router');
const port = process.env.APP_PORT || 3000;
const db = require('./models')

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));

//middleware for parce the request bodu to json
app.use(express.json())

//routers
app.use(authRouter);
app.use(userRouter);


db.sequelize.sync().then(() => {
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}).catch((error) => {
  console.error('Error syncing database:', error);
});


module.exports = app;