import express from "express";
import { prisma } from "../utils/prisma/index.js";

const router = express.Router();

// 댓글 등록 API // gitgit

router.post("/reviews/:reviewId/comments", async (req, res, next) => {
  const { reviewId } = req.params;
  const { content, author, password } = req.body;

  // body 혹은 params 받지 못한 경우 errorMessage
  if (!reviewId || !content || !author || !password) {
    return res
      .status(400)
      .json({ errorMessage: "데이터 형식이 올바르지 않습니다" });
  }

  //   Prisma로 reviewId에 해당하는 리뷰 찾기
  const review = await prisma.reviews.findUnique({
    where: { id: +reviewId },
  });

  //  reviewId에 해당하는 리뷰가 존재하지 않는 경우 404 에러
  if (!review) {
    return res.status(404).json({ message: "존재하지 않는 리뷰입니다" });
  }

  // 댓글 내용이 없는 경우 400 에러
  if (!content) {
    return res.status(400).json({ message: "댓글내용을 입력해주세요" });
  }

  // 댓글 등록
  const comment = await prisma.comments.create({
    data: {
      content,
      author,
      password,
      reviewId: +reviewId, // param으로 받아온 reviewId
    },
  });
  return res.status(201).json({ message: "댓글을 등록하였습니다" });
});

// // 댓글 전체 조회 API //

router.get("/reviews/:reviewId/comments", async (req, res, next) => {
  const { reviewId } = req.params;

  //   Prisma로 reviewId에 해당하는 리뷰 찾기
  const review = await prisma.reviews.findUnique({
    where: { id: +reviewId },
  });

  //  reviewId에 해당하는 리뷰가 존재하지 않는 경우 404 에러
  if (!review) {
    return res.status(404).json({ message: "존재하지 않는 리뷰입니다" });
  }

  // body 혹은 params 받지 못한 경우 errorMessage
  if (!reviewId) {
    return res
      .status(400)
      .json({ errorMessage: "데이터 형식이 올바르지 않습니다" });
  }

  const comments = await prisma.comments.findMany({
    select: {
      id: true,
      content: true,
      createdAt: true,
      updatedAt: true,
    },
    where: { reviewId: +reviewId },
  });

  return res.status(200).json({ data: comments });
});

// // 댓글 수정 API //

router.put("/reviews/:reviewId/comments/:commentId", async (req, res, next) => {
  const { reviewId, commentId } = req.params;
  const { content, password } = req.body;

  // params, body가 전달되지 않았을 경우 errorMessage
  if (!reviewId || !commentId || !content || !content || !password) {
    return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다" });
  }

  //   Prisma로 reviewId에 해당하는 리뷰 찾기
  const review = await prisma.reviews.findUnique({
    where: { id: +reviewId },
  });

  //  reviewId에 해당하는 리뷰가 존재하지 않는 경우 404 에러
  if (!review) {
    return res.status(404).json({ message: "존재하지 않는 리뷰입니다" });
  }

  // 댓글 Id 해당하는 리뷰 조회
  const comment = await prisma.comments.findUnique({
    where: { id: +commentId },
  });
  // 수정할 댓글가 존재하지 않는 경우 , 비밀번호가 일치하지 않을 경우
  if (!comment) {
    return res.status(404).json({ message: "댓글 내용을 입력해주세요" });
  } else if (comment.password !== password) {
    return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
  }

  // 댓글 업데이트
  await prisma.comments.update({
    data: { content },
    where: {
      id: +commentId,
      password,
    },
  });

  return res.status(200).json({ message: "댓글을 수정하였습니다" });
});

// 댓글 삭제 API //

router.delete(
  "/reviews/:reviewId/comments/:commentId",
  async (req, res, next) => {
    const { reviewId, commentId } = req.params;
    const { password } = req.body;

    // body 혹은 params 받지 못한 경우 errorMeaage
    if (!commentId || !reviewId || !password) {
      return req
        .status(400)
        .json({ message: "데이터 형식이 올바르지 않습니다" });
    }

    //  Prisma로 reviewId에 해당하는 리뷰 찾기
    const review = await prisma.reviews.findUnique({
      where: { id: +reviewId },
    });

    //  reviewId에 해당하는 리뷰가 존재하지 않는 경우 404 에러
    if (!review) {
      return res.status(404).json({ message: "존재하지 않는 리뷰입니다" });
    }

    //   id로 해당하는 댓글 찾기
    const comment = await prisma.comments.findFirst({
      where: { id: +commentId },
    });

    //   댓글가 존재하지 않을 경우, 입력된 비밀번호가 일치 하지 않을 경우 errorMessage
    if (!comment) {
      return res.status(404).json({ message: "존재하지 않는 리뷰입니다." });
    } else if (comment.password !== password) {
      return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
    }

    await prisma.comments.delete({
      where: {
        id: +commentId,
        password,
      },
    });

    return res.status(200).json({ message: "댓글을 삭제하였습니다" });
  }
);

export default router;
