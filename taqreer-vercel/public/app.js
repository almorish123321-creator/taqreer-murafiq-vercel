const app = {
    tg: window.Telegram ? window.Telegram.WebApp : null,
    state: {
        chatId: null,
        user: null,
        points: 0,
        subscriptionDays: 0,
        reports: [],
        currentStep: 1,
        leaveType: 'sickleave', // 'sickleave' or 'companion'
        hospitalLogoUrl: './الشعارات/Saudi_Ministry_of_Health.JPG' // Default MOH logo
    },

    currentDropdown: null,
    dropdownData: {
        nationality: [
            "السعودية", "الإمارات", "البحرين", "الكويت", "عمان", "قطر", "اليمن", "الأردن", "سوريا", "لبنان", "فلسطين", "العراق", "مصر", "السودان", "ليبيا", "تونس", "الجزائر", "المغرب", "موريتانيا", "الصومال", "جيبوتي", "جزر القمر", "الهند", "باكستان", "بنجلاديش", "أفغانستان", "إندونيسيا", "ماليزيا", "الفلبين", "سريلانكا", "نيبال", "تركيا", "إيران", "الصين", "اليابان", "كوريا الجنوبية", "روسيا", "الولايات المتحدة", "بريطانيا", "فرنسا", "ألمانيا", "إيطاليا", "إسبانيا", "كندا", "أستراليا", "البرازيل", "الأرجنتين", "المكسيك", "جنوب أفريقيا", "نيجيريا", "إثيوبيا", "كينيا", "أوغندا", "تشاد", "النيجر", "مالي", "السنغال"
        ],
        hospital: [
        "مستشفى نجران العام",
        "مستشفى الملك عبدالعزيز التخصصي",
        "مستشفى الملك فيصل",
        "مستشفى القوات المسلحة بالهدا",
        "مستشفى الملك خالد ومركز الأمير سلطان للخدمات الصحية",
        "مستشفى الملك خالد",
        "مستشفى حفر الباطن المركزي",
        "مستشفى الملك فهد للقوات المسلحة",
        "مستشفى الملك خالد الجامعي",
        "مستشفى القريع بني مالك العام",
        "مستشفى الطائف العام",
        "مستشفى ميسان العام",
        "مستشفى السحن بني سعد العام",
        "مستشفى قيا العام",
        "مستشفى المحاني العام",
        "مستشفى ظلم العام",
        "مستشفى المويه العام",
        "مستشفى الملك عبدالعزيز التخصصي بالطائف",
        "مستشفى الصحة النفسية بالطائف",
        "مستشفى إرادة والصحة النفسية",
        "مستشفى الأطفال بالطائف",
        "مستشفى الملك فهد العام بجدة",
        "مستشفى الملك عبدالعزيز بجدة",
        "مستشفى الملك عبدالله التخصصي للأطفال",
        "مدينة الملك سعود الطبية",
        "مدينة الملك فهد الطبية",
        "مستشفى الملك خالد التخصصي للعيون",
        "مستشفى الملك فيصل التخصصي ومركز الأبحاث",
        "مستشفى الملك سلمان بن عبدالعزيز بالرياض",
        "مستشفى الإيمان العام بالرياض",
        "مستشفى اليمامة بالرياض",
        "مستشفى الأمير محمد بن عبدالعزيز بالرياض",
        "مستشفى الملك خالد بالخرج",
        "مستشفى الولادة والأطفال",
        "مستشفى الصحة النفسية",
        "مستشفى عسير المركزي",
        "مستشفى خميس مشيط العام",
        "مستشفى الملك خالد بنجران",
        "مستشفى نجران العام الجديد",
        "مستشفى شرورة العام",
        "مستشفى الملك فهد التخصصي بتبوك",
        "مستشفى الملك فهد المركزي بجازان",
        "مستشفى الملك خالد بحائل",
        "مستشفى بريدة المركزي",
        "مستشفى الملك فهد التخصصي ببريدة",
        "مستشفى الملك سلمان التخصصي بحائل",
        "مستشفى الأمير متعب بن عبدالعزيز بسكاكا",
        "مستشفى عرعر المركزي",
        "مستشفى طريف العام"
    ]
    },

    openDropdown(type) {
        this.currentDropdown = type;
        const overlay = document.getElementById('custom-select-overlay');
        const input = document.getElementById('custom-select-input');
        input.value = '';
        overlay.classList.add('active');
        this.renderDropdownList(this.dropdownData[type]);
        input.focus();
    },

    closeDropdown() {
        document.getElementById('custom-select-overlay').classList.remove('active');
        this.currentDropdown = null;
    },

    renderDropdownList(items) {
        const list = document.getElementById('custom-select-list');
        list.innerHTML = '';
        items.forEach(item => {
            const div = document.createElement('div');
            div.className = 'custom-select-item';
            div.innerText = item;
            div.onclick = () => {
                const targetInput = document.getElementById(this.currentDropdown === 'hospital' ? 'hospital_ar' : 'nationality');
                targetInput.value = item;
                if(this.currentDropdown === 'hospital') this.syncHospitalEn();
                this.closeDropdown();
            };
            list.appendChild(div);
        });
    },

    filterCustomSelect() {
        if(!this.currentDropdown) return;
        const query = document.getElementById('custom-select-input').value.toLowerCase();
        const filtered = this.dropdownData[this.currentDropdown].filter(item => item.toLowerCase().includes(query));
        this.renderDropdownList(filtered);
    },

    async init() {
        if (this.tg) {
            this.tg.expand();
            if (this.tg.initDataUnsafe && this.tg.initDataUnsafe.user) {
                this.state.chatId = this.tg.initDataUnsafe.user.id;
                this.state.user = this.tg.initDataUnsafe.user;
            } else {
                // Mock for local testing
                this.state.chatId = "123456789";
            }
        } else {
            this.state.chatId = "123456789";
        }

        await this.loadLocalData();
        this.updateDashboardUI();
        
        // Listeners for file upload
        const logoInput = document.getElementById('hospital_logo');
        if(logoInput) logoInput.addEventListener('change', (e) => this.handleLogoUpload(e));
        
        await this.loadPdfTemplate();
        
        // Sync with server asynchronously
        this.syncDataWithServer().catch(err => console.warn('Offline mode active', err));
    },

    async loadLocalData() {
        try {
            const res = await fetch('/subscriptions.json');
            if (res.ok) {
                const data = await res.json();
                if (data.subscriptions && data.subscriptions[this.state.chatId]) {
                    const u = data.subscriptions[this.state.chatId];
                    this.state.points = u.points || 0;
                    this.state.subscriptionDays = u.subscriptionDays || 0;
                    this.state.reports = u.reports || [];
                }
            }
        } catch (e) {
            console.log('No local data found or offline');
        }
    },

    async syncDataWithServer() {
        if (!this.state.chatId) return;
        const res = await fetch(`/api/user/${this.state.chatId}`);
        if (res.ok) {
            const data = await res.json();
            this.state.points = data.user?.points || data.points || 0;
            this.state.subscriptionDays = data.user?.subscriptionDays || data.subscriptionDays || 0;
            this.state.reports = data.reports || data.user?.reports || [];
            if (data.user?.mohLogo) this.state.mohLogoUrl = data.user.mohLogo;
            if (data.user?.hospitalLogo) this.state.hospitalLogoUrl = data.user.hospitalLogo;
            this.updateDashboardUI();
        }
    },

    updateDashboardUI() {
        document.getElementById('points-balance-display').innerText = this.state.points;
        const subBadge = document.getElementById('sub-status-badge');
        if (this.state.subscriptionDays > 0) {
            subBadge.innerText = `نشط - متبقي ${this.state.subscriptionDays} يوم`;
            subBadge.style.color = '#009688';
        } else {
            subBadge.innerText = 'غير نشط - متبقي 0 يوم';
            subBadge.style.color = '#e74c3c';
        }
        
        this.renderReports(this.state.reports);
    },

    searchReports() {
        const term = document.getElementById('report-search').value.toLowerCase();
        const filtered = this.state.reports.filter(r => {
            const data = r.data || {};
            const name = (r.patientName || "").toLowerCase();
            const nid = (data.national_id || "").toLowerCase();
            return name.includes(term) || nid.includes(term);
        });
        this.renderReports(filtered);
    },

    renderReports(reportsToRender) {
        const reportsList = document.getElementById('reports-list');
        reportsList.innerHTML = '';
        if (reportsToRender.length === 0) {
            reportsList.innerHTML = '<p style="text-align:center; color:#777; margin-top:30px;">لا توجد تقارير مطابقة</p>';
        } else {
            reportsToRender.forEach(r => {
                const card = document.createElement('div');
                card.className = 'report-card';
                card.innerHTML = `
                    <div class="report-info">
                        <h4>${r.patientName}</h4>
                        <p>${r.type === 'companion' ? 'مرافقة مريض' : 'إجازة مرضية'} • ${r.issueDate}</p>
                    </div>
                    <div class="report-actions">
                        <button onclick="app.copyReportId('${r.id}')" title="نسخ رقم التقرير">📋</button>
                        <button onclick="app.editReport('${r.id}')" title="تعديل التقرير">✏️</button>
                    </div>
                `;
                reportsList.appendChild(card);
            });
        }
    },

    copyReportId(id) {
        navigator.clipboard.writeText(id).then(() => {
            if(this.tg) this.tg.showAlert('تم نسخ رقم التقرير!');
            else alert('تم النسخ');
        });
    },

    navigate(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(`${screenId}-screen`).classList.add('active');
        if(screenId === 'dashboard') {
            document.getElementById('fab-menu').style.display = 'block';
        } else {
            document.getElementById('fab-menu').style.display = 'none';
        }
    },

    toggleFab() {
        const fabContainer = document.getElementById('fab-menu');
        const overlay = document.getElementById('fab-overlay');
        const fabMain = document.getElementById('fab-main');
        
        fabContainer.classList.toggle('active');
        overlay.classList.toggle('active');
        fabMain.classList.toggle('active');
    },

    startForm(type) {
        this.toggleFab();
        this.state.leaveType = type;
        this.state.currentStep = 1;
        
        document.getElementById('form-title').innerText = type === 'companion' ? 'إصدار تقرير مرافقة مريض' : 'إصدار تقرير جديد';
        
        const typeSelect = document.getElementById('leave_type');
        typeSelect.innerHTML = type === 'companion' ? '<option value="Companion">Companion</option>' : '<option value="GSL">GSL</option>';
        
        document.getElementById('escort-fields').style.display = type === 'companion' ? 'block' : 'none';
        
        this.updateWizardUI();
        this.navigate('form');
        
        // Auto-fill current date and time
        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000;
        const localISOTime = (new Date(now - offset)).toISOString().slice(0, -1);
        const todayStr = localISOTime.split('T')[0];
        
        document.getElementById('issue_date').value = todayStr;
        document.getElementById('admission_date').value = todayStr;
        document.getElementById('discharge_date').value = todayStr;
        
        let hours = now.getHours().toString().padStart(2, '0');
        let minutes = now.getMinutes().toString().padStart(2, '0');
        document.getElementById('issue_time').value = `${hours}:${minutes}`;
    },

    syncHospitalEn() {
        const ar = document.getElementById('hospital_ar').value;
        const enInput = document.getElementById('hospital_en');
        const map = {
            "مستشفى نجران العام": "Najran General Hospital",
            "مستشفى الملك عبدالعزيز التخصصي": "King Abdulaziz Specialist Hospital",
            "مستشفى الملك فيصل": "King Faisal Hospital",
            "مستشفى القوات المسلحة بالهدا": "Al-Hada Armed Forces Hospital",
            "مستشفى الملك خالد ومركز الأمير سلطان للخدمات الصحية": "King Khalid Hospital and Prince Sultan Health Services Center",
            "مستشفى الملك خالد": "King Khalid Hospital",
            "مستشفى حفر الباطن المركزي": "Hafar Al-Batin Central Hospital"
        };
        if (map[ar]) {
            enInput.value = map[ar];
        }
    },

    editReport(id) {
        const report = this.state.reports.find(r => r.id === id);
        if(!report || !report.data) {
            alert('عذراً، بيانات هذا التقرير القديم غير متوفرة للتعديل.');
            return;
        }
        
        this.startForm(report.type);
        
        // Populate fields
        for (const [key, value] of Object.entries(report.data)) {
            const el = document.getElementById(key);
            if(el && key !== 'hospital_type') {
                el.value = value || '';
            }
        }
        
        // Radio button
        if(report.data.hospital_type) {
            const radio = document.querySelector(`input[name="hospital_type"][value="${report.data.hospital_type}"]`);
            if(radio) {
                radio.checked = true;
                this.toggleLicense();
            }
        }
    },

    updateWizardUI() {
        document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
        document.getElementById(`step-${this.state.currentStep}`).classList.add('active');
        
        const progress = (this.state.currentStep / 3) * 100;
        document.getElementById('form-progress').style.width = `${progress}%`;
    },

    nextStep() {
        // Simple required validation
        const currentForm = document.getElementById(`step-${this.state.currentStep}`);
        const inputs = currentForm.querySelectorAll('input[required], select[required]');
        let valid = true;
        inputs.forEach(i => {
            if(!i.value) {
                valid = false;
                i.style.borderColor = 'red';
            } else {
                i.style.borderColor = '#ddd';
            }
        });
        
        if(!valid) {
            if(this.tg) this.tg.showAlert('يرجى تعبئة الحقول المطلوبة.');
            else alert('يرجى تعبئة الحقول المطلوبة.');
            return;
        }

        if (this.state.currentStep < 3) {
            this.state.currentStep++;
            this.updateWizardUI();
        }
    },

    prevStep() {
        if (this.state.currentStep > 1) {
            this.state.currentStep--;
            this.updateWizardUI();
        }
    },

    toggleLicense() {
        const isPrivate = document.querySelector('input[name="hospital_type"]:checked').value === 'private';
        const licenseField = document.getElementById('license-field');
        const licenseInput = document.getElementById('license_number');
        
        if (isPrivate) {
            licenseField.style.display = 'block';
            licenseInput.value = Math.floor(1000000000 + Math.random() * 9000000000).toString();
            document.getElementById('leave_type').value = 'PSL';
        } else {
            licenseField.style.display = 'none';
            licenseInput.value = '';
            document.getElementById('leave_type').value = 'GSL';
        }
    },

    handleLogoUpload(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                this.state.hospitalLogoUrl = event.target.result;
            };
            reader.readAsDataURL(file);
        }
    },

    buyPackage(pkgName) {
        if(this.tg) {
            this.tg.openTelegramLink('https://t.me/zakmmm_1211');
        } else {
            window.open('https://t.me/zakmmm_1211', '_blank');
        }
    },

    async loadPdfTemplate() {
        const res = await fetch('pdf-template.html');
        const html = await res.text();
        document.getElementById('pdf-container').innerHTML = html;
    },

    getHijriDate(dateString) {
        if(!dateString) return "";
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('en-GB-u-ca-islamic', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(date).replace(/AH/g, '').trim().replace(/\//g, '-');
    },

    formatGregorian(dateString) {
        if(!dateString) return "";
        const parts = dateString.split('-');
        if(parts.length===3) return `${parts[2]}-${parts[1]}-${parts[0]}`;
        return dateString;
    },

    formatAMPM(timeStr) {
        if(!timeStr) return "";
        let [hours, minutes] = timeStr.split(':');
        hours = parseInt(hours);
        let ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; 
        return `${hours}:${minutes} ${ampm}`;
    },

    formatDateLabel(dateStr) {
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    },

    getNationalityEn(arName) {
        const map = {
            'السعودية': 'Saudi Arabia',
            'الإمارات': 'United Arab Emirates',
            'البحرين': 'Bahrain',
            'الكويت': 'Kuwait',
            'عمان': 'Oman',
            'قطر': 'Qatar',
            'اليمن': 'Yemen',
            'الأردن': 'Jordan',
            'سوريا': 'Syria',
            'لبنان': 'Lebanon',
            'فلسطين': 'Palestine',
            'العراق': 'Iraq',
            'مصر': 'Egypt',
            'السودان': 'Sudan',
            'ليبيا': 'Libya',
            'تونس': 'Tunisia',
            'الجزائر': 'Algeria',
            'المغرب': 'Morocco',
            'موريتانيا': 'Mauritania',
            'الصومال': 'Somalia',
            'جيبوتي': 'Djibouti',
            'جزر القمر': 'Comoros',
            'الهند': 'India',
            'باكستان': 'Pakistan',
            'بنجلاديش': 'Bangladesh',
            'أفغانستان': 'Afghanistan',
            'إندونيسيا': 'Indonesia',
            'ماليزيا': 'Malaysia',
            'الفلبين': 'Philippines',
            'سريلانكا': 'Sri Lanka',
            'نيبال': 'Nepal',
            'تركيا': 'Turkey',
            'إيران': 'Iran',
            'الصين': 'China',
            'اليابان': 'Japan',
            'كوريا الجنوبية': 'South Korea',
            'روسيا': 'Russia',
            'الولايات المتحدة': 'United States',
            'بريطانيا': 'United Kingdom',
            'فرنسا': 'France',
            'ألمانيا': 'Germany',
            'إيطاليا': 'Italy',
            'إسبانيا': 'Spain',
            'كندا': 'Canada',
            'أستراليا': 'Australia',
            'البرازيل': 'Brazil',
            'الأرجنتين': 'Argentina',
            'المكسيك': 'Mexico',
            'جنوب أفريقيا': 'South Africa',
            'نيجيريا': 'Nigeria',
            'إثيوبيا': 'Ethiopia',
            'كينيا': 'Kenya',
            'أوغندا': 'Uganda',
            'تشاد': 'Chad',
            'النيجر': 'Niger',
            'مالي': 'Mali',
            'السنغال': 'Senegal'
        };
        return map[arName] || arName;
    },

    async submitForm() {
        // Final Validation
        if(this.state.points < 5 && this.state.subscriptionDays <= 0) {
            if(this.tg) this.tg.showAlert("رصيدك غير كافٍ. تحتاج إلى 5 نقاط على الأقل.");
            else alert("رصيدك غير كافٍ. تحتاج إلى 5 نقاط على الأقل.");
            return;
        }

        // Show loading
        document.getElementById('loading-overlay').style.display = 'flex';
        
        try {
            await this.populatePdfAndGenerate();
        } catch(e) {
            console.error(e);
            alert("حدث خطأ أثناء إعداد التقرير: " + (e.message || e));
            document.getElementById('loading-overlay').style.display = 'none';
        }
    },

    async populatePdfAndGenerate() {
        // 1. Gather Data
        const type = this.state.leaveType;
        const admission = document.getElementById('admission_date').value;
        const discharge = document.getElementById('discharge_date').value;
        const duration = document.getElementById('duration').value;
        const issueDate = document.getElementById('issue_date').value;
        const issueTime = document.getElementById('issue_time').value;

        const pNameAr = document.getElementById('patient_name_ar').value;
        const pNameEn = document.getElementById('patient_name_en').value;
        const idNum = document.getElementById('national_id').value;
        const nationalityAr = document.getElementById('nationality').value;
        const nationalityEn = this.getNationalityEn(nationalityAr);
        const employer = document.getElementById('employer').value;

        const docNameAr = document.getElementById('doctor_name_ar').value;
        const docNameEn = document.getElementById('doctor_name_en').value;
        const jobAr = document.getElementById('job_title_ar').value;
        const jobEn = document.getElementById('job_title_en').value;
        
        const hospAr = document.getElementById('hospital_ar').value;
        const hospEn = document.getElementById('hospital_en').value;
        const isPrivate = document.querySelector('input[name="hospital_type"]:checked').value === 'private';
        const license = document.getElementById('license_number').value;

        const reportId = `GSL${Math.floor(Math.random() * 10000000000)}`;

        // Gather escort/relation data early (before any conditional blocks)
        const escAr = document.getElementById('escort_name_ar') ? document.getElementById('escort_name_ar').value : '';
        const escEn = document.getElementById('escort_name_en') ? document.getElementById('escort_name_en').value : '';
        const relAr = document.getElementById('relation_ar') ? document.getElementById('relation_ar').value : '';
        const relEn = document.getElementById('relation_en') ? document.getElementById('relation_en').value : '';

        // 2. Populate PDF Template
        document.getElementById('pdf-leave-id').innerText = reportId;
        
        const gregoAdm = this.formatGregorian(admission);
        const gregoDis = this.formatGregorian(discharge);
        
        document.getElementById('pdf-duration-en').innerText = `${duration} day (${gregoAdm} to ${gregoDis})`;
        // Match reference repo logical order: "${days} يوم ( ${LRM}${start}${LRM} إلى ${LRM}${end}${LRM} )"
        const LRM = '\u200e';
        document.getElementById('pdf-duration-ar').innerText = `${duration} يوم ( ${LRM}${gregoAdm}${LRM} إلى ${LRM}${gregoDis}${LRM} )`;

        document.getElementById('pdf-admission-g').innerText = gregoAdm;
        document.getElementById('pdf-admission-h').innerText = gregoAdm;
        document.getElementById('pdf-discharge-g').innerText = gregoDis;
        document.getElementById('pdf-discharge-h').innerText = gregoDis;
        
        document.getElementById('pdf-issue-date').innerText = this.formatGregorian(issueDate);
        
        document.getElementById('pdf-national-id').innerText = idNum;
        document.getElementById('pdf-nationality-en').innerText = nationalityEn;
        document.getElementById('pdf-nationality-ar').innerText = nationalityAr;
        
        const emptyEmployer = !employer || ['','غير محدد','فارغ','-','None','none','null','NULL','Not Specified','N/A','n/a','undefined'].includes(employer.trim());
        document.getElementById('pdf-employer-en').innerText = emptyEmployer ? ' ' : employer;
        document.getElementById('pdf-employer-ar').innerText = emptyEmployer ? ' ' : employer;
        
        document.getElementById('pdf-doctor-en').innerText = docNameEn.toUpperCase();
        document.getElementById('pdf-doctor-ar').innerText = docNameAr;
        document.getElementById('pdf-position-en').innerText = jobEn;
        document.getElementById('pdf-position-ar').innerText = jobAr;
        
        document.getElementById('pdf-hospital-en').innerText = hospEn;
        document.getElementById('pdf-hospital-ar').innerText = hospAr;
        
        if (isPrivate && license) {
            document.getElementById('pdf-license').style.display = 'block';
            document.getElementById('pdf-license-val').innerText = license;
        } else {
            document.getElementById('pdf-license').style.display = 'none';
        }
        
        document.getElementById('pdf-hospital-logo').src = this.state.hospitalLogoUrl;
        
        if (this.state.mohLogoUrl) {
            const mohContainer = document.getElementById('pdf-moh-logo-container');
            const mohImg = document.getElementById('pdf-moh-logo');
            if (mohContainer && mohImg) {
                mohContainer.style.display = 'block';
                mohImg.src = this.state.mohLogoUrl;
            }
        } else {
            const mohContainer = document.getElementById('pdf-moh-logo-container');
            if (mohContainer) {
                mohContainer.style.display = 'none';
            }
        }

        // Type specific adjustments
        if (type === 'companion') {
            if(document.getElementById('pdf-title-ar')) document.getElementById('pdf-title-ar').innerText = "تقرير مرافق مريض";
            if(document.getElementById('pdf-title-en')) document.getElementById('pdf-title-en').innerText = "Patient Companion Report";
            
            document.getElementById('pdf-name-label-en').innerText = "Companion Name";
            document.getElementById('pdf-name-label-ar').innerText = "اسم المرافق";
            document.getElementById('pdf-name-en').innerText = escEn.toUpperCase();
            document.getElementById('pdf-name-ar').innerText = escAr;
            
            document.getElementById('pdf-relation-row').style.display = 'flex';
            document.getElementById('pdf-relation-en').innerText = relEn;
            document.getElementById('pdf-relation-ar').innerText = relAr;

            document.getElementById('pdf-doc-label-en').innerText = "Physician Name";
            document.getElementById('pdf-doc-label-ar').innerText = "اسم الطبيب المعالج";
        } else {
            if(document.getElementById('pdf-title-ar')) document.getElementById('pdf-title-ar').innerText = "تقرير إجازة مرضية";
            if(document.getElementById('pdf-title-en')) document.getElementById('pdf-title-en').innerText = "Sick Leave Report";
            
            document.getElementById('pdf-name-label-en').innerText = "Name";
            document.getElementById('pdf-name-label-ar').innerText = "الاسم";
            document.getElementById('pdf-name-en').innerText = pNameEn.toUpperCase();
            document.getElementById('pdf-name-ar').innerText = pNameAr;
            
            document.getElementById('pdf-relation-row').style.display = 'none';
            document.getElementById('pdf-doc-label-en').innerText = "Practitioner Name";
            document.getElementById('pdf-doc-label-ar').innerText = "اسم الممارس";
        }

        // Generate QR Code
        document.getElementById('pdf-qrcode').innerHTML = "";
        const includeQR = document.getElementById('include_qr') ? document.getElementById('include_qr').checked : true;
        const inquiryBaseUrl = window.location.origin;
        const verifyUrl = `${inquiryBaseUrl}/inquiry`;
        
        if (includeQR) {
            new QRCode(document.getElementById('pdf-qrcode'), {
                text: verifyUrl,
                width: 100,
                height: 100,
                colorDark : "#000000",
                colorLight : "#ffffff",
                correctLevel : QRCode.CorrectLevel.L
            });
        }

        document.getElementById('pdf-time').innerText = this.formatAMPM(issueTime);
        document.getElementById('pdf-day-date').innerText = this.formatDateLabel(issueDate);

        try {
            app.state.points -= 5;
            app.updateDashboardUI();

            // Wait for QR and fonts to be ready
            await new Promise(r => setTimeout(r, 1000));

            // Ensure fonts are loaded before generating
await document.fonts.ready;
await new Promise(r => setTimeout(r, 800)); // allow QR and images to settle

const pdfElement = document.getElementById('pdf-content');
// Ensure the element is completely visible before rendering
pdfElement.parentElement.style.opacity = '1';
pdfElement.parentElement.style.zIndex = '9999';
pdfElement.parentElement.style.position = 'absolute'; // Use absolute to prevent fixed viewport issues
pdfElement.parentElement.style.top = '0';
pdfElement.parentElement.style.left = '0';
pdfElement.parentElement.style.right = 'auto';

// Very important for RTL pages: html2canvas calculates X incorrectly if the page is RTL.
const originalHtmlDir = document.documentElement.getAttribute('dir');
const originalBodyDir = document.body.getAttribute('dir');
document.documentElement.setAttribute('dir', 'ltr');
document.body.setAttribute('dir', 'ltr');

// Prevent body overflow clipping
const originalOverflow = document.body.style.overflow;
const originalDocOverflow = document.documentElement.style.overflow;
document.body.style.overflow = 'visible';
document.documentElement.style.overflow = 'visible';

// Scroll to top-left to ensure capture area is within viewport coordinates
window.scrollTo(0, 0);


            // Generate PNG using dom-to-image to preserve exact browser Arabic text rendering (RTL/CTL)
            // html2canvas is known to mangle Arabic cursive joining.
            let pdfBase64;
            const PDF_W = 842, PDF_H = 1190; // matching official PDF: A3 842x1190
            try {
                const scale = 2; // high quality
                const dataUrl = await domtoimage.toJpeg(pdfElement, {
                    quality: 0.98,
                    bgcolor: '#ffffff',
                    width: PDF_W * scale,
                    height: PDF_H * scale,
                    style: {
                        transform: 'scale(' + scale + ')',
                        transformOrigin: 'top left',
                        width: PDF_W + 'px',
                        height: PDF_H + 'px'
                    }
                });

                // Create jsPDF and inject the perfectly rendered image
                const jsPDFClass = window.jspdf ? window.jspdf.jsPDF : window.jsPDF;
                if (!jsPDFClass) throw new Error("jsPDF not loaded");
                const pdf = new jsPDFClass({ unit: 'px', format: [PDF_W, PDF_H], orientation: 'portrait', hotfixes: ["px_scaling"] });
                pdf.addImage(dataUrl, 'JPEG', 0, 0, PDF_W, PDF_H);
                pdfBase64 = pdf.output('datauristring');
            } catch (fallbackErr) {
                console.error("dom-to-image failed, trying html2pdf:", fallbackErr);
                const opt = {
                    margin: 0,
                    filename: 'sickLeaves.pdf',
                    image: { type: 'jpeg', quality: 1 },
                    html2canvas: { scale: 2, useCORS: true, letterRendering: false },
                    jsPDF: { unit: 'px', format: [PDF_W, PDF_H], orientation: 'portrait', hotfixes: ["px_scaling"] }
                };
                pdfBase64 = await html2pdf().from(pdfElement).set(opt).outputPdf('datauristring');
            }


// Hide it again
pdfElement.parentElement.style.opacity = '0.01';
pdfElement.parentElement.style.zIndex = '-9999';
pdfElement.parentElement.style.position = 'absolute';
pdfElement.parentElement.style.top = '-10000px';
pdfElement.parentElement.style.left = '-10000px';

// Restore page states
document.body.style.overflow = originalOverflow;
document.documentElement.style.overflow = originalDocOverflow;
if(originalHtmlDir) document.documentElement.setAttribute('dir', originalHtmlDir);
else document.documentElement.removeAttribute('dir');
if(originalBodyDir) document.body.setAttribute('dir', originalBodyDir);
else document.body.removeAttribute('dir');

    


            // ===== SAVE PDF TO STATE FOR DOWNLOAD LATER =====
            app.state.lastPdfBase64 = pdfBase64;
            app.state.lastReportId = reportId;

            // ===== AUTO-DOWNLOAD PDF TO DEVICE =====
            try {
                const link = document.createElement('a');
                link.href = pdfBase64;
                link.download = `${reportId}.pdf`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            } catch (dlErr) {
                console.warn('Auto-download failed:', dlErr);
            }

            // Send generated PDF back to server to send via Telegram
            const sendResponse = await fetch('/api/send-generated-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    chatId: app.state.chatId,
                    pdfBase64: pdfBase64,
                    filename: 'sickLeaves.pdf',
                    reportId: reportId
                })
            });
            
            const sendResult = await sendResponse.json();
            if (!sendResult.success) {
                console.warn('Telegram send failed:', sendResult.error);
            }

            // Also save report data
            await fetch(`/api/report/${app.state.chatId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    report: {
                        id: reportId,
                        patientName: type === 'companion' ? escAr : pNameAr,
                        type: type,
                        issueDate: issueDate,
                        data: {
                            admission_date: admission,
                            discharge_date: discharge,
                            duration: duration,
                            issue_date: issueDate,
                            issue_time: issueTime,
                            national_id: idNum,
                            patient_name_ar: pNameAr,
                            patient_name_en: pNameEn,
                            nationality: document.getElementById('nationality').value,
                            employer: employer,
                            escort_name_ar: escAr,
                            escort_name_en: escEn,
                            relation_ar: relAr,
                            relation_en: relEn,
                            doctor_name_ar: docNameAr,
                            doctor_name_en: docNameEn,
                            job_title_ar: jobAr,
                            job_title_en: jobEn,
                            hospital_ar: hospAr,
                            hospital_en: hospEn,
                            hospital_type: document.querySelector('input[name="hospital_type"]:checked').value,
                            license_number: license
                        }
                    }
                })
            });

            // Upload data to inquiry panel (fire-and-forget, don't block UI)
            fetch('/api/upload-inquiry', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    leave_id: reportId,
                    identity_number: idNum,
                    patient_name_ar: pNameAr,
                    patient_name_en: pNameEn,
                    nationality_ar: nationalityAr,
                    nationality_en: nationalityEn,
                    employer_ar: emptyEmployer ? ' ' : employer,
                    employer_en: emptyEmployer ? ' ' : employer,
                    doctor_name_ar: docNameAr,
                    doctor_name_en: docNameEn,
                    doctor_specialty_ar: jobAr,
                    doctor_specialty_en: jobEn,
                    hospital_name_ar: hospAr,
                    hospital_name_en: hospEn,
                    hospital_type: isPrivate ? 'private' : 'public',
                    license_number: license,
                    admission_date: admission,
                    discharge_date: discharge,
                    day_count: parseInt(duration) || 1,
                    issue_date: issueDate,
                    time: issueTime,
                    leave_type: type
                })
            }).catch(err => console.warn('Inquiry upload failed (non-critical):', err));

            document.getElementById('loading-overlay').style.display = 'none';
            document.getElementById('report-form').reset();
            app.navigate('success');
        } catch(e) {
            console.error("PDF Generation error: ", e);
            fetch('/api/logs?msg=' + encodeURIComponent('Client_Error: ' + e.message));
            alert("حدث خطأ أثناء إصدار التقرير: " + e.message);
            document.getElementById('loading-overlay').style.display = 'none';
        }
    },

    downloadLastPdf() {
        if (!app.state.lastPdfBase64) {
            if(this.tg) this.tg.showAlert('لا يوجد تقرير للتحميل');
            else alert('لا يوجد تقرير للتحميل');
            return;
        }
        try {
            const link = document.createElement('a');
            link.href = app.state.lastPdfBase64;
            link.download = `${app.state.lastReportId || 'report'}.pdf`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch(e) {
            if(this.tg) this.tg.showAlert('حدث خطأ أثناء التحميل');
            else alert('حدث خطأ أثناء التحميل');
        }
    },

    printLastPdf() {
        if (!app.state.lastPdfBase64) {
            if(this.tg) this.tg.showAlert('لا يوجد تقرير للطباعة');
            else alert('لا يوجد تقرير للطباعة');
            return;
        }
        try {
            const rawBase64 = app.state.lastPdfBase64.split(',')[1] || app.state.lastPdfBase64;
            const binaryStr = atob(rawBase64);
            const bytes = new Uint8Array(binaryStr.length);
            for (let i = 0; i < binaryStr.length; i++) {
                bytes[i] = binaryStr.charCodeAt(i);
            }
            const blob = new Blob([bytes], { type: 'application/pdf' });
            const blobUrl = URL.createObjectURL(blob);

            // Use hidden iframe for reliable cross-browser printing
            const iframe = document.createElement('iframe');
            iframe.style.position = 'fixed';
            iframe.style.right = '0';
            iframe.style.bottom = '0';
            iframe.style.width = '0';
            iframe.style.height = '0';
            iframe.style.border = 'none';
            iframe.style.opacity = '0';
            iframe.style.pointerEvents = 'none';
            document.body.appendChild(iframe);

            iframe.onload = function() {
                setTimeout(() => {
                    try {
                        iframe.contentWindow.print();
                    } catch(e) {
                        console.warn('iframe print failed, trying window.open:', e);
                        // Fallback to new window
                        const printWindow = window.open(blobUrl, '_blank');
                        if (printWindow) {
                            printWindow.addEventListener('load', function() {
                                setTimeout(() => { printWindow.print(); }, 800);
                            });
                        } else {
                            app.downloadLastPdf();
                        }
                    }
                    // Cleanup iframe after printing
                    setTimeout(() => {
                        document.body.removeChild(iframe);
                        URL.revokeObjectURL(blobUrl);
                    }, 5000);
                }, 500);
            };
            iframe.src = blobUrl;
        } catch(e) {
            console.error('Print failed:', e);
            app.downloadLastPdf();
        }
    },

    closeApp() {
        if(this.tg) {
            this.tg.close();
        } else {
            window.close();
        }
    }
};

window.onload = () => {
    app.init();
};

