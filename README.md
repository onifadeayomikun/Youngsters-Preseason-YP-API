# YP API

YP API is a full-stack Node.js project for tracking young football players, clubs, and preseason appearances across the biggest English clubs. It combines a REST API with a browser-based admin portal, allowing both data consumers and internal editors to browse and manage records.

This project currently supports:

- Club and player data lookup
- Season-by-season preseason stats
- Full database-backed API access
- Admin web views with login and registration
- Role-based access controls for editors/admins
- Google OAuth and local Passport authentication

## What this project does

The application is designed around a football data model with these core entities:

- Clubs
- Players
- Seasons
- Player season statistics
- Users/authentication accounts

It can be used to:

- List every club and player in the database
- View club-specific preseason information
- Retrieve all players for a given season
- Search players by name with partial matching
- Add clubs and players through structured endpoints
- Manage the data through a web UI with authentication

## Tech stack

- Node.js
- Express.js
- PostgreSQL
- EJS templating
- bcrypt
- dotenv
- Axios for internal API calls in the web layer

## Project structure

```text
YP_API/
├── server.js              # REST API
├── index.js               # Web app + authentication layer
├── public/                # Static assets
├── views/                 # EJS pages for admin UI
├── .env                   # Environment configuration
├── package.json
├── data.js                # Seed/example data
└── README.md
```

## Prerequisites

Before running the project, make sure you have:

- Node.js installed
- PostgreSQL running locally or remotely
- A PostgreSQL database with the required tables for clubs, players, seasons, and player season stats
- A `.env` file with the required connection variables

## Environment variables

Create a `.env` file in the project root with values similar to:

```env
PG_USER=your_db_user
PG_HOST=localhost
PG_DATABASE=your_database_name
PG_PASSWORD=your_db_password
PG_PORT=5432
IN_DATABASE=your_database_name
SESSION_SECRET=your_session_secret
```

The API server reads `PG_*` values, while the web app also uses `IN_DATABASE` and `SESSION_SECRET` for auth/session setup.

## Install dependencies

```bash
npm install
```

## Run the application

### Start the API server

```bash
npm run api
```

This runs:

```bash
node server.js
```

The API is available at:

```text
http://localhost:4000
```

### Start the web app

```bash
npm run web
```

This runs:

```bash
node index.js
```

The web interface is available at:

```text
http://localhost:3000
```

## Authentication and admin features

The project includes a web app with authentication and role checks.

### Available auth routes

- `GET /login`
- `GET /register`
- `POST /login`
- `POST /register`
- `GET /logout`
- `GET /auth/google`

### Role-based access

Certain pages and actions are restricted to users with roles like:

- `admin`
- `editor`

Protected routes include things like:

- `/dashboard`
- `/newclub`
- admin-only information screens

If a user is not authenticated or does not have the required role, they are redirected or rejected with a 403 response.

## API overview

The API is versioned under `/v1`.

### Club endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/v1/clubs` | Returns club data across all clubs |
| GET | `/v1/club` | Returns a simplified list of clubs |
| GET | `/v1/clubs/:club` | Returns club data for a specific club |
| GET | `/v1/club/:club` | Returns a single club by name |
| GET | `/v1/clubs/:club/preseason/:season` | Returns a club's player stats for a season |
| GET | `/v1/clubs-countries/:club/preseason/:season` | Returns country-related preseason data |
| POST | `/v1/clubs` | Creates a new club |

### Season endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/v1/seasons` | Returns all available seasons |
| GET | `/v1/seasons/:season` | Returns all clubs and players for a specific season |

### Player endpoints

| Method | Endpoint | Description |
| --- | --- | --- |
| GET | `/v1/players` | Returns all players |
| GET | `/v1/players/:player` | Returns players whose names match the search term |
| GET | `/v1/player/:player` | Returns a player by exact name |
| GET | `/v1/players-clubs` | Returns players joined with club and season data |
| POST | `/v1/players` | Inserts one or more players |
| POST | `/v1/clubs/:club/players/:player/preseason/:season` | Adds a player-season stat entry |

## Example requests

### Clubs

```bash
curl http://localhost:4000/v1/clubs
curl http://localhost:4000/v1/clubs/arsenal
curl http://localhost:4000/v1/clubs/arsenal/preseason/2024-25
```

### Seasons

```bash
curl http://localhost:4000/v1/seasons
curl http://localhost:4000/v1/seasons/2024-25
```

### Players

```bash
curl http://localhost:4000/v1/players
curl "http://localhost:4000/v1/players/Ethan"
curl "http://localhost:4000/v1/players/Nwaneri"
```

## Example payloads

### Create a club

```bash
curl -X POST http://localhost:4000/v1/clubs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Arsenal",
    "slang": "Gunners",
    "country": "England",
    "country_code": "GB",
    "city": "London",
    "seasonsAvailable": 3
  }'
```

### Create players

```bash
curl -X POST http://localhost:4000/v1/players \
  -H "Content-Type: application/json" \
  -d '{
    "players": [
      {
        "playerName": "Ethan Nwaneri",
        "nationality": "English",
        "position": "Forward"
      }
    ]
  }'
```

### Add player season stats

```bash
curl -X POST http://localhost:4000/v1/clubs/Arsenal/players/Ethan%20Nwaneri/preseason/2024-25 \
  -H "Content-Type: application/json" \
  -d '{
    "age": 17,
    "appearances": 10
  }'
```

## Player identity matching note

`POST /v1/clubs` and the player identity logic use normalized string matching rather than a guaranteed unique identifier.

This means names are compared in a case-insensitive, whitespace-normalized, accent-stripped way. That works well for many data-entry scenarios, but it has a limitation:

- two different real players with the same name may be treated as the same player

If your use case requires true identity resolution, you should consider using a stronger identifier such as date of birth, nationality, external ID, or a dedicated unique player reference.

## Notes

- This project is a practical football data project, not a production-ready SaaS API.
- The app is designed for local development and internal use.
- The admin web app relies on sessions and role checks.
- If you want to expand the project, the cleanest next steps are adding validation, pagination, stronger identity resolution, and richer API documentation.

## License

This project is currently unlicensed unless explicitly added later.

