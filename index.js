const express = require( 'express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


console.log(process.env.DB_PASS)


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qen4a4k.mongodb.net/?retryWrites=true&w=majority`;

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
    await client.connect();

    const alltoysCollection = client.db('toyDrive').collection('alltoys');
    const addToysCollection = client.db('toyDrive').collection('addToy');

    app.get('/alltoys', async(req, res) =>{
        const cursor = alltoysCollection.find();
        const result = await cursor.toArray();
        res.send(result)
    })

    app.get('/alltoys/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id)}

      const options = {
        projection: { ToyName: 1, price: 1, toys_id: 1, Img: 1, AvailableQuantity: 1},
      }
      const result = await alltoysCollection.findOne(query, options)
      res.send(result)
    })

    // addToy

    app.get('/addToy', async(req, res) => {
      console.log(req.query.email)
      let query = {};
      if(req.query?.email){
        query = {email: req.query.email}
      }

      const result = await addToysCollection.find(query).toArray();
      res.send(result);
    })

  // Post 
    app.post('/addToy', async(req, res)=> {
      
        const addToy = req.body;
        console.log(addToy);
        const result = await addToysCollection.insertOne(addToy);
        res.send(result);
    })

    // Patch

    app.patch('/addToy/:id', async(req, res) =>{
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) }
      const updatedAddingToys  = req.body;
      console.log(updatedAddingToys)
      const updateDoc = {
        $set: {
          status: updatedAddingToys.status
        },
      };
      const result = await addToysCollection.updateOne(filter, updateDoc);
      res.send(result)
      
      
    })

    // Delete 

    app.delete('/addToy/:id', async(req, res)=>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await addToysCollection.deleteOne(query);
      res.send(result)
    })



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
    res.send('toy drive is running')
})

app.listen(port, ()=>{
    console.log(`Toy drive server is running on port ${port}`)
})