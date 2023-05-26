import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";
dotenv.config({ path: "./.env" });

import { registerValidation, loginValidation } from "./validations/auth.js";

import * as UserController from "./controllers/UserController.js";
import * as ChatController from "./controllers/ChatController.js";
import * as MessageController from "./controllers/MessageController.js";

import checkAuth from "./utils/checkAuth.js";
import isFriend from "./utils/isFriend.js";

mongoose
  .connect(process.env.URL_DB)
  .then(() => {
    console.log("DB OK");
  })
  .catch((err) => {
    console.log("DB Error", err);
  });

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

app.use(express.json());
app.use(cors());

app.post("/auth/login", loginValidation, UserController.login);
app.post("/auth/register", registerValidation, UserController.register);
app.get("/auth/me", checkAuth, UserController.getMe);

app.get("/chats", checkAuth, ChatController.showChats); // вывод всех чатов
app.get("/chats/:id", checkAuth, ChatController.showChat); // получить чат
//app.post("/chats/:id", checkAuth, sendMessage, ChatController.showChat); // отправка сообщения
app.post("/chat/create", checkAuth, ChatController.createChat); // создать чат с пользователем
app.patch("/chats/del/:id", checkAuth, ChatController.deleteChat); // сделать чат не активным

app.get("/message/get/:messageId", checkAuth, MessageController.getMessage); // получить сообщение
app.post(
  "/message/post/:chatId/:userId/:messageText",
  checkAuth,
  MessageController.postMessage
); // отправить сообщение

app.get("/users/find/:fname?/:lname?", checkAuth, UserController.findUsers);
app.get("/users/:id", checkAuth, isFriend, UserController.showUser);
app.patch(
  "/users/:id/add",
  checkAuth,
  isFriend,
  UserController.addFriendOrSubscriber
);
app.patch(
  "/users/:id/del",
  checkAuth,
  isFriend,
  UserController.deleteFriendOrUnsubscriber
);

app.post("/update/foto/:avatarUrl", checkAuth, UserController.updateFoto);

let users = []; // пользователи в сети

const addUser = (userId, socketId) => {
  !users.some((user) => user.userId === userId) &&
    users.push({ userId, socketId });
};

const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};

const getUser = (userId) => {
  return users.find((user) => user.userId === userId);
};

io.on("connection", (socket) => {
  // console.log("a user connected");

  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);
    io.emit("getUsers", users);
  });

  socket.on("sendMessage", ({ senderId, receiverId, text }) => {
    const user = getUser(receiverId);
    user &&
      io.to(user.socketId).emit("getMessage", {
        senderId,
        text,
      });
  });

  socket.on("disconnect", () => {
    // console.log("a user disconnected");
    removeUser(socket.id);
    io.emit("getUsers", users);
  });
});

server.listen(process.env.PORT || 7777, (err) => {
  if (err) return console.log(err);
  console.log("Server OK");
});
