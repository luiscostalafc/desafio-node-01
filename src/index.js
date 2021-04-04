const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid')

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const nameUser = users.find((user) => user.username === username);

  if (!nameUser) {
    return response.status(404).json({ error: "User not found" });
  }

  request.nameUser = nameUser;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(
    (user) => user.username === username
  );

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User already exists!" });
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  });

  return response.status(201).json(users);

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { nameUser } = request;

  try {
    return response.json(nameUser.todos);

  } catch (err) {
    console.log(err)
  }
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;

  const { nameUser } = request;

  const todoOperation = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  nameUser.todos.push(todoOperation)

  return response.status(201).json(todoOperation);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { nameUser } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todoExists = nameUser.todos.find((todo) => todo.id === id);

  if (!todoExists) {
    return response.status(404).json({ error: "Todo not found" });
  } else {

    todoExists.title = title;
    todoExists.deadline = new Date(deadline)

    return response.json(todoExists);

  }
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { nameUser } = request;
  const { id } = request.params;

  const todoExists = nameUser.todos.find((todo) => todo.id === id);

  if (!todoExists) {
    return response.status(404).json({ error: "Todo not found" });
  } else {
    todoExists.done = true;

    return response.status(201).json(updateTodoDone);
  }
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { nameUser } = request;
  const { id } = request.params

  const todoIndex = nameUser.todos.findIndex((todo) => todo.id === id);

  if (todoIndex === -1) {
    return response.status(404).json({ error: "Todo not found" })
  }

  const deleteTodos = nameUser.todos.splice(todoIndex, 1);

  return response.status(204).json(deleteTodos);
});

module.exports = app;