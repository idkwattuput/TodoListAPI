import db from "../database/db";

const findAll = async (limit: number, offset: number) => {
  const todos = await db.query(
    "SELECT * FROM todos ORDER BY id LIMIT $1 OFFSET $2",
    [limit, offset],
  );
  return todos;
};

const find = async (id: number, userId: number) => {
  const todo = await db.query(
    "SELECT * FROM todos WHERE id = $1 AND user_id = $2",
    [id, userId],
  );
  return todo.rows[0];
};

const save = async (title: string, description: string, userId: number) => {
  const newTodo = await db.query(
    "INSERT INTO todos (title, description, user_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [title, description, userId, new Date(), new Date()],
  );
  return newTodo.rows[0];
};

const update = async (id: number, title: string, description: string) => {
  const updatedTodo = await db.query(
    "UPDATE todos SET title = $1, description = $2, updated_at = $3 WHERE id = $4 RETURNING *",
    [title, description, new Date(), id],
  );
  return updatedTodo.rows[0];
};

const remove = async (id: number) => {
  const deletedTodo = await db.query("DELETE FROM todos WHERE id = $1", [id]);
  return deletedTodo.rows;
};

export default {
  findAll,
  find,
  save,
  update,
  remove,
};
