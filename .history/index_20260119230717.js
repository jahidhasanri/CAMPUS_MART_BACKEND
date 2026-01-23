
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

    const userCollaction = client.db("campusmart").collection('users')

//userCollection

app.post('/users', async (req, res) => {
  const user = req.body;
  console.log(user);
  const query = { email: user.email };
  try {
    const isExist = await userCollaction.findOne(query);
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
    console.error(err);
    res.status(500).json({ message: 'server error' });
  }
});


app.get('/users', async (req, res) => {
  try {
    const { email } = req.query;
    const user = await userCollaction.findOne({ email: email });
    
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    res.send(user);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error" });
  }
});








    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})