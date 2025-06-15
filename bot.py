from telegram import Update, KeyboardButton, ReplyKeyboardMarkup, WebAppInfo
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes

BOT_TOKEN = "7211672303:AAESDni7WJlSmJxdIHRHwK-dSCtnM8B8gNs"
WEBAPP_URL = "https://guestmaxtop001.github.io/conflict-bot-webapp/"  # нова адреса WebApp

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    keyboard = [
        [KeyboardButton("🖥 Відкрити WebApp", web_app=WebAppInfo(url=WEBAPP_URL))]
    ]
    reply_markup = ReplyKeyboardMarkup(keyboard, resize_keyboard=True)

    await update.message.reply_text(
        "Привіт, командире! Натисни кнопку нижче, щоб відкрити застосунок.",
        reply_markup=reply_markup
    )

async def handle_webapp_data(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.message.web_app_data:
        data = update.message.web_app_data.data
        await update.message.reply_text(f"✅ Дані з WebApp отримано:\n\n{data}")
    else:
        await update.message.reply_text("⚠️ Немає даних із WebApp.")

def main():
    app = ApplicationBuilder().token(BOT_TOKEN).build()

    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.StatusUpdate.WEB_APP_DATA, handle_webapp_data))

    print("✅ Бот запущено.")
    app.run_polling()

if __name__ == "__main__":
    main()
