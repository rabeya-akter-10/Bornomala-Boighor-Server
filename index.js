const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const port = process.env.PORT || 5000;

// middleware
app.use(cors())
// app.use(cors({
//     origin: 'http://localhost:5173'
// }));
app.use(express.json())
app.get('/', (req, res) => {
    res.send('Bornomala is running...')
})

// MongoDB Connect

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.a46jnic.mongodb.net/?retryWrites=true&w=majority`;

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
        client.connect();
        const usersCollections = client.db("BornomalaDB").collection("users");
        const categoriesCollections = client.db("BornomalaDB").collection("categories");
        const publicatonCollections = client.db("BornomalaDB").collection("publications");
        const booksCollections = client.db("BornomalaDB").collection("books");
        const writerCollections = client.db("BornomalaDB").collection("writers");

        // Users Api
        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await usersCollections.findOne(query)
            if (existingUser) {
                return res.send({ message: "user already exist" })
            }
            const result = await usersCollections.insertOne(user);
            res.send(result)
        })

        // Get All Users
        app.get('/users', async (req, res) => {
            const result = await usersCollections.find().toArray()
            res.send(result)
        })

        // Get All Categories
        app.get('/categories', async (req, res) => {
            const result = await categoriesCollections.find().toArray()
            res.send(result)
        })

        // Post a categories
        app.post('/categories', async (req, res) => {
            const category = req.body;
            const result = await categoriesCollections.insertOne(category)
            res.send(result)
        })
        // Get All publications
        app.get('/publications', async (req, res) => {
            const result = await publicatonCollections.find().toArray()
            res.send(result)
        })

        // Post a publications
        app.post('/publications', async (req, res) => {
            const publication = req.body;
            const result = await publicatonCollections.insertOne(publication)
            res.send(result)
        })

        // Post a book
        app.post('/books', async (req, res) => {
            const book = req.body;
            const result = await booksCollections.insertOne(book)
            res.send(result)
        })
        // Get a book
        app.get('/books', async (req, res) => {
            const result = await booksCollections.find().toArray()
            res.send(result)
        })

        // Get a book by id
        app.get(`/books/:id`, async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await booksCollections.findOne(query);
            res.send(result);
        });
        // Get a book by id
        app.delete(`/books/:id`, async (req, res) => {
            const id = req.params.id;
            console.log(id);
            const query = { _id: new ObjectId(id) };
            const result = await booksCollections.deleteOne(query);
            res.send(result);
        });
        // Update a book
        app.patch('/books/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const updatedBook = req.body;
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    bookName: updatedBook.bookName,
                    price: updatedBook.price,
                    quantity: updatedBook.quantity,
                    discounts: updatedBook.discounts,
                    category: updatedBook.category,
                    writer: updatedBook.writer,
                    publications: updatedBook.publications,
                    descriptions: updatedBook.descriptions,
                }
            }
            const result = await booksCollections.updateOne(filter, updateDoc, options)
            res.send(result)

        })

        // Get Populer books
        app.get('/best-seller', async (req, res) => {
            try {
                const books = await booksCollections.find().toArray();
                const sortedBooks = books.sort((a, b) => -a?.sold + b?.sold);
                const topBooks = sortedBooks.slice(0, 6);
                res.send(topBooks);
            } catch (error) {
                console.error("Error fetching top books:", error);
                res.status(500).send("An error occurred while fetching top books.");
            }
        });


        // Post a writers
        app.post('/writers', async (req, res) => {
            const writer = req.body;
            const result = await writerCollections.insertOne(writer)
            res.send(result)
        })
        // Get All publications
        app.get('/writers', async (req, res) => {
            const result = await writerCollections.find().toArray()
            res.send(result)
        })




        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error

    }
}
run().catch(console.dir);


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})