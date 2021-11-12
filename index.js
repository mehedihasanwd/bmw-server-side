const express = require("express");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

// MongoDB - URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qbhxv.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

console.log(uri);

// MongoDB - Client
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function run() {
  try {
    await client.connect();

    const database = client.db("BMW");
    const bmwCollection = database.collection("Cars");
    const reviewCollection = database.collection("Reviews");
    const orderCollection = database.collection("Orders");
    const userCollection = database.collection("users");

    // GET CARS - API
    app.get("/cars", async (req, res) => {
      const cursor = bmwCollection.find({});
      const cars = await cursor.toArray();
      res.send(cars);
    });

    // GET SPECIFIC CAR - API
    app.get("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const car = await bmwCollection.findOne(query);
      res.send(car);
    });
    // GET REVIEWS - API
    app.get("/reviews", async (req, res) => {
      const cursor = reviewCollection.find({});
      const reviews = await cursor.toArray();
      res.send(reviews);
    });

    app.post("/reviews", async (req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.json(result);
    });

    // POST ORDERS - API
    app.post("/orders", async (req, res) => {
      const order = req.body;
      const result = await orderCollection.insertOne(order);
      res.json(result);
    });

    // POST CARS - API (Add A Product)
    app.post("/cars", async (req, res) => {
      const car = req.body;
      const result = await bmwCollection.insertOne(car);
      res.json(result);
    });

    // GET Orders - API
    app.get("/orders", async (req, res) => {
      const cursor = orderCollection.find({});
      const orders = await cursor.toArray();
      res.json(orders);
    });

    // Orders API with Email - GET
    app.get("/orders/:email", async (req, res) => {
      const email = req.params.email;
      const cursor = orderCollection.find({});
      const orders = await cursor.toArray();
      const customerOrder = orders.filter((mail) => mail.email === email);
      res.send(customerOrder);
    });

    // Delete Specific Order API
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const deleteOrder = await orderCollection.deleteOne(query);
      res.json(deleteOrder);
    });
    // Delete Specific Cars API
    app.delete("/cars/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const deleteCars = await bmwCollection.deleteOne(query);
      res.json(deleteCars);
    });

    // All Orders
    app.get("/allorders", async (req, res) => {
      const cursor = orderCollection.find({});
      const allOrders = await cursor.toArray();
      res.json(allOrders);
    });

    // Delete Specific Ordered Cars API
    app.delete("/allorders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const deleteCars = await orderCollection.deleteOne(query);
      res.json(deleteCars);
    });

    // Update Status
    app.put("/updateStatus/:id", (req, res) => {
      const id = req.params.id;
      const updatedStatus = req.body.status;
      const filter = { _id: ObjectId(id) };
      orderCollection
        .updateOne(filter, {
          $set: { orderStatus: updatedStatus },
        })
        .then((result) => {
          res.send(result);
        });
    });

    // Post User - API
    app.post("/users", async (req, res) => {
      const user = req.body;
      const result = await userCollection.insertOne(user);
      console.log(result);
      res.json(result);
    });
    // Upsert User - API
    app.put("/users", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const option = { upsert: true };
      const updateUser = { $set: user };
      const result = await userCollection.updateOne(filter, updateUser, option);
      res.json(result);
    });
    // Make Admin From Users - API
    app.put("/users/admin", async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const updateUser = { $set: { role: "admin" } };
      const result = await userCollection.updateOne(filter, updateUser);
      res.json(result);
    });

    // Filter Admin - API
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await userCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === "admin") {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    });
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

// Default Route
app.get("/", (req, res) => {
  res.send("Running the BMW Server");
});

// Listening to the app
app.listen(port, () => {
  console.log("Listening to the Port: ", port);
});
