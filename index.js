require("dotenv").config()
const express = require("express")
const cors = require("cors")
const app = express()

const Products = require("./models/products.model")
const User = require("./models/user.model")
const Categories = require("./models/categories.model")
const Cart = require("./models/cart.model")
const Wishlist = require("./models/wishlist.model")
const Order = require("./models/order.model")

const {initializeDatabase} = require("./db/db.connect")

const corsOptions = {
    origin: "*",
    credentials: true,
    optionSuccessStatus: 200
}

app.use(cors(corsOptions))
app.use(express.json())
initializeDatabase()


//adding product in database

async function addProduct(newProduct){
    try{
        const product = new Products(newProduct)
        const saveProduct = await product.save()
        return saveProduct
    } catch(error) {
        throw (error)
    }
}

app.post("/api/products", async (req, res) => {
    /*
    console.log("Request body:", req.body)
    console.log('Received request at /api/products')
    */

    try{
        const addedProduct = await addProduct(req.body)

        if(addedProduct.length != 0) {
            res.status(200).json({message: "Product added successfully.", product: addedProduct})
        } else {
            res.status(404).json({error: "Product not found."})
        }
    } catch(error) {
        res.status(500).json({error: "Failed to fetch and add new product", error})
    }
})

//adding category in database

async function addCategory(newCategory) {
    try{
        const category = new Categories(newCategory)
        const saveCategory = await category.save()
        return saveCategory
    } catch(error) {
        throw(error)

    }
}

app.post("/api/category", async (req, res) => {
    /*
    console.log("Request body:", req.body)
    console.log('Received request at /api/category')
    */
    try {
        const addedCategory = await addCategory(req.body)

        if(addedCategory.length != 0){
            res.status(200).json({message: "Category added successfully.", category: addedCategory})
        } else{
            res.status(404).json({error: "Category not found."})
        }
    } catch(error){
        res.status(500).json({error: "Failed to fatch category."})
    }
})

//adding user in database

async function addUser(newUser){
    try{
        const user = new User(newUser)
        const saveUser = await user.save()
        return saveUser
    } catch (error){
        throw (error)
    }
}

app.post("/api/users", async (req, res)=> {
    try{
        const addedUser = await addUser(req.body)

        if(addedUser){
            res.status(200).json({message: "User added successfully.", user: addedUser})
        } else {
            res.status(404).json({error: "User not found."})
        }
    } catch (error){
        res.status(500).json({error: "Faild to fetch User."})
    }
})

// reading all products
async function readProducts(){
    try {
        const allProducts = await Products.find().populate("category")
        return allProducts
    } catch(error){
        throw(error)
    }
}

app.get("/api/products", async (req, res)=> {
    try {
        const products = await readProducts()

        if(products){
            res.json(products)
        } else {
            res.status(404).json({error: "Product not found."})
        }
    } catch(error) {
        res.status(500).json({error: "Failed to fetch products."})
    }
})

// reading products by product id
async function readProductById(productId){
    try{
        const productById = await Products.findById(productId).populate("category")
        return productById
    } catch (error) {
        throw (error)
    }
}

app.get("/api/products/:productId", async (req, res)=> {
    try{
        const product = await readProductById(req.params.productId)

        if(product) {
            res.json(product)
        } else{
            res.status(404).json({error: "Product not found."})
        }
    } catch (error) {
        res.status(500).json({error: "Failed to fetch product by id"})
    }
})

// reading user by product id
async function readUserById(userId) {
    try{
        const userById = await User.findById(userId)
        return userById
    } catch (error) {
        throw (error)
    }
}

app.get("/api/users/:userId", async (req, res) => {
    try {
         const user = await readUserById(req.params.userId)

         if(user) {
            res.json(user)
         } else{
            res.status(404).json({error: "User not found."})
         }
    } catch (error) {
        res.status(500).json({error: "Failed to fetch user buy id."})
    }
})


// adding product in cart

app.post("/api/cart", async (req, res) => {
  const { userId, productId, quantity } = req.body;

  try {
    if (!productId) {
      return res.status(400).json({ error: "Product ID is required" });
    }

    const cartItem = new Cart({ userId, productId, quantity });
    const savedItem = await cartItem.save();

    res.status(201).json({ message: "Item added to cart", cart: savedItem });
  } catch (error) {
    res.status(500).json({ error: "Failed to add item to cart" });
  }
});


// reading cart of product
async function readCartProducts() {
    try {
        const allCartProducts = await Cart.find().populate("productId")
        return allCartProducts
    } catch (error){
        throw (error)
    }
}

app.get("/api/cart", async (req, res)=> {
    try {
        const cartProducts = await readCartProducts()

        if(cartProducts) {
            res.json(cartProducts)
        } else {
            res.status(404).json({error: "Cart not foud."})
        }
    } catch (error) {
        res.status(500).json({error: "Failed to fatch cart."})
    }
})

// reading wishlist of product
async function readWishlistProducts(){
    try {
        const allWishlistProducts = await Wishlist.find().populate("category")
        return allWishlistProducts
    } catch (error) {
        throw (error)
    }
}

app.get("/api/wishlist", async (req, res)=> {
    try {
        const wishlistProducts = await readWishlistProducts()

        if(wishlistProducts) {
            res.json(wishlistProducts)
        } else {
            res.status(404).json({error: "Wishlist not found."})
        }
    } catch (error) {
        res.status(505).json({error: "Failed to fetch wishlist products."})
    }
})

// reading order of product
async function readOrderProducts(){
    try {
        const allOrderProducts = await Order.find().populate("category")
        return allOrderProducts
    } catch (error) {
        throw (error)
    }
}

app.get("/api/order", async (req, res)=> {
    try {
        const orderProducts = await readOrderProducts()

        if(orderProducts) {
            res.json(orderProducts)
        } else {
            res.status(404).json({error: "Order not found"})
        }
    } catch (error) {
        res.status(505).json({error: "Failed to fetch order."})
    }
})


// reading categories
async function readCategory() {
    try{
        const category = await Categories.find()
        return category
    } catch(error) {
        throw(error)
    }
}

app.get("/api/category", async (req, res)=> {
    try {
        const allCategories = await readCategory()

        if(allCategories){
            res.json(allCategories)
        } else {
            res.status(404).json({error: "Category not found"})
        }
    } catch (error){
        res.status(500).json({error: "Failed to fetch category"})
    }
})

const PORT = process.env.PORT || 3000

app.listen(PORT, ()=> {
    console.log("Server Running on PORT:", PORT)
})