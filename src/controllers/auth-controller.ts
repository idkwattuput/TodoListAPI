import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import userRepository from "../repositories/user-repository";

const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: "All field are required" });
    }
    const isUserExist = await userRepository.findByEmail(email);
    if (isUserExist) {
      return res.status(400).json({ error: "This email already used" });
    }
    const hashPassword = await bcrypt.hash(password, 12);
    const newUser = await userRepository.save(name, email, hashPassword);
    const accessToken = jwt.sign(
      { id: newUser.id },
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: "20s",
      },
    );
    const refreshToken = jwt.sign(
      { id: newUser.id },
      process.env.REFRESH_TOKEN_SECRET!,
      {
        expiresIn: "1w",
      },
    );
    await userRepository.updateRefresToken(refreshToken, newUser.id);
    res.cookie("refresh_token_todo_list", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.json({ token: accessToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All field are required" });
    }
    const isUserExist = await userRepository.findByEmail(email);
    if (!isUserExist) {
      return res
        .status(400)
        .json({ message: "Email or password are incorrect" });
    }
    const isPasswordMatch = await bcrypt.compare(
      password,
      isUserExist.password,
    );
    if (!isPasswordMatch) {
      return res
        .status(400)
        .json({ message: "Email or password are incorrect" });
    }
    const accessToken = jwt.sign(
      { id: isUserExist.id },
      process.env.ACCESS_TOKEN_SECRET!,
      {
        expiresIn: "20s",
      },
    );
    const refreshToken = jwt.sign(
      { id: isUserExist.id },
      process.env.REFRESH_TOKEN_SECRET!,
      {
        expiresIn: "1w",
      },
    );
    await userRepository.updateRefresToken(refreshToken, isUserExist.id);
    res.cookie("refresh_token_todo_list", refreshToken, {
      httpOnly: true,
      sameSite: "none",
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.json({ token: accessToken });
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

const refresh = async (req: Request, res: Response) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.refresh_token_todo_list) {
      return res.sendStatus(401);
    }
    const refreshToken = cookies.refresh_token_todo_list;
    const isRefreshTokenExist =
      await userRepository.findByRefreshToken(refreshToken);
    if (!isRefreshTokenExist) {
      return res.sendStatus(403);
    }
    jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET!,
      (err: any, decode: any) => {
        if (err || isRefreshTokenExist.id !== decode.id) {
          return res.sendStatus(403);
        }
        const accessToken = jwt.sign(
          { id: decode.id },
          process.env.ACCESS_TOKEN_SECRET!,
          { expiresIn: "20s" },
        );
        return res.json({ token: accessToken });
      },
    );
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

const logout = async (req: Request, res: Response) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.refresh_token_todo_list) {
      return res.sendStatus(204);
    }
    const refreshToken = cookies.refresh_token_todo_list;
    const isRefreshTokenExist =
      await userRepository.findByRefreshToken(refreshToken);
    if (!isRefreshTokenExist) {
      res.clearCookie("refresh_token_todo_list", {
        httpOnly: true,
        sameSite: "none",
      });
      return res.sendStatus(204);
    }
    await userRepository.updateRefresToken("empty", isRefreshTokenExist.id);
    res.clearCookie("refresh_token_todo_list", {
      httpOnly: true,
      sameSite: "none",
    });
    res.sendStatus(204);
  } catch (error) {
    console.error(error);
    return res.status(500).json(error);
  }
};

export default { register, login, refresh, logout };
