export const Load = ({ text = "Загружаем..." }: { text?: string }) => (
  <div className="container" style={styles.center}>
    <div className="spinner-grow text-success" />
    <p style={styles.text}>{text}</p>
  </div>
);

const styles = {
  center: {
    display: "flex",
    flexDirection: "column" as const,
    alignItems: "center",
    justifyContent: "center",
    padding: "80px 20px",
    minHeight: "50vh",
  },
  text: {
    marginTop: "20px",
    color: "#5c6b5e",
    fontSize: "1.1rem",
    fontWeight: 500,
  },
};
