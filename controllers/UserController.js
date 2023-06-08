import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

import { validationResult } from "express-validator";
import UserModel from "../models/User.js";

const SECRET_KEY = "lolkekcheburek283598203958205982";

export const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json(errors.array());

    const password = req.body.password;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    const doc = new UserModel({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      passwordHash: hash,
      avatarUrl: req.body.avatarUrl,
    });

    const user = await doc.save();

    const token = jwt.sign(
      {
        _id: user._id,
      },
      SECRET_KEY,
      {
        expiresIn: "1d",
      }
    );

    const { passwordHash, ...userData } = user._doc;
    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось зарегистрироваться",
    });
  }
};

export const login = async (req, res) => {
  try {
    const user = await UserModel.findOne({ email: req.body.email });

    if (!user)
      return res.status(404).json({
        message: "Неверный логин или пароль",
      });

    const isValidPassword = await bcrypt.compare(
      req.body.password,
      user._doc.passwordHash
    );
    if (!isValidPassword)
      return res.status(400).json({
        message: "Неверный логин или пароль",
      });

    const token = jwt.sign(
      {
        _id: user._id,
      },
      SECRET_KEY,
      {
        expiresIn: "1d",
      }
    );

    const { passwordHash, ...userData } = user._doc;
    res.json({
      ...userData,
      token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось авторизоваться",
    });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user)
      return res.status(404).json({
        message: "Пользователь не найден",
      });

    const { passwordHash, ...userData } = user._doc;
    res.json(userData);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Нет доступа",
    });
  }
};

export const addFriendOrSubscriber = async (req, res) => {
  try {
    const friendId = req.params.id;
    const user = req.user;

    if (req.isFriend) {
      res.json({
        message: "Вы друзья",
      });
    } else if (req.isSubscriber) {
      await UserModel.findByIdAndUpdate(
        {
          _id: user._id,
        },
        {
          $pull: { subscribers: friendId },
          $push: { friends: friendId },
        }
      );

      await UserModel.findByIdAndUpdate(
        {
          _id: friendId,
        },
        {
          $pull: { subscribers: user._id },
          $push: { friends: user._id },
        }
      );

      res.json({
        message: "Вы добавили в друзья",
      });
    } else {
      const friend = await UserModel.findById(friendId);
      // если мы уже подписаны
      if (friend.subscribers.find((uId) => uId.toString() == user._id)) {
        return res.json({
          message: "Вы подписаны",
        });
      }
      // подписываемся на пользователя
      await UserModel.findByIdAndUpdate(
        {
          _id: friendId,
        },
        {
          $push: { subscribers: user._id },
        }
      );
      res.json({
        message: "Вы подписались",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Нет доступа",
    });
  }
};

export const deleteFriendOrUnsubscriber = async (req, res) => {
  try {
    const friendId = req.params.id;
    const user = req.user;
    //const friend = await UserModel.findById(friendId);
    if (req.isFriend) {
      await UserModel.findByIdAndUpdate(
        {
          _id: user._id,
        },
        {
          $pull: { friends: friendId },
          $push: { subscribers: friendId },
        }
      );
      await UserModel.findByIdAndUpdate(
        {
          _id: friendId,
        },
        {
          $pull: { friends: user._id },
        }
      );
      res.json({
        message: "Вы удалили из друзей",
      });
    } else {
      await UserModel.findByIdAndUpdate(
        {
          _id: friendId,
        },
        {
          $pull: { subscribers: user._id },
        }
      );

      res.json({
        message: "Вы отписались",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Нет доступа",
    });
  }
};

export const showUser = async (req, res) => {
  try {
    const user = await UserModel.findById(req.params.id)
      .populate("friends")
      .populate("subscribers")
      .exec();
    res.json(user);
  } catch (err) {
    console.log(err);
    res.json({
      message: "Нет доступа",
    });
  }
};

export const findUsers = async (req, res) => {
  try {
    let fname = req.params.fname;
    let lname = req.params.lname;

    let users = await UserModel.find({
      firstName: {
        $regex: `.*${fname ? fname : "$"}.*`,
      },
      lastName: {
        $regex: `.*${lname ? lname : "$"}.*`,
      },
    });

    if (!users.length) {
      users = await UserModel.find({
        lastName: {
          $regex: `.*${fname ? fname : "$"}.*`,
        },
      });
    }

    res.json(users);
  } catch (err) {
    console.log(err);
    res.json({
      message: "Нет доступа",
    });
  }
};

export const updateFoto = async (req, res) => {
  try {
    const url = req.params.avatarUrl.replaceAll(" ", "/");
    await UserModel.findByIdAndUpdate(
      {
        _id: req.userId,
      },
      {
        $set: { avatarUrl: url },
      }
    );

    res.json({
      message: "Фотография была изменена",
    });
  } catch {
    console.log(err);
    res.status(500).json({
      message: "Нет доступа",
    });
  }
};

export const updateDescription = async (req, res) => {
  try {
    const textDesc = req.params.textDesc;
    await UserModel.findByIdAndUpdate(
      {
        _id: req.userId,
      },
      {
        $set: { description: textDesc },
      }
    );
    res.json({
      message: "Фотография была изменена",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Нет доступа",
    });
  }
};
