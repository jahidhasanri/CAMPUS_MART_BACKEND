const express = require('express');
const cors = require('cors');
require('dotenv').config();

const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.RS_USER}:${process.env.RS_PASS}@cluster0.e8jg2.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Mongo Client
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

// MongoDB connect
async function run() {
  try {
    await client.connect();
    console.log("✅ MongoDB connected successfully");

   

  } finally {

  }
}
run().catch(console.dir);

// root route
app.get('/', (req, res) => {
  res.send('CampusMart Backend Running 🚀');
});

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
