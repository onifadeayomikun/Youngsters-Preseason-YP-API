import express from "express";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = 4000;

const db = new pg.Client({
 user: String(process.env.PG_USER ?? "postgres"),
 host: String(process.env.PG_HOST ?? "localhost"),
 database: String(process.env.PG_DATABASE ?? "postgres"),
 password: String(process.env.PG_PASSWORD ?? ""),
 port: Number(process.env.PG_PORT ?? 5432),
});

db.connect().catch((error) => {
 console.error("Database connection failed:", error);
 process.exit(1);
});

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

function normalizePlayerName(name) {
    return name
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") 
        .trim()
        .replace(/\s+/g, " ")
        .toLowerCase();            
}

app.get("/v1/clubs", async (req, res) => {
    const clubs = await db.query(`SELECT clubs.name, clubs.slang, clubs.country, clubs.city, clubs.seasons_available, seasons.season_label, 
    players.player_name, players.position, players.nationality, player_season_stats.age, player_season_stats.appearances
    FROM player_season_stats
    FULL JOIN clubs ON player_season_stats.club_id = clubs.club_id
    FULL JOIN players ON player_season_stats.player_id = players.player_id
    FULL JOIN seasons ON player_season_stats.season_id = seasons.season_id;`);
        if (!clubs) {
        return res.status(404).json({ error: "Clubs not found" });
    }    
    res.json(clubs.rows);
});

app.get("/v1/clubs/:club", async (req, res) => {
    try {
        const clubName = req.params.club;
        console.log(clubName);
        const foundClub = await db.query(`
            SELECT clubs.name, clubs.slang, clubs.country, clubs.city, clubs.seasons_available, seasons.season_label, 
            players.player_name, players.position, players.nationality, player_season_stats.age, player_season_stats.appearances
            FROM player_season_stats
            FULL JOIN clubs ON player_season_stats.club_id = clubs.club_id
            FULL JOIN players ON player_season_stats.player_id = players.player_id
            FULL JOIN seasons ON player_season_stats.season_id = seasons.season_id
            WHERE LOWER(clubs.name) = LOWER($1);`, [clubName]);
        
        if (!foundClub.rows || foundClub.rows.length === 0) {
            return res.status(404).json({
                error: "Club not found"
            });
        }

        res.json(foundClub.rows);
    } catch (error) {
        console.error("Error fetching club:", error);
        return res.status(500).json({
            error: "An unexpected error occurred while fetching the club"
        });
    }
});


app.get("/v1/clubs/:club/preseason/:season", async (req, res) => {
  try {
    const clubName = req.params.club;
    const season = req.params.season;
    
    const foundSeason = await db.query(`
        SELECT clubs.name, clubs.slang, clubs.country, clubs.city, clubs.seasons_available, seasons.season_label, 
        players.player_name, players.position, players.nationality, player_season_stats.age, player_season_stats.appearances
        FROM player_season_stats
        FULL JOIN clubs ON player_season_stats.club_id = clubs.club_id
        FULL JOIN players ON player_season_stats.player_id = players.player_id
        FULL JOIN seasons ON player_season_stats.season_id = seasons.season_id
        WHERE LOWER(clubs.name) = LOWER($1) AND seasons.season_label = $2;`, [clubName, season]);
    if (!foundSeason.rows || foundSeason.rows.length === 0) {
      return res.status(404).json({ error: "Season not found" });
    }

    res.json(foundSeason.rows);
  } catch (error) {
    console.error("Error fetching season:", error);
    return res.status(500).json({ error: "An unexpected error occurred while fetching the season" });
  }
});

app.get("/v1/seasons/:season", async (req, res) => {
  const season = req.params.season;
    
  const allSeasons = await db.query(
    `SELECT clubs.name, clubs.slang, clubs.country, clubs.city, clubs.seasons_available, seasons.season_label,
    players.player_name, players.position, players.nationality, player_season_stats.age, player_season_stats.appearances
    FROM player_season_stats
    FULL JOIN clubs ON player_season_stats.club_id = clubs.club_id 
    FULL JOIN players ON player_season_stats.player_id = players.player_id
    FULL JOIN seasons ON player_season_stats.season_id = seasons.season_id
    WHERE seasons.season_label = $1;`, [season]);

  if (!allSeasons.rows || allSeasons.rows.length === 0) {
    return res.status(404).json({ error: "Season(s) not found" });
  }

  res.json(allSeasons.rows);
});

