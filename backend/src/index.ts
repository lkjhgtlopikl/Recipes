import express from "express";
import * as trpcExp from "@trpc/server/adapters/express";
import { trpcRouter } from "./router/index";
import cors from "cors";
import { createContext } from "./lib/ctx";
import multer from 'multer';
import { uploadToCloudinary } from './lib/uploadToCloudinary';

const upload = multer({ storage: multer.memoryStorage() });
try {
  const app = express();
  app.use(cors(
    {
      origin: "http://localhost:5173",
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,

    }
  ));

  app.post('/upload', upload.single('image'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Файл не найден' });
      }

      const folder = req.body.folder || 'recipes';
      const url = await uploadToCloudinary(req.file.buffer, folder);
      res.json({ url });
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      res.status(500).json({ error: 'Не удалось загрузить изображение' });
    }
  });
  app.use(
    "/trpc",
    trpcExp.createExpressMiddleware({
      router: trpcRouter,
      createContext,
    }),
  );
  app.listen(3000, () => {
    console.info("listening at http://localhost:3000");
  });


} catch (error) {
  console.error(error);
}


