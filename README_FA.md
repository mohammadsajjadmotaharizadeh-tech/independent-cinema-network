# ICN — بسته جایگزینی کامل سایت

این پوشه برای جایگزینی کامل فایل‌های قبلی Repository ساخته شده است.

محتویات:
- index.html : صفحه اصلی کامل سایت
- portal.html : پنل امن کارگردان
- film-data.json : داده و تحلیل دو فیلم
- agent-prompts.json : دستور ایجنت هر فیلم
- api/ : ورود، وضعیت و چت
- package.json
- vercel.json
- .env.example

## مهم
برای چت واقعی و ورود امن باید روی Vercel یا هاست دارای Serverless/Node deploy شود.
GitHub Pages فقط صفحات HTML را نشان می‌دهد و API را اجرا نمی‌کند.

## متغیرهای لازم در Vercel
OPENAI_API_KEY
OPENAI_MODEL
SESSION_SECRET
SUDDEN_USERNAME
SUDDEN_PASSWORD
BATTLE_USERNAME
BATTLE_PASSWORD

رمزها را داخل Repository عمومی قرار ندهید.
