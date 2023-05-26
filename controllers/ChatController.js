import UserModel from "../models/User.js";
import ChatModel from "../models/Chat.js";

export const showChats = async (req, res) => {
  try {
    const user = await UserModel.findById(req.userId);
    if (!user)
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    let chats = await ChatModel.find({ user1: user._id })
      .populate("user1")
      .populate("user2")
      .exec();
    if (!chats.length)
      chats = await ChatModel.find({ user2: user._id })
        .populate("user1")
        .populate("user2")
        .exec();

    res.json(chats);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Нет доступа",
    });
  }
};

export const createChat = async (req, res) => {
  try {
    let isNewChat = await ChatModel.findOne({
      user1: req.userId,
      user2: req.body.user2,
    });
    if (!isNewChat) {
      isNewChat = await ChatModel.findOne({
        user1: req.body.user2,
        user2: req.userId,
      });
    }
    // сделать проверку на user2, чтобы реализовать удаление
    if (isNewChat) {
      if (isNewChat.active)
        return res.json({
          message: "Чат уже был когда-то начат",
        });
      else {
        await isNewChat.updateOne({
          $set: { active: true },
        });
        return res.json({
          message: "Чат снова активен",
        });
      }
    }

    const doc = new ChatModel({
      user1: req.userId,
      user2: req.body.user2,
    });

    const newChat = await doc.save();

    await UserModel.findByIdAndUpdate(
      {
        _id: req.userId,
      },
      {
        $push: { chats: newChat._id },
      }
    );

    await UserModel.findByIdAndUpdate(
      {
        _id: req.body.user2,
      },
      {
        $push: { chats: newChat._id },
      }
    );

    res.json(newChat);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось создать чат",
    });
  }
};

export const showChat = async (req, res) => {
  try {
    const chatId = req.params.id;
    const chat = await ChatModel.findById(chatId)
      .populate("user1")
      .populate("user2")
      .populate("messages")
      .exec();

    if (!chat)
      return res.json({
        message: "Чат не найден",
      });

    res.json(chat);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Нет доступа",
    });
  }
};

export const deleteChat = async (req, res) => {
  try {
    const chatId = req.params.id;
    await ChatModel.findByIdAndUpdate(
      {
        _id: chatId,
      },
      {
        $set: { active: false },
      }
    );
    res.json({
      message: "Чат был деактивирован",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось удалить чат",
    });
  }
};
