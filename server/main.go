package main

import (
	"fmt"
	"log"
	"os"

	"github.com/gofiber/fiber/v2"
	"github.com/joho/godotenv"
)

type ToDo struct {
	ID        int    `json:"id"`
	Completed bool   `json:"completed"`
	Body      string `json:"body"`
}

func main() {

	fmt.Println("Hello Worlds")
	app := fiber.New()

	//in golang when loading or checking for errors
	// IF WE GET NIL it means we are in a good state
	// BUT IF WE DO NOT GET NIL, something went wrong and this is a true error
	err := godotenv.Load(".env")
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	//os is like importing any kind of c++ library we use, its standard in go, I'm just not so familiar with it
	PORT := os.Getenv("PORT")

	todos := []ToDo{}
	//create a todo
	app.Post("/api/todos", func(c *fiber.Ctx) error {
		todo := &ToDo{} //we assign our todos struct from the user

		if err := c.BodyParser(todo); err != nil { //this will parse the request user input and if its an error return error
			return err //stores their request in our todo struct
		}
		if todo.Body == "" { //throws an error when body is empty
			return c.Status(400).JSON(fiber.Map{"error": "Todo body is required"})
		}

		todo.ID = len(todos) + 1 //assigns the ID depending on the length of our list of ToDo structs

		todos = append(todos, *todo) //appends the todo struct which we assigned earlier to the end of our struct list
		//we dereference because we originally created a list of VALUES todo := &ToDo{}
		return c.Status(201).JSON(todo) //returns the todo information if successful

	})

	//update a todo
	app.Patch("/api/todos/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")

		for i, todo := range todos {
			if fmt.Sprint(todo.ID) == id {
				todos[i].Completed = true
				return c.Status(200).JSON(todos[i])
			}
		}
		return c.Status(404).JSON(fiber.Map{"error": "ToDo not found"})
	})

	//delete a todo
	app.Delete("/api/todos/:id", func(c *fiber.Ctx) error {
		id := c.Params("id")
		for i, todo := range todos {
			if fmt.Sprint(todo.ID) == id {
				//go doesn't have a delete from slice, what this code below is doing
				//its grabbing all elements before i
				//its grabbing all elements after i
				//the ... is necessary to unpack the second slice for appending it
				//then we're reassining it back to todos, we are essentially recomining todos but skipping i (which we want to delete)
				todos = append(todos[:i], todos[i+1:]...)
				return c.Status(200).JSON(fiber.Map{"success": true})
			}
		}
		return c.Status(404).JSON(fiber.Map{"error": "Todo not found"})
	})

	app.Get("/api/todos", func(c *fiber.Ctx) error {
		return c.Status(200).JSON(todos)
	})
	//log.Fatal(app.Listen(":3003"))
	log.Fatal(app.Listen(":" + PORT))
}
