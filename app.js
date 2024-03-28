const express = require('express')
const path = require('path')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const app = express()
app.use(express.json())
const dbPath = path.join(__dirname, 'cricketTeam.db')
let db = null
const server = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
server()

const dbToResponse = dbObject => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  }
}
//Getting all players
app.get('/players/', async (request, response) => {
  const getplayers = `
    SELECT 
      *
    FROM cricket_team;`
  const allplayers = await db.all(getplayers);
  response.send(allplayers.map(i => dbToResponse(i)));
});
//Posting new player details
app.post('/players/', async (request, response) => {
  const playerDetails = request.body;
  const {playerName, jersyNumber, role} = playerDetails;
  const addPlayer = `
    INSERT INTO 
    cricket_team (player_name,jersy_number,role)
    VALUES 
    (
      '${playerName}',
      '${jersyNumber}',
      '${role}');`;
  const playerAdd = await db.run(addPlayer);
  response.send('Player Added to Team');
});
//getting one player details
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params;
  const api3 = `
  SELECT 
  *
  FROM 
  cricket_team
  WHERE
  player_id=${playerId};`
  const a = await db.get(api3)
  response.send(dbToResponse(a))
});
//Update
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params;
  const details = request.body;
  const {playerName, jersyNumber, role} = details;
  const api4 = `
  UPDATE
      cricket_team
  SET
      player_name='${playerName}',
      jersey_number='${jersyNumber}',
      role='${role}'
  WHERE 
      player_id=${playerId};`;
  await db.run(api4);
  response.send('Player Details Updated');
});
//DELETE
app.delete('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params;
  const delteQuery = `
  DELETE
  FROM 
  cricket_team
  WHERE
  player_id = ${playerId};`;
  await db.run(delteQuery);
  response.send("Player Removed")
});
module.exports = app
