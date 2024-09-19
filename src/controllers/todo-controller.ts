import type { Request, Response } from "express";
import todoRepository from "../repositories/todo-repository";

const getTodos = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const page = parseInt(req.query.page as string) || 1;
    const offset = (page - 1) * limit;

    const todos = await todoRepository.findAll(limit, offset);
    return res.json({
      data: todos.rows,
      page: page,
      limit: limit,
      total: todos.rowCount,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

const getTodo = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const userId = (req as any).user;
    const todo = await todoRepository.find(parseInt(id), userId);
    if (!todo) {
      return res.status(404).json({ message: "Todo not found" });
    }
    return res.json({ data: todo });
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

const createTodo = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    const userId = (req as any).user;
    if (!title || !description) {
      return res.status(400).json({ message: "All field required" });
    }
    const newTodo = await todoRepository.save(title, description, userId);
    return res.status(201).json({ data: newTodo });
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

const updateTodo = async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    const id = req.params.id;
    const userId = (req as any).user;
    if (!title || !description) {
      return res.status(400).json({ message: "All field required" });
    }
    const isTodoExist = await todoRepository.find(parseInt(id), userId);
    if (!isTodoExist) {
      return res.status(404).json({ message: "Todo not found" });
    }
    const updatedTodo = await todoRepository.update(
      parseInt(id),
      title,
      description,
    );
    return res.json({ data: updatedTodo });
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

const deleteTodo = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const userId = (req as any).user;
    const isTodoExist = await todoRepository.find(parseInt(id), userId);
    if (!isTodoExist) {
      return res.status(404).json({ message: "Todo not found" });
    }
    await todoRepository.remove(parseInt(id));
    return res.sendStatus(204);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

export default {
  getTodos,
  getTodo,
  createTodo,
  updateTodo,
  deleteTodo,
};
