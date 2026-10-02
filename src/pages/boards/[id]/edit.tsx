import { useEffect, useState } from "react";
import type { SubmitEvent } from "react";
import { useRouter } from "next/router";
import type { ErrorResponse } from "@/types/api";
import type { Article } from "@/types/article";
import styles from "../BoardForm.module.css";

export default function BoardEditPage() {
  const router = useRouter();
  const id = typeof router.query.id === "string" ? router.query.id : null;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!router.isReady || !id) return;

    async function getArticle() {
      try {
        const response = await fetch(`/api/articles/${id}`);
        const data = (await response.json()) as Article | ErrorResponse;

        if (!response.ok) {
          throw new Error(
            (data as ErrorResponse).message || "게시글을 불러오지 못했습니다.",
          );
        }

        const article = data as Article;

        setTitle(article.title);
        setContent(article.content);
      } catch (error) {
        console.error(error);

        const message =
          error instanceof Error
            ? error.message
            : "게시글 조회 중 오류가 발생했습니다.";

        alert(message);
        router.push("/boards");
      } finally {
        setIsLoading(false);
      }
    }

    getArticle();
  }, [router.isReady, id, router]);

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!id || !title.trim() || !content.trim() || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch(`/api/articles/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      });

      const data = (await response.json()) as Article | ErrorResponse;

      if (!response.ok) {
        throw new Error(
          (data as ErrorResponse).message || "게시글을 수정하지 못했습니다.",
        );
      }

      const article = data as Article;

      router.push(`/boards/${article.id}`);
    } catch (error) {
      console.error(error);

      const message =
        error instanceof Error
          ? error.message
          : "게시글 수정 중 오류가 발생했습니다.";

      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return <p>게시글을 불러오는 중입니다.</p>;
  }

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.formHeader}>
          <h1 className={styles.pageTitle}>게시글 수정</h1>

          <button
            className={styles.submitButton}
            type="submit"
            disabled={!title.trim() || !content.trim() || isSubmitting}
          >
            {isSubmitting ? "수정 중" : "수정 완료"}
          </button>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>*제목</label>

          <input
            className={styles.titleInput}
            type="text"
            placeholder="제목을 입력해주세요"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>*내용</label>

          <textarea
            className={styles.contentInput}
            placeholder="내용을 입력해주세요"
            value={content}
            onChange={(event) => setContent(event.target.value)}
          />
        </div>
      </form>
    </div>
  );
}
