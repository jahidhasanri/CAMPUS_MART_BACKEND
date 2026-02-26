require("dotenv").config(); 
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion } = require('mongodb');
// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gubl8vg.mongodb.net/?appName=Cluster0`;
// const uri = `mongodb+srv://rifat:${process.env.DB_PASS}@cluster0.rrbhn4a.mongodb.net/?appName=Cluster0`;
const uri="mongodb://localhost:27017"

console.log("DB User:", process.env.DB_USER);
console.log("DB Pass:", process.env.DB_PASS);

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {

     await client.connect();
    console.log("MongoDB connected successfully!");

    const myDB = client.db("campusmart");
    const userCollection = myDB.collection("users");
    const listingsCollection = myDB.collection("listings");

    // POST user
    app.post("/users", async (req, res) => {
      const user = req.body;
      try {
        const isExist = await userCollection.findOne({ email: user.email });

        if (isExist) {
          return res.status(200).send(isExist);
        }

        const result = await userCollection.insertOne({
          name: user.name,
          image: user.image,
          email: user.email,
          role: "user",
        });

        res.status(201).send(result);
      } catch (err) {
        // console.error("POST /users error:", err);
        res.status(500).json({ message: "server error" });
      }
    });

    // GET user
    app.get("/users", async (req, res) => {
      const { email } = req.query;

      try {
        const user = await userCollection.findOne({ email });
        if (!user) return res.status(404).send({ message: "User not found" });
        res.send(user);
      } catch (err) {
        // console.error("GET /users error:", err);
        res.status(500).send({ message: "server error" });
      }
    });

    //create a post

    app.post("/create-post", async (req, res) => {
      const data = req.body;
      data.createdAt = new Date();
      console.log(data);
      try {
        const result = await listingsCollection.insertOne(data);
        res.send(result);
      } catch (err) {
        console.error("Insert Error:", err);
        return res.status(500).send({ message: "Something went wrong..." });
      }
    });

    app.get("/all-posts", async (req, res) => {
      const searchText = req.query.search;
      const skip = parseInt(req.query.skip);
      const limit = parseInt(req.query.limit);
      const category = req.query.category;
      const status = req.query.status;

      let query = {};

      if (status) {
        query.status = status;
      }
      if (searchText) {
        query.title = { $regex: searchText, $options: "i" };
      }
      if(category){
        query.category=category
      }

      const result = await listingsCollection.find(query).skip(skip).limit(limit).sort({createdAt:-1}).toArray()
      res.send(result)

    });
       
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }

}
run();

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
