const express = require("express");
const { Telegraf, Markup } = require("telegraf");

const BOT_TOKEN = process.env.BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL;
const PORT = Number(process.env.PORT || 3000);

if (!BOT_TOKEN) {
  throw new Error("Falta la variable de entorno BOT_TOKEN");
}

if (!WEBHOOK_URL) {
  throw new Error("Falta la variable de entorno WEBHOOK_URL");
}

const bot = new Telegraf(BOT_TOKEN);
const app = express();

app.use(express.json());

const menu = Markup.keyboard([
  ["📡 Propagación", "☀️ Datos solares"],
  ["🕒 Hora UTC", "📻 Bandas HF"],
  ["ℹ️ Ayuda"]
]).resize();

bot.start(async (ctx) => {
  await ctx.reply(
    `👋 Hola, soy EA2FMOBot.

Soy tu asistente de radio y propagación.

Esta es la primera versión de prueba. Muy pronto consultaré datos reales de todas las bandas.`,
    menu
  );
});

bot.command("help", async (ctx) => {
  await ctx.reply(
    `Comandos disponibles:

/start — Abrir el menú
/propa — Propagación
/solar — Datos solares
/bandas — Bandas HF
/help — Ayuda`
  );
});

bot.command("propa", async (ctx) => {
  await ctx.reply(
    "📡 La consulta de propagación real se añadirá en el siguiente paso."
  );
});

bot.command("solar", async (ctx) => {
  await ctx.reply(
    "☀️ La consulta de índices solares reales se añadirá próximamente."
  );
});

bot.command("bandas", async (ctx) => {
  await ctx.reply(
    `📻 Bandas que analizaremos:

160, 80, 60, 40, 30, 20, 17, 15, 12, 11 y 10 metros.`
  );
});

bot.hears("📡 Propagación", async (ctx) => {
  await ctx.reply(
    "📡 La consulta de propagación real se añadirá en el siguiente paso."
  );
});

bot.hears("☀️ Datos solares", async (ctx) => {
  await ctx.reply(
    "☀️ Próximamente mostraré SFI, Kp, A, manchas solares y alertas."
  );
});

bot.hears("📻 Bandas HF", async (ctx) => {
  await ctx.reply(
    "📻 Analizaré desde 160 metros hasta 10/11 metros."
  );
});

bot.hears("ℹ️ Ayuda", async (ctx) => {
  await ctx.reply("Escribe /help para ver todos los comandos.");
});

bot.hears("🕒 Hora UTC", async (ctx) => {
  const ahora = new Date().toUTCString();
  await ctx.reply(`🕒 Hora UTC:\n${ahora}`);
});
bot.hears("☀️ Datos solares", async (ctx) => {
  await ctx.reply(`☀️ Datos solares

🔄 Conectando con el servicio...

Próximamente mostraré:
• SFI
• Índice K
• Índice A
• Manchas solares`);
});
app.get("/", (_req, res) => {
  res.status(200).send("EA2FMOBot está funcionando.");
});

app.post("/telegram", bot.webhookCallback("/telegram"));

app.listen(PORT, async () => {
  const webhook = `${WEBHOOK_URL.replace(/\/$/, "")}/telegram`;

  try {
    await bot.telegram.setWebhook(webhook);
    console.log(`EA2FMOBot funcionando en el puerto ${PORT}`);
    console.log(`Webhook configurado: ${webhook}`);
  } catch (error) {
    console.error("No se pudo configurar el webhook:", error);
    process.exit(1);
  }
});
