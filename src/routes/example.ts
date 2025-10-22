import { Hono } from "hono";
import { AppError } from "../utils/app-error.js";
import type { AppEnv } from "../types/app.js";

const app = new Hono<AppEnv>();

// Custom error kullanım örnekleri
app.get("/examples", (c) => {
  const examples = [
    {
      method: "AppError.badRequest()",
      description: "400 Bad Request hatası",
      example:
        "throw AppError.badRequest('Geçersiz parametre', { field: 'email' })",
    },
    {
      method: "AppError.unauthorized()",
      description: "401 Unauthorized hatası",
      example: "throw AppError.unauthorized('Token geçersiz')",
    },
    {
      method: "AppError.forbidden()",
      description: "403 Forbidden hatası",
      example: "throw AppError.forbidden('Bu kaynağa erişim yetkiniz yok')",
    },
    {
      method: "AppError.notFound()",
      description: "404 Not Found hatası",
      example:
        "throw AppError.notFound('Kullanıcı bulunamadı', { userId: 123 })",
    },
    {
      method: "AppError.conflict()",
      description: "409 Conflict hatası",
      example: "throw AppError.conflict('Email zaten kullanılıyor')",
    },
    {
      method: "AppError.unprocessable()",
      description: "422 Unprocessable Entity hatası",
      example: "throw AppError.unprocessable('Veri formatı hatalı')",
    },
    {
      method: "AppError.tooManyRequests()",
      description: "429 Too Many Requests hatası",
      example: "throw AppError.tooManyRequests('Çok fazla istek gönderdiniz')",
    },
    {
      method: "AppError.internal()",
      description: "500 Internal Server Error hatası",
      example: "throw AppError.internal('Veritabanı bağlantı hatası')",
    },
    {
      method: "Custom AppError",
      description: "Özel hata oluşturma",
      example:
        "throw new AppError('Özel hata mesajı', { status: 418, code: 'TEAPOT' })",
    },
  ];

  return c.json({
    success: true,
    data: examples,
    message: "Custom error kullanım örnekleri",
  });
});

// Test endpoint'leri
app.get("/test/bad-request", () => {
  throw AppError.badRequest("Test bad request hatası", { test: true });
});

app.get("/test/unauthorized", () => {
  throw AppError.unauthorized("Test unauthorized hatası");
});

app.get("/test/not-found", () => {
  throw AppError.notFound("Test not found hatası", { resource: "user" });
});

app.get("/test/custom", () => {
  throw new AppError("Özel test hatası", {
    status: 418,
    code: "I_AM_A_TEAPOT",
    details: { reason: "Test amaçlı" },
  });
});

export default app;
