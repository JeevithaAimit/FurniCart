const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");
const Order = require("./models/OrderModel");
const Customer = require("./models/Customer");
const Product = require("./models/Product");
const adminRoutes = require("./routes/adminRoutes"); // ✅ Adjust path if needed
const inventoryRoutes = require("./routes/inventory");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cors());
app.use("/admin-api", adminRoutes)

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "❌ MongoDB connection error:"));
db.once("open", () => console.log("✅ Connected to MongoDB"));

// Cloudinary Config
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});

// Multer Setup
const storage = multer.memoryStorage();
const upload = multer({ storage }).any(); // Accepts any file


// Cloudinary Upload Helper
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream((error, result) => {
      if (error) reject(error);
      else resolve(result.secure_url);
    });
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Product Schema
// const ProductSchema = new mongoose.Schema({
//   name: { type: String, required: true },
//   category: { type: String, required: true },
//   price: { type: Number, required: true },
//   discountPrice: Number,
//   material: String,
//   color: String,
//   type: String,
//   description: String,
//   isAvailable: { type: Boolean, default: true },
//   mainImage: String,
//   subImages: [String],
// },{ timestamps: true } );
// const Product = mongoose.model("Product", ProductSchema);

// Add Product API
app.post("/add-product", upload, async (req, res) => {
  try {
    console.log("🟢 Received request to add product");
    console.log("🔍 Checking received files:", req.files);

    // Ensure files are present
    if (!req.files || req.files.length === 0) {
      console.log("❌ No image files received");
      return res.status(400).json({ error: "Images are required" });
    }

    console.log("✅ Files received, processing Cloudinary upload...");

    // Extract mainImage and subImages
    const mainImageFile = req.files.find((file) => file.fieldname === "mainImage");
    const subImagesFiles = req.files.filter((file) => file.fieldname === "subImages");

    if (!mainImageFile || subImagesFiles.length === 0) {
      console.log("❌ Missing main image or sub-images");
      return res.status(400).json({ error: "Main image and sub-images are required" });
    }

    // Upload Main Image
    const mainImageUrl = await uploadToCloudinary(mainImageFile.buffer);
    console.log("✅ Main image uploaded:", mainImageUrl);

    // Upload Sub Images
    const subImagesUrls = await Promise.all(
      subImagesFiles.map(async (file) => {
        return await uploadToCloudinary(file.buffer);
      })
    );
    console.log("✅ Sub images uploaded:", subImagesUrls);

    // Save product data to MongoDB
    const newProduct = new Product({
      name: req.body.name,
      category: req.body.category,
      price: req.body.price,
      discountPrice: req.body.discountPrice,
      material: req.body.material,
      color: req.body.color,
      type: req.body.type,
      quantity: req.body.quantity,
      description: req.body.description,
      isAvailable: req.body.isAvailable === "true",
      mainImage: mainImageUrl,
      subImages: subImagesUrls,
    });

    await newProduct.save();
    console.log("✅ Product saved successfully to MongoDB");

    res.status(201).json({ message: "Product added successfully" });
  } catch (error) {
    console.error("❌ Error in /add-product route:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// Fetch Products API
app.get("/products", async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json(products);
  } catch (error) {
    console.error("❌ Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products" });
  }
});




// Delete Product API
app.delete("/delete-product/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the product exists
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    // Delete images from Cloudinary
    const deleteImage = async (imageUrl) => {
      const publicId = imageUrl.split("/").pop().split(".")[0]; // Extract public ID
      await cloudinary.uploader.destroy(publicId);
    };

    await deleteImage(product.mainImage);
    await Promise.all(product.subImages.map(deleteImage));

    // Delete the product from MongoDB
    await Product.findByIdAndDelete(id);

    console.log("✅ Product deleted successfully:", id);
    res.status(200).json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("❌ Error deleting product:", error);
    res.status(500).json({ error: "Failed to delete product" });
  }
});


