const dns = require("dns");
const SSLCommerzPayment = require("sslcommerz-lts");
dns.setServers(["8.8.8.8", "8.8.4.4"]);
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());
app.use(express.json());
const { ObjectId } = require("mongodb");

const store_id = process.env.StoreId;
const store_passwd = process.env.StorePass;
const is_live = false;

const { MongoClient, ServerApiVersion } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.gubl8vg.mongodb.net/?appName=Cluster0`;
// const uri = "mongodb://localhost:27017/";
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
    //  await client.connect();
    // console.log("MongoDB connected successfully!");

    const myDB = client.db("campusmart");
    const userCollection = myDB.collection("users");
    const listingsCollection = myDB.collection("listings");
    const cartCollection = myDB.collection("carts");
    const FinalorderInfoCollaction = myDB.collection("finalOrders");

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
        let query = {};
        if (email) {
          query.email = email;
        }
        const result = await userCollection.find(query).toArray();
        res.send(result);
      } catch (err) {
        // console.error("GET /users error:", err);
        res.status(500).send({ message: "server error" });
      }
    });

    app.get("/allusers", async (req, res) => {
      const alluser = userCollection.find();
      const result = await alluser.toArray();
      res.send(result);
    });
    //update user role
    app.patch("/users/role/:id", async (req, res) => {
      const id = req.params.id;
      const role = req.body.role;

      const result = await userCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: { role: role },
        },
      );

      res.send(result);
    });

    // delete user by admin
    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;

      const result = await userCollection.deleteOne({
        _id: new ObjectId(id),
      });

      res.send(result);
    });

    //create a post

    app.post("/create-post", async (req, res) => {
      const data = req.body;
      data.createdAt = new Date();
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
      if (category) {
        query.category = category;
      }

      const result = await listingsCollection
        .find(query)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .toArray();
      res.send(result);
    });

    // get all post
    app.get("/allposts", async (req, res) => {
      const alluser = listingsCollection.find();
      const result = await alluser.toArray();
      res.send(result);
    });

    // get post by email
    app.get("/posts", async (req, res) => {
      const email = req.query.email;
      const result = await listingsCollection
        .find({ "postedBy.ownerEmail": email })
        .toArray();

      res.send(result);
    });

    // delete post by id
    app.delete("/posts/:id", async (req, res) => {
      try {
        const id = req.params.id;
        console.log(id);
        const query = { _id: new ObjectId(id) };

        const result = await listingsCollection.deleteOne(query);

        res.send(result);
      } catch (error) {
        res.status(500).send({ error: "Failed to delete post" });
      }
    });

    // update post by id
    app.put("/posts/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;

      const result = await listingsCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updatedData },
      );

      res.send(result);
    });

    // post approve post by admin
    app.patch("/posts/approve/:id", async (req, res) => {
      const id = req.params.id;

      const result = await listingsCollection.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: { status: "approved" },
        },
      );

      res.send(result);
    });

    // get final order by email
    app.get("/finalOrders", async (req, res) => {
      const email = req.query.email;
      const result = await FinalorderInfoCollaction.find({
        "userInfo.email": email,
      }).toArray();

      res.send(result);
    });

    // get all orders
    app.get("/allorders", async (req, res) => {
      const alluser = FinalorderInfoCollaction.find();
      const result = await alluser.toArray();
      res.send(result);
    });

    // update order status by admin
    app.patch("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const { orderStatus } = req.body;

      const result = await FinalorderInfoCollaction.updateOne(
        { _id: new ObjectId(id) },
        {
          $set: { orderStatus: orderStatus },
        },
      );

      res.send(result);
    });

    // add to card
    app.post("/cart", async (req, res) => {
      const cartItem = req.body;

      // check if item already exists
      const query = { postId: cartItem.postId };

      const existingItem = await cartCollection.findOne(query);

      if (existingItem) {
        return res.send({ message: "Item already added to cart" });
      }

      const newItem = {
        ...cartItem,
        quantity: 1,
      };

      const result = await cartCollection.insertOne(newItem);

      res.send(result);
    });

    // get card items
    app.get("/cart", async (req, res) => {
      const email = req.query.email;

      const result = await cartCollection
        .find({ "userInfo.email": email })
        .toArray();

      res.send(result);
    });

    // update quantity
    app.patch("/cart/:id", async (req, res) => {
      const id = req.params.id;
      const { quantity } = req.body;

      const result = await cartCollection.updateOne(
        { _id: new ObjectId(id) },
        { $set: { quantity } },
      );

      res.send(result);
    });

    // delete item from cart
    app.delete("/cart/:id", async (req, res) => {
      const id = req.params.id;

      const result = await cartCollection.deleteOne({
        _id: new ObjectId(id),
      });

      res.send(result);
    });

    // payment
    app.post("/finalOrder", async (req, res) => {
      try {
        const { orders, user, total, userInfo } = req.body;
        const tran_id = new ObjectId().toString();
        // Insert to DB
        const result = await FinalorderInfoCollaction.insertOne({
          orders,
          userInfo,
          total,
          paidstatus: "pending",
          orderStatus: "Pending",
          createdAt: new Date(),
          tran_id,
        });

        // SSLCommerz Payment Data
        const data = {
          total_amount: total,
          currency: "BDT",
          tran_id,
          success_url: `http://localhost:5000/payment/success/${tran_id}`,
          fail_url: `http://localhost:5000/payment/fail/${tran_id}`,
          cancel_url: `http://localhost:5000/payment/cancel/${tran_id}`,
          ipn_url: "http://localhost:5000/payment/ipn",
          shipping_method: "Courier",
          product_name: "Food Items",
          product_category: "Restaurant",
          product_profile: "general",
          cus_name: user?.name || "Customer",
          cus_email: user?.email || "customer@example.com",
          cus_add1: "Dhaka",
          cus_add2: "Dhaka",
          cus_city: "Dhaka",
          cus_state: "Dhaka",
          cus_postcode: "1000",
          cus_country: "Bangladesh",
          cus_phone: user?.phoneNumber || "01700000000",
          cus_fax: "01711111111",
          ship_name: user?.name || "Customer",
          ship_add1: "Dhaka",
          ship_add2: "Dhaka",
          ship_city: "Dhaka",
          ship_state: "Dhaka",
          ship_postcode: 1000,
          ship_country: "Bangladesh",
        };

        const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
        sslcz.init(data).then((apiResponse) => {
          let GatewayPageURL = apiResponse.GatewayPageURL;
          res.send({ url: GatewayPageURL });
          console.log("Redirecting to:", GatewayPageURL);
        });
      } catch (err) {
        console.error("FinalOrder Error:", err);
        res.status(500).send({ error: "Something went wrong!" });
      }
    });

    // payment success
    app.post("/payment/success/:tran_id", async (req, res) => {
      const tran_id = req.params.tran_id;

      const order = await FinalorderInfoCollaction.findOne({ tran_id });

      if (!order) {
        return res.send("Order not found");
      }

      await FinalorderInfoCollaction.updateOne(
        { tran_id },
        { $set: { paidstatus: "success" } },
      );

      // cart items delete
      const cartIds = order.orders.map((item) => new ObjectId(item._id));

      await cartCollection.deleteMany({
        _id: { $in: cartIds },
      });

      res.redirect(`http://localhost:5173/payment-success/${tran_id}`);
    });

    // payment fail
    app.post("/payment/fail/:tran_id", async (req, res) => {
      const tran_id = req.params.tran_id;

      await FinalorderInfoCollaction.deleteOne({ tran_id });

      res.redirect(`http://localhost:5173/payment-fail/${tran_id}`);
    });

    app.get("/order/:tran_id", async (req, res) => {
      const tranId = req.params.tran_id;
      try {
        const result = await FinalorderInfoCollaction.findOne({
          tran_id: tranId,
        });
        if (!result) {
          return res.status(404).send({ message: "Order not found" });
        }
        res.send(result);
      } catch (err) {
        console.error(err);
        res.status(500).send({ message: "Server error" });
      }
    });

    // payment cancel
    app.post("/payment/cancel/:tran_id", async (req, res) => {
      const tran_id = req.params.tran_id;
      const result = await FinalorderInfoCollaction.deleteOne({
        tran_id: tran_id,
      });

      if (result.deletedCount > 0) {
        res.redirect(`http://localhost:5173/payment-cancel/${tran_id}`);
      } else {
        res.status(400).send({ message: "Transaction not found to delete" });
      }
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
