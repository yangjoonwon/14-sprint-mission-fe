import type { NextApiRequest, NextApiResponse } from "next";
import type { Comment } from "@prisma/client";
import prisma from "@/lib/prisma";
import type { ErrorResponse } from "@/types/api";

type ArticleComment = Pick<
  Comment,
  "id" | "content" | "createdAt" | "updatedAt"
>;

type ArticleCommentsApiResponse = ArticleComment[] | Comment | ErrorResponse;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ArticleCommentsApiResponse>,
) {
  const allowedMethods = ["GET", "POST"];

  if (!req.method || !allowedMethods.includes(req.method)) {
    res.setHeader("Allow", allowedMethods);
    return res.status(405).json({
      message: "허용되지 않은 메서드입니다.",
    });
  }

  const { id } = req.query;

  if (typeof id !== "string") {
    return res.status(400).json({
      message: "올바른 게시글 ID가 필요합니다.",
    });
  }

  try {
    const article = await prisma.article.findUnique({
      where: { id },
    });

    if (!article) {
      return res.status(404).json({
        message: "게시글을 찾을 수 없습니다.",
      });
    }

    if (req.method === "GET") {
      const comments = await prisma.comment.findMany({
        where: {
          articleId: id,
        },
        orderBy: {
          createdAt: "desc",
        },
        select: {
          id: true,
          content: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      return res.status(200).json(comments);
    }

    const content =
      typeof req.body?.content === "string" ? req.body.content.trim() : "";

    if (!content) {
      return res.status(400).json({
        message: "댓글 내용을 입력해주세요.",
      });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        articleId: id,
      },
    });

    return res.status(201).json(comment);
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "댓글 요청을 처리하지 못했습니다.",
    });
  }
}
