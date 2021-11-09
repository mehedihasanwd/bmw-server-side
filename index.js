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
    const bmwDemo = database.collection("CarsDemo");

    // Test
    const doc = {
      name: "Mehedi",
      email: "hellomehediwd@gmail.com",
    };
    const result = await bmwDemo.insertOne(doc);
    console.log(result);
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

// Default Route
app.get("/", (req, res) => {
  res.send("Running the BMW Server");
});
app.get("/dear", (req, res) => {
  res.send("Hello Dear");
});

// Listening to the app
app.listen(port, () => {
  console.log("Listening to the Port: ", port);
});
