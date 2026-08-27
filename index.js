import express from "express";
import axios from "axios";

const app = express();
const port = 3001;
const API_URL = "http://localhost:4000";

app.use(express.static("public"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", async (req, res) => {
  try {
    const response = await axios.get(`${API_URL}/v1/clubs`);
    res.render("home.ejs", { response: response.data });
  } catch (error) {
    res.status(500).json({ message: "Error fetching Club Data" });
  }
});

app.get("/clubs/:club", async (req, res) => {
    const club = req.params.club;
    try {
        const response = await axios.get(`${API_URL}/v1/clubs/${club}`);
        console.log(response.data);
        res.render("home.ejs", { response: response.data });
    } catch (error) {
        res.status(500).json({ message: `Error fetching ${club} data`  });
    }
});

// app.get("/clubs/:club/preseason/:season", async (req, res) => {
//     const club = req.params.club;
//     try {
//         const response = await axios.get(`${API_URL}/v1/clubs/${club}`);
//         console.log(response.data);
//         res.render("index.ejs", { response: response.data });
//     } catch (error) {
//         res.status(500).json({ message: `Error fetching ${club} data`  });
//     }
// });

// // Create a new post
// app.post("/api/posts", async (req, res) => {
//   try {
//     const response = await axios.post(`${API_URL}/posts`, req.body);
//     console.log(response.data);
//     res.redirect("/");
//   } catch (error) {
//     res.status(500).json({ message: "Error creating post" });
//   }
// });

// // Partially update a post
// app.post("/api/posts/:id", async (req, res) => {
//   console.log("called");
//   try {
//     const response = await axios.patch(
//       `${API_URL}/posts/${req.params.id}`,
//       req.body
//     );
//     console.log(response.data);
//     res.redirect("/");
//   } catch (error) {
//     res.status(500).json({ message: "Error updating post" });
//   }
// });

// // Delete a post
// app.get("/api/posts/delete/:id", async (req, res) => {
//   try {
//     await axios.delete(`${API_URL}/posts/${req.params.id}`);
//     res.redirect("/");
//   } catch (error) {
//     res.status(500).json({ message: "Error deleting post" });
//   }
// });

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
