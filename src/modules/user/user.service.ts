import type { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { UserModel } from "./user.model.js";
import { jwtConfig } from "../../config/jwt.config.js";


export async function registerUser(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;

    const exists = await UserModel.findOne({ email });
    if (exists) {
        return res.status(409).json({ message: "User already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await UserModel.create({
        email,
        password: passwordHash,
    });


    const token = jwt.sign(
    {
        sub: user.email,
        email: user.email,
    },
    jwtConfig.secret,
    {
        expiresIn: "1h",
    }
    );

    return res.status(201).json({ token });
};

export async function login(req: Request, res: Response): Promise<Response> {
  const { email, password } = req.body;

  const user = await UserModel.findOne({ email });
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

    const token = jwt.sign(
    {
        sub: user.email,
        email: user.email,
    },
    jwtConfig.secret,
    {
        expiresIn: "1h",
    }
    );

  return res.json({ token });
};
