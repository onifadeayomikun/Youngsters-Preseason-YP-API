import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import pg from "pg";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import session from "express-session";
import passport from "passport";
import GoogleStrategy from "passport-google-oauth2";
import { Strategy } from "passport-local";

dotenv.config();

const app = express();
const port = 3000;
const API_URL = "http://localhost:4000";
const saltRounds = 10;

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.IN_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
    }
  })
);

app.use(passport.initialize());
app.use(passport.session());

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer")) {
    return res.status(401).json({error: "No token provided"});
  }
  try {
    req.user = jwt.verify(authHeader.split(' ')[1], process.env.JWT_SECRET);
    next();
  } catch (error) {
      return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: insufficient role' });
    }
    next();
  };
}

app.get("/", async (req, res) => {
  res.render("home.ejs");
});

app.get("/login", async (req, res) => {
  res.render("login.ejs");
});

app.get("/register", async (req, res) => {
  res.render("register.ejs");
});

app.get("/auth/google", passport.authenticate("google", {
  scope: ["profile", "email"],
})
);

app.get("/auth/google/info/clubs", passport.authenticate("google", {
    successRedirect: "/info/clubs",
    failureRedirect: "/login",
  })
);

app.get("/logout", async (req, res) => {
  req.logout((err) => {
    if (err) console.log(err);
    res.redirect("/");
  })
});

app.post("/login", passport.authenticate("local", {
    successRedirect: "/info/clubs",
    failureRedirect: "/login",
  })
);

app.post("/login", (req, res, next) => {
  passport.authenticate("local", { session: false }, (error, user) => {
    if (error) return next(error);

    if (!user) {
      return res.status(401).json({
        error: "Invalid email or password",
      });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );        
  return res.json({ token });
  })
});

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
        const result = await db.query(`INSERT INTO auth (email, password) VALUES ($1, $2) RETURNING *`,
        [email, hash]);
        const user = result.rows[0];
        req.login(user, (err) => {
          console.log(err)
          res.redirect("/info/clubs");
        })
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

app.get('/dashboard', authenticate, requireRole('admin', 'editor'), (req, res) => {
  res.json({ message: `Welcome, ${req.user.role}` });
});

app.post("/v1/clubs", async (req, res) => {
    const { name, slang, country, city, seasonsAvailable } = req.body;
    if (!name || !country || !city) {
      return res.send("name, country, and city are required");
    }
    if (!slang || typeof slang !== "string") {
        return res.send("Slang must be a string");
    }
    if (typeof seasonsAvailable != "number" || !Number.isInteger(seasonsAvailable) || seasonsAvailable < 0) {
        return res.send("Seasons Available must be a non-negative integer");
    }    
    try {
        const clubCheck = await db.query( `SELECT club_id FROM clubs WHERE lower(name) = lower($1)`, [name] );

        if (clubCheck.rows.length > 0) {
            return res.send("Club found");

        } else {
            const newClub = await db.query(`INSERT INTO clubs (name, slang, country, city, seasons_available)
                 VALUES ($1, $2, $3, $4, $5)`, [ name, slang, country, city, seasonsAvailable ] );
            res.status(201).json({
            message: 'Club inserted successfully',
            data: newClub.rows[0]
        });
        }

    } catch (error) {
      console.error("Error creating club: ", error);
      return res.status(500).json({ 
        error: "An unexpected error occured while creating club",
     });  
    }       


});

// Create a new Club
app.post("/api/posts", async (req, res) => {
  try {
    const response = await axios.post(`${API_URL}/posts`, req.body);
    console.log(response.data);
    res.redirect("/");
  } catch (error) {
    res.status(500).json({ message: "Error creating post" });
  }
});

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

passport.use("local", new Strategy(async function verify (username, password, cb){
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
      res.send({ error: "An unexpected error occured while logging in" });
      return cb(err);
    }
  }) 
);

passport.use("local",new Strategy({ passReqToCallback: true }, 
  async (req, username, password, cb) => {
    console.log(req.ip);
    return cb(null, user);
  }
)
);

passport.use("google", new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/google/info/clubs",
    userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo"
  }, async (accessToken, refreshToken, profile, cb) => {
    try {
    const result = await db.query("SELECT * FROM auth WHERE email = $1", [profile.email])
    if (result.rows.length === 0 ) {
      const newUser = await db.query("INSERT INTO auth (email, password) VALUES ($1, $2)", [profile.email, "google"])
      cb(null, newUser.rows[0]);
    } else {
      cb(null, result.rows[0])
    }
  } catch (err) {
    cb(err);
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
