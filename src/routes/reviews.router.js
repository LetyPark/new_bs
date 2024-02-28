import express from "express";
import { prisma } from "../utils/prisma/index.js";

const router = express.Router();


// 리뷰 등록 API //

router.post("/reviews", async (req, res, next) => {
  const { bookTitle, title, content, starRating, author, password } = req.body;
  
  // id           Int 
  // bookTitle    String 
  // title        String 
  // content      String 
  // starRating   String 
  // author       String 
  // password     String


  // 데이터가 body로 요청되지 않은 경우 errorMessage
  if (!bookTitle || !title || !content || !starRating || !author || !password) {
    return res
      .status(400)
      .json({ errorMessage: "데이터 형식이 올바르지 않습니다" });
  }

  // 리뷰 등록
  try {
    const review = await prisma.reviews.create({
      data: {
        bookTitle,
        title,
        content,
        starRating,
        author,
        password,
      },
    });

    return res.status(201).json({ message: "책 리뷰를 등록하였습니다" });
  } catch (error) {
    // db 오류로 리뷰를 등록할수 없는 경우
    console.error("Error creating review:", error);
    return res
      .status(500)
      .json({ errorMessage: "서버에서 오류가 발생하였습니다" });
  }
});


// 리뷰 전체 조회 API //

router.get("/reviews", async (req, res, next) => {
  const reviews = await prisma.reviews.findMany({
    select: {
      id: true,
      bookTitle: true,
      title: true,
      author: true,
      starRating: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res.status(200).json({ data: reviews });
});


// 리뷰 상세 조회 API //

router.get("/reviews/:reviewId", async (req, res, next) => {
  const { reviewId } = req.params;

  // params 가 없을 경우 errorMessage
  if (reviewId === undefined || reviewId === null || reviewId === "") {
    return res
      .status(400)
      .json({ message: "데이터 형식이 올바르지 않습니다." });
  }

  const review = await prisma.reviews.findFirst({
    where: { id: +reviewId },
    select: {
      id: true,
      bookTitle: true,
      title: true,
      content: true,
      author: true,
      starRating: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return res.status(200).json({ data: review });
});


// review 수정 API //

router.put("/reviews/:reviewId", async (req, res, next) => {
  const { reviewId } = req.params;
  const { bookTitle, title, content, starRating, password } = req.body;

  // params, body가 전달되지 않았을 경우 errorMessage
  if (
    !reviewId ||
    !bookTitle ||
    !title ||
    !content ||
    !starRating ||
    !password
  ) {
    return res.status(400).json({ message: "데이터 형식이 올바르지 않습니다" });
  }
  // 리뷰 Id 해당하는 리뷰 조회
  const review = await prisma.reviews.findUnique({
    where: { id: +reviewId },
  });
  // 수정할 리뷰가 존재하지 않는 경우 , 비밀번호가 일치하지 않을 경우
  if (!review) {
    return res.status(404).json({ message: "존재하지 않는 리뷰입니다" });
  } else if (review.password !== password) {
    return res.status(401).json({ message: "비밀번호가 일치하지 않습니다." });
  }

 // 리뷰 업데이트
  await prisma.reviews.update({
    data: { bookTitle, title, content, starRating },
    where: {
      id: +reviewId,
      password,
    },
  });

  return res.status(200).json({ message: "책 리뷰를 수정하였습니다" });
});


// review 삭제 API //

router.delete("/reviews/:reviewId", async (req, res, next) => {
  const { reviewId } = req.params;
  const { password } = req.body;

    // body 혹은 params 받지 못한 경우 errorMeaage
if (!reviewId || !password) {
    return req.status(400).json({ message: "데이터 형식이 올바르지 않습니다" });
    }

//   id로 해당하는 리뷰 찾기 
  const review = await prisma.reviews.findFirst({ where: { id: +reviewId } });

//   리뷰가 존재하지 않을 경우, 입력된 비밀번호가 일치 하지 않을 경우 errorMessage
  if(!review){
    return res.status(404).json({message : '존재하지 않는 리뷰입니다.'})
  }else if(review.password !== password){
    return res.status(401).json({message : '비밀번호가 일치하지 않습니다.'})
  }

  await prisma.reviews.delete({where : {
    id : +reviewId,
    password
  }});

  return res.status(200).json({message : "책 리뷰를 삭제하였습니다"})
});

export default router;
