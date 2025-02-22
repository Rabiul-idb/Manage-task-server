const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io"); 

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(express.json());
app.use(cors());

// Create HTTP server and WebSocket server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f8y06.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    console.log("Connected to MongoDB!");

    const db = client.db("ManageTask");
    const toDoCollection = db.collection("toDo");

    //  MongoDB  Change Stream: Watch for real-time updates
    const changeStream = toDoCollection.watch();

    changeStream.on("change", (change) => {
      console.log("Task Change Detected:", change);

      // Send real-time update to frontend via WebSocket
      io.emit("taskUpdate", change);
    });

    // Add To-Do Task API
    app.post("/addTodoTask", async (req, res) => {
      const todoTask = req.body;
      const result = await toDoCollection.insertOne(todoTask);
      res.send(result);
    });

    // get all task from 
    app.get('/allTask', async (req, res) => {
      const result = await toDoCollection.find().toArray();
      res.send(result)
    })

    // delete a task
    app.delete('/delete/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await toDoCollection.deleteOne(query);
      res.send(result);
    })

  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

run().catch(console.dir);

// Root Route
app.get("/", (req, res) => {
  res.send("Hello from Manage Task server");
});

// Start WebSocket + Express Server
server.listen(port, () => {
  console.log("Server running at", port);
});
