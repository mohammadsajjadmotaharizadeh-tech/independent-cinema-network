# ICN Live Director Portal — Vercel Ready

این نسخه اتصال واقعی چت را دارد.

## استقرار سریع روی Vercel
1. پوشه را در یک repository خصوصی قرار دهید یا مستقیم در Vercel Import کنید.
2. در Project Settings > Environment Variables این متغیرها را وارد کنید:
   - OPENAI_API_KEY
   - OPENAI_MODEL = gpt-5.6
   - SESSION_SECRET
   - SUDDEN_USERNAME
   - SUDDEN_PASSWORD
   - BATTLE_USERNAME
   - BATTLE_PASSWORD
3. Deploy کنید.
4. آدرس سایت را باز کنید و با یکی از دو حساب وارد شوید.

## امنیت
نام کاربری و رمز دیگر داخل HTML نیستند و روی سرور بررسی می‌شوند.
OPENAI_API_KEY فقط روی Vercel Environment Variables قرار می‌گیرد.
توکن ورود با HMAC امضا می‌شود و ۱۲ ساعت اعتبار دارد.

## چت
/api/chat پیام را به ایجنت همان فیلم می‌فرستد.
پرامپت هر فیلم سمت سرور در agent-prompts.json نگهداری می‌شود.