app.get("/v1/players", async (req, res) => {
     const players = await db.query(`
        SELECT players.player_id, players.player_name, players.position, players.nationality
        FROM players 
        ORDER BY player_name;`);
    if (!players.rows || players.rows.length === 0) {
        return res.status(404).json({ error: "Players not found" });
    } 
    res.json(players.rows);   
});

app.get("/v1/players/:player", async (req, res) => {
    const player = req.params.player;
    const foundPlayer = await db.query(`
        SELECT DISTINCT players.player_id, players.player_name, players.position, players.nationality, clubs.name AS club_name
        FROM player_season_stats
        JOIN clubs ON player_season_stats.club_id = clubs.club_id 
        JOIN players ON player_season_stats.player_id = players.player_id
        WHERE lower(players.player_name) LIKE '%' || lower($1) || '%';`, [player]);

    if (!foundPlayer.rows || foundPlayer.rows.length === 0) {
        return res.status(404).json({ error: "Player not found" });
    }

    res.json(foundPlayer.rows);

});

app.post("/v1/clubs", (req, res) => {
    const { clubName, slang, country, city, seasonsAvailable, playerName, nationality, position, seasonLabel, age, appearances } = req.body;

        if (!clubName || !country || !city) {
            return res.status(400).json({
                error: "name, country, and city are required",
            });
        }
        const normalizedName = normalizePlayerName(playerName);
        if (typeof slang !== "string") {
            return res.status(400).json({
                error: "Slang must be a string"
            });
        }
        if (typeof seasonsAvailable != "number" || !Number.isInteger(seasonsAvailable) || seasonsAvailable < 0) {
            return res.status(400).json({
                error: "Seasons Available must be a non-negative integer",
            });
        }

        if (!playerName || typeof playerName !== "string") {
            return res.status(400).json({
                error: "Every youngster needs a valid player name",
            });
        }
        if (!nationality || typeof nationality !== "string") {
            return res.status(400).json({
                error: "Every youngster needs a valid nationality",
            });
        }        

        if (!position || typeof position !== "string") {
            return res.status(400).json({
                error: "Every youngster needs a valid position(Goalkeeper, Defender, Midfielder or Attacker)",
            });
        }
        if (!seasonLabel || typeof seasonLabel !== "string") {
            return res.status(400).json({
                error: "Every youngster needs a valid season label",
            })
        }
        
        if (typeof age !== "number" || !Number.isFinite(age) || age < 0 || age > 100) {
            return res.status(400).json({
                error: "Players ages must be valid numbers between 0 and 100",
            });
        }

        if (typeof appearances !== "number" || !Number.isInteger(appearances) || appearances < 0) {
            return res.status(400).json({
                error: "Players appearances must be a non-negative integer",
            });
        }

    try {
        const clubCheck = await pool.query( `SELECT club_id FROM clubs WHERE name = $1`, [clubName] );
        let clubId;

        if (clubCheck.rows.length > 0) {
            clubId = clubCheck.rows[0].club_id;
            return res.status(400).json({
                message: 'Club exists in DB'
            });

        } else {
            const newClub = await pool.query(`INSERT INTO clubs (name, slang, country, city, seasons_available)
                 VALUES ($1, $2, $3, $4, $5) 
                 RETURNING club_id`, [ clubName, slang, country, city, seasonsAvailable ] );

            clubId = newClub.rows[0].club_id;
        }

        const playerCheck = await pool.query(`SELECT player_id FROM players WHERE normalized_name = $1`, [normalizedName]);

        let playerId;
        if (playerCheck.rows.length > 0) {
            playerId = playerCheck.rows[0].player_id;
            return res.status(400).json({
                message: '' //Problem here
            })
        } else {
            const newPlayer = await pool.query(`INSERT INTO players (player_name, normalized_name, nationality, position)
                 VALUES ($1, $2, $3, $4)
                 RETURNING player_id`,
                [ playerName, normalizedName, nationality, position ]);

            playerId = newPlayer.rows[0].player_id;
        }

        const seasonCheck = await pool.query(`SELECT season_id FROM seasons WHERE season_label = $1`, [seasonLabel]);

        if (seasonCheck.rows.length === 0) {

            return res.status(400).json({
                message: "Season doesn't exist in DB"
            });

        }

        const seasonId = seasonCheck.rows[0].season_id;

        const statsResult = await pool.query(`INSERT INTO player_season_stats (club_id, season_id, player_id, age, appearances)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`, [ clubId, seasonId, playerId, age, appearances ]
        );

        res.status(201).json({
            message: 'Player season data inserted successfully',
            data: statsResult.rows[0]
        });

    } catch (error) {
      console.error("Error creating club: ", error);
      return res.status(500).json({ 
        error: "An unexpected error occured while creating club",
     });  
    }       
}); 

