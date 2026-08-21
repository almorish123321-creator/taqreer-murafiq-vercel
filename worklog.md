---
Task ID: 1
Agent: Main
Task: إصلاح تنسيق PDF + خطأ الطباعة + لوحة الاستعلامات + رفع البيانات

Work Log:
- استكشف المستودع بالكامل (taqreer-murafiq, taqreer-vercel, almoqeesehh-main)
- اكتشف pdf-generator.ts (1735 سطر) كمرجع أصلي للتنسيقات
- اكتشف لوحة الاستعلامات في almoqeesehh-main (inquiry/page.tsx + API routes)
- نسخ ملفات خط NotoSansArabic TTF إلى taqreer-vercel/public/fonts/
- أضاف @font-face declarations في pdf-template.html للخطوط المحلية
- أصلح QR Code ليستخدم مكتبة QRCode.js المحلية بدل API خارجي
- أصلح دالة printLastPdf() لتستخدم blob URL بدل iframe
- أزال تحميل app.js المزدود من head في index.html
- أصلح خطأ HTML (missing quote في job_title_ar)
- أنشأ لوحة الاستعلامات (inquiry.html) بتنسيقات منصة صحة الأصلية
- أنشأ API /api/upload-inquiry لحفظ بيانات الاستعلام
- أنشأ API /api/inquiry للبحث (GET + POST)
- أنشأ lib/inquiry-store.js للتخزين
- أضاف رفع البيانات تلقائياً بعد توليد PDF في app.js
- نشر على Vercel (3 مرات لإصلاح مشاكل)

Stage Summary:
- تم نشر 4 ميزات جديدة على https://taqreer-vercel.vercel.app
- لوحة الاستعلامات: https://taqreer-vercel.vercel.app/inquiry.html
- ملاحظة: تخزين الاستعلامات يعتمد على /tmp (غير مستمر على Vercel بدون DB)
