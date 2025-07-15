require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const bcrypt = require("bcryptjs");
//const jwt = require("jsonwebtoken"); // Assuming this is still commented out

const Products = require("./models/products.model");
const User = require("./models/user.model");
const Categories = require("./models/categories.model");
const Cart = require("./models/cart.model");
const Wishlist = require("./models/wishlist.model");
const Order = require("./models/order.model");

const { initializeDatabase } = require("./db/db.connect");

const corsOptions = {
  origin: "*",
  credentials: true,
  optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
console.log("Middleware: CORS applied.");
app.use(express.json());
console.log("Middleware: express.json() applied. Ready to parse JSON bodies.");

initializeDatabase();
console.log("Database initialization called.");

// ------------- ADD THIS TEST ROUTE HERE (KEEP IT) -------------
app.get("/api/test-route", (req, res) => {
  console.log("Backend: /api/test-route was hit!");
  res.status(200).json({ message: "Test route hit successfully!" });
});
console.log("Route: /api/test-route GET defined.");
// ----------------------------------------------------

//adding product in database

async function addProduct(newProduct) {
  try {
    const product = new Products(newProduct);
    const saveProduct = await product.save();
    return saveProduct;
  } catch (error) {
    throw error;
  }
}

app.post("/api/products", async (req, res) => {
  /*
    console.log("Request body:", req.body)
    console.log('Received request at /api/products')
    */

  try {
    const addedProduct = await addProduct(req.body);

    if (addedProduct.length != 0) {
      res.status(200).json({
        message: "Product added successfully.",
        product: addedProduct,
      });
    } else {
      res.status(404).json({ error: "Product not found." });
    }
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch and add new product", error });
  }
});

//adding category in database

async function addCategory(newCategory) {
  try {
    const category = new Categories(newCategory);
    const saveCategory = await category.save();
    return saveCategory;
  } catch (error) {
    throw error;
  }
}

app.post("/api/category", async (req, res) => {
  /*
    console.log("Request body:", req.body)
    console.log('Received request at /api/category')
    */
  try {
    const addedCategory = await addCategory(req.body);

    if (addedCategory.length != 0) {
      res.status(200).json({
        message: "Category added successfully.",
        category: addedCategory,
      });
    } else {
      res.status(404).json({ error: "Category not found." });
    }
  } catch (error) {
    console.error("Category fetch error:", error);
    res.status(500).json({ error: "Failed to fatch category." });
  }
});

//adding user register in database
async function addUser(newUser) {
  const { name, email, password } = newUser;

  const existingUser = await User.findOne({ email });

  if (existingUser) throw new Error("Email already registered");

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = new User({
    name,
    email,
    password: hashedPassword,
  });

  const saveUser = await user.save();
  return saveUser; // Returns the saved user object on success
}

console.log("Function: addUser defined.");

app.post("/api/users", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const newUser = new User({ name, email, password });
    const savedUser = await newUser.save();

    res.status(201).json({ user: savedUser });
  } catch (error) {
    console.error("Registration error:", error); // ✅ Debug this!
    res.status(500).json({ error: "Internal server error" });
  }
});

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
async function readProductById(productId) {
  try {
    const productById = await Products.findById(productId).populate("category");
    return productById;
  } catch (error) {
    throw error;
  }
}

app.get("/api/products/:productId", async (req, res) => {
  try {
    const product = await readProductById(req.params.productId);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ error: "Product not found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product by id" });
  }
});

// reading user by user id
async function readUserById(userId) {
  try {
    const userById = await User.findById(userId);
    return userById;
  } catch (error) {
    throw error;
  }
}

app.get("/api/users/:userId", async (req, res) => {
  try {
    const user = await readUserById(req.params.userId);

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: "User not found." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user buy id." });
  }
});

//add new address and update user

app.post("/api/users/:userId/address", async (req, res) => {
 
  try {
    const userId = req.params.userId;
    console.log("✅ /api/users/:userId/address  userid:", req.params.userId);
    
    const newAddress = req.body.address; 
    console.log("✅ typeof newAddress: ", typeof newAddress);
    console.log("✅ newAddress: ", newAddress);

   if (typeof newAddress !== "string") {
      return res.status(400).json({ error: "Address must be a string", user: userId, address: newAddress});
    
   }
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $push: { address: newAddress} },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json({
      message: "Address added successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error while adding address:", error.message);
    res.status(500).json({ error: "Internal server error", details: error.message });
  }
});

