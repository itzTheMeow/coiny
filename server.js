// server.js
// where your node app starts

// init project
var express = require("express");
var app = express();

app.use(express.static("assets"));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function(request, response) {
  response.sendFile(__dirname + "/views/index.html");
});
app.get("/home/", function(request, response) {
  response.redirect("/play/");
});
app.get("/play/", function(request, response) {
  response.sendFile(__dirname + "/views/play/index.html");
});
app.get("/game/", function(request, response) {
  response.sendFile(__dirname + "/views/play/index.html");
});
app.get("/about/", function(request, response) {
  response.sendFile(__dirname + "/views/about/index.html");
});

app.get("/account/", function(request, response) {
  response.send("depreciated");
});
app.get("/login/", function(request, response) {
  response.send("depreciated");
});
app.get("/logout/", function(request, response) {
  response.send("depreciated");
});
app.get("/createaccount/", function(request, response) {
  response.send("depreciated");
});

app.get("*", function(req, res) {
  res.send(
    `<meta http-equiv="refresh" content="0; url=https://coiny.ml?404=${req.url.substring(
      1
    )}">`,
    404
  );
});

// listen for requests :)
var listener = app.listen(process.env.PORT, function() {
  console.log("Your app is listening on port " + listener.address().port);
});
