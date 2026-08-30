import { ChatMessage } from "../types";
import { getInlineCitationItems, shouldShowLegacyCitationList } from "../view-model";

type AnswerSectionsProps = {
  message: ChatMessage;
  messageKey: string;
};

export default function AnswerSections({
  message,
  messageKey,
}: AnswerSectionsProps) {
  if ( !message.summary || !message.bullets?.length ) {
    return (
      <>
        <div className="review-chat-body">{message.content}</div>
        {shouldShowLegacyCitationList(message) ? (
          <div className="review-chat-inline-citations review-chat-inline-citations-block">
            {getInlineCitationItems({
              citations: message.citations,
              citationIndices: message.citations.map((_, citationIndex) => citationIndex),
            }).map((citation, citationIndex) =>
              citation.sourceUrl ? (
                <a
                  key={`${messageKey}-legacy-${citationIndex}`}
                  href={citation.sourceUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="review-chat-inline-citation"
                >
                  {citation.label}
                </a>
              ) : (
                <span
                  key={`${messageKey}-legacy-${citationIndex}`}
                  className="review-chat-inline-citation is-static"
                >
                  {citation.label}
                </span>
              ),
            )}
          </div>
        ) : null}
      </>
    );
  }

  return (
    <div className="review-chat-structured">
      <p className="review-chat-summary">{message.summary}</p>
      <ul className="review-chat-bullet-list">
        {message.bullets.map((bullet, bulletIndex) => (
          <li
            key={`${messageKey}-bullet-${bulletIndex}`}
            className="review-chat-bullet-item"
          >
            <span>{bullet.text}</span>
            {bullet.citationIndices.length > 0 ? (
              <span className="review-chat-inline-citations">
                {getInlineCitationItems({
                  citations: message.citations,
                  citationIndices: bullet.citationIndices,
                }).map((citation, citationIndex) =>
                  citation.sourceUrl ? (
                    <a
                      key={`${messageKey}-${bulletIndex}-${citationIndex}`}
                      href={citation.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="review-chat-inline-citation"
                    >
                      {citation.label}
                    </a>
                  ) : (
                    <span
                      key={`${messageKey}-${bulletIndex}-${citationIndex}`}
                      className="review-chat-inline-citation is-static"
                    >
                      {citation.label}
                    </span>
                  ),
                )}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
    </div>
  );
}
