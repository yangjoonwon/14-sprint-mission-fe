import { useState } from "react";
import type { SubmitEvent } from "react";
import type { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import Image from "next/image";
import CommentItem from "@/components/boards/CommentItem";
import getNickname from "@/lib/getNickname";
import type { ErrorResponse } from "@/types/api";
import type { Article } from "@/types/article";
import type { BaseComment } from "@/types/comment";
import styles from "./BoardDetail.module.css";

type BoardDetailPageProps = {
  initialArticle: Article;
  initialComments: BaseComment[];
};

export default function BoardDetailPage({
  initialArticle,
  initialComments,
}: BoardDetailPageProps) {
  const router = useRouter();

  const article = initialArticle;

  const [comments, setComments] = useState(initialComments);
  const [commentContent, setCommentContent] = useState("");

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isCommentSubmitting, setIsCommentSubmitting] = useState(false);
  const [isArticleDeleting, setIsArticleDeleting] = useState(false);

  async function handleDeleteArticle() {
    if (isArticleDeleting) {
      return;
    }

    setIsArticleDeleting(true);

    try {
      const response = await fetch(`/api/articles/${article.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = (await response.json()) as ErrorResponse;
        throw new Error(data.message || "게시글을 삭제하지 못했습니다.");
      }

      router.push("/boards");
    } catch (error) {
      console.error(error);

      const message =
        error instanceof Error
          ? error.message
          : "게시글 삭제 중 오류가 발생했습니다.";

      alert(message);
    } finally {
      setIsArticleDeleting(false);
    }
  }

  async function handleCreateComment(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmedContent = commentContent.trim();

    if (!trimmedContent || isCommentSubmitting) {
      return;
    }

    setIsCommentSubmitting(true);

    try {
      const response = await fetch(`/api/articles/${article.id}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          content: trimmedContent,
        }),
      });

      const data = (await response.json()) as BaseComment | ErrorResponse;

      if (!response.ok) {
        throw new Error(
          (data as ErrorResponse).message || "댓글을 등록하지 못했습니다.",
        );
      }

      const createdComment = data as BaseComment;

      setComments((previousComments) => [createdComment, ...previousComments]);

      setCommentContent("");
    } catch (error) {
      console.error(error);

      const message =
        error instanceof Error
          ? error.message
          : "댓글 등록 중 오류가 발생했습니다.";

      alert(message);
    } finally {
      setIsCommentSubmitting(false);
    }
  }

  function handleUpdateComment(updatedComment: BaseComment) {
    setComments((previousComments) =>
      previousComments.map((comment) =>
        comment.id === updatedComment.id ? updatedComment : comment,
      ),
    );
  }

  function handleDeleteComment(commentId: string) {
    setComments((previousComments) =>
      previousComments.filter((comment) => comment.id !== commentId),
    );
  }

  return (
    <div className={styles.page}>
      <article className={styles.article}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{article.title}</h1>

          <div className={styles.menuWrapper}>
            <button
              className={styles.menuButton}
              type="button"
              aria-label="게시글 메뉴 열기"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Image
                src="/images/menu_button.png"
                alt=""
                width={24}
                height={24}
              />
            </button>

            {isMenuOpen && (
              <div className={styles.menu}>
                <button
                  className={styles.menuItem}
                  type="button"
                  onClick={() => router.push(`/boards/${article.id}/edit`)}
                >
                  수정하기
                </button>

                <button
                  className={styles.menuItem}
                  type="button"
                  disabled={isArticleDeleting}
                  onClick={handleDeleteArticle}
                >
                  삭제하기
                </button>
              </div>
            )}
          </div>
        </div>

        <div className={styles.meta}>
          <div className={styles.authorInfo}>
            <Image
              src="/images/default_profile.png"
              alt="작성자 기본 프로필 이미지"
              width={18}
              height={18}
            />

            <span className={styles.nickname}>{getNickname(article.id)}</span>

            <span className={styles.date}>
              {new Date(article.createdAt).toLocaleDateString("ko-KR")}
            </span>
          </div>

          <div className={styles.likeInfo}>
            <Image
              src="/images/heart.png"
              alt="좋아요"
              width={15}
              height={15}
            />

            <span>9999+</span>
          </div>
        </div>

        <p className={styles.content}>{article.content}</p>
      </article>

      <section className={styles.commentSection}>
        <form className={styles.commentForm} onSubmit={handleCreateComment}>
          <p className={styles.commentLabel}>댓글달기</p>

          <textarea
            className={styles.commentInput}
            placeholder="댓글을 입력해주세요."
            value={commentContent}
            onChange={(event) => setCommentContent(event.target.value)}
          />

          <div className={styles.commentButtonArea}>
            <button
              className={styles.commentSubmitButton}
              type="submit"
              disabled={!commentContent.trim() || isCommentSubmitting}
            >
              {isCommentSubmitting ? "등록 중..." : "등록"}
            </button>
          </div>
        </form>

        <div className={styles.commentList}>
          {comments.length === 0 ? (
            <div className={styles.emptyComments}>
              <Image
                src="/images/no_comment.png"
                alt="댓글 없음"
                width={80}
                height={80}
              />

              <p>아직 댓글이 없어요.</p>
              <p>지금 댓글을 달아보세요!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                onUpdate={handleUpdateComment}
                onDelete={handleDeleteComment}
              />
            ))
          )}
        </div>
      </section>

      <div className={styles.backButtonArea}>
        <button
          className={styles.backButton}
          type="button"
          onClick={() => router.push("/boards")}
        >
          목록으로 돌아가기
        </button>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps<
  BoardDetailPageProps
> = async (context) => {
  const id = context.params?.id;

  if (typeof id !== "string") {
    return {
      notFound: true,
    };
  }

  const serverUrl = `http://${context.req.headers.host}`;

  try {
    const articleResponse = await fetch(`${serverUrl}/api/articles/${id}`);

    if (articleResponse.status === 404) {
      return {
        notFound: true,
      };
    }

    if (!articleResponse.ok) {
      throw new Error("게시글을 불러오지 못했습니다.");
    }

    const article = (await articleResponse.json()) as Article;

    const commentsResponse = await fetch(
      `${serverUrl}/api/articles/${id}/comments`,
    );

    if (!commentsResponse.ok) {
      throw new Error("댓글을 불러오지 못했습니다.");
    }

    const comments = (await commentsResponse.json()) as BaseComment[];

    return {
      props: {
        initialArticle: article,
        initialComments: comments,
      },
    };
  } catch (error) {
    console.error(error);

    return {
      redirect: {
        destination: "/boards",
        permanent: false,
      },
    };
  }
};
