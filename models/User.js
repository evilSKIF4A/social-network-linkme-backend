import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    firstName: {
      type: String, // тип
      required: true, // обязательно для заполнения
    },
    lastName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    avatarUrl: String,
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    subscribers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    chats: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chat" }],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("User", UserSchema);
