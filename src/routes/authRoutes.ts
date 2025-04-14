import express, { NextFunction } from "express";
import { Request, Response } from "express";
import { register, loginUser } from '../controller/userController';

const router = express.Router();


router.post("/login", (req: Request, res: Response,next:NextFunction) => {loginUser(req, res,next);});
router.post("/register", (req: Request, res: Response,next:NextFunction) => {register(req, res,next);});

export default router;