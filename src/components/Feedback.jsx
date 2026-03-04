export default function Feedback({ feedback }) {
  if (!feedback) return null;
  return (
    <div className={feedback.ok ? "feedback-success" : "feedback-error"}>
      {feedback.msg}
    </div>
  );
}
