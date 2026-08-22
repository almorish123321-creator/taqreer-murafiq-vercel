const { loadLocalSubscriptions, saveLocalSubscriptions } = require('./db');

async function upsertInquiry(record) {
    const data = await loadLocalSubscriptions();
    if (!data.inquiries) data.inquiries = [];
    
    const existingIdx = data.inquiries.findIndex(
        r => r.gsl_code && r.identity_number
            && r.gsl_code.toLowerCase() === (record.gsl_code || '').toLowerCase()
            && r.identity_number === (record.identity_number || '')
    );

    if (existingIdx >= 0) {
        data.inquiries[existingIdx] = { ...data.inquiries[existingIdx], ...record, updated_at: new Date().toISOString() };
    } else {
        data.inquiries.push({
            ...record,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        });
    }

    await saveLocalSubscriptions(data);
    return record;
}

async function searchInquiry(serviceCode, nationalId) {
    const data = await loadLocalSubscriptions();
    const inquiries = data.inquiries || [];
    return inquiries.find(
        r => r.gsl_code && r.identity_number
            && r.gsl_code.toLowerCase() === serviceCode.toLowerCase()
            && r.identity_number === nationalId
    );
}

module.exports = {
    upsertInquiry,
    searchInquiry
};
