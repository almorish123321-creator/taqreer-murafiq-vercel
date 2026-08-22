const { upsertInquiry } = require('../lib/inquiry-store');

module.exports = async (req, res) => {
    try {
        if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

        const body = req.body;
        const record = {
            gsl_code: body.leave_id || '',
            identity_number: body.identity_number || '',
            name_ar: body.patient_name_ar || '',
            name_en: body.patient_name_en || '',
            nationality_ar: body.nationality_ar || '',
            nationality_en: body.nationality_en || '',
            employer_ar: body.employer_ar || '',
            employer_en: body.employer_en || '',
            doctor_name_ar: body.doctor_name_ar || '',
            doctor_name_en: body.doctor_name_en || '',
            doctor_specialty_ar: body.doctor_specialty_ar || '',
            doctor_specialty_en: body.doctor_specialty_en || '',
            hospital_name_ar: body.hospital_name_ar || '',
            hospital_name_en: body.hospital_name_en || '',
            hospital_type: body.hospital_type || 'public',
            license_number: body.license_number || '',
            date_from: body.admission_date || '',
            date_to: body.discharge_date || '',
            day_count: body.day_count || 1,
            issue_date: body.issue_date || '',
            time_from: body.time || '',
            leave_type: body.leave_type || 'sick'
        };

        await upsertInquiry(record);
        console.log('[upload-inquiry] Saved:', record.gsl_code, 'for ID:', record.identity_number);

        res.status(200).json({ success: true, message: 'تم حفظ بيانات الاستعلام بنجاح' });
    } catch (err) {
        console.error('[upload-inquiry] Error:', err);
        res.status(500).json({ success: false, message: 'فشل حفظ البيانات: ' + (err.message || 'خطأ غير متوقع') });
    }
};
