interface ErrorPageProps {
  message?: string;
  onRetry?: () => void;
}
export const Err = ({
  message = "Что-то пошло не так. Попробуйте обновить страницу.",
  onRetry,
}: ErrorPageProps) => (
  <div className="container" style={styles.wrapper}>
    <div style={styles.icon}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        fill="#e07a5f"
        viewBox="0 0 16 16"
      >
        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
        <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z" />
      </svg>
    </div>
    <h2 style={styles.title}>Упс! Что-то пошло не так</h2>
    <p style={styles.message}>{message}</p>
    <div style={styles.actions}>
      {onRetry && (
        <button onClick={onRetry} className="btn btn-primary">
          Попробовать снова
        </button>
      )}
      <a href="/" className="btn btn-outline">
        На главную
      </a>
    </div>
  </div>
);
const styles = {
  wrapper: {
    textAlign: "center" as const,
    padding: "80px 20px",
    maxWidth: 500,
    margin: "0 auto",
  },
  icon: { marginBottom: "20px" },
  title: {
    color: "#1e2b1f",
    marginBottom: "10px",
    fontSize: "1.8rem",
    fontWeight: 600,
  },
  message: {
    color: "#5c6b5e",
    marginBottom: "30px",
    fontSize: "1.1rem",
    lineHeight: 1.6,
  },
  actions: {
    display: "flex",
    gap: 12,
    justifyContent: "center",
    flexWrap: "wrap" as const,
  },
};
