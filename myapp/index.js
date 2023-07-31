const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "goodreads.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

// Get Books API
app.get("/books/", async (request, response) => {
  const getBooksQuery = `
    SELECT
      *
    FROM
      book
    ORDER BY
      book_id;`;
  const booksArray = await db.all(getBooksQuery);
  response.send(booksArray);
});

//Get Book API
const oneBook = require("./queries.js");
app.get("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const onlyBookQuery = oneBook;
  const book = await db.get(onlyBookQuery + bookId + ";");
  response.send(book);
});

//Create a Book API
app.post("/books/", async (request, response) => {
  const newBook = request.body;
  //   console.log(newBook);
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = newBook;

  const addBookQuery = `
    INSERT INTO
      book (title,author_id,rating,rating_count,review_count,description,pages,date_of_publication,edition_language,price,online_stores)
    VALUES
      (
        '${title}',
         ${authorId},
         ${rating},
         ${ratingCount},
         ${reviewCount},
        '${description}',
         ${pages},
        '${dateOfPublication}',
        '${editionLanguage}',
         ${price},
        '${onlineStores}'
      );`;
  const dbResponse = await db.run(addBookQuery);
  const newBookId = dbResponse.lastID;
  response.send({ bookId: newBookId });
});

// Update Book API
app.put("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const updateBook = request.body;
  const {
    title,
    authorId,
    rating,
    ratingCount,
    reviewCount,
    description,
    pages,
    dateOfPublication,
    editionLanguage,
    price,
    onlineStores,
  } = updateBook;

  const updateBookQuery = `
    UPDATE
      book
    SET
      title='${title}',
      author_id=${authorId},
      rating=${rating},
      rating_count=${ratingCount},
      review_count=${reviewCount},
      description='${description}',
      pages=${pages},
      date_of_publication='${dateOfPublication}',
      edition_language='${editionLanguage}',
      price= ${price},
      online_stores='${onlineStores}'
    WHERE
      book_id = ${bookId};`;

  await db.run(updateBookQuery);
  response.send(`Book with ID ${bookId} is successfully Updated`);
});

//Delete Book API
app.delete("/books/:bookId/", async (request, response) => {
  const { bookId } = request.params;
  const deleteBookQuery = `
    DELETE FROM
        book
    WHERE
        book_id = ${bookId};`;
  await db.run(deleteBookQuery);
  response.send(`Book with ${bookId} Deleted Successfully`);
});

//Author Books API
app.get("/authors/:authorId/books/", async (request, response) => {
  const { authorId } = request.params;
  const getAuthorBooksQuery = `
    SELECT
    *
    FROM
        book
    WHERE
        author_id = ${authorId};`;
  const AuthorBooks = await db.all(getAuthorBooksQuery);
  const len = AuthorBooks.length;
  response.send({ len, AuthorBooks });
  //   res.sendStatus(AuthorBooks.length);
});
