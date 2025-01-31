require('dotenv').config()
const express = require('express');
const app = express();
const path = require('path');
const authRouter = require("./routes/auth.router");
const userRouter = require('./routes/user.router');
const port = process.env.APP_PORT || 3000;
const cors = require('cors');
const db = require('./models')

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static('public'));

//middleware for parce the request bodu to json
app.use(express.json())

app.use(
  cors({
    origin: 'http://localhost:3000',
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

//routers
app.use(authRouter);
app.use(userRouter);


const startServer = (port) => {
  return new Promise((resolve) => {
    const server = app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
      resolve(server);
    });
  });
};

// Start the server only if the file is run directly
if (require.main === module) {
  startServer(port);
}

module.exports = { app, startServer };