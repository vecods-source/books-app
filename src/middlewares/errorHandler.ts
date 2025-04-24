import { ZodError } from "zod";
import { ErrorRequestHandler } from "express";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

export const ErrorCheck: ErrorRequestHandler = (err, req, res, next) => {
  console.log("Error Check recieved this error: ", err);
  if (err instanceof ZodError) {
    res.status(400).json({
      message: "Validation error",
      errors: err.errors.map((e) => ({
        path: e.path.join("."),
        message: e.message,
      })),
    });
    next();
    return;
  }

  if (err instanceof PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      res.status(409).json({
        message: "Unique constraint failed",
        errors: err.meta?.target,
      });
      next();
      return;
    }
  }

  console.error(err);

  res.status(500).json({ message: "Internal server error" });
  next();
  return;
};
