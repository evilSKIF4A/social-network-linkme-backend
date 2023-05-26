import { body } from "express-validator";

export const loginValidation = [
  body("email", "Неверный формат почты").isEmail(),
  body("password", "Пароль должен быть минимум 5 символов").isLength({
    min: 5,
  }),
];

export const registerValidation = [
  body("email", "Неверный формат почты").isEmail(),
  body("password", "Пароль должен быть минимум 5 символов").isLength({
    min: 5,
  }),
  body("firstName", "Укажите имя").isLength({ min: 1 }),
  body("lastName", "Укажите фамилию").isLength({ min: 1 }),
  body("avatarUrl", "Неверная ссылка на аватар").optional().isURL(),
];
