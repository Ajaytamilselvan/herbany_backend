const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
require("dotenv").config();
const path = require("path");

const app = express();
app.use(cors({origin:"https://herbany-frontend.vercel.app"}));
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
});

db.connect((err) => {
    if (err) throw err;
    console.log("MySQL Connected...");
});

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/", (req, res) => {
  res.send("Backend is running on Render!");
});

// Fetch all products
app.get("/products", (req, res) => {
  db.query("SELECT * FROM products", (err, results) => {
      if (err) return res.json({ error: err.message });

      // Modify image_url to include full path
      const updatedResults = results.map((product) => ({
          ...product,
          image_url: product.image_url ? `http://localhost:5000/${product.image_url}` : null
      }));

      res.json(updatedResults);
  });
});

app.post("/contact", (req, res) => {
    const { name, email, message } = req.body;
    const sql = "INSERT INTO contacts (name, email, message) VALUES (?, ?, ?)";
    db.query(sql, [name, email, message], (err, result) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: "Database error" });
      }
      res.status(200).json({ message: "Message received!" });
    });
  });

app.listen(process.env.PORT, () => console.log("Server running on port 5000"));
