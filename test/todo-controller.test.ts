import todoController from "../src/controllers/todo-controller";
import todoRepository from "../src/repositories/todo-repository";
import { Request, Response } from "express";

export interface CustomRequest extends Request {
  user?: number; // Assuming the user is a number (user ID)
}

// Mocking the repository
jest.mock("../src/repositories/todo-repository");

describe("Todo Controller", () => {
  let req: Partial<CustomRequest>;
  let res: Partial<Response>;
  let json = jest.fn(); // Mock the response json function
  let status = jest.fn().mockReturnValue({ json }); // Mock status and chain json
  let sendStatus = jest.fn(); // For 204 No Content
  let mockUserId = 1; // Mock user ID

  beforeEach(() => {
    req = { query: {}, params: {}, body: {}, user: mockUserId }; // Default request object
    res = { json, status, sendStatus }; // Attach mocked functions to res object
    jest.clearAllMocks(); // Clear mocks before each test
  });

  describe("getTodos", () => {
    it("should return a list of todos with default pagination", async () => {
      const todos = { rows: [{ id: 1, title: "Test todo" }], rowCount: 1 };

      (todoRepository.findAll as jest.Mock).mockResolvedValue(todos);

      await todoController.getTodos(req as Request, res as Response);

      expect(todoRepository.findAll).toHaveBeenCalledWith(10, 0);
      expect(res.json).toHaveBeenCalledWith({
        data: todos.rows,
        page: 1,
        limit: 10,
        total: todos.rowCount,
      });
    });

    it("should return 500 if there is an error", async () => {
      (todoRepository.findAll as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await todoController.getTodos(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("getTodo", () => {
    it("should return a single todo by id", async () => {
      req.params = { id: "1" };
      const todo = {
        id: 1,
        title: "Test todo",
        description: "Todo description",
        userId: mockUserId,
      };

      (todoRepository.find as jest.Mock).mockResolvedValue(todo);

      await todoController.getTodo(req as Request, res as Response);

      expect(todoRepository.find).toHaveBeenCalledWith(1, mockUserId);
      expect(res.json).toHaveBeenCalledWith({ data: todo });
    });

    it("should return 404 if the todo is not found", async () => {
      req.params = { id: "999" };

      (todoRepository.find as jest.Mock).mockResolvedValue(null);

      await todoController.getTodo(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Todo not found" });
    });

    it("should return 500 if there is an error", async () => {
      req.params = { id: "1" };

      (todoRepository.find as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await todoController.getTodo(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("createTodo", () => {
    it("should create a new todo and return 201", async () => {
      req.body = { title: "New Todo", description: "Todo description" };
      const newTodo = {
        id: 1,
        title: "New Todo",
        description: "Todo description",
        userId: mockUserId,
      };

      (todoRepository.save as jest.Mock).mockResolvedValue(newTodo);

      await todoController.createTodo(req as Request, res as Response);

      expect(todoRepository.save).toHaveBeenCalledWith(
        "New Todo",
        "Todo description",
        mockUserId,
      );
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ data: newTodo });
    });

    it("should return 400 if title or description is missing", async () => {
      req.body = { title: "Incomplete Todo" }; // Missing description

      await todoController.createTodo(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ message: "All field required" });
    });

    it("should return 500 if there is an error", async () => {
      req.body = { title: "New Todo", description: "Todo description" };

      (todoRepository.save as jest.Mock).mockRejectedValue(
        new Error("Database error"),
      );

      await todoController.createTodo(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("updateTodo", () => {
    it("should update an existing todo", async () => {
      req.params = { id: "1" };
      req.body = { title: "Updated Todo", description: "Updated description" };
      const updatedTodo = {
        id: 1,
        title: "Updated Todo",
        description: "Updated description",
        userId: mockUserId,
      };

      (todoRepository.find as jest.Mock).mockResolvedValue(updatedTodo); // Todo exists
      (todoRepository.update as jest.Mock).mockResolvedValue(updatedTodo);

      await todoController.updateTodo(req as Request, res as Response);

      expect(todoRepository.find).toHaveBeenCalledWith(1, mockUserId);
      expect(todoRepository.update).toHaveBeenCalledWith(
        1,
        "Updated Todo",
        "Updated description",
      );
      expect(res.json).toHaveBeenCalledWith({ data: updatedTodo });
    });

    it("should return 404 if the todo is not found", async () => {
      req.params = { id: "999" };
      req.body = { title: "Updated Todo", description: "Updated description" };

      (todoRepository.find as jest.Mock).mockResolvedValue(null);

      await todoController.updateTodo(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Todo not found" });
    });

    it("should return 500 if there is an error", async () => {
      const mockError = new Error("Internal server error");

      // Mock the repository to throw an error
      (todoRepository.find as jest.Mock).mockRejectedValue(mockError);

      req = {
        params: { id: "1" },
        body: { title: "New Title", description: "New Description" },
        user: mockUserId,
      };

      await todoController.updateTodo(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.any(Error));
    });
  });

  describe("deleteTodo", () => {
    it("should delete an existing todo and return 204", async () => {
      req.params = { id: "1" };
      const todo = {
        id: 1,
        title: "Test Todo",
        description: "Todo description",
        userId: mockUserId,
      };

      (todoRepository.find as jest.Mock).mockResolvedValue(todo); // Todo exists
      (todoRepository.remove as jest.Mock).mockResolvedValue(null);

      await todoController.deleteTodo(req as Request, res as Response);

      expect(todoRepository.find).toHaveBeenCalledWith(1, mockUserId);
      expect(todoRepository.remove).toHaveBeenCalledWith(1);
      expect(res.sendStatus).toHaveBeenCalledWith(204);
    });

    it("should return 404 if the todo is not found", async () => {
      req.params = { id: "999" };

      (todoRepository.find as jest.Mock).mockResolvedValue(null);

      await todoController.deleteTodo(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ message: "Todo not found" });
    });

    it("should return 500 if there is an error", async () => {
      const mockError = new Error("Internal server error");

      // Mock the repository to throw an error
      (todoRepository.find as jest.Mock).mockRejectedValue(mockError);

      req = {
        params: { id: "1" },
        user: mockUserId,
      };

      await todoController.deleteTodo(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.any(Error));
    });
  });
});
