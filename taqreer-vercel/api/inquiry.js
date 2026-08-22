const { searchInquiry } = require('../lib/inquiry-store');

function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return String(dateStr);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${day}-${month}-${year}`;
}

// POST /api/inquiry
async function handlePost(req, res) {
    try {
        const body = req.body;
        const serviceCode = String(body?.service_code || '').trim();
        const nationalId = String(body?.national_id || '').trim();

        if (!serviceCode || !nationalId) {
            return res.status(400).json({ success: false, message: 'يرجى إدخال رمز الخدمة ورقم الهوية.' });
        }

        const record = await searchInquiry(serviceCode, nationalId);

        if (record) {
            return res.status(200).json({
                success: true,
                data: {
                    name: record.name_ar || '',
                    issue_date: formatDate(record.issue_date),
                    date_from: formatDate(record.date_from),
                    date_to: formatDate(record.date_to),
                    day_count: record.day_count || 0,
                    doctor_name: record.doctor_name_ar || '',
                    doctor_specialty: record.doctor_specialty_ar || ''
                }
            });
        }

        return res.status(404).json({ success: false, message: 'خطأ في الاستعلام' });
    } catch (err) {
        console.error('[inquiry POST] Error:', err);
        return res.status(500).json({ success: false, message: 'حدث خطأ أثناء الاتصال بالنظام، يرجى المحاولة لاحقًا.' });
    }
}

// GET /api/inquiry?code=XXX&identity=XXX
async function handleGet(req, res) {
    try {
        const code = (req.query.code || '').trim();
        const identity = (req.query.identity || '').trim();

        if (!code || !identity) {
            return res.status(400).json({ success: false, message: 'يرجى إدخال رمز الخدمة ورقم الهوية.' });
        }

        const record = await searchInquiry(code, identity);

        if (record) {
            return res.status(200).json({
                success: true,
                data: {
                    name: record.name_ar || '',
                    issue_date: formatDate(record.issue_date),
                    date_from: formatDate(record.date_from),
                    date_to: formatDate(record.date_to),
                    day_count: record.day_count || 0,
                    doctor_name: record.doctor_name_ar || '',
                    doctor_specialty: record.doctor_specialty_ar || ''
                }
            });
        }

        return res.status(404).json({ success: false, message: 'خطأ في الاستعلام' });
    } catch (err) {
        console.error('[inquiry GET] Error:', err);
        return res.status(500).json({ success: false, message: 'خطأ في الاستعلام' });
    }
}

module.exports = async (req, res) => {
    if (req.method === 'POST') return handlePost(req, res);
    if (req.method === 'GET') return handleGet(req, res);
    res.status(405).json({ error: 'Method not allowed' });
};
