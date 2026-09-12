import express from "express";
import dotenv from "dotenv";
import axios from "axios";
import pg from "pg";
import bcrypt from "bcrypt";
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

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.redirect("/login");
    }
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

app.get("/info/club", async(req, res) => {
  try {
    const response = await axios.get(`${API_URL}/v1/club`);
    if (req.isAuthenticated()) {
      res.render("club.ejs", { response: response.data, currentPath: req.path });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
      res.send(`Error fetching Club Data`);
  }
});

app.get("/info/clubs/:club", async (req, res) => {
    const club = req.params.club;
    try {
        const response = await axios.get(`${API_URL}/v1/clubs/${club}`);
    if (req.isAuthenticated()) {
      res.render("index.ejs", { response: response.data, currentPath: req.path });
    } else {
      res.redirect("/login");
    }        
    } catch (error) {
        res.send(`Error fetching ${club} data`);
    }
});

app.get("/info/clubs/:club/preseason/:season", async (req, res) => {
    const club = req.params.club;
    const season = req.params.season;
    try {
        const response = await axios.get(`${API_URL}/v1/clubs/${club}/preseason/${season}`);
      if (req.isAuthenticated()) {
        res.render("index.ejs", { response: response.data, currentPath: req.path });
      } else {
        res.redirect("/login");
      }        
    } catch (error) {
        res.status(500).json({ message: `Error fetching ${club} data` });
    }
});

app.get("/info/seasons/:season", async (req, res) => {
  const season = req.params.season;
  try {
    const response = await axios.get (`${API_URL}/v1/seasons/${season}`);
    if (req.isAuthenticated()) {
      res.render("index.ejs", { response: response.data });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
      res.status(500).json({ message: `Error fetching ${season} season data`  });
  }
});

app.get("/info/players", async (req, res) => {
  try {
    const response = await axios.get (`${API_URL}/v1/players`);
    if (req.isAuthenticated()) {
      res.render("player.ejs", { response: response.data });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
      res.status(500).json({ message: `Error fetching Players data`  });
  }
});

app.get("/info/players-clubs", async (req, res) => {
  try {
    const response = await axios.get (`${API_URL}/v1/players-clubs`);
    if (req.isAuthenticated()) {
      res.render("index.ejs", { response: response.data });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
      res.status(500).json({ message: `Error fetching Players data`  });
  }
});

app.get("/info/players/:player", async (req, res) => {
  const player = req.params.player;
  try {
    const response = await axios.get (`${API_URL}/v1/players/${player}`);
    if (req.isAuthenticated()) {
      res.render("index.ejs", { response: response.data });
    } else {
      res.redirect("/login");
    }
  } catch (error) {
      res.status(500).json({ message: `Error fetching Player data`  });
  }
});

app.get('/dashboard', requireRole('admin', 'editor'), (req, res) => {
  res.json({ message: `Welcome, ${req.user.role}` });
});

app.get("/new", (req, res) => {
  if (req.isAuthenticated()) {
    res.render("modify.ejs", { submit: "Create Club" });
  } else {
    res.redirect("/login");
  }
  
})

app.get("/modify/:club", async (req, res) => {
  try {
    const club = req.params.club;
    const response = await axios.get(`${API_URL}/v1/club/${club}`);
    if (req.isAuthenticated()) {
      res.render("modifyclub.ejs", { 
        club: response.data,
        submit: "Update Club" 
      });
    } else {
      res.redirect("/login");
    }  
  } catch (error) {
    res.send("Error getting Modify page");
  }

})

app.post("/info/clubs", async (req, res) => {
  const { name, slang, country, city } = req.body;   
  const seasonsAvailable = Number(req.body.seasons_available);
  try {
    const response = await axios.post(`${API_URL}/v1/clubs`, {
      name: name,
      slang: slang,
      country: country,
      city: city,
      seasonsAvailable: seasonsAvailable
    });
    console.log(response);
    res.redirect("/info/club");
  } catch (error) {
    console.error("Error creating club: ", error);
    return res.send("Error creating new club");  
  }       
});

app.post("/info/players", async (req, res) => {
  const { playerName, nationality, position } = req.body;

  try {
    await axios.post(`${API_URL}/v1/players`, {
      players: [{ playerName, nationality, position }],
    });
    res.redirect("/info/players");
  } catch (error) {
    console.error("Error creating player:", error.response?.data || error.message);
    return res.status(error.response?.status || 500).send("Error creating player");
  }
});

app.post("/info/clubs/:club/preseason/:season", async (req, res) => {
  const { club, season } = req.params;
  const { player, age, appearances } = req.body;

  try {
    await axios.post(
      `${API_URL}/v1/clubs/${encodeURIComponent(club)}/players/${encodeURIComponent(player)}/preseason/${encodeURIComponent(season)}`,
      {
        age: Number(age),
        appearances: Number(appearances),
      }
    );
    res.redirect(`/info/clubs/${encodeURIComponent(club)}/preseason/${encodeURIComponent(season)}`);
  } catch (error) {
    console.error("Error adding player preseason data:", error.response?.data || error.message);
    return res.status(error.response?.status || 500).send("Error adding player preseason data");
  }
});



passport.use("local", new Strategy({ passReqToCallback: true }, async function verify (req, username, password, cb){
    try {
      console.log(req.ip);
      const result = await db.query(`SELECT * FROM auth WHERE email = $1`, [username]);
      if (result.rows.length === 0) {
        return cb(null, false);
      }        
      const user = result.rows[0];
      const passwordMatches = await bcrypt.compare(password, user.password);
      
      if (!passwordMatches) {
        return cb(null, false);
      } 
     
      return cb(null, user)
        
    } catch (error) {
      return cb(error);
    }
  }) 
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
      const newUser = await db.query("INSERT INTO auth (email, password) VALUES ($1, $2) RETURNING *", [profile.email, "google"])
      return cb(null, newUser.rows[0]);
    } else {
      return cb(null, result.rows[0])
    }
  } catch (err) {
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
