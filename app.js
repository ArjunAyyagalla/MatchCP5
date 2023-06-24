const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3002, () => {
      console.log("Server Running at http://localhost:3002/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertDirectorToResponse = (directorArray) => {
  return {
    directorId: directorArray.director_id,
    directorName: directorArray.director_name,
  };
};

const convertMovieToResponse = (movie) => {
  return {
    movieId: movie.movie_id,
    directorId: movie.director_id,
    movieName: movie.movie_name,
    leadActor: movie.lead_actor,
  };
};

app.get("/movies/", async (request, response) => {
  const getMovieQuery = `
    SELECT
      *
    FROM
      movie;`;
  const MovieArray = await db.all(getMovieQuery);
  response.send(
    MovieArray.map((each) => ({
      movieName: each.movie_name,
    }))
  );
});

app.post("/movies/", async (request, response) => {
  const newList = request.body;
  const { directorId, movieName, leadActor } = newList;
  const addNewUser = `
    INSERT INTO movie
    (director_id,movie_name,lead_actor)
    VALUES
    (
        ${directorId},
        '${movieName}',
       '${leadActor}'
    );`;
  await db.run(addNewUser);
  response.send("Movie Successfully Added");
});

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const searchDetails = `
    SELECT *
    FROM movie
    WHERE movie_id = ${movieId};`;
  const movie = await db.get(searchDetails);
  response.send(convertMovieToResponse(movie));
});

app.put("/movies/:movieId/", async (request, response) => {
  const { queryId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateDetails = `
  UPDATE movie
  SET
  director_id=${directorId},
  movie_name='${movieName}'
  lead_actor='${leadActor}'
  WHERE movie_id=${queryId};`;

  await db.run(updateDetails);
  response.send("Movie Details Updated");
});

app.delete("/movies/:movieId/", async (request, response) => {
  const { queryId } = request.params;
  const deleteDetails = `
   DELETE FROM movie
    WHERE movie_id = ${queryId};`;
  await db.run(deleteDetails);
  response.send("Movie Removed");
});

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
    SELECT
      *
    FROM
      director`;
  const directorArray = await db.all(getDirectorQuery);
  response.send(
    directorArray.map((each) => convertDirectorToResponse(eachArray))
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { queryId } = request.params;
  const directorMovie = `
    SELECT movie_name
    FROM movie
    where director_id=${queryId};`;
  const array = await db.all(directorMovie);
  response.send(
    array.map((each) => ({
      movieName: each.movie_name,
    }))
  );
});

module.exports = app;
