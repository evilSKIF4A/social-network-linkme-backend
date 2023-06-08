import PostModel from "../models/Post.js";

export const getPost = async (req, res) => {
  try {
    const postId = req.params.postId;
    const post = await PostModel.findByIdAndUpdate(
      {
        _id: postId,
      },
      {
        $inc: { viewsCount: 1 },
      },
      {
        returnDocument: "after",
      }
    )
      .populate("authorId")
      .exec();
    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось получить статьи",
    });
  }
};

export const removePost = async (req, res) => {
  try {
    const postId = req.params.id;

    PostModel.findOneAndDelete({
      _id: postId,
    });
    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось получить статьи",
    });
  }
};

export const createPost = async (req, res) => {
  try {
    const doc = new PostModel({
      text: req.params.text,
      imageUrl: req.params.imageUrl,
      authorId: req.params.authorId,
    });

    const post = await doc.save();

    res.json(post);
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось создать статью",
    });
  }
};

export const updatePost = async (req, res) => {
  try {
    const postId = req.params.id;

    await PostModel.updateOne(
      {
        _id: postId,
      },
      {
        text: req.params.text,
        imageUrl: req.params.imageUrl,
        authorId: req.params.authorId,
      }
    );

    res.json({
      success: true,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Не удалось обновить статью",
    });
  }
};
