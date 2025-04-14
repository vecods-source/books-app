import { NextFunction, Request, Response } from 'express';
import Prisma from '../../src/prisma';
import { loginSchema, registerSchema } from '../utils/validation';
import bcrypt from 'bcrypt';
import jwt from "jsonwebtoken";
import dotenv from 'dotenv';

dotenv.config();
export const register = async (req:Request, res:Response, next:NextFunction):Promise<unknown> => {
    try{
        console.log("Registering user...");
        console.log(req.body);
        
        const validation = registerSchema.parse(req.body);
        const hashedPassword = await bcrypt.hash(validation.password, 10);
        const existingUser = await Prisma.user.findUnique({
            where: {email: validation.email},
            select: {username: true}
        })
        if(existingUser){
            return res.status(409).json({message: "User already exists"})
        }
        const user = await Prisma.user.create({
            data: {
                username: validation.username,
                email: validation.email,
                password: hashedPassword,
            },
            select: {username: true}
        })

        res.status(201).json({message:"User created",user});
    }catch(err){
        next(err)
    }
}
export const loginUser = async (req:Request, res:Response,next:NextFunction):Promise<unknown> => {
    try{
        console.log("logging in...")
        console.log(req.body);
        const validatedData = loginSchema.parse(req.body);
        const user = await Prisma.user.findUnique({
            where: {username: validatedData.username},
            select: {password: true, username: true,userid: true, email: true}
        })
        if(!user || !(await bcrypt.compare(validatedData.password, user.password))){
            return res.status(401).json({message: "Invalid Credentials"})
        }
        const token = jwt.sign({userid:user.userid,email: user.email, username: user.username}, process.env.JWT_SECRET as string, {expiresIn: "1h"})
        const {password, ...userWithoutPassword} = user;
        res.status(200).json({message: "Login successful", token,userWithoutPassword});
    }catch(err){
        next(err)
    }
}