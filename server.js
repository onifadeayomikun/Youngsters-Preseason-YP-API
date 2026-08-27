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
    JOIN seasons ON player_season_stats.season_id = seasons.season_id;`);
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
            JOIN seasons ON player_season_stats.season_id = seasons.season_id
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
        JOIN seasons ON player_season_stats.season_id = seasons.season_id
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
    JOIN seasons ON player_season_stats.season_id = seasons.season_id
    WHERE seasons.season_label = $1;`, [season]);

  if (!allSeasons.rows || allSeasons.rows.length === 0) {
    return res.status(404).json({ error: "Season(s) not found" });
  }

  res.json(allSeasons.rows);
});

app.get("/v1/players", async (req, res) => {
     const players = await db.query(`SELECT players.player_id, players.player_name, players.position, players.nationality
        FROM players 
        ORDER BY player_name;`);
    if (!players.rows || players.rows.length === 0) {
        return res.status(404).json({ error: "Players not found" });
    } 
    res.json(players.rows);   
});
app.get("/v1/players-clubs", async (req, res) => {
    const players = await db.query(`SELECT players.player_id, players.player_name, players.position, players.nationality, clubs.name, seasons.season_label
        FROM player_season_stats
        FULL JOIN players ON player_season_stats.player_id = players.player_id
        FULL JOIN clubs ON player_season_stats.club_id = clubs.club_id
        JOIN seasons ON player_season_stats.season_id = seasons.season_id
        ORDER BY clubs.club_id, seasons.season_id, players.player_id;`);
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

app.post("/v1/clubs", async (req, res) => {
    const { name, slang, country, city, seasonsAvailable } = req.body;

        if (!name || !country || !city) {
            return res.status(400).json({
                error: "name, country, and city are required",
            });
        }
        if (!slang || typeof slang !== "string") {
            return res.status(400).json({
                error: "Slang must be a string"
            });
        }
        if (typeof seasonsAvailable != "number" || !Number.isInteger(seasonsAvailable) || seasonsAvailable < 0) {
            return res.status(400).json({
                error: "Seasons Available must be a non-negative integer",
            });
        }    
    try {
        const clubCheck = await db.query( `SELECT club_id FROM clubs WHERE lower(name) = lower($1)`, [name] );

        if (clubCheck.rows.length > 0) {
            return res.status(400).json({
                message: 'Club found'
            });

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

app.post("/v1/players", async (req, res) => {
    const { players } = req.body;

     if (!Array.isArray(players) || players.length === 0) {
        return res.status(400).json({
            error: "Players must be a non-empty array"
        });
    }
    
    for (const player of players) {
        const { playerName, nationality, position } = player;

        if (!playerName || typeof playerName !== "string" ||
        !nationality || typeof nationality !== "string" ||
        !position || typeof position !== "string"
        ) {
            return res.status(400).json({
                error: "Every player needs playerName, nationality, and position"
            });
        }
    }
    try {
        for (const player of players) {
            const playerCheck = await db.query(`SELECT player_id
            FROM players
            WHERE lower(player_name) = lower($1)`, [player.playerName]);
            if (playerCheck.rows.length > 0) {
                return res.status(400).json({
                    message: `${player.playerName} already exists`
                });
            }
        }
        const values = [];
        const placeholders = players.map((player, index) => {
            const offset = index * 3;
            values.push(player.playerName.trim(), player.nationality.trim(), player.position.trim());
            return (`($${offset + 1}, $${offset + 2}, $${offset + 3})`);
        });

        const newPlayer = await db.query(`INSERT INTO players
            (player_name, nationality, position)
            VALUES ${placeholders.join(',')}
            RETURNING *;`, values );

        return res.status(201).json({
            message: "Players inserted successfully",
            data: newPlayer.rows
        });
        
    } catch (error) {
        console.error("Error adding player:", error);
        return res.status(500).json({
            error: "Could not insert players"
        });
    }    
});

app.post("/v1/clubs/:club/players/:player/preseason/:season", async (req, res) => {
    const { club, player, season } = req.params;
    const { age, appearances } = req.body;

    if (!club || !player) {
        return res.status(400).json({
            error: "Invalid Club or Player name",
        })
    }
    if (!season || typeof season !== "string") {
        return res.status(400).json({
            error: "Every youngster needs a valid season label",
        })
    }
        
    if (typeof age !== "number" || !Number.isFinite(age) || age < 13 || age > 21) {
        return res.status(400).json({
            error: "Players ages must be valid numbers between 13 and 21",
        });
    }

    if (typeof appearances !== "number" || !Number.isInteger(appearances) || appearances < 0) {
        return res.status(400).json({
            error: "Players appearances must be a non-negative integer",
        });
    }
    try {
        const seasonCheck = await db.query(`SELECT season_id FROM seasons WHERE season_label = $1`, [season]);

        if (seasonCheck.rows.length === 0) {
            return res.status(400).json({
                message: "Season doesn't exist"
            });
        }

        const clubCheck = await db.query(`SELECT club_id FROM clubs WHERE lower(name) = lower($1)`, [club]);
        if (clubCheck.rows.length === 0) {
            return res.status(400).json({
                message: "Club spelt wrongly or doesn't exist"
            });
        }
        const clubId = clubCheck.rows[0].club_id;

        const playerCheck = await db.query(`SELECT player_id FROM players WHERE lower(player_name) = lower($1)`, [player]);
        if (playerCheck.rows.length === 0) {
            return res.status(400).json({
                message: "Player spelt wrongly or doesn't exist"
            });
        }
        const playerId = playerCheck.rows[0].player_id;

        const seasonId = seasonCheck.rows[0].season_id;
        const statsResult = await db.query(`INSERT INTO player_season_stats (club_id, season_id, player_id, age, appearances)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`, [ clubId, seasonId, playerId, age, appearances ]
        );
        return res.status(201).json({
                message: "Player Data inserted successfully",
                data: statsResult.rows[0]
        });

    } catch (error) {
        console.error("Error adding season data:", error);
        return res.status(500).json({
            error: "An unexpected error occured while creating new season data "
        })
    }
});

app.patch("/v1/clubs/:club", async (req, res) => {
    const club = req.params.club;
    if (!club || typeof club !== "string") {
        return res.status(404).json({
            error: "Club name required"
        })
    }
  try {
    const { name, slang, country, city, seasons_available } = req.body;

    const existingClub = await db.query(`SELECT * FROM clubs WHERE lower(name) = lower($1);`, [club]);
    if (existingClub.rows.length <= 1) {
        return res.status(404).json({
            error: "Invalid Club Name"
        })
    }

    const updatedName = name || existingClub.rows[0].name;
    const updatedSlang = slang || existingClub.rows[0].slang; 
    const updatedCountry = country || existingClub.rows[0].country;
    const updatedCity = city || existingClub.rows[0].city;
    const updatedSA = seasons_available || existingClub.rows[0].seasons_available;

    const updatedClub = await db.query(`UPDATE Clubs
        SET name = $1, slang = $2, country = $3, city = $4, seasons_available = $5
        WHERE lower(name) = lower($6);`, [ updatedName, updatedSlang, updatedCountry, updatedCity, updatedSA, club ]);
    return res.status(200).json({
        message: "Club Data Updated Successfully",
        data: updatedClub.rows[0]
    });
    console.log(updatedClub);
  } catch (error) {
    console.error("Error updating club profile: ", error);
    return res.status(500).json({ error: "An unexpected error occurred while updating the club profile" });
  }
});

app.patch("/v1/players/:player", async (req, res) => {
    const player =  req.params.player;
    if (!player || typeof player !== "string") {
        return res.status(404).json({
            error: "Player name required"
        })
    }
  try {
    const { player_name, nationality, position } = req.body;
    
    const existingPlayer = await db.query(`SELECT * FROM players WHERE lower(player_name) = lower($1);`, [player]);
        if (existingPlayer.rows.length !== 1) {
        return res.status(404).json({
            error: "Invalid Player Name"
        })
    }
    console.log(existingPlayer);

    const updatedPlayerName = player_name || existingPlayer.rows[0].player_name;
    const updatedNationality = nationality || existingPlayer.rows[0].nationality; 
    const updatedPosition = position || existingPlayer.rows[0].position;

    const updatedPlayer = await db.query(`UPDATE Players
        SET player_name = $1, nationality = $2, position = $3
        WHERE lower(player_name) = lower($4);`, [ updatedPlayerName, updatedNationality, updatedPosition, player ]);
    return res.status(200).json({
        message: "Player Data Updated Successfully",
        data: updatedPlayer.rows[0]
    });
    console.log(updatedPlayer);

  } catch (error) {
    console.error("Error updating player profile: ", error);
    return res.status(500).json({ error: "An unexpected error occurred while updating the player profile" });
  }
});

app.patch("/v1/clubs/:club/players/:player/preseason/:season", async (req, res) => {
    const { club, player, season } = req.params;
    const { age, appearances } = req.body;
    
    if (!club || !player || typeof club !== "string" || typeof player !== "string") {
        return res.status(400).json({
            error: "Invalid Club or Player name",
        })
    }
    if (!season || typeof season !== "string") {
        return res.status(400).json({
            error: "Every youngster needs a valid season label",
        })
    }
    try {
        const seasonCheck = await db.query(`SELECT season_id FROM seasons WHERE season_label = $1`, [season]);
        if (seasonCheck.rows.length === 0) {
            return res.status(400).json({
                message: "Season doesn't exist"
            });
        }

        const seasonId = seasonCheck.rows[0].season_id;
        const clubCheck = (await db.query(`SELECT club_id FROM clubs WHERE lower(name) = lower($1)`, [club]))
        if (clubCheck.rows.length === 0) {
            return res.status(400).json({
                message: "Club spelt wrongly or doesn't exist"
            });
        }
        const clubId = clubCheck.rows[0].club_id;        

        const playerCheck = (await db.query(`SELECT player_id FROM players WHERE lower(player_name) = lower($1)`, [player]));
        if (playerCheck.rows.length === 0) {
            return res.status(400).json({
                message: "Player spelt wrongly or doesn't exist"
            });
        }
        const playerId = playerCheck.rows[0].player_id;

        const statCheck = await db.query(`SELECT * FROM player_season_stats WHERE season_id = $1 
            AND player_id = $2 AND club_id = $3;`, [ seasonId, playerId, clubId ]);
        const statId = statCheck.rows[0].stat_id;   
            
        const updatedAge = age || statCheck.rows[0].age ;
        const updatedAppearances = appearances || statCheck.rows[0].appearances;
        console.log(updatedAge);

        const statsResult = await db.query(`UPDATE player_season_stats 
            SET club_id = $1, season_id = $2, player_id = $3, age = $4, appearances = $5
            WHERE stat_id = $6
            RETURNING *;`, [ clubId, seasonId, playerId, updatedAge, updatedAppearances, statId ]
        );
        return res.status(201).json({
                message: "Player season Data updated successfully",
                data: statsResult.rows[0]
        });
  } catch (error) {
    console.error("Error updating season: ", error);
    return res.status(500).json({ error: "An unexpected error occurred while updating the player season data" });
  }
});
app.delete("/v1/clubs/:club", async (req, res) => {
    const club = req.params.club;
    if (!club || typeof club !== "string") {
        return res.status(404).json({
            error: "Club name required"
        })
    }

    try {
        const clubId = (await db.query(`SELECT club_id FROM clubs WHERE lower(name) = lower($1);`, [club])).rows[0].club_id;
        if (clubId < 1) {
            return res.status(400).json({
                error: "Invalid Club Name"
            })
        }

        const deletedClub = await db.query(`DELETE FROM clubs WHERE club_id = $1;`, [clubId])
        return res.status(201).json({
            message: "Club profile deleted successfully"
        })
           
    } catch (error) {
        console.error("Error deleting club: ", error);
        res.status(400).json({ error: "An unexpected error occurred while deleting the Club profile" });
    }    
});
app.delete("/v1/players/:player", async (req, res) => {
    const player = req.params.player;
    if (!player || typeof player !== "string") {
        return res.status(404).json({
            error: "Player name required"
        })
    }

    try {
        const playerId = (await db.query(`SELECT player_id FROM players WHERE lower(player_name) = lower($1);`, [player])).rows[0].player_id;
        if (playerId < 1) {
            return res.status(400).json({
                error: "Invalid Player Name"
            })
        }

        const deletedPlayer = await db.query(`DELETE FROM players WHERE player_id = $1;`, [playerId])
        return res.status(201).json({
            message: "Player profile deleted successfully"
        }) 
           
    } catch (error) {
        console.error("Error deleting player: ", error);
        res.status(500).json({ error: "An unexpected error occurred while deleting the player profile" });
    }
});

app.delete("/v1/clubs/:club/players/:player/preseason/:season", async (req, res) => {
    const { club, player, season } = req.params;
    
    if (!club || !player || typeof club !== "string" || typeof player !== "string") {
        return res.status(400).json({
            error: "Invalid Club or Player name",
        })
    }
    if (!season || typeof season !== "string") {
        return res.status(400).json({
            error: "Every youngster needs a valid season label",
        })
    }

    try {
        const seasonCheck = await db.query(`SELECT season_id FROM seasons WHERE season_label = $1`, [season]);
        if (seasonCheck.rows.length === 0) {
            return res.status(400).json({
                message: "Season doesn't exist"
            });
        }

        const seasonId = seasonCheck.rows[0].season_id;
        const clubId = (await db.query(`SELECT club_id FROM clubs WHERE lower(name) = lower($1)`, [club])).rows[0].club_id;
        if (clubId < 1) {
            return res.status(400).json({
                error: "Invalid Club Name"
            })
        }

        const playerId = (await db.query(`SELECT player_id FROM players WHERE lower(player_name) = lower($1)`, [player])).rows[0].player_id;
        if (playerId < 1) {
            return res.status(400).json({
                error: "Invalid Player Name"
            })
        }

        const statCheck = await db.query(`SELECT * FROM player_season_stats WHERE season_id = ($1)
             AND player_id = ($2) AND club_id = ($3);`, [ seasonId, playerId, clubId ]);
        
        const statId = statCheck.rows[0].stat_id;

        const deletedPlayer = await db.query(`DELETE FROM player_season_stats WHERE stat_id = $1;`, [statId])
        return res.status(201).json({
            message: "Player Season profile deleted successfully"
        }) 
           
    } catch (error) {
        console.error("Error deleting player: ", error);
        res.status(500).json({ error: "An unexpected error occurred while deleting the player profile" });
    }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
