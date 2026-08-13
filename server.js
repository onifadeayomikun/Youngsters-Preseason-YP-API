import express from "express";
import { clubs, players } from "./data.js";

const app = express();
const port = 4000;

let clubLastId = clubs.length;
let playerLastId = players.length + 1000;


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

app.get("/v1/clubs", (req, res) => {
    if (!clubs) {
        return res.status(404).json({ error: "Clubs not found" });
    }    
    res.json(clubs);
});

app.get("/v1/clubs/:club", (req, res) => {
    const clubName = req.params.club;
    console.log(clubName);
    const foundClub = clubs.find((club) => club.name.toLowerCase() === clubName.toLowerCase());
     if (!foundClub) {
        return res.status(404).json({
            error: "Club not found"
        });
    }

    res.json(foundClub);
});


app.get("/v1/clubs/:club/preseason/:season", (req, res) => {
  const clubName = req.params.club;
  const season = req.params.season;
  const foundClub = clubs.find((club) => club.name.toLowerCase() === clubName.toLowerCase());

  if (!foundClub) {
    return res.status(404).json({ error: "Club not found" });
  }

  const foundSeason = foundClub.preseason.find((p) => p.season === season);
  if (!foundSeason) {
     return res.status(404).json({ error: "Season not found" });
  }

  res.json(foundSeason);
});

app.get("/v1/seasons/:season", (req, res) => {
  const season = req.params.season;

  const allSeasons = clubs.flatMap((club) => club.preseason).filter((p) => p.season === season);


  if (allSeasons.length === 0) {
    return res.status(404).json({ error: "Season(s) not found" });
  }

  res.json(allSeasons);
});

app.get("/v1/players", (req, res) => {
    if (!players) {
        return res.status(404).json({ error: "Players not found" });
    } 
    res.json(players);   
});

app.get("/v1/players/:player", (req, res) => {
    const player = req.params.player;
    const foundPlayer = players.filter((p) => p.player.toLowerCase().includes(player.toLowerCase()));

    if (!Array.isArray(foundPlayer) || foundPlayer.length === 0) {
        return res.status(404).json({ error: "Player not found" });
    }
    try {
        const enrichedPlayer = foundPlayer.map((p) => {
            const seasons = clubs.flatMap((club) => 
                club.preseason.flatMap((season) =>
                    season.youngsters
                        .filter((y) => y.playerId === p.id)
                        .map((y) => ({
                            club: club.name,
                            season: season.season,
                            age: y.age,
                            appearances: y.appearances
                        }))
                )
            );
            return { ...p, seasons };
        });

        res.json(enrichedPlayer);
    } catch (error) {
       console.error("Could not enrich player data: ", error);
       return res.status(500).json({ error: "Unable to receive player data"}); 
    }

});
app.post("/v1/clubs", (req, res) => {
    try {
        const { name, slang, country, city, seasonsAvailable, preseason } = req.body;

        if (!name || !country || !city) {
            return res.status(400).json({
                error: "name, country, and city are required",
            });
        }

        if (!Array.isArray(preseason)) {
            return res.status(400).json({
                error: "preseason must be an array",
            });
        }
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

            if (
                typeof player.age !== "number" ||
                !Number.isFinite(player.age) ||
                player.age < 0 || player.age > 100
            ) {
                return res.status(400).json({
                    error: "Players ages must be valid numbers between 0 and 100",
                });
            }

            if (
                typeof player.appearances !== "number" ||
                !Number.isInteger(player.appearances) ||
                player.appearances < 0
            ) {
                return res.status(400).json({
                    error: "Players appearances must be a non-negative integer",
                });
            }
}
        }       
        const newClubPlayers = [];
        clubLastId++;
        const newClub = {
            id: clubLastId,
            name: req.body.name,
            slang: req.body.slang,
            country: req.body.country,
            city: req.body.city,
            seasonsAvailable: req.body.seasonsAvailable,
            preseason: req.body.preseason.map(season => ({
                season: season.season,

                youngsters: season.youngsters.map(player => {
                    const existingPlayer = players.find(p => normalizePlayerName(p.player) === normalizePlayerName(player.player));
                    if (existingPlayer) {
                        return {
                            player: player.player,
                            playerId: existingPlayer.id,
                            age: player.age,
                            appearances: player.appearances
                        };
                    }

                    const alreadyAddedPlayer = newClubPlayers.find(p => normalizePlayerName(p.player) === normalizePlayerName(player.player));
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
                    newClubPlayers.push(newPlayer);
                    return {
                        player: player.player,
                        playerId: newPlayer.id,    
                        age: player.age,
                        appearances: player.appearances
                    };
                })
            }))
        };
        players.push(...newClubPlayers);
        clubs.push(newClub);
        res.status(201).json(newClub);
            
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
        const foundClub = clubs.find((club) => club.name.toLowerCase() === clubName.toLowerCase());
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
})

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});