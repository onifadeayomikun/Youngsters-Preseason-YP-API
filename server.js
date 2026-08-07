import express from "express";
import { clubs, players } from "./data.js";

const app = express();
const port = 4000;

app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/v1/clubs", (req, res) => {
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
    res.json(players)
});

app.get("/v1/players/:player", (req, res) => {
    const player = req.params.player;
    const foundPlayers = players.filter((p) => p.player.toLowerCase().includes(player.toLowerCase()));

    if (foundPlayers.length === 0) {
        return res.status(404).json({ error: "Player not found" });
    }

    // Enrich each player with their season stats from the clubs array
    const enrichedPlayers = foundPlayers.map((p) => {
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

    res.json(enrichedPlayers);
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});