// Express.js DELETE route (example)
app.delete("/api/users/:userId/address/:index", async (req, res) => {
  const { userId, index } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user || !Array.isArray(user.address)) {
      return res.status(404).json({ error: "User or address not found" });
    }

    user.address.splice(index, 1);
    await user.save();

    res.status(200).json({ message: "Address deleted" });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
});



// adding product in cart

app.post("/api/cart", async (req, res) => {
  const { user, product, quantity } = req.body;
  console.log("Incoming cart data:", req.body);

  try {
    let cartItem = await Cart.findOne({ user, product });

    if (cartItem) {
      // If product already in cart, update quantity
      cartItem.quantity += quantity;
      await cartItem.save();
      return res
        .status(200)
        .json({ message: "Quantity updated", cart: cartItem });
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
app.put("/api/cart", async (req, res) => {
  const { user, product, quantity } = req.body;

  try {
    const cartItem = await Cart.findOne({ user, product });
    if (!cartItem)
      return res.status(404).json({ error: "Cart item not found" });

    cartItem.quantity = quantity;
    await cartItem.save();
    res.status(200).json({ message: "Cart quantity updated", cart: cartItem });
  } catch (error) {
    console.error("Update quantity error:", error);
    res.status(500).json({ error: "Failed to update cart" });
  }
});

//app.get: geting cart by user id

app.get("/api/cart/:userId", async (req, res) => {
  try {
    const cartItem = await Cart.find({ user: req.params.userId })
      .populate("product")
      .populate("user");
    res.status(200).json(cartItem);
  } catch (error) {
    console.error("Cart fetch error:", error);
    res.status(500).json({ error: "Failed to fetch cart by user id" });
  }
});

//app.delete: remove product from cart

app.delete("/api/cart/:id", async (req, res) => {
  try {
    const deletedItem = await Cart.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ error: "Item not found" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete item from cart" });
  }
});

// DELETE all cart products after placing order
app.delete("/api/cart/:userId", async (req, res) => {
  try {
    const deletedCart = await Cart.deleteMany({ user: req.params.userId });

    if (deletedCart.deletedCount === 0) {
      return res.status(404).json({ error: "No cart items found for this user." });
    }

    res.status(200).json({ message: "All cart items deleted successfully." });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete cart items." });
  }
});

// reading cart of product
async function readCartProducts() {
  try {
    const allCartProducts = await Cart.find()
      .populate("product")
      .populate("user");

    return allCartProducts;
  } catch (error) {
    throw error;
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

// adding product in wishlist
app.post("/api/wishlist", async (req, res) => {
  const { user, product, quantity } = req.body;
  console.log("Incoming cart data:", req.body);

  try {
    let wishlistItem = await Wishlist.findOne({ user, product });

    if (wishlistItem) {
      // If product already in wishlist, update quantity
      wishlistItem.quantity += quantity;
      await wishlistItem.save();
      return res
        .status(200)
        .json({ message: "Quantity updated", wishlist: wishlistItem });
    }

    // If product not in wishlist, create new entry
    wishlistItem = new Wishlist({ user, product, quantity });
    await wishlistItem.save();

    res
      .status(201)
      .json({ message: "Item added to wishlist", wishlist: wishlistItem });
  } catch (error) {
    console.error("Wishlist add error", error);
    res.status(500).json({ error: "Failed to add item to wishlist" });
  }
});

//app.put: in wishlist if we click on increse (+) or decrese (-) product quantity then update product quantity
app.put("/api/wishlist", async (req, res) => {
  const { user, product, quantity } = req.body;

  try {
    const wishlistItem = await Wishlist.findOne({ user, product });
    if (!wishlistItem)
      return res.status(404).json({ error: "Wishlist item not found" });

    wishlistItem.quantity = quantity;
    await wishlistItem.save();
    res
      .status(200)
      .json({ message: "Wishlist quantity updated", wishlist: wishlistItem });
  } catch (error) {
    console.error("Update quantity error:", error);
    res.status(500).json({ error: "Failed to update cart" });
  }
});

//app.get: geting wishlist by user id

app.get("/api/wishlist/:userId", async (req, res) => {
  try {
    const wishlistItem = await Wishlist.find({ user: req.params.userId })
      .populate("product")
      .populate("user");
    res.status(200).json(wishlistItem);
  } catch (error) {
    console.error("Wishlist fetch error:", error);
    res.status(500).json({ error: "Failed to fetch wishlist by user id" });
  }
});

//app.delete: remove product from wishlist

app.delete("/api/wishlist/:id", async (req, res) => {
  try {
    const deletedItem = await Wishlist.findByIdAndDelete(req.params.id);
    if (!deletedItem) return res.status(404).json({ error: "Item not found" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete item from cart" });
  }
});

// reading wishlist of product
async function readWishlistProducts() {
  try {
    const allWishlistProducts = await Wishlist.find()
      .populate("product")
      .populate("user");
    return allWishlistProducts;
  } catch (error) {
    throw error;
  }
}

app.get("/api/wishlist", async (req, res) => {
  try {
    const wishlistProducts = await readWishlistProducts();

    if (wishlistProducts && wishlistProducts > 0) {
      res.json(wishlistProducts);
    } else {
      res.status(404).json({ error: "Wishlist not found." });
    }
  } catch (error) {
    res.status(505).json({ error: "Failed to fetch wishlist products." });
  }
});

// POST or add products in order from cart

async function addOrder(newOrderData) {
  try {
    const newOrder = new Order(newOrderData);
    const savedOrder = await newOrder.save();
    return savedOrder;
  } catch (error) {
    throw error;
  }
}

app.post("/api/order/", async (req, res) => {
  console.log("Request body:", req.body);
  console.log("Received request at /api/order");

  const { customer, orderItem, orderPrice, deliveryAdress } = req.body;
  try {
    if (!customer || !orderItem || orderItem.length === 0 || !orderPrice || !deliveryAdress) {

      return res
        .status(400)
        .json({ error: "Missing required fields for order." });
    }
    const addedOrder = await addOrder(req.body);


    console.log("Saved order:", addedOrder);

    if (addedOrder) {
      res.status(200).json({
        message: "Order placed successfully.",
        order: addedOrder,
      });
    } else {
      res.status(404).json({ error: "Order creation failed." });
    }
  } catch (error) {
    console.error("Order creation error:", error);
    res.status(500).json({ error: "Failed to create order", error });
  }
});



// reading order of product
async function readOrderProducts() {
  try {
    const allOrderProducts = await Order.find()
      .populate("customer", "name email") // populate customer details
      .populate("orderItem.product", "title price image") // populate product details
      .sort({ createdAt: -1 }); // latest orders first
    return allOrderProducts;
  } catch (error) {
    throw error;
  }
}

app.get("/api/order", async (req, res) => {
  /*
    console.log("GET request at /api/order");
  */
  try {
    const orderProducts = await readOrderProducts();

    if (orderProducts && orderProducts.length > 0) {
      res.json(orderProducts);
    } else {
      res.status(404).json({ error: "Order not found" });
    }
  } catch (error) {
    console.error("Order fetch error:", error);
    res.status(500).json({ error: "Failed to fetch order." });
  }
});

// ✅ Get all orders of a specific user
app.get("/api/order/user/:userId", async (req, res) => {
  try {
    const userOrders = await Order.find({ customer: req.params.userId })
      .populate("customer", "name email") // Optional: get user info
      .populate("orderItem.product", "title price image") // Get product details
      .sort({ createdAt: -1 }); // Recent first

    if (userOrders.length > 0) {
      res.status(200).json(userOrders);
    } else {
      res.status(404).json({ error: "No orders found for this user." });
    }
  } catch (error) {
    console.error("User orders fetch error:", error);
    res.status(500).json({ error: "Failed to fetch user orders." });
  }
});

// reading categories
async function readCategory() {
  try {
    const category = await Categories.find();
    return category;
  } catch (error) {
    throw error;
  }
}

app.get("/api/category", async (req, res) => {
  try {
    const allCategories = await readCategory();

    if (allCategories) {
      res.json(allCategories);
    } else {
      res.status(404).json({ error: "Category not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch category" });
  }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log("Server Running on PORT:", PORT);
});
