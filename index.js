// import packages
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");
const fs = require("fs");

// create and configure express app
const app = express();
app.use(bodyParser.json()); //parsing json files

// configuring mongoose
mongoose.connect("mongodb://localhost:27017/blog_db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});
// blog schema
const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  photo: { type: String, default: "None" },
});
// blog model
const Blog = mongoose.model("blogs", blogSchema);

app.use(express.static(path.join(__dirname, "public")));

// GET: /blogs
app.get("/blogs", async (req, res) => {
  try {
    const { filter, skip, limit } = req.query;
    const blogs = await Blog.find(filter).skip(skip).limit(limit);
    res.json({ success: true, blogs });
  } catch (err) {
    res.status(500).json({
      success: false,
      err,
    });
  }
});

// POST: /blogs
app.post("/blogs", async (req, res) => {
  try {
    const blog = new Blog(req.body);
    await blog.save();
    res.json({ success: true, blog });
  } catch (err) {
    res.status(500).json({
      success: false,
      err,
    });
  }
});

// PUT: /blogs/:id
app.put("/blogs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findOneAndUpdate({ _id: id }, req.body);
    if (blog == null) {
      res.status(404).json({ success: false });
      return;
    }
    res.json({ success: true, blog });
  } catch (err) {
    res.status(500).json({
      success: false,
      err,
    });
  }
});

// DELETE /blogs/:id
app.delete("/blogs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findOneAndDelete({ _id: id });
    if (blog == null) {
      res.status(404).json({ success: false });
      return;
    }
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({
      success: false,
      err,
    });
  }
});

// uploading images
const multer = require("multer");
const uuid4 = require("uuid").v4;
const storage = multer.diskStorage({
  destination: path.join(__dirname, "public/uploads"),
  filename: function (req, file, cb) {
    const fullName =
      "blog_" + uuid4().replace(/-/g, "") + path.extname(file.originalname);
    cb(null, fullName);
  },
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 2000000 }, // file size two milion bytes are allowed
  fileFilter: function (req, file, cb) {
    // filter file when it is needed
    const fileTypes = /png|jpeg|jpg/;
    const extName = fileTypes.test(path.extname(file.originalname));
    file.originalname.toLowerCase();
    const mimeType = fileTypes.test(file.mimetype);
    if (extName && mimeType) {
      cb(null, true);
    } else {
      cb("Error: only png, jpeg, and jpg are allowed!");
    }
  },
});

// POST /blogs/upload/:id
app.post("/blogs/upload/:id", upload.single("photo"), async (req, res) => {
  try {
    const photo = "/uploads/" + req.file.filename;
    const { id } = req.params;
    const blog = await Blog.findOneAndUpdate({ _id: id }, { photo });
    if (blog == null) {
      fs.unlink(path.join(__dirname, photo), (err) => {
        if (err) throw err;
        else res.status(404).json({ success: false });
      });
      return;
    }
    res.json({
      success: true,
      blog,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      err,
    });
  }
});

const PORT = 3000;
app.listen(PORT, (err) =>
  err ? console.log(err) : console.log(`The server is started on port: ${PORT}`)
);
