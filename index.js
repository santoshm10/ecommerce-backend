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
/*async function readProducts(){
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
    */

// changed reading all products with category fillter. old code is commented above and new code is created bellow

// Function to read products based on optional category query
async function readProducts(category) {
    try {
        const filter = category ? { category } : {};
        const products = await Products.find(filter).populate("category");
        return products;
    } catch (error) {
        throw error;
    }
}

// Route to fetch products (optionally filtered by category)
app.get("/api/products", async (req, res) => {
    const { category } = req.query;

    try {
        const products = await readProducts(category);

        if (products && products.length > 0) {
            res.json(products);
        } else {
            res.status(404).json({ error: "No products found." });
        }
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch products." });
    }
});


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
  const { user, product, quantity } = req.body;
  console.log("Incoming cart data:", req.body);

  try {
    let cartItem = await Cart.findOne({user, product})

    if(cartItem) {
        // If product already in cart, update quantity
        cartItem.quantity += quantity
        await cartItem.save()
        return res.status(200).json({message: "Quantity updated", cart: cartItem})
    }

     // If product not in cart, create new entry
    cartItem = new Cart({ user, product, quantity });
    await cartItem.save();

    res.status(201).json({ message: "Item added to cart", cart: cartItem });
  } catch (error) {
    console.error("Cart add error", error);
    res.status(500).json({ error: "Failed to add item to cart" });
  }
});

//app.put: in cart if we click on increse (+) or decrese (-) product quantity then update product quantity
app.put("/api/cart", async (req, res)=> {
    const { user, product, quantity} = req.body

    try {
        const cartItem = await Cart.findOne({ user, product })
        if (!cartItem) return res.status(404).json({ error: "Cart item not found" })

        cartItem.quantity = quantity
        await cartItem.save()
        res.status(200).json({message: "Cart quantity updated", cart: cartItem})    
    } catch(error) {
        console.error("Update quantity error:", error);
        res.status(500).json({ error: "Failed to update cart" });
    }
})

//app.get: geting cart by user id

app.get("/api/cart/:userId", async (req, res)=> {
    try{
        const cartItem = await Cart.find({user: req.params.userId}).populate("product").populate("user")
        res.status(200).json(cartItem)
    } catch(error){
        console.error("Cart fetch error:", error)
        res.status(500).json({error: "Failed to fetch cart by user id"})
    }
})

//app.delete: remove product from cart 

app.delete("/api/cart/:id", async (req, res)=> {
    try{
        const deletedItem = await Cart.findByIdAndDelete(req.params.id);
        if(!deletedItem) return res.status(404).json({ error: "Item not found" })
    } catch(error){
        console.error("Delete error:", error)
        res.status(500).json({ error: "Failed to delete item from cart" })
    }
})

// reading cart of product
async function readCartProducts() {
    try {
        const allCartProducts = await Cart.find().populate("product").populate("user");

        return allCartProducts
    } catch (error){
        throw (error)
    }
}

app.get("/api/cart", async (req, res) => {
  try {
    const cartProducts = await readCartProducts();

    if (cartProducts && cartProducts.length > 0) {
      res.json(cartProducts);
    } else {
      res.status(404).json({ error: "Cart not found." });
    }
  } catch (error) {
    console.error("Failed to fetch cart:", error);
    res.status(500).json({ error: "Failed to fetch cart." });
  }
});


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