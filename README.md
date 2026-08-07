# YP API — Youngsters Preseason API

A RESTful API built with Node.js and Express that tracks young footballers' preseason appearances across the Big Six English Premier League clubs (for now). It provides data on player profiles, preseason appearances by season, and club information — allowing anyone to query by club, season, or individual player name.

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express
- **Data:** Static in-memory data (`data.js`)
- **Module System:** ES Modules (`import` / `export`)

## Getting Started

### Install dependencies

```bash
npm install
```

### Start the server

```bash
node server.js
```

Or with auto-reload:

```bash
nodemon server.js
```

The server runs on `http://localhost:4000`.

## API Endpoints

### Clubs

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/v1/clubs` | Returns all clubs |
| GET | `/v1/clubs/:club` | Returns a specific club by name |
| GET | `/v1/clubs/:club/preseason/:season` | Returns a club's preseason youngsters for a given season |

### Seasons

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/v1/seasons/:season` | Returns preseason data across all clubs for a given season |

### Players

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/v1/players` | Returns all players |
| GET | `/v1/players/:player` | Returns a player's profile and full season stats (supports partial name search) |

## Example Requests

```
GET /v1/clubs
GET /v1/clubs/arsenal
GET /v1/clubs/arsenal/preseason/2024-25
GET /v1/seasons/2024-25
GET /v1/players
GET /v1/players/Ethan
GET /v1/players/Nwaneri
```
