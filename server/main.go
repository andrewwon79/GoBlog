package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"strconv"

	"github.com/gofiber/fiber/v2"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

type ToDo struct {
	ID        *int    `json:"id"`
	Completed *bool   `json:"completed"`
	Body      *string `json:"body"`
}

type Data struct {
	Todos []ToDo `json:"todos"`
}

type Response struct {
	Status  string `json:"status"`
	Results int    `json:"results"`
	Data    Data   `json:"data"`
}

func main() {

	//in our production we won't have a environment file (this is dependent on how i deploy I think)
	//so if it does not exist, grab it from environment variables
	if os.Getenv("ENV") != "production" {
		err := godotenv.Load()
		if err != nil {
			fmt.Println("Error loading .env file")
		}
	}

	//pgx handles pghost and pgadatabase postgres components
	//if we leave the "os.Getenv("DATABASE_URL")" blank it'll grab it from my env file
	//otherwise we need to explicityl define a "DATABASE_URL" in my env file
	//dbpool, err := pgxpool.New(context.Background(), os.Getenv("DATABASE_URL"))

	//context we can put some special cancellations, but background means we want nothing special
	dbpool, err := pgxpool.New(context.Background(), "")
	//error handling to make sure we are able to connect to our database
	//if we get an error we'll throw it to standard error with am essage
	if err != nil {
		fmt.Fprintf(os.Stderr, "Unable to create connection pool: %v\n", err)
		os.Exit(1)
	}
	//defer means we'll close the connection at a later point "once we are done with function main"
	defer dbpool.Close()

	app := fiber.New()

	//not needed once deplyoed because react app and backend will be on same port (3006 for example)
	/* app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:5173",
		AllowHeaders: "Origin,Content-Type,Accept",
	})) */

	//app.Get("/api/todos",getTodos)
	//app.Post("/api/todos",createTodo)
	//app.Patch("/api/todos/:id",updateTodo)
	//app.Delete("/api/todos/:id",deleteTodo)

	//grab my todos
	app.Get("/api/todos", func(c *fiber.Ctx) error {
		var todos []ToDo
		//this is only meant for a single row, queryRow is expecting only to return 1 row!!!!
		//scan is trying to read columns of that 1 row!!!
		/*
			err = dbpool.QueryRow(context.Background(), "SELECT * FROM Todo").Scan(&todos)
			if err != nil {
				fmt.Fprintf(os.Stderr, "QueryRow failed: %v\n", err)
				os.Exit(1)
			}*/

		rows, err := dbpool.Query(context.Background(), "SELECT * FROM Todo ORDER BY id DESC;")

		if err != nil {
			fmt.Fprintf(os.Stderr, "Pool Connection failed: %v\n", err)
			os.Exit(1)
		}
		defer rows.Close()

		for rows.Next() {
			var todo ToDo
			//because I converted my struct to pointers to allow optional updates
			//when I'm doing this scan I'm PASSING IN **int, **string, **bool
			//but I'm not actually setting these to double pointers only passing in, then we're assigning todo.ID
			//then we're done!
			err := rows.Scan(&todo.ID, &todo.Body, &todo.Completed)
			if err != nil {
				return err
			}
			//we don't need to dereference here because fmt.printf AUTOMATICALLY DEREFERENCES!!!
			fmt.Printf(" id: %d \n body: %v \n completed: %v \n", todo.ID, todo.Body, todo.Completed)
			todos = append(todos, todo)
		}

		response := Response{
			Status:  "success",
			Results: len(todos),
			Data:    Data{Todos: todos},
		}
		return c.Status(201).JSON(response)
	})

	app.Post("/api/todos", func(c *fiber.Ctx) error {
		todo := new(ToDo)

		if err := c.BodyParser(todo); err != nil {
			return err
		}

		if todo.Body == nil {
			return c.Status(400).JSON(fiber.Map{"error": "Todo body cannot be empty"})
		}

		//the _, err := ...
		//this is a pattern in Go when a functino returns multiple values, but we only care about one of them
		//_, err := dbpool.Exec(context.Background(), "INSERT INTO todo (body) VALUES ($1)", todo.Body)

		//WE DONT USE Exec here because if we want to return the actual id, we need to grab it from our postgres table again because that autoincrements, id here is automatically 0 until we insert into postgres
		err := dbpool.QueryRow(
			context.Background(),
			"INSERT INTO todo (body, completed) VALUES ($1, $2) RETURNING id",
			todo.Body, todo.Completed,
		).Scan(&todo.ID)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).SendString("Failed to insert")
		}
		return c.Status(201).JSON(todo)
	})

	app.Patch("/api/todos/:id", func(c *fiber.Ctx) error {

		todo := new(ToDo)
		argID := c.Params("id")
		passedID, err := strconv.Atoi(argID)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).SendString("Invalid ID")
		}

		if err := c.BodyParser(todo); err != nil {
			return err
		}
		//build up our query systematically in case we want to update both body and ocmpleted
		//or only update body or only update completed
		//interface is a slice that can hold many different data types
		//its initalized like this usually interface{}
		//we want to make it a slice so we add []interface{}
		//now we want to initialize it to empty so we add []interface{}{}
		query := "UPDATE Todo SET "
		args := []interface{}{}
		argIndex := 1
		if todo.Body != nil {
			query += fmt.Sprintf("body = $%v, ", argIndex)
			args = append(args, *todo.Body)
			argIndex++
		}
		if todo.Completed != nil {
			query += fmt.Sprintf("completed = $%v, ", argIndex)
			args = append(args, *todo.Completed)
			argIndex++
		}
		query = query[:len(query)-2] // trim ", "
		query += fmt.Sprintf(" WHERE id = $%v RETURNING id, body, completed", argIndex)
		args = append(args, passedID)

		for i, arg := range args {
			fmt.Printf("Arg %d: %v\n", i+1, arg)
		}

		fmt.Println(query)
		err = dbpool.QueryRow(
			context.Background(),
			query,
			args...,
		).Scan(&todo.ID, &todo.Body, &todo.Completed)
		if err != nil {
			return c.Status(fiber.StatusInternalServerError).SendString("Failed to update")
		}
		return c.Status(201).JSON(todo)
	})

	app.Delete("/api/todos/:id", func(c *fiber.Ctx) error {
		argID := c.Params("id")

		passedID, err := strconv.Atoi(argID)
		if err != nil {
			return c.Status(fiber.StatusBadRequest).SendString("Invalid ID")
		}

		//if passedID == nil {
		//	return c.Status(400).JSON(fiber.Map{"error": "Todo body cannot be empty"})
		//}

		//the _, err := ...
		//this is a pattern in Go when a functino returns multiple values, but we only care about one of them
		_, err = dbpool.Exec(context.Background(), "DELETE FROM todo WHERE id = $1", passedID)

		if err != nil {
			return c.Status(fiber.StatusInternalServerError).SendString("Failed to insert")
		}
		return c.Status(200).SendString(fmt.Sprintf("Deleted id: %d successfully", passedID))
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "3003"
	}
	//we only need this is we're serving a static file(it was used when I was using 1 dockerfile for both frontend and backend)
	//however we're going to splitup frontend and backend into seperate docker images meaning and host on kubernetes
	//this means we're going to use nginx.conf to grab the static file
	/* if os.Getenv("ENV") == "production" {
		app.Static("/", "./client/dist")
		// Serve index.html for root path
		app.Get("/", func(c *fiber.Ctx) error {
			return c.SendFile("./client/dist/index.html")
		})
	} */

	log.Fatal(app.Listen(":" + port))

	/*
		var greeting string
		//we query our database and select hello world
		//scan means we'll put the result in our greeting variable
		err = dbpool.QueryRow(context.Background(), "SELECT name FROM restaurants WHERE id=2").Scan(&greeting)
		if err != nil {
			fmt.Fprintf(os.Stderr, "QueryRow failed: %v\n", err)
			os.Exit(1)
		}
		fmt.Println(greeting)
	*/
}