// Update Product API
app.put("/update-product/:id", upload, async (req, res) => {
  try {
    const { id } = req.params;

    // Find existing product
    let product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    console.log("🟡 Updating product:", id);

    // Extract new data from request
    const {
      name,
      category,
      price,
      discountPrice,
      material,
      color,
      type,
      quantity,
      description,
      isAvailable,
    } = req.body;

    // Handle image updates
    let mainImageUrl = product.mainImage;
    let subImagesUrls = product.subImages;

    if (req.files && req.files.length > 0) {
      const mainImageFile = req.files.find((file) => file.fieldname === "mainImage");
      const subImagesFiles = req.files.filter((file) => file.fieldname === "subImages");

      // If new main image is uploaded, replace the old one
      if (mainImageFile) {
        await cloudinary.uploader.destroy(product.mainImage.split("/").pop().split(".")[0]); // Delete old image
        mainImageUrl = await uploadToCloudinary(mainImageFile.buffer); // Upload new image
      }

      // If new sub-images are uploaded, replace the old ones
      if (subImagesFiles.length > 0) {
        await Promise.all(product.subImages.map(async (img) => {
          await cloudinary.uploader.destroy(img.split("/").pop().split(".")[0]); // Delete old sub-images
        }));
        subImagesUrls = await Promise.all(subImagesFiles.map(async (file) => {
          return await uploadToCloudinary(file.buffer); // Upload new images
        }));
      }
    }

    // Update product in MongoDB
    product = await Product.findByIdAndUpdate(
      id,
      {
        name,
        category,
        price,
        discountPrice,
        material,
        color,
        type,
        quantity,
        description,
        isAvailable: isAvailable === "true",
        mainImage: mainImageUrl,
        subImages: subImagesUrls,
      },
      { new: true } // Return the updated document
    );

    console.log("✅ Product updated successfully:", id);
    res.status(200).json({ message: "Product updated successfully", product });
  } catch (error) {
    console.error("❌ Error updating product:", error);
    res.status(500).json({ error: "Failed to update product" });
  }
});

// Update Product Availability API
// app.patch("/update-availability/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { isAvailable } = req.body;

//     // Validate product existence
//     const product = await Product.findById(id);
//     if (!product) {
//       return res.status(404).json({ error: "Product not found" });
//     }

//     // Update availability
//     product.isAvailable = isAvailable;
//     await product.save();

//     console.log(`✅ Product availability updated: ${id}, Available: ${isAvailable}`);
//     res.status(200).json({ message: "Product availability updated successfully" });
//   } catch (error) {
//     console.error("❌ Error updating availability:", error);
//     res.status(500).json({ error: "Failed to update availability" });
//   }
// });



