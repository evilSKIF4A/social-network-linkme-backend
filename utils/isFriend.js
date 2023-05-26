import UserModel from "../models/User.js";

export default async (req, res, next) => {
  try {
    const friendId = req.params.id; // есть ли этот пользователь у нас в друзьях
    const user = await UserModel.findById(req.userId);
    if (!user) {
      next();
      return res.status(404).json({
        message: "Пользователь не найден",
      });
    }

    if (user.friends.find((fId) => fId.toString() == friendId)) {
      // если уже друг
      req.isFriend = true;
      req.isSubscriber = false;
    } else if (user.subscribers.find((fId) => fId.toString() == friendId)) {
      // если friend подписан на user
      req.isFriend = false;
      req.isSubscriber = true;
    } else {
      req.isFriend = false;
      req.isSubscriber = false;
    }
    req.user = user;
    next();
  } catch (err) {
    console.log(err);
    res.json({
      message: "Нет доступа",
    });
  }
};
