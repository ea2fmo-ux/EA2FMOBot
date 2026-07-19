const express = require("express");
const { Telegraf, Markup } = require("telegraf");
const xml2js = require("xml2js");

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
  try {
    const axios = require("axios");
    const xml2js = require("xml2js");

    const { data } = await axios.get("https://www.hamqsl.com/solarxml.php");

    const resultado = await xml2js.parseStringPromise(data, {
      explicitArray: false,
      trim: true
    });

    const solar = resultado.solar.solardata;
    console.log(solar);
    const mufTexto = solar.muf;
const muf = Number(mufTexto);
const hayMuf = !isNaN(muf);
    const sfi = Number(solar.solarflux);
    const k = Number(solar.kindex);

    let mensaje =
`📡 Estado de propagación

🌐 MUF: ${hayMuf ? muf + " MHz" : "No disponible"}

`;

if (muf >= 28 && k <= 2) {

  mensaje += `
🟢 10 m → Excelente para DX
🟢 12 m → Muy buena
🟢 15 m → Muy buena
🟢 17 m → Buena
🟢 20 m → Excelente
🟡 40 m → Normal
🟢 80 m → Buena por la noche

💡 Hoy merece la pena probar 10, 15 y 20 metros.
`;

} else if (muf >= 21 && k <= 3) {

  mensaje += `
🟡 10 m → Variable
🟢 15 m → Buena
🟢 20 m → Muy buena
🟢 40 m → Buena

💡 Las mejores bandas serán 15, 20 y 40 metros.
`;

} else if (muf >= 14) {

  mensaje += `
🔴 10 m → Cerrada
🟡 12 m → Variable
🟡 15 m → Regular
🟡 20 m → Buena
🟢 40 m → Buena
🟢 80 m → Muy buena

💡 Hoy conviene centrarse en 20, 40 y 80 metros.
`;

} else {

  mensaje += `
🔴 10 m → Cerrada
🔴 12 m → Cerrada
🔴 15 m → Muy difícil
🟡 20 m → Variable
🟢 40 m → Buena
🟢 80 m → Muy buena

💡 Hoy céntrate en 40 y 80 metros.
`;

}

    await ctx.reply(mensaje);

  } catch (error) {
    await ctx.reply("❌ No se ha podido obtener la propagación.");
  }
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
  try {
    const axios = require("axios");

   const { data } = await axios.get("https://www.hamqsl.com/solarxml.php");

    const resultado = await xml2js.parseStringPromise(data, {
  explicitArray: false,
  trim: true
});

const solar = resultado.solar.solardata;

const sfi = Number(solar.solarflux);
const k = Number(solar.kindex);
const a = Number(solar.aindex);
const xray = solar.xray;

const estadoSFI =
  sfi >= 100 ? "🟢 Excelente" :
  sfi >= 70 ? "🟡 Normal" :
  "🔴 Baja";

const estadoK =
  k <= 1 ? "🟢 Muy estable" :
  k == 2 ? "🟢 Estable" :
  k == 3 ? "🟡 Inestable" :
  k == 4 ? "🟠 Activo" :
  "🔴 Tormenta";

const estadoA =
  a <= 7 ? "🟢 Tranquilo" :
  a <= 15 ? "🟡 Ligera actividad" :
  a <= 29 ? "🟠 Activo" :
  "🔴 Muy perturbado";

const letraX = xray.charAt(0);

const estadoX =
  letraX === "A" ? "🟢 Muy baja" :
  letraX === "B" ? "🟢 Baja" :
  letraX === "C" ? "🟡 Moderada" :
  letraX === "M" ? "🟠 Fuerte" :
  "🔴 Extrema";

await ctx.reply(
  "☀️ Datos solares\n\n" +
  `📡 SFI: ${sfi} ${estadoSFI}\n` +
  `🌍 Índice K: ${k} ${estadoK}\n` +
  `📈 Índice A: ${a} ${estadoA}\n` +
  `☀️ Manchas solares: ${solar.sunspots}\n` +
  `☢️ Rayos X: ${xray} ${estadoX}`
);
  } catch (error) {
    await ctx.reply("❌ No se ha podido conectar con el servidor de datos solares.");
  }
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
