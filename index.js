const express = require("express");
const bodyParser = require("body-parser");
const multer = require("multer");
const multerS3 = require("multer-s3");
const AWS = require("aws-sdk");

const app = express();

app.use(bodyParser.json());
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "OPTIONS, GET, POST, PUT, PATCH, DELETE"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
//Do Not Store These CREDINTIALS on Bitbucket at all.
AWS.config.update({
  secretAccessKey: process.env.AWS_SECRET_KEY,
  accessKeyId: process.env.AWS_ID,
  region: "us-east-1",
});

const s3 = new AWS.S3();

console.log(process.env.AWS_SECRET_KEY);
const upload = new multer({
  storage: new multerS3({
    s3: s3,
    bucket: "tru-app",
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: function (req, file, cb) {
      cb(null, `tru-${Date.now().toString()}-${file.originalname}`);
    },
  }),
});

app.post("/upload", upload.single("image"), (req, res, next) => {
  res.status(200).json(req.file);
});

app.delete("/delete", (req, res, next) => {
  const key = req.body.key;
  s3.deleteObject(
    {
      //Put Bucket name in config file.
      Bucket: "tru-app",
      Key: key,
    },
    function (err, data) {
      if (err) {
        console.log(err);
        throw err;
      } else {
        res.status(200).send("Deleted Successfully");
      }
    }
  );
});
app.listen(3000, () => {
  console.log("Server is runing on port 3000");
});
