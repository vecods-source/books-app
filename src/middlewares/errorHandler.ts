import { ZodError } from "zod";
import { Request,NextFunction, Response } from "express";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
export const    ErrorCheck = (
    err: unknown, req: Request, res: Response, next: NextFunction
)=>{
    if(err instanceof ZodError){
        return res.status(404).json({message: "validation error",
            errors: err.errors.map(e=>({
                path:e.path.join('.'),
                message: e.message
            }))
        })
    }
    if(err instanceof PrismaClientKnownRequestError){
        if(err.code === "P2002"){
            return res.status(409).json({message: "Unique constraint failed",
                errors: err.meta?.target})
        }
    }
    console.log(err)
    return res.status(500).json({message: "Internal server error"})
}

