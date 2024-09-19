import express from "express";
import todoController from "../controllers/todo-controller";
import { verifyJWT } from "../middleware/verifyJwt";
const router = express.Router();

router
  .route("/")
  .get(verifyJWT, todoController.getTodos)
  .post(verifyJWT, todoController.createTodo);
router
  .route("/:id")
  .get(verifyJWT, todoController.getTodo)
  .put(verifyJWT, todoController.updateTodo)
  .delete(verifyJWT, todoController.deleteTodo);

export default router;
