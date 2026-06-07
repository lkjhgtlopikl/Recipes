import { useState, ChangeEvent } from "react";

interface ImgProps {
  currentUrl: string;
  onUploaded: (url: string) => void;
  folder?: string;
}

export function Img({ currentUrl, onUploaded, folder = "recipes" }: ImgProps) {
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", folder);

    setIsUploading(true);
    try {
      const res = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      onUploaded(data.url); // <-- передаём URL в форму
    } catch (err) {
      console.error("Ошибка загрузки:", err);
      alert("Не удалось загрузить изображение");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      {isUploading && <p>Загрузка...</p>}
      {currentUrl && (
        <div>
          <img
            src={currentUrl}
            alt="Предпросмотр"
            style={{ maxWidth: "200px" }}
          />
          <p>Текущее фото</p>
        </div>
      )}
    </div>
  );
}
