import { PendingAnswerView } from "../view-model";
import ChatTurn from "./ChatTurn";
import StructuredAnswer from "./StructuredAnswer";

function Caret() {
  return <span className="review-chat-caret" aria-hidden="true"/>;
}

/**
 * The answer while it is still arriving: its stage until the model starts
 * writing, then the text so far in the finished answer's layout. Citations
 * come only with the finished answer, which replaces this one.
 */
export default function StreamingAnswer({ answer }: { answer: PendingAnswerView }) {
  return (
    <ChatTurn role="assistant" busy>
      {answer.caret === "label" ? (
        <div className="review-chat-body review-chat-body-pending">
          {answer.stageLabel}
          <Caret/>
        </div>
      ) : (
        <StructuredAnswer
          summary={answer.summary}
          summaryEnd={answer.caret === "summary" ? <Caret/> : null}
          bullets={answer.bullets.map((text, index) => ({
            text,
            end: answer.caret === index ? <Caret/> : null,
          }))}
        />
      )}
    </ChatTurn>
  );
}
