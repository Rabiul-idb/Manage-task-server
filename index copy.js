
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const express = require('express');
const cors = require('cors');


const app = express();

const port = process.env.PORT || 5000;

// middle ware

app.use(express.json());
app.use(cors());





const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.f8y06.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // Connect the client to the server	(optional starting in v4.7)
   // await client.connect();
    // Send a ping to confirm a successful connection
  //  await client.db("admin").command({ ping: 1 });

    const db = client.db("ManageTask");
    const userCollection = db.collection("users");
    const toDoCollection = db.collection("toDo");


    const changeStream = toDoCollection.watch();

    changeStream.on("change", (change) => {
      console.log("🆕 Task Change Detected:", change);

      if (change.operationType === "insert") {
        console.log("✅ New Task Added:", change.fullDocument);
        // You can send a real-time notification here (WebSocket, email, etc.)
      } else if (change.operationType === "update") {
        console.log("🔄 Task Updated:", change.updateDescription.updatedFields);
      } else if (change.operationType === "delete") {
        console.log("❌ Task Deleted:", change.documentKey);
      }
    });
    
    // add user to db
    // save or update a user to db
    app.post('/addUser/:email', async(req, res) =>{
        const email = req.params.email;
        const query = {email}
        const user = req.body
  
        // now check the user is exist in db
        const isExist = await userCollection.findOne(query);
        if(isExist){
          return res.send(isExist)
        }
  
        const result = await userCollection.insertOne({
          ...user, 
          'login_date': new Date().toLocaleString(),
        })
        res.send(result)
  
      })

    // get all users
    app.get('/allUsers', async(req, res) =>{
        const users = await userCollection.find().toArray();
        res.send(users);
      })

      // add to do task
      app.post('/addTodoTask', async(req, res) =>{
        const todoTask = req.body;
        const result = await toDoCollection.insertOne(todoTask);
        res.send(result);

      });






    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  //  await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Hello from my manage task server')
})

app.listen(port, () => {
    console.log('My simple server is running at', port);
})