app.post("/v1/clubs/:club/preseason",(req, res) => {
    try {
        const clubName = req.params.club;
        console.log(clubName);
        const foundClub = clubs.find((club) => club.name.toLowerCase() === clubName.toLowerCase());
        console.log(foundClub);
        if (!foundClub) {
            return res.status(404).json({
                error: "Club does not exist"
            })
        }

        const preseason  = req.body.preseason;
        if (!Array.isArray(preseason)) {
            return res.status(400).json({
                error: "preseason must be an array",
            });
        }
        for (const season of preseason) {
            if (!season.season || !Array.isArray(season.youngsters)) {
                return res.status(400).json({
                    error: "Each preseason entry needs a season and a youngsters array",
                });
            }

            for (const player of season.youngsters) {
                if (!player.player || typeof player.player !== "string") {
                    return res.status(400).json({
                        error: "Every youngster needs a valid player name",
                    });
                }

                if ( typeof player.age !== "number" || !Number.isFinite(player.age) || player.age < 0 || player.age > 100 ) {
                    return res.status(400).json({
                        error: "Players ages must be valid numbers between 0 and 100",
                    });
                }

                if (typeof player.appearances !== "number" || !Number.isInteger(player.appearances) || player.appearances < 0) {
                    return res.status(400).json({
                        error: "Players appearances must be a non-negative integer",
                    });
                }
            }
        }  
        
        const newSeasonPlayers = [];
        const newSeason = preseason.map(season => ({ season: season.season, youngsters: season.youngsters.map(player => {
            const existingPlayer = players.find(p => normalizePlayerName(p.player) === normalizePlayerName(player.player));
            if (existingPlayer) {
                return {
                    player: player.player,
                    playerId: existingPlayer.id,
                    age: player.age,
                    appearances: player.appearances
                };
            }

            const alreadyAddedPlayer = newSeasonPlayers.find(p => normalizePlayerName(p.player) === normalizePlayerName(player.player));
            if(alreadyAddedPlayer) {
                return {
                    player: player.player,
                    playerId: alreadyAddedPlayer.id ,
                    age: player.age,
                    appearances: player.appearances
                };
            }

            playerLastId++;
            const newPlayer = {
                player: player.player,
                id: playerLastId,
                age: player.age,
                appearances: player.appearances
            };
            newSeasonPlayers.push(newPlayer);
            return {
                player: player.player,
                playerId: newPlayer.id,    
                age: player.age,
                appearances: player.appearances
            };
            })
        }));
        players.push(...newSeasonPlayers);
        foundClub.preseason.push(...newSeason);
        foundClub.seasonsAvailable = foundClub.preseason.length;
        return res.status(201).json(newSeason);
            
    } catch (error) {
        console.error("Error adding preason:", error);
        return res.status(500).json({
            error: "An unexpected error occured while creating a new season"
        });
    }    
});

app.post("/v1/clubs/:club/preseason/:season", (req, res) => {
    try {
        const club = req.params.club;
        const season = req.params.season;
        const youngsters = req.body.youngsters;

        const foundClub = clubs.find((c) => c.name.toLowerCase() === club.toLowerCase());
        if (!foundClub) {
            return res.status(404).json({
                error: "Club does not exist"
            })
        }       
        const arrayIndex = foundClub.preseason.findIndex((s) => s.season === season );
        if (!arrayIndex) {
            return res.status(404).json({
                error: "Club Season does not exist"
            })
        } 
        const newPlayers = [];
        const newYoungster = youngsters.map(player => {
            const existingPlayer = players.find(p => normalizePlayerName(p.player) === normalizePlayerName(player.player));
            if (existingPlayer) {
                return {
                    player: player.player,
                    playerId: existingPlayer.id,
                    age: player.age,
                    appearances: player.appearances
                };
            }

            const alreadyAddedPlayer = newPlayers.find(p => normalizePlayerName(p.player) === normalizePlayerName(player.player));
            if(alreadyAddedPlayer) {
                return {
                    player: player.player,
                    playerId: alreadyAddedPlayer.id ,
                    age: player.age,
                    appearances: player.appearances
                };
            }

            playerLastId++;
            const newPlayer = {
                player: player.player,
                id: playerLastId,
                age: player.age,
                appearances: player.appearances
            };
            newPlayers.push(newPlayer);
            return {
                player: player.player,
                playerId: newPlayer.id,    
                age: player.age,
                appearances: player.appearances
            };
        });
        players.push(...newPlayers);
        foundClub.preseason[arrayIndex].youngsters.push(...newYoungster);
        return res.status(201).json(newYoungster);       

    } catch (error) {
        console.error("Error adding player:", error);
        return res.status(500).json({
            error: "An unexpected error occured while creating a new player profile "
        })
    }
});

app.patch("/v1/clubs/:club", (req, res) => {
  try {
    const clubName = req.params.club;
    const clubIndex = clubs.findIndex((c) => c.name.toLowerCase() === clubName.toLowerCase());

    if (clubIndex === -1) {
      return res.status(404).json({ error: "Club does not exist" });
    }

    const existingClub = clubs[clubIndex];

    const updatedClub = {
      ...existingClub,
      ...(req.body.name !== undefined ? { name: req.body.name } : {}),
      ...(req.body.slang !== undefined ? { slang: req.body.slang } : {}),
      ...(req.body.country !== undefined ? { country: req.body.country } : {}),
      ...(req.body.city !== undefined ? { city: req.body.city } : {}),
      ...(req.body.seasonsAvailable !== undefined ? { seasonsAvailable: req.body.seasonsAvailable } : {})
    };

    clubs[clubIndex] = updatedClub;
    return res.status(200).json(clubs[clubIndex]);

  } catch (error) {
    console.error("Error updating club profile: ", error);
    return res.status(500).json({ error: "An unexpected error occurred while updating the club profile" });
  }
});

app.patch("/v1/clubs/:club/preseason/:season", (req, res) => {
  try {
    const { club, season } = req.params;

    const clubIndex = clubs.findIndex((c) => c.name.toLowerCase() === club.toLowerCase());
    if (clubIndex === -1) {
      return res.status(404).json({ error: "Club does not exist" });
    }

    const existingClub = clubs[clubIndex];
    const existingPreseason = existingClub.preseason ?? [];

    const seasonIndex = existingPreseason.findIndex((p) => p.season === season);
    if (seasonIndex === -1) {
      return res.status(404).json({ error: `No preseason entry found for season ${season}` });
    }

    const currentSeasonEntry = existingPreseason[seasonIndex];

    if (existingPreseason.some(p => p.season === req.body.season)) {
        return res.status(404).json({ error: "Cannot have two seasons with the same value" });
    }
    const updatedSeasonEntry = {
      ...currentSeasonEntry,
      ...(req.body.season !== undefined ? { season: req.body.season } : {})
    };

    const updatedPreseason = [...existingPreseason];
    updatedPreseason[seasonIndex] = updatedSeasonEntry;

    clubs[clubIndex] = {
      ...existingClub,
      preseason: updatedPreseason
    };

    return res.status(200).json(clubs[clubIndex]);

  } catch (error) {
    console.error("Error updating preseason entry: ", error);
    return res.status(500).json({ error: "An unexpected error occurred while updating the preseason entry" });
  }
});

app.patch("/v1/clubs/:club/preseason/:season/youngsters/:player", (req, res) => {
  try {
    const { club, season, player } = req.params;

    const clubIndex = clubs.findIndex((c) => c.name.toLowerCase() === club.toLowerCase());
    if (clubIndex === -1) {
      return res.status(404).json({ error: "Club does not exist" });
    }

    const existingClub = clubs[clubIndex];
    const existingPreseason = existingClub.preseason ?? [];

    const seasonIndex = existingPreseason.findIndex((p) => p.season === season);
    if (seasonIndex === -1) {
      return res.status(404).json({ error: `No preseason entry found for season ${season}` });
    }

    const existingYoungsters = existingPreseason[seasonIndex].youngsters ?? [];
    const youngsterIndex = existingYoungsters.findIndex((y) => normalizePlayerName(y.player).includes(normalizePlayerName(player)));

    if (youngsterIndex === -1) {
      return res.status(404).json({ error: `No youngster found with player name ${player}` });
    }

    const currentYoungster = existingYoungsters[youngsterIndex];
    const updatedYoungsters = [...existingYoungsters];
    updatedYoungsters[youngsterIndex] = {
      ...currentYoungster,
      ...(req.body.player != undefined ? { player: req.body.player } : {}),
      ...(req.body.age !== undefined ? { age: req.body.age } : {}),
      ...(req.body.appearances !== undefined ? { appearances: req.body.appearances } : {})
    };

    const updatedPreseason = [...existingPreseason];
    updatedPreseason[seasonIndex] = {
      ...existingPreseason[seasonIndex],
      youngsters: updatedYoungsters
    };

    clubs[clubIndex] = {
      ...existingClub,
      preseason: updatedPreseason
    };

    return res.status(200).json(clubs[clubIndex]);

  } catch (error) {
    console.error("Error updating youngster: ", error);
    return res.status(500).json({ error: "An unexpected error occurred while updating the youngster" });
  }
});
app.delete("/v1/clubs/:club", (req, res) => {
    try {
        const clubName = req.params.club;
        const clubIndex = clubs.findIndex((c) => c.name.toLowerCase() === clubName.toLowerCase());
        if (clubIndex === -1) {
            return res.status(404).json({ error: "Club does not exist" });
        }

        if (clubIndex > -1) {
            clubs.splice(clubIndex, 1);
            return res.status(200).json(clubs);
        } 
           
    } catch (error) {
        console.error("Error deleting club: ", error);
        res.status(400).json({ error: "An unexpected error occurred while deleting the Club profile" });
    }    
});
app.delete("/v1/clubs/:club/preseason/:season/youngsters/:player", (req, res) => {
    try {
        const { club, season, player } = req.params;
        const clubIndex = clubs.findIndex((c) => c.name.toLowerCase() === club.toLowerCase());
        if (clubIndex === -1) {
            return res.status(404).json({ error: "Club does not exist" });
        }

        const seasonIndex = clubs[clubIndex].preseason.findIndex((c) => c.season === season);
        if (seasonIndex === -1) {
            return res.status(404).json({ error: `No preseason entry found for season ${season}` });
        }

        const currentYoungster = clubs[clubIndex].preseason[seasonIndex]
        const youngsterIndex = currentYoungster.youngsters.findIndex((y) => normalizePlayerName(y.player).includes(normalizePlayerName(player)));
        if (youngsterIndex === -1) {
            return res.status(404).json({ error: `No youngster found with player name ${player}` });
        }

        if (youngsterIndex > -1) {
            currentYoungster.youngsters.splice(youngsterIndex, 1);
            return res.status(200).json(clubs);
        } 
           
    } catch (error) {
        console.error("Error deleting player: ", error);
        res.status(500).json({ error: "An unexpected error occurred while deleting the player profile" });
    }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});