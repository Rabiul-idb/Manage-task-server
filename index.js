
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