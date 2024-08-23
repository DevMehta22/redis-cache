require("dotenv").config();
const redis = require("redis");

const express = require("express");
const mongoose = require("mongoose");
const morgan = require("morgan");
const schema = require("./modules/dataSchema");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

const redisClient = redis.createClient({
    port: process.env.REDIS_PORT,
    host: process.env.REDIS_HOST,
  });
  
  redisClient.on("error", (err) => {
    console.error("Redis error:", err);
  });
  
  (async () => {
    try {
      await redisClient.connect().then(() => {
        console.log("Connected to Redis");
      });
    } catch (error) {
      console.log(error);
    }
  })();

app.post("/add", async (req, res) => {
  const { name, email, rollno, phone_no } = req.body;
  try {
    await schema.create({ name, email, rollno, phone_no });
    res.status(200).send("Data Added Successfully");
  } catch (err) {
    res.status(500).send(err);
  }
});

const checkCache = async (req, res, next) => {
  try {

    const data = await redisClient.get("data");
    if (data) {
      console.log("Data found in cache");
      res.send(data);
    } else {
      console.log("Data not found in cache");
      next();
    }
  } catch (err) {
    console.error(err);
    next(err);
  }
};

app.get("/get", checkCache, async (req, res) => {
  try {
    const data = await schema.find();
    redisClient.set("data", JSON.stringify(data));
    res.status(200).send(data);
  } catch (err) {
    res.status(500).send(err);
  }
});

mongoose.connect(process.env.MONG_URI).then(() => {
    console.log("Connected to MongoDB");
    const port = process.env.PORT;
    app.listen(port, (err) => {
      if (err) throw err;
      console.log(`Server is running on port ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });

process.on("exit", () => {
  if (redisClient.isOpen) {
    redisClient.quit();
  }
});
