import { ReactNode } from "react";

type StructuredAnswerProps = {
  summary: string;
  /** What follows the summary text, if anything. */
  summaryEnd?: ReactNode;
  /** Each bullet's text, and what follows it: its citations, or the caret. */
  bullets: Array<{ text: string; end?: ReactNode }>;
};

/**
 * The one layout every answer uses, finished or still arriving: a summary,
 * then bullets. An empty summary, or a draft with no bullets yet, is left out.
 */
export default function StructuredAnswer({
  summary,
  summaryEnd,
  bullets,
}: StructuredAnswerProps) {
  return (
    <div className="review-chat-structured">
      {summary ? (
        <p className="review-chat-summary">
          {summary}
          {summaryEnd}
        </p>
      ) : null}
      {bullets.length > 0 ? (
        <ul className="review-chat-bullet-list">
          {bullets.map((bullet, index) => (
            <li key={index} className="review-chat-bullet-item">
              <span>{bullet.text}</span>
              {bullet.end}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
