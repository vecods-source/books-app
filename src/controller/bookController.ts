import { Request, Response } from "express";
import Prisma from "../prisma";
import cloudinary from "../config/cloundinary";
export const getBooks = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 0; //default to 0 if not provided
  const limit = parseInt(req.query.limit as string) || 5; //default to 5 if not provided
  const skipNum = (page - 1) * limit;
  console.log(page, skipNum, limit);
  res.status(200).json({ message: "nice" });
  try {
    const books = await Prisma.books.findMany({
      take: limit,
      skip: skipNum,
      orderBy: { createdAt: "asc" },
    });
    if (!books) {
      console.log("No books found");
      return res.status(404).json({ message: "No books found" });
    }
    console.log(`Books fetched, books details: ${books}`);
    const totalBooks = books.length;
    const totalPages = Math.ceil(totalBooks / limit);
    res
      .status(200)
      .json({
        message: "Books fetched",
        books,
        currentPage: page,
        totalPages,
        totalBooks,
      });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Error fetching books", err });
  }
};

export const getBook = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const book = await Prisma.books.findUnique({
      where: { bookid: id },
      select: {
        title: true,
        author: true,
        caption: true,
        bookid: true,
        image: true,
      }, //image is just a strin from an api cloundinary url <==
    });
    if (!book) {
      console.log(`Book with id ${id} not found`);
      return res.status(404).json({ message: "Book not found" });
    }
    console.log(`Book with id ${id} fetched, book details: ${book}`);
    return res.status(200).json({ message: "Book fetched", book });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "error getting book ", err });
  } finally {
    console.log("getBook function finished");
  }
};

export const createBook = async (req: Request, res: Response) => {
  try {
    const { title, caption, image } = req.body;
    const userId = req.user?.userid;
    if (!userId) {
      return res.status(400).json({ message: "User ID is missing" });
    }
    const result = await cloudinary.uploader.upload(image);
    const url = result.secure_url;
    const book = await Prisma.books.create({
      data: {
        title,
        authorId: userId,
        caption,
        image: url,
      },
    });
    if (book) {
      console.log(`Book with id ${book.bookid} created`);
      return res.status(201).json({ message: "Book created", book });
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "error creating book ", err });
  }
};

export const deleteBook = async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const book = await Prisma.books.delete({
      where: { bookid: id },
    });
    if (!book) {
      console.log(`Book with id ${id} not found`);
      return res.status(404).json({ message: "Book not found" });
    }
    const url = book.image;
    const publicId = url.split("/").pop()?.split(".")[0]; // Extract the public ID from the URL
    if (publicId) {
      await cloudinary.uploader.destroy(publicId); // Delete the image from Cloudinary
    }
    console.log(`Book with id ${id} deleted, book details: ${book}`);
    return res.status(200).json({ message: "Book deleted", book });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "error deleting book ", err });
  }
};
