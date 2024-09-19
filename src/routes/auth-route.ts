import express from "express";
const router = express.Router();

import userController from "../controllers/auth-controller";

router.route("/register").post(userController.register);
router.route("/login").post(userController.login);
router.route("/refresh").get(userController.refresh);
router.route("/logout").get(userController.logout);

export default router;
