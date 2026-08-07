YP API — Youngsters Preseason(YP) API
A RESTful API built with Node.js and Express that tracks young footballers preseason appearances across the Big Six English Premier League clubs for now.

Endpoints
Method	Endpoint	Description
GET	/v1/clubs	Returns all clubs
GET	/v1/clubs/:club	Returns a specific club by name
GET	/v1/clubs/:club/preseason/:season	Returns a club's preseason data for a given season
GET	/v1/seasons/:season	Returns all clubs' preseason data for a given season
GET	/v1/players	Returns all players
GET	/v1/players/:player	Returns a player's profile and full season stats
Example
GET /v1/players/Ethan
GET /v1/clubs/arsenal/preseason/2024-25
GET /v1/seasons/2024-25
Tech Stack
Node.js
Express
