const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express()
const SSLCommerzPayment = require('sslcommerz-lts')
const store_id = `${process.env.STORE_ID}`
const store_passwd = `${process.env.STORE_PASS}`
const is_live = false //true for live, false for sandbox
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
        const cartCollections = client.db("BornomalaDB").collection("carts");
        const orderCollections = client.db("BornomalaDB").collection("orders");

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

        // Get user by email
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const result = await usersCollections.findOne(filter)
            res.send(result)
        })


        // update User
        app.put('/users/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { email: email };
            const updatedinfo = req.body

            const options = {};
            // Specify the update to set a value for the plot field
            const updateDoc = {
                $set: {

                    phone: updatedinfo.phone,
                    address: updatedinfo.address

                },
            };
            // Update the first document that matches the filter
            const result = await usersCollections.updateOne(filter, updateDoc, options);
            if (result.modifiedCount === 1) {
                res.status(200).json({ acknowledged: true });
            } else {
                res.status(500).json({ acknowledged: false, error: "Failed to update user information." });
            }
        });

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
            // const options = { upsert: true };
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
                    keywords: updatedBook.keywords,
                    bookName_en: updatedBook.bookName_en,

                }
            }
            const result = await booksCollections.updateOne(filter, updateDoc)
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

        // Cart Collection

        app.post('/carts', async (req, res) => {
            const item = req.body;
            const result = await cartCollections.insertOne(item)
            res.send(result)
        })

        // get all cart
        app.get('/carts', async (req, res) => {
            const result = await cartCollections.find().toArray()
            res.send(result)
        })

        // get cart by email
        app.get('/carts/:email', async (req, res) => {
            const email = req.params.email;
            const filter = { userEmail: email };
            const result = await cartCollections.find(filter).toArray()
            res.send(result);
        });

        // delete a item from cart
        app.delete('/carts/:id', async (req, res) => {
            const id = req.params.id
            const filter = { _id: new ObjectId(id) }
            const result = await cartCollections.deleteOne(filter)
            res.send(result)
        })

        app.post('/orders', async (req, res) => {
            const initialOrder = req?.body;
            const items = initialOrder?.items;
            const client = initialOrder?.client;
            const bookIDs = items.map(item => new ObjectId(item.bookID));
            const books = await booksCollections.find({ _id: { $in: bookIDs } }).toArray();
            const selectedItems = items?.map(item => {
                const matchedBook = books?.find(book => book?._id.equals(item?.bookID));
                return item
            });
            const totalPrice = selectedItems.reduce((total, i) => total + i?.discountedPrice, 0);
            const trans_id = Math.random().toString(36).substr(2, 6) + Math.random().toString(36).substr(2, 6).substr(0, 6)
            const data = {
                total_amount: totalPrice + 70,
                currency: 'BDT',
                tran_id: trans_id,
                success_url: `https://bornomala-boighor-server.vercel.app/payment/success/${trans_id}`,
                fail_url: 'https://bornomala-mart.web.app/failed-payment',
                cancel_url: 'https://bornomala-mart.web.app/cancel-payment',
                shipping_method: 'Courier',
                product_name: 'book',
                product_category: 'book',
                product_profile: 'general',
                cus_name: client.name,
                cus_email: client.email,
                cus_add1: client.address.district,
                cus_phone: client.phone,
                ship_name: client.name,
                ship_add1: client.address.division,
                ship_city: client.address.district,
                ship_area: client.address.street,
                ship_postcode: client.address.postCode,
                ship_country: 'Bangladesh',
            };


            const finalOrder = {
                client: initialOrder?.client,
                products: selectedItems,
                transactionId: data?.tran_id,
                paymentStatus: false,
                deliveryCost: initialOrder.deliveryCost
            }

            const orderInsert = await orderCollections.insertOne(finalOrder)

            const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
            sslcz.init(data).then(apiResponse => {
                let GatewayPageURL = apiResponse.GatewayPageURL;

                res.send({ url: GatewayPageURL });
                console.log('Redirecting to: ', GatewayPageURL);
            }).catch(error => {
                console.error('Error initiating SSLCommerz payment:', error);
                res.status(500).send('An error occurred while initiating payment.');
            });



        });

        app.post(`/payment/success/:trans_id`, async (req, res) => {
            const result = await orderCollections.updateOne({ transactionId: req.params.trans_id }, {
                $set: {
                    paymentStatus: true,
                    orderStatus: "processing"
                }
            })

            if (result.modifiedCount > 0) {
                res.redirect(`https://bornomala-mart.web.app/success-payment/${req.params.trans_id}`)
            }

            const orders = await orderCollections.findOne({ transactionId: req.params.trans_id })
            const items = orders?.products
            const clients = orders?.client
            const userCart = await cartCollections.find({ userEmail: clients.email }).toArray()

            const orderedItems = userCart.filter(cartItem => {
                return items.some(item => item.bookId === cartItem.bookId);
            });

            const removeFromCart = orderedItems.map(item => {
                const del = cartCollections.deleteOne({ _id: new ObjectId(item._id) })
            });


        })

        app.get('/orders', async (req, res) => {
            const result = await orderCollections.find().toArray();
            res.send(result);
        });

        app.get('/orders/:email', async (req, res) => {
            const email = req.params.email
            const filter = {
                'client.email': email
            }
            const result = await orderCollections.find(filter).toArray();
            res.send(result);

        });

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