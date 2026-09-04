import express from "express";
import axios from "axios";
import pg from "pg";
import bcrypt from "bcrypt";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";

const app = express();
const port = 3000;
const API_URL = "http://localhost:4000";
const saltRounds = 10;

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "auth",
  password: "mikun2005",
  port: 5432,
});
db.connect();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: "SECRETORPASSWORD",
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.get("/", async (req, res) => {
  res.render("home.ejs");
});

app.get("/login", async (req, res) => {
  res.render("login.ejs");
});

app.get("/register", async (req, res) => {
  res.render("register.ejs");
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/info/clubs",
    failureRedirect: "/login",
  })
);

app.post("/register", async (req, res) => {
  const email = req.body.username;
  const password = req.body.password;
  try {
    const checkResult = await db.query(`SELECT email FROM auth WHERE email = $1`, [email]);
    if (checkResult.rows.length > 0) {
      res.send("Email already exists. Try logging in.");
    } else {
      bcrypt.hash(password, saltRounds, async (err, hash) => {
        if (err) {
          console.log("Error hashing password: ", err);
        }
        const result = await db.query(`INSERT INTO auth (email, password) VALUES ($1, $2)`,
        [email, hash]);
        res.redirect("/info/clubs");
      });
      
    }

  } catch (error) {
    console.log(error);
    res.send("An unexpected error occured while registering new user" );
  }
});

app.get("/info/clubs", async (req, res) => {
  try {
    console.log(req.user);
    const response = await axios.get(`${API_URL}/v1/clubs`);
    if (req.isAuthenticated()) {
      res.render("index.ejs", { 
        response: response.data,
        currentPath: req.path
      });      
    } else {
     res.redirect("/login"); 
    }

  } catch (error) {
    res.status(500).json({ message: "Error fetching Club Data" });
  }
});

app.get("/info/clubs/:club", async (req, res) => {
    const club = req.params.club;
    try {
        const response = await axios.get(`${API_URL}/v1/clubs/${club}`);
        res.render("index.ejs", { response: response.data, currentPath: req.path });
    } catch (error) {
        res.status(500).json({ message: `Error fetching ${club} data`});
    }
});

app.get("/info/clubs/:club/preseason/:season", async (req, res) => {
    const club = req.params.club;
    const season = req.params.season;
    try {
        const response = await axios.get(`${API_URL}/v1/clubs/${club}/preseason/${season}`);
        res.render("index.ejs", { response: response.data, currentPath: req.path });
    } catch (error) {
        res.status(500).json({ message: `Error fetching ${club} data` });
    }
});
app.get("/info/seasons/:season", async (req, res) => {
  const season = req.params.season;
  try {
    const response = await axios.get (`${API_URL}/v1/seasons/${season}`);
    res.render("index.ejs", { response: response.data });
  } catch (error) {
      res.status(500).json({ message: `Error fetching ${season} season data`  });
  }
});

app.get("/info/players", async (req, res) => {
  try {
    const response = await axios.get (`${API_URL}/v1/players`);
    res.render("player.ejs", { response: response.data });
  } catch (error) {
      res.status(500).json({ message: `Error fetching Players data`  });
  }
});

app.get("/info/players-clubs", async (req, res) => {
  try {
    const response = await axios.get (`${API_URL}/v1/players-clubs`);
    res.render("index.ejs", { response: response.data });
  } catch (error) {
      res.status(500).json({ message: `Error fetching Players data`  });
  }
});

app.get("/info/players/:player", async (req, res) => {
  const player = req.params.player;
  try {
    const response = await axios.get (`${API_URL}/v1/players/${player}`);
    res.render("index.ejs", { response: response.data });
  } catch (error) {
      res.status(500).json({ message: `Error fetching Player data`  });
  }
});

app.post("/v1/clubs", async (req, res) => {
    const { name, slang, country, city, seasonsAvailable } = req.body;

});
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

passport.use(new Strategy(async function verify (username, password, cb){
    try {
      const result = await db.query(`SELECT * FROM auth WHERE email = $1`, [username]);
      if (result.rows.length > 0) {
        const user = result.rows[0];
        const storedPassword = user.password;
        bcrypt.compare(password, storedPassword, (err, result) => {
          if (err) {
            return cb(err);
          } else {
            if (result) {
              return cb(null, user)
            } else {
              return cb(null, false)
            }
          }
        })

      } else {
        return cb("User not found");
      }

    } catch (error) {
      res.status(500).send({ error: "An unexpected error occured while logging in" });
      return cb(err);
    }
  }) 
);

passport.serializeUser((user, cb) => {
  cb(null, user);
});

passport.deserializeUser((user, cb) => {
  cb(null, user);
});

app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});
