import express from "express";
import { protect } from "../middlewares/auth";
import {
  getBooks,
  getBook,
  createBook,
  deleteBook,
} from "../controller/bookController";
import { Request, Response } from "express";

const router = express.Router();

// Middleware to protect routes
router.get("/get-all-book", protect, (req: Request, res: Response) => {
  getBooks(req, res);
});
router.get("/get-book/:id", protect, (req: Request, res: Response) => {
  getBook(req, res);
});
router.post("/create-book", protect, (req: Request, res: Response) => {
  createBook(req, res);
});
router.delete("/delete-book/:id", protect, (req: Request, res: Response) => {
  deleteBook(req, res);
});