app.get("/inventory", async (req, res) => {
  try {
    const totalProducts = await Product.countDocuments(); // Count total products
    res.json({ totalProducts });
  } catch (error) {
    console.error("❌ Error fetching total products:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


app.get("/total-sales", async (req, res) => {
  try {
    const totalSales = await Order.aggregate([
      { $group: { _id: null, totalSalesPrice: { $sum: "$totalAmount" } } }, // Sum all order amounts
    ]);
    res.json({ totalSalesPrice: totalSales[0]?.totalSalesPrice || 0 });
  } catch (error) {
    console.error("❌ Error fetching total sales:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// app.get("/api/customers", async (req, res) => {
//   try {
//     const totalCustomers = await Customer.countDocuments(); // Count customers
//     res.json({ totalCustomers });
//   } catch (error) {
//     console.error("❌ Error fetching total customers:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });


// app.get("/api/orders", async (req, res) => {
//   try {
//     const orders = await Order.find(); // Ensure Order model is correct
//     res.json(orders); // Send JSON array
//   } catch (error) {
//     console.error("❌ Error fetching orders:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// app.get("/products/:id", async (req, res) => {
//   try {
//     const productId = req.params.id;
//     console.log("Backend received request for product ID:", productId);

//     // ✅ Validate if productId is a valid MongoDB ObjectId
//     if (!mongoose.Types.ObjectId.isValid(productId)) {
//       return res.status(400).json({ message: "Invalid Product ID format" });
//     }

//     // ✅ Convert string ID to ObjectId
//     const product = await Product.findById(new mongoose.Types.ObjectId(productId));

//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     res.json(product);
//   } catch (error) {
//     console.error("Error fetching product:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// });

// app.get("/products/recent", async (req, res) => {
//   try {
//     const recentProducts = await Product.find().sort({ createdAt: -1 }).limit(8);
//     res.json(recentProducts);
//   } catch (error) {
//     console.error("Error fetching recent products:", error);
//     res.status(500).json({ error: "Error fetching recent products" });
//   }
// });


app.delete("/customers/:id", async (req, res) => {
  try {
    const deletedCustomer = await Customer.findByIdAndDelete(req.params.id);
    if (!deletedCustomer) {
      return res.status(404).json({ message: "Customer not found" });
    }
    res.status(200).json({ message: "Customer deleted" });
  } catch (error) {
    console.error("Error deleting customer:", error);
    res.status(500).json({ message: "Server error" });
  }
});




// app.get("/products/:id", async (req, res) => {
//   try {
//     const { id } = req.params;

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid Product ID format" });
//     }

//     const product = await Product.findById(id);
//     if (!product) {
//       return res.status(404).json({ message: "Product not found" });
//     }

//     res.json(product);
//   } catch (error) {
//     console.error("❌ Error fetching product:", error);
//     res.status(500).json({ error: "Server error" });
//   }
// });

app.get("/products/recent", async (req, res) => {
  try {
    const recentProducts = await Product.find().sort({ createdAt: -1 }).limit(10);
    res.json(recentProducts);
  } catch (error) {
    console.error("Error fetching recent products:", error);
    res.status(500).json({ error: "Error fetching recent products" });
  }
});

app.get("/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log("Backend received request for product ID:", id);

    // ✅ Validate if productId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid Product ID format" });
    }

    // ✅ Fetch product by ID
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    console.error("❌ Error fetching product:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/orders", async (req, res) => {
  try {
    const orders = await Order.find({}, "name email phone totalPrice status items");
    
    // Transform data to include only required fields from items
    const formattedOrders = orders.map((order) => ({
      _id: order._id,
      name: order.name,
      email: order.email,
      phone: order.phone,
      totalPrice: order.totalPrice,
      status: order.status,
      items: order.items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        price: item.price,
        mainImage:item.mainImage
      }))
    }));

    res.json(formattedOrders);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/customers", async (req, res) => {
  try {
    // Fetch all customers from the Customer collection
    const customers = await Customer.find();

    // Aggregate order count grouped by customerId (using $group and $sum)
    const orderCounts = await Order.aggregate([
      {
        $group: {
          _id: "$customerId",  // Group by customerId from the Order collection
          count: { $sum: 1 }    // Count the number of orders per customerId
        }
      }
    ]);

    // Map the order counts by customerId for fast lookup
    const countMap = {};
    orderCounts.forEach(item => {
      countMap[item._id.toString()] = item.count;  // Store count with customerId as string key
    });

    // Enrich customer data with orderCount by matching customer._id with countMap
    const enrichedCustomers = customers.map(customer => ({
      ...customer._doc,  // Spread the raw customer data
      orderCount: countMap[customer._id.toString()] || 0  // Attach the orderCount, default to 0 if not found
    }));

    // Send the enriched customer data as the response
    res.status(200).json(enrichedCustomers);
  } catch (error) {
    console.error("❌ Error fetching customers:", error);
    res.status(500).json({ message: "Server error while fetching customers" });
  }
});


app.get("/orders/by-customer/:customerId", async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.customerId);
    if (!customer) return res.status(404).json({ message: "Customer not found" });

    const orders = await Order.find({ customerId: customer._id });  // Use customerId instead of email
    res.status(200).json(orders);
  } catch (error) {
    console.error("❌ Error fetching orders:", error);
    res.status(500).json({ message: "Server error while fetching orders" });
  }
});


app.use("/inventory", inventoryRoutes);



app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));