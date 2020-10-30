// import packages
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

// create and configure express app
const app = express();
app.use(bodyParser.json()); //parsing json files

app.use(express.static(path.join(__dirname, "public")));

app.get("/blogs", (req, res) => res.json({ success: true, blogs: [] }));
app.post("/blogs", (req, res) => res.json({ success: true, blog: {} }));
app.put("/blogs/{id}", (req, res) => res.json({ success: true, blogs: [] }));
app.delete("/blogs/{id}", (req, res) => res.json({ success: true }));

// uploading images
const multer = require("multer");
const uuid4 = require("uuid").v4;
const storage = multer.diskStorage({
  destination: path.join(__dirname, "/public/uploads"),
  filename: function (req, file, cb) {
    const fullName =
      "blog_" + uuid4().replace(/-/g, "") + path.extname(file.originalname);
    cb(null, fullName);
  },
});
const upload = multer({ storage: storage });
app.post("/blogs/upload", upload.single("photo"), (req, res) =>
  res.json({
    success: true,
    blog: {
      photo: "/uploads/" + req.file.filename,
    },
  })
);

const PORT = 3000;
app.listen(PORT, (err) =>
  err ? console.log(err) : console.log(`The server is started on port: ${PORT}`)
);
