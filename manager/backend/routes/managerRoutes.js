const express = require('express');
const router = express.Router();
const multer = require('multer');
const streamifier = require('streamifier');
const cloudinary = require('cloudinary').v2;
const Manager = require('../models/manager');

// Use memory storage (buffer)
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload buffer to Cloudinary
const uploadToCloudinary = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: 'managers' },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
};

// Manager Register Route
router.post('/register', upload.single('profile'), async (req, res) => {
  console.log("📩 Register API hit");

  try {
    const { name, email, phone, gender, password } = req.body;
    const file = req.file;

    if (!name || !email || !phone || !gender || !password || !file) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await Manager.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    // Upload image to Cloudinary
    const profilePicUrl = await uploadToCloudinary(file.buffer);

    const newManager = new Manager({
      name,
      email,
      phone,
      gender,
      password,
      profilePic: profilePicUrl,
    });

    await newManager.save();

    console.log("✅ Manager saved:", newManager);
    res.status(201).json({ message: 'Manager registered successfully' });
  } catch (err) {
    console.error("❌ Error registering manager:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Manager Login Route
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const manager = await Manager.findOne({ email });
    if (!manager || manager.password !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    res.status(200).json({ message: 'Login successful', manager });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get Manager by ID
// router.get("/manager-profile-pic/:id", async (req, res) => {
//     try {
//       const manager = await Manager.findById(req.params.id).select("profilePic");
//       if (!manager) {
//         return res.status(404).json({ message: "Manager not found" });
//       }
//       res.json({ profilePic: manager.profilePic });
//     } catch (error) {
//       console.error("Error fetching profilePic:", error);
//       res.status(500).json({ message: "Server error" });
//     }
//   });


 // Get Manager by ID (Full Info)
 router.get("/:id", async (req, res) => {
  try {
    const manager = await Manager.findById(req.params.id);
    if (!manager) {
      return res.status(404).json({ message: "Manager not found" });
    }
    res.json(manager);
  } catch (error) {
    console.error("Error fetching manager:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/managers/:id/name
router.put('/:id/name', async (req, res) => {
  const { name } = req.body;
  try {
    const manager = await Manager.findByIdAndUpdate(
      req.params.id,
      { name },
      { new: true }
    );
    res.json(manager);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update name' });
  }
});
// PUT /api/managers/:id/profile-pic
router.put('/:id/profile-pic', upload.single('profilePic'), async (req, res) => {
  try {
    const manager = await Manager.findById(req.params.id);
    if (!manager) return res.status(404).send("Manager not found");

    if (req.file && req.file.path) {
      manager.profilePic = req.file.path; // Cloudinary URL
    }

    await manager.save();
    res.json(manager);
  } catch (err) {
    res.status(500).send("Server error");
  }
});

  
module.exports = router;
