import { body } from "express-validator";

export const postCreateValidation = [
  body("text", "Введите текст статьи").isLength({ min: 3 }).isString(),
  body("imageUrl", "Неверная ссылка на изображение").optional().isString(),
];
