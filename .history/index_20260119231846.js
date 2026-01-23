
const express = require('express')
const cors = require('cors');
require('dotenv').config();
const app = express()
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());



const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = `mongodb+srv://${process.env.CM_USER}:${process.env.CM_PASS}@cluster0.e8jg2.mongodb.net/?appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    console.log("MongoDB connected successfully!");

    const userCollaction = client.db("campusmart").collection('users');

    // POST user
    app.post('/users', async (req, res) => {
      const user = req.body;
      console.log(req.body);
      try {
        const isExist = await userCollaction.findOne({ email: user.email });

        if (isExist) {
          return res.status(200).send(isExist);
        }

        const result = await userCollaction.insertOne({
          name: user.name,
          image: user.image,
          email: user.email,
          role: "user",
        });

        res.status(201).send(result);
      } catch (err) {
        console.error("POST /users error:", err);
        res.status(500).json({ message: "server error" });
      }
    });

    // GET user
    app.get("/users", async (req, res) => {
      const { email } = req.query;
     
      try {
        const user = await userCollaction.findOne({ email });
        if (!user) return res.status(404).send({ message: "User not found" });
        res.send(user);
      } catch (err) {
        console.error("GET /users error:", err);
        res.status(500).send({ message: "server error" });
      }
    });

  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
}
run();




app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})