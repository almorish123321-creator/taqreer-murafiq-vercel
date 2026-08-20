const fs = require('fs').promises;
const path = require('path');

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    const { chatId, reportData, reportId } = req.body;
    if (!chatId || !reportData) return res.status(400).json({ success: false, error: 'Missing chatId or reportData' });

    const imgToBase64 = async (filePath) => {
      try {
        const abs = path.join(process.cwd(), 'public', filePath);
        const buf = await fs.readFile(abs);
        const ext = path.extname(filePath).toLowerCase().replace('.', '');
        const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';
        return `data:${mime};base64,${buf.toString('base64')}`;
      } catch { return ''; }
    };

    const sehaLogo = await imgToBase64('الشعارات/Seha.png');
    const ksaCalligraphy = await imgToBase64('الشعارات/ksa_calligraphy.png');
    const mohLogo = await imgToBase64('الشعارات/Saudi_Ministry_of_Health.JPG');
    const nhicLogo = await imgToBase64('الشعارات/dfhZfyJM_400x400 (1).jpg');

    const d = reportData;

    const html = `<!DOCTYPE html>
<html lang="ar" dir="ltr">
<head>
<meta charset="UTF-8">
</head>
<body>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;700&display=swap');
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  html { background: #fff !important; }
  body { margin: 0; padding: 0; background: #fff !important; width: 794px; height: 1123px; overflow: hidden; direction: ltr; }
  @page { size: 794px 1123px; margin: 0; }
  table { border-spacing: 0; direction: ltr; }
  td { font-family: 'Tajawal', 'Arial', sans-serif; }
  .label-en { border: 1px solid #dee2e6; padding: 10px 8px; font-weight: bold; color: #216ba5; font-size: 12px; width: 155px; text-decoration: underline; font-style: italic; text-align: left; }
  .label-ar { border: 1px solid #dee2e6; padding: 10px 8px; font-weight: bold; color: #216ba5; font-size: 13px; width: 155px; text-align: right; }
  .val { border: 1px solid #dee2e6; padding: 10px 8px; color: #333; font-size: 12px; }
  .dur-row td { background-color: #2b4b7c; color: white; border: 1px solid #4a6a9a; padding: 10px 8px; font-size: 12px; }
  .dur-label { font-weight: bold; }
</style>
<div style="width:794px;height:1123px;background:#fff;font-family:'Tajawal','Arial',sans-serif;position:relative;overflow:hidden;direction:ltr;">
  <img src="${sehaLogo}" style="position:absolute;top:30px;left:40px;width:120px;">
  <img src="${ksaCalligraphy}" style="position:absolute;top:20px;left:50%;transform:translateX(-50%);width:140px;height:55px;object-fit:contain;">
  <div style="position:absolute;top:78px;left:0;width:794px;text-align:center;"><p style="font-family:'Times New Roman',serif;font-size:14px;color:#000;font-weight:bold;">Kingdom of Saudi Arabia</p></div>
  <div style="position:absolute;top:108px;left:0;width:794px;text-align:center;"><h1 style="color:#216ba5;font-size:22px;font-weight:bold;font-family:'Tajawal',sans-serif;margin:0;">${d.titleAr || 'تقرير إجازة مرضية'}</h1></div>
  <div style="position:absolute;top:138px;left:0;width:794px;text-align:center;"><h2 style="color:#216ba5;font-size:14px;font-weight:bold;margin:0;">${d.titleEn || 'Sick Leave Report'}</h2></div>
  <svg width="120" height="65" viewBox="0 0 150 80" style="position:absolute;top:35px;left:634px;opacity:0.6;"><path d="M 0,10 L 40,40 L 90,10 L 130,30 L 150,0 M 40,40 L 60,70 L 90,10 M 60,70 L 130,30 M 90,10 L 110,80 L 130,30 M 110,80 L 150,60" stroke="#b0c4de" stroke-width="1.2" fill="none"/></svg>
  <div style="position:absolute;top:170px;left:40px;width:714px;height:1px;background:#dee2e6;"></div>
  <table style="position:absolute;top:185px;left:40px;width:714px;border-collapse:collapse;font-size:12px;text-align:center;table-layout:fixed;">
    <tr><td class="label-en" style="width:155px;">Leave ID</td><td class="val" colspan="2" style="width:404px;">${d.leaveId || ''}</td><td class="label-ar" style="width:155px;">رمز الإجازة</td></tr>
    <tr class="dur-row"><td class="dur-label" style="width:155px;">Leave Duration</td><td style="width:202px;">${d.durationEn || ''}</td><td dir="rtl" style="width:202px;">${d.durationAr || ''}</td><td class="dur-label" style="width:155px;">مدة الإجازة</td></tr>
    <tr><td class="label-en">Admission Date</td><td class="val">${d.admissionG || ''}</td><td class="val">${d.admissionH || ''}</td><td class="label-ar">تاريخ الدخول</td></tr>
    <tr><td class="label-en">Discharge Date</td><td class="val">${d.dischargeG || ''}</td><td class="val">${d.dischargeH || ''}</td><td class="label-ar">تاريخ الخروج</td></tr>
    <tr><td class="label-en">Issue Date</td><td class="val" colspan="2">${d.issueDate || ''}</td><td class="label-ar">تاريخ إصدار التقرير</td></tr>
    <tr><td class="label-en">${d.nameLabelEn || 'Name'}</td><td class="val">${d.nameEn || ''}</td><td class="val">${d.nameAr || ''}</td><td class="label-ar">${d.nameLabelAr || 'الاسم'}</td></tr>
    <tr><td class="label-en">National ID / Iqama</td><td class="val" colspan="2">${d.nationalId || ''}</td><td class="label-ar">رقم الهوية/الاقامه</td></tr>
    <tr><td class="label-en">Nationality</td><td class="val">${d.nationalityEn || 'Saudi Arabia'}</td><td class="val">${d.nationalityAr || 'السعودية'}</td><td class="label-ar">الجنسية</td></tr>
    ${d.relationEn ? `<tr><td class="label-en">Relation</td><td class="val">${d.relationEn}</td><td class="val">${d.relationAr || ''}</td><td class="label-ar">صلة القرابة</td></tr>` : ''}
    <tr><td class="label-en">Employer</td><td class="val">${d.employerEn || ''}</td><td class="val">${d.employerAr || ''}</td><td class="label-ar">جهة العمل</td></tr>
    <tr><td class="label-en">${d.docLabelEn || 'Practitioner Name'}</td><td class="val">${d.doctorEn || ''}</td><td class="val">${d.doctorAr || ''}</td><td class="label-ar">${d.docLabelAr || 'اسم الممارس'}</td></tr>
    <tr><td class="label-en">Position</td><td class="val">${d.positionEn || ''}</td><td class="val">${d.positionAr || ''}</td><td class="label-ar">المسمى الوظيفى</td></tr>
  </table>
  <div style="position:absolute;bottom:45px;left:40px;width:300px;">
    <div style="text-align:left;margin-bottom:8px;"><img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${encodeURIComponent(d.leaveId || 'SEHA')}" style="width:100px;height:100px;"></div>
    <p style="font-size:10px;font-weight:bold;font-family:'Tajawal',sans-serif;text-align:center;margin:0 0 2px 0;">للتحقق من بيانات التقرير يرجى التأكد من زيارة موقع منصة صحة<br>الرسمي</p>
    <p style="font-size:9px;color:#555;text-align:center;margin:0 0 2px 0;font-style:italic;">To check the report please visit Seha's offical website</p>
    <p style="font-size:9px;color:#1a73e8;text-align:center;margin:0 0 15px 0;text-decoration:underline;">www.seha.sa/#/inquiries/slenquiry</p>
    <div style="text-align:left;font-weight:bold;font-size:11px;color:#000;">
      <p style="margin:0 0 3px 0;">${d.time || ''}</p>
      <p style="margin:0;">${d.dayDate || ''}</p>
    </div>
  </div>
  <div style="position:absolute;bottom:45px;left:397px;width:1px;height:200px;background-color:#d0d0d0;"></div>
  <div style="position:absolute;bottom:45px;left:454px;width:300px;text-align:center;">
    <div style="margin-bottom:8px;"><img src="${mohLogo}" style="height:80px;"></div>
    <h3 style="font-size:14px;font-weight:bold;font-family:'Tajawal',sans-serif;margin:0 0 3px 0;color:#333;">${d.hospitalAr || ''}</h3>
    <h4 style="font-size:12px;font-weight:bold;font-family:'Arial',sans-serif;margin:0 0 3px 0;color:#333;">${d.hospitalEn || ''}</h4>
    ${d.licenseNumber ? `<p style="font-size:10px;color:#555;margin:0 0 10px 0;">رقم الترخيص : ${d.licenseNumber}</p>` : '<div style="height:10px;"></div>'}
    <div><img src="${nhicLogo}" style="height:55px;"></div>
  </div>
</div>
</body>
</html>`;

    res.status(200).json({ success: true, html, reportId });
  } catch (err) {
    console.error('Error generating HTML for PDF:', err);
    res.status(500).json({ success: false, error: err.message });
  }
};
