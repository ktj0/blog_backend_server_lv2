const express = require("express");
const router = express.Router();

const commentDb = require("../schemas/comment.js");

router.post("/comments/:_postId", async (req, res) => {
  try {
    const createdAt = new Date();
    createdAt.setHours(createdAt.getHours() + 9);

    const { _postId } = req.params;
    const { user, password, content } = req.body;

    const post = await commentDb.find({ _postId });
    const existPwd = await commentDb.find({ _postId, password });

    if (!post) {
      return res.status(404).json({ message: "게시글이 존재하지 않습니다." });
    }

    if (existPwd.length) {
      return res
        .status(400)
        .json({ message: "해당 비밀번호를 사용할 수 없습니다." });
    }

    if (!content) {
      return res.status(400).json({ message: "댓글 내용을 입력해주세요." });
    }

    await commentDb.create({
      _postId,
      user,
      password,
      content,
      createdAt,
      updatedAt: null,
    });

    res.status(200).json({ message: "댓글을 생성하였습니다." });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
  }
});

router.get("/comments/:_postId", async (req, res) => {
  const { _postId } = req.params;

  const comments = await commentDb.find({ _postId });

  comments.reverse();

  const data = comments.map((comment) => {
    const { _id, user, content, createdAt, updatedAt } = comment;

    const data = {
      _commentId: _id,
      user,
      content,
      createdAt,
      updatedAt,
    };

    return data;
  });

  res.status(200).json({ message: data });
});

router.put("/comments/:_commentId", async (req, res) => {
  try {
    const updatedAt = new Date();
    updatedAt.setHours(updatedAt.getHours() + 9);

    const { _commentId } = req.params;
    const { password, content } = req.body;

    if (!password) {
      return res.status(401).json({ message: "비밀번호를 입력해주세요." });
    }

    if (!content) {
      return res.status(400).json({ message: "댓글 내용을 입력해주세요." });
    }

    const comment = await commentDb.findOne({ _id: _commentId });
    const existPwd = await commentDb.findOne({ _id: _commentId, password });

    if (!comment) {
      return res.status(400).json({ message: "댓글 조회에 실패하였습니다." });
    }
    if (!existPwd) {
      return res.status(403).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    await commentDb.updateOne(
      { _id: _commentId, password },
      { $set: { content, updatedAt } }
    );

    res.status(200).json({ message: "댓글을 수정하였습니다." });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
  }
});

router.delete("/comments/:_commentId", async (req, res) => {
  try {
    const { _commentId } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(401).json({ message: "비밀번호를 입력해주세요" });
    }

    const comment = await commentDb.findOne({ _id: _commentId });
    const existPwd = await commentDb.findOne({ _id: _commentId, password });

    if (!comment) {
      return res.status(400).json({ message: "댓글 조회에 실패하였습니다." });
    }

    if (!existPwd) {
      return res.status(403).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    await commentDb.deleteOne({ _id: _commentId, password });

    res.status(200).json({ message: "댓글을 삭제하였습니다." });
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: "데이터 형식이 올바르지 않습니다." });
  }
});

module.exports = router;