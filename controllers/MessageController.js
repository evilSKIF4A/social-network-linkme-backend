import MessageModel from "../models/Message.js";
import ChatModel from "../models/Chat.js";

export const getMessage = async (req, res) => {
  try {
    const messageId = req.params.messageId;
    const message = await MessageModel.findById(messageId);

    if (!message) {
      res.json({
        message: "Сообщение не найдено",
      });
      return;
    }

    res.json(message);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Нет доступа",
    });
  }
};

export const postMessage = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const doc = new MessageModel({
      authorId: req.params.userId,
      message: req.params.messageText.toString(),
    });

    const newMessage = await doc.save();
    await ChatModel.findOneAndUpdate(
      {
        _id: chatId,
      },
      {
        $push: { messages: newMessage._id },
      }
    );
    res.json(newMessage);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Нет доступа",
    });
  }
};
