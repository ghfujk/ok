// ==UserScript==
// @name         Greek Consulate Helper,
// @namespace    Violentmonkey Scripts
// @version      2.8
// @description  Enhanced appointment checker with custom times, auto-redirect, and client data autofill
// @match        https://appointment.mfa.gr/*
// @match        https://www.facebook.com/*
// @grant        GM_xmlhttpRequest
// @grant        GM_notification
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// @grant        GM_getResourceURL
// @resource     beepSound https://www.soundjay.com/buttons/sounds/button-09.mp3
// @resource     alertSound https://www.soundjay.com/buttons/sounds/button-21.mp3
// ==/UserScript==

(function () {
    'use strict';

    // Configuration
    const CONFIG = {
        services: [
            {
                name: "Greece Work",
                bid: 86,
                fakeTimes: ["09:00", "09:05", "09:10", "09:15", "09:20", "09:25", "09:30", "09:35", "09:40", "09:45", "09:50", "09:55", "10:00", "10:05", "10:10", "10:15", "10:20", "10:25", "10:30", "10:35", "10:40", "10:45", "10:50", "10:55", "11:00", "11:05", "11:10", "11:15", "11:20", "11:25", "11:30", "11:35", "11:40", "11:45", "11:50", "11:55"],
                daysToShow: 31 // Show last 15 days of month
            },
            {
                name: "Greece Attestation",
                bid: 74,
                fakeTimes: ["09:00", "09:05", "09:10", "09:15", "09:20", "09:25", "09:30", "09:35", "09:40", "09:45", "09:50", "09:55", "10:00", "10:05", "10:10"],
                daysToShow: 31
            },
            {
                name: "Greece Schengen",
                bid: 72,
                fakeTimes: ["08:00", "08:05", "08:10", "08:15", "08:20", "08:25"],
                daysToShow: 31
            },
            {
                name: "Other Consular Services",
                bid: 73,
                fakeTimes: ["10:20", "10:30", "10:40", "10:50"],
                daysToShow: 31
            },
            {
                name: "National Visa (Students etc.)",
                bid: 71,
                fakeTimes: ["08:35", "08:40", "08:45", "08:50"],
                daysToShow: 31
            }
        ],
        adults: 1,
        children: 0,
        checkInterval: 10000, // Check every 10 seconds
        notificationThreshold: 1,
        storageKey: 'greekConsulateAvailableSlots',
        userPrefsKey: 'greekConsulateUserPrefs',
        maxRetries: 5000000,
        initialRetryDelay: 10000,
        retryMultiplier: 2,
        currentYear: new Date().getFullYear(),
        redirectDelay: 50,
        alarmSound: "https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg",
        errorRetryDelay: 1000 // Delay between retries when error occurs
    };

    // Updated client data array with 15 clients
    const CLIENTS = [
        {
            id: 1,
            firstName: 'ABDUL',
            lastName: 'QAYOOM',
            email: 'myaseenn8090@gmail.com',
            city: 'BHIMBER AJK, PAK',
            address: 'BHIMBER AJK, PAK',
            postalCode: '81101',
            telephone: '03001234567',
            mobile: '03331234567',
            fatherName: 'MUHAMMAD HUSSAIN',
            employerName: 'ABDUL QAYOOM',
            p1firstName: 'ABDUL',
            p1lastName: 'QAYOOM'
        },
        {
            id: 2,
            firstName: 'IKRAM',
            lastName: 'YOUSAF',
            email: 'sultanhaider3040@gmail.com',
            city: 'GUJRAT, PAK',
            address: 'GUJRAT, PAK',
            postalCode: '34202',
            telephone: '03001234568',
            mobile: '03331234568',
            fatherName: 'YOUSAF, MUHAMMAD',
            employerName: 'IKRAM YOUSAF',
            p1firstName: 'IKRAM',
            p1lastName: 'YOUSAF'
        },
        {
            id: 3,
            firstName: 'SYED AHMED RAZA',
            lastName: 'SHAH',
            email: 'azaanali3050@gmail.com',
            city: 'GUJRAT, PAK',
            address: 'GUJRAT, PAK',
            postalCode: '34201',
            telephone: '03001234569',
            mobile: '03331234569',
            fatherName: 'ALI, ZULFIQAR',
            employerName: 'SYED AHMED RAZA SHAH',
            p1firstName: 'SYED AHMED RAZA',
            p1lastName: 'SHAH'
        },
        {
            id: 4,
            firstName: 'AHSAN',
            lastName: 'ARSHAD',
            email: 'ansarshazil6@gmail.com',
            city: 'KOTLI AK, PAK',
            address: 'KOTLI AK, PAK',
            postalCode: '81101',
            telephone: '03001234570',
            mobile: '03331234570',
            fatherName: 'ARSHAD, MUHAMMAD',
            employerName: 'AHSAN ARSHAD',
            p1firstName: 'AHSAN',
            p1lastName: 'ARSHAD'
        },
        {
            id: 5,
            firstName: 'MASOOD',
            lastName: 'HUSSAIN',
            email: 'rehmanw384@gmail.com',
            city: 'BHIMBER AJK, PAK',
            address: 'BHIMBER AJK, PAK',
            postalCode: '81101',
            telephone: '03001234571',
            mobile: '03331234571',
            fatherName: 'HUSSAIN, MANZOOR',
            employerName: 'MASOOD HUSSAIN',
            p1firstName: 'MASOOD',
            p1lastName: 'HUSSAIN'
        },
        {
            id: 6,
            firstName: 'EHSAN',
            lastName: 'ULLAH',
            email: 'muzairr8090@gmail.com',
            city: 'BHIMBER AJK, PAK',
            address: 'BHIMBER AJK, PAK',
            postalCode: '81101',
            telephone: '03330098934',
            mobile: '03330098934',
            fatherName: 'QAYOM, ABDUL',
            employerName: 'EHSAN ULLAH',
            p1firstName: 'EHSAN',
            p1lastName: 'ULLAH'
        },
        {
            id: 7,
            firstName: 'AZAN',
            lastName: 'ALI',
            email: 'myasirr8090@gmail.com',
            city: 'GUJRAT, PAK',
            address: 'GUJRAT, PAK',
            postalCode: '34202',
            telephone: '03467656768',
            mobile: '03466757686',
            fatherName: 'AHMED, RUKHSAR',
            employerName: 'AZAN ALI',
            p1firstName: 'AZAN',
            p1lastName: 'ALI'
        },
        {
            id: 8,
            firstName: 'MUHAMMAD',
            lastName: 'NAZIR',
            email: 'mehmodahmer@gmail.com',
            city: 'GUJRANWALA, PAK',
            address: 'GUJRANWALA, PAK',
            postalCode: '34101',
            telephone: '03476656786',
            mobile: '03476678656',
            fatherName: 'BASHIR, MUHAMMAD',
            employerName: 'MUHAMMAD NAZIR',
            p1firstName: 'MUHAMMAD',
            p1lastName: 'NAZIR'
        },
        {
            id: 9,
            firstName: 'REHMAN',
            lastName: 'ASLAM',
            email: 'abduljabbarr8090@gmail.com',
            city: 'BHIMBER AJK, PAK',
            address: 'BHIMBER AJK, PAK',
            postalCode: '81101',
            telephone: '03330998934',
            mobile: '03335298934',
            fatherName: 'ASLAM, MUHAMMAD',
            employerName: 'REHMAN ASLAM',
            p1firstName: 'REHMAN',
            p1lastName: 'ASLAM'
        },
        {
            id: 10,
            firstName: 'FAISAL',
            lastName: 'NADEEM',
            email: 'masadd8900@gmail.com',
            city: 'BHIMBER AJK, PAK',
            address: 'BHIMBER AJK, PAK',
            postalCode: '81101',
            telephone: '03330098934',
            mobile: '03330098934',
            fatherName: 'TARIQ, MUHAMMAD',
            employerName: 'FAISAL NADEEM',
            p1firstName: 'FAISAL',
            p1lastName: 'NADEEM'
        },
        {
            id: 11,
            firstName: 'GHULAM',
            lastName: 'GHOUS',
            email: 'jordana4080@gmail.com',
            city: 'GUJRANWALA, PAK',
            address: 'GUJRANWALA, PAK',
            postalCode: '34101',
            telephone: '03330998934',
            mobile: '03335298934',
            fatherName: 'RASHEED, ABDUL',
            employerName: 'GHULAM GHOUS',
            p1firstName: 'GHULAM',
            p1lastName: 'GHOUS'
        },
        {
            id: 12,
            firstName: 'HASSAN',
            lastName: 'ABBAS',
            email: 'zubaira3040@gmail.com',
            city: 'BHIMBER AJK, PAK',
            address: 'BHIMBER AJK, PAK',
            postalCode: '81101',
            telephone: '03330098934',
            mobile: '03330098934',
            fatherName: 'ILYAS, MUHAMMAD',
            employerName: 'HASSAN ABBAS',
            p1firstName: 'HASSAN',
            p1lastName: 'ABBAS'
        },
        {
            id: 13,
            firstName: 'MUHAMMAD',
            lastName: 'FAROOQ',
            email: 'Syedshazar048@gmail.com',
            city: 'GUJRAT, PAK',
            address: 'GUJRAT, PAK',
            postalCode: '34202',
            telephone: '03330098934',
            mobile: '03330098934',
            fatherName: 'MALIK, ABDUL',
            employerName: 'MUHAMMAD FAROOQ',
            p1firstName: 'MUHAMMAD',
            p1lastName: 'FAROOQ'
        },
        {
            id: 14,
            firstName: 'ATTA',
            lastName: 'HUSSAIN',
            email: 'Saimabibii3080@gmail.com',
            city: 'NANKANA SAHIB, PAK',
            address: 'NANKANA SAHIB, PAK',
            postalCode: '34101',
            telephone: '03330098934',
            mobile: '03330098934',
            fatherName: 'AZAM, MUHAMMAD',
            employerName: 'ATTA HUSSAIN',
            p1firstName: 'ATTA',
            p1lastName: 'HUSSAIN'
        },
        {
            id: 15,
            firstName: 'CHILIPPATHO',
            lastName: 'HUMBOR',
            email: 'siqbal8090@gmail.com',
            city: 'BHIMBER AJK, PAK',
            address: 'BHIMBER AJK, PAK',
            postalCode: '81101',
            telephone: '03330098934',
            mobile: '03330098934',
            fatherName: 'Unknown',
            employerName: 'CHILIPPATHO HUMBOR',
            p1firstName: 'CHILIPPATHO',
            p1lastName: 'HUMBOR'
        }
    ];

    // State variables
    let selectedService = 0;
    let selectedMonth = new Date().getMonth() + 1;
    let checkingActive = true;
    let selectedDate = null;
    let selectedTime = null;
    let selectedClientId = null;
    let beepAudio, alertAudio;
    let isRedirecting = false;
    let realAvailableSlots = [];
    let lastCheckTime = null;
    let checkIntervalId = null;
    let redirectInProgress = false;
    let errorPageObserver = null;
    let redirectQueue = [];
    let attemptedTimes = new Set(); // Track attempted time slots for current date
    let successAlarmPlayed = false; // Track if success alarm has been played

    // Add custom CSS
    GM_addStyle(`
        .greek-consulate-helper {
            position: fixed;
            top: 20px;
            right: 20px;
            width: 380px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            z-index: 9999;
            font-family: 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
            overflow: hidden;
        }

        .helper-header {
            background: #007bff;
            color: white;
            padding: 12px 15px;
            font-size: 16px;
            font-weight: bold;
            border-radius: 8px 8px 0 0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .helper-body {
            padding: 15px;
            max-height: 500px;
            overflow-y: auto;
        }

        .helper-status {
            margin-bottom: 15px;
            padding: 10px;
            background: #e9ecef;
            border-radius: 4px;
            font-size: 14px;
        }

        .error-status {
            color: #dc3545;
            margin-bottom: 15px;
            padding: 10px;
            background: #f8d7da;
            border-radius: 4px;
            font-size: 14px;
            display: none;
        }

        .slots-container {
            margin-top: 15px;
        }

        .slot-day {
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 10px;
            margin-bottom: 10px;
            cursor: pointer;
            transition: background 0.2s;
        }

        .slot-day:hover {
            background: #f1f8ff;
        }

        .slot-day.selected {
            background: #d4edff;
            border-color: #007bff;
        }

        .slot-date {
            font-weight: bold;
            margin-bottom: 8px;
            color: #343a40;
        }

        .slot-times {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
        }

        .time-slot {
            display: inline-block;
            padding: 5px 10px;
            background: #6c757d;
            color: white;
            border-radius: 4px;
            font-size: 12px;
            cursor: pointer;
        }

        .time-slot.selected {
            background: #28a745;
            border: 1px solid #218838;
        }

        .time-slot.real-available {
            background: #ffc107;
            color: #212529;
        }

        .time-slot.attempted {
            opacity: 0.6;
            text-decoration: line-through;
        }

        .helper-controls {
            display: flex;
            flex-direction: column;
            gap: 10px;
            margin-top: 15px;
            padding-top: 15px;
            border-top: 1px solid #dee2e6;
        }

        .control-row {
            display: flex;
            gap: 10px;
        }

        .control-row > * {
            flex: 1;
        }

        .helper-btn {
            padding: 8px 15px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            transition: all 0.2s;
        }

        .helper-btn-primary {
            background: #007bff;
            color: white;
        }

        .helper-btn-primary:hover {
            background: #0069d9;
        }

        .helper-btn-success {
            background: #28a745;
            color: white;
        }

        .helper-btn-success:hover {
            background: #218838;
        }

        .helper-btn-danger {
            background: #dc3545;
            color: white;
        }

        .helper-btn-danger:hover {
            background: #c82333;
        }

        .helper-btn-warning {
            background: #ffc107;
            color: #212529;
        }

        .helper-btn-warning:hover {
            background: #e0a800;
        }

        .no-slots {
            color: #6c757d;
            font-style: italic;
            text-align: center;
            padding: 10px;
        }

        .notification-badge {
            position: absolute;
            top: -5px;
            right: -5px;
            background: #dc3545;
            color: white;
            border-radius: 50%;
            width: 20px;
            height: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
        }

        .month-selector {
            display: flex;
            gap: 5px;
            margin-bottom: 10px;
            flex-wrap: wrap;
        }

        .month-btn {
            padding: 5px 10px;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            background: white;
            cursor: pointer;
            font-size: 12px;
        }

        .month-btn.active {
            background: #007bff;
            color: white;
            border-color: #0069d9;
        }

        .service-selector {
            margin-bottom: 10px;
        }

        select {
            width: 100%;
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #ced4da;
        }

        .time-selection-info {
            font-size: 12px;
            color: #6c757d;
            margin-top: 5px;
        }

        .redirect-notice {
            background: #fff3cd;
            color: #856404;
            padding: 10px;
            border-radius: 4px;
            margin-top: 10px;
            font-size: 13px;
            display: none;
        }

        .client-selector-container {
            position: relative;
            width: 100%;
        }

        .client-selector-btn {
            width: 100%;
            padding: 8px 15px;
            border: none;
            border-radius: 4px;
            background: #007bff;
            color: white;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            text-align: center;
            transition: all 0.2s;
        }

        .client-selector-btn:hover {
            background: #0069d9;
        }

        .client-selector-dropdown {
            position: absolute;
            bottom: 100%;
            left: 0;
            width: 100%;
            max-height: 300px;
            overflow-y: auto;
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            z-index: 10000;
            display: none;
        }

        .client-selector-dropdown.show {
            display: block;
        }

        .client-option {
            padding: 8px 12px;
            cursor: pointer;
            transition: background 0.2s;
            border-bottom: 1px solid #f1f1f1;
            font-size: 13px;
        }

        .client-option:hover {
            background: #f1f8ff;
        }

        .client-option.selected {
            background: #d4edff;
            font-weight: bold;
        }

        .save-date-btn {
            margin-top: 10px;
        }
    `);

    // Load user preferences from storage
    function loadUserPreferences() {
        try {
            const prefs = JSON.parse(GM_getValue(CONFIG.userPrefsKey, '{}'));
            if (prefs.selectedService !== undefined) {
                selectedService = parseInt(prefs.selectedService) || 0;
            }
            if (prefs.selectedMonth !== undefined) {
                selectedMonth = parseInt(prefs.selectedMonth) || (new Date().getMonth() + 1);
            }
            if (prefs.selectedDate) {
                selectedDate = prefs.selectedDate;
            }
            if (prefs.selectedTime) {
                selectedTime = prefs.selectedTime;
            }
            if (prefs.checkingActive !== undefined) {
                checkingActive = prefs.checkingActive;
            }
            if (prefs.selectedClientId !== undefined) {
                selectedClientId = parseInt(prefs.selectedClientId);
            }
            if (prefs.attemptedTimes) {
                attemptedTimes = new Set(prefs.attemptedTimes);
            }
        } catch (e) {
            console.error('Error loading user preferences:', e);
        }
    }

    // Save user preferences to storage
    function saveUserPreferences() {
        const prefs = {
            selectedService,
            selectedMonth,
            selectedDate,
            selectedTime,
            checkingActive,
            selectedClientId,
            attemptedTimes: Array.from(attemptedTimes)
        };
        GM_setValue(CONFIG.userPrefsKey, JSON.stringify(prefs));
    }

    // Initialize the UI
    function initUI() {
        // Load saved preferences
        loadUserPreferences();

        // Create main container
        const panel = document.createElement('div');
        panel.className = 'greek-consulate-helper';

        // Create header
        const header = document.createElement('div');
        header.className = 'helper-header';
        header.innerHTML = `
            <span>Greek Consulate Helper</span>
            <span id="activeBadge" style="font-size:12px;background:${checkingActive ? '#28a745' : '#ffc107'};padding:2px 8px;border-radius:10px;">${checkingActive ? 'ACTIVE' : 'PAUSED'}</span>
        `;
        panel.appendChild(header);

        // Create body
        const body = document.createElement('div');
        body.className = 'helper-body';

        // Create service selector
        const serviceSelector = document.createElement('div');
        serviceSelector.className = 'service-selector';
        const select = document.createElement('select');
        select.id = 'serviceSelect';
        CONFIG.services.forEach((service, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = service.name;
            option.selected = index === selectedService;
            select.appendChild(option);
        });
        select.addEventListener('change', () => {
            selectedService = parseInt(select.value);
            selectedDate = null;
            selectedTime = null;
            attemptedTimes.clear();
            saveUserPreferences();
            startChecking();
            displayFakeSlots();
        });
        serviceSelector.appendChild(select);
        body.appendChild(serviceSelector);

        // Create month selector
        const monthSelector = document.createElement('div');
        monthSelector.className = 'month-selector';

        // Create buttons for each month
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        monthNames.forEach((name, index) => {
            const monthBtn = document.createElement('button');
            monthBtn.className = `month-btn ${index + 1 === selectedMonth ? 'active' : ''}`;
            monthBtn.textContent = name;
            monthBtn.dataset.month = index + 1;
            monthBtn.addEventListener('click', () => {
                selectedMonth = parseInt(monthBtn.dataset.month);
                document.querySelectorAll('.month-btn').forEach(btn => btn.classList.remove('active'));
                monthBtn.classList.add('active');
                selectedDate = null;
                selectedTime = null;
                attemptedTimes.clear();
                saveUserPreferences();
                startChecking();
                displayFakeSlots();
            });
            monthSelector.appendChild(monthBtn);
        });
        body.appendChild(monthSelector);

        // Create status element
        const statusElement = document.createElement('div');
        statusElement.id = 'helperStatus';
        statusElement.className = 'helper-status';
        statusElement.textContent = 'Ready to check';
        body.appendChild(statusElement);

        // Create error status element
        const errorElement = document.createElement('div');
        errorElement.id = 'errorStatus';
        errorElement.className = 'error-status';
        body.appendChild(errorElement);

        // Create slots container
        const slotsContainer = document.createElement('div');
        slotsContainer.id = 'slotsDisplay';
        slotsContainer.className = 'slots-container';
        body.appendChild(slotsContainer);

        // Create redirect notice
        const redirectNotice = document.createElement('div');
        redirectNotice.id = 'redirectNotice';
        redirectNotice.className = 'redirect-notice';
        redirectNotice.textContent = 'Preparing to redirect...';
        redirectNotice.style.display = 'none';
        body.appendChild(redirectNotice);

        // Create time selection info
        const timeInfo = document.createElement('div');
        timeInfo.className = 'time-selection-info';
        timeInfo.textContent = 'Click on a time slot to select it - you will be automatically redirected';
        timeInfo.style.display = 'none';
        body.appendChild(timeInfo);

        // Create controls
        const controls = document.createElement('div');
        controls.className = 'helper-controls';

        // Control row 1
        const row1 = document.createElement('div');
        row1.className = 'control-row';

        // Check now button
        const checkBtn = document.createElement('button');
        checkBtn.className = 'helper-btn helper-btn-primary';
        checkBtn.textContent = 'Check Now';
        checkBtn.addEventListener('click', startChecking);
        row1.appendChild(checkBtn);

        // Toggle auto-check
        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'helper-btn helper-btn-primary';
        toggleBtn.textContent = checkingActive ? 'Pause Auto-Check' : 'Resume Auto-Check';
        toggleBtn.addEventListener('click', () => {
            checkingActive = !checkingActive;
            toggleBtn.textContent = checkingActive ? 'Pause Auto-Check' : 'Resume Auto-Check';
            document.getElementById('activeBadge').textContent = checkingActive ? 'ACTIVE' : 'PAUSED';
            document.getElementById('activeBadge').style.background = checkingActive ? '#28a745' : '#ffc107';
            saveUserPreferences();

            if (checkingActive) {
                startChecking();
            } else {
                stopChecking();
            }
        });
        row1.appendChild(toggleBtn);

        controls.appendChild(row1);

        // Control row 2
        const row2 = document.createElement('div');
        row2.className = 'control-row';

        // Clear storage button
        const clearBtn = document.createElement('button');
        clearBtn.className = 'helper-btn helper-btn-danger';
        clearBtn.textContent = 'Clear Storage';
        clearBtn.addEventListener('click', clearStorage);
        row2.appendChild(clearBtn);

        // Client selector button
        const clientSelectorContainer = document.createElement('div');
        clientSelectorContainer.className = 'client-selector-container';

        const clientSelectorBtn = document.createElement('button');
        clientSelectorBtn.className = 'helper-btn helper-btn-primary client-selector-btn';
        clientSelectorBtn.textContent = selectedClientId ? `Client: ${getClientName(selectedClientId)}` : 'Select Client';
        clientSelectorBtn.addEventListener('click', toggleClientDropdown);

        const clientDropdown = document.createElement('div');
        clientDropdown.className = 'client-selector-dropdown';

        // Add client options to dropdown
        CLIENTS.forEach(client => {
            const clientOption = document.createElement('div');
            clientOption.className = `client-option ${selectedClientId === client.id ? 'selected' : ''}`;
            clientOption.dataset.clientId = client.id;
            clientOption.innerHTML = `<div>${client.firstName} ${client.lastName}</div>`;
            clientOption.addEventListener('click', () => selectClient(client.id));
            clientDropdown.appendChild(clientOption);
        });

        clientSelectorContainer.appendChild(clientSelectorBtn);
        clientSelectorContainer.appendChild(clientDropdown);
        row2.appendChild(clientSelectorContainer);

        controls.appendChild(row2);

        // Save date button
        const saveDateBtn = document.createElement('button');
        saveDateBtn.className = 'helper-btn helper-btn-success save-date-btn';
        saveDateBtn.textContent = 'Save Date & Time';
        saveDateBtn.addEventListener('click', () => {
            if (selectedDate && selectedTime) {
                saveUserPreferences();
                GM_notification({
                    title: 'Date Saved',
                    text: `Saved ${formatDate(selectedDate)} at ${selectedTime}`,
                    silent: false,
                    timeout: 2000
                });
            } else {
                updateErrorStatus('Please select both a date and time');
            }
        });
        controls.appendChild(saveDateBtn);

        body.appendChild(controls);
        panel.appendChild(body);
        document.body.appendChild(panel);

        // Initialize audio
        initAudio();

        // Start checking and display fake slots
        startChecking();
        displayFakeSlots();

        // Set up form autofill observer
        setupFormAutofill();

        // Set up interval for checking
        setupCheckInterval();

        // Set up error page observer
        setupErrorPageObserver();

        // Check if we're on the form page and play success alarm if needed
        if (document.getElementById('aebofirstname') && !successAlarmPlayed) {
            playSuccessAlarm();
            successAlarmPlayed = true;
        }
    }

    // Set up observer for error page detection
    function setupErrorPageObserver() {
        errorPageObserver = new MutationObserver(() => {
            const errorElement = document.querySelector('.aero_error_wrap');
            if (errorElement && (errorElement.textContent.includes('Invalid request') ||
                errorElement.textContent.includes('Invalid book date'))) {
                console.log('Error page detected, initiating retry...');
                handleRedirectError();
            } else if (document.getElementById('aebofirstname')) {
                // If we're on the form page, play success alarm
                console.log('Form page detected, success!');
                if (!successAlarmPlayed) {
                    playSuccessAlarm();
                    successAlarmPlayed = true;
                }
                clearRedirectQueue();
            }
        });

        errorPageObserver.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Clear the redirect queue
    function clearRedirectQueue() {
        redirectQueue = [];
    }

    // Handle redirect error by trying next available time
    function handleRedirectError() {
        if (redirectInProgress) return;

        const service = CONFIG.services[selectedService];
        if (!service || !selectedDate) return;

        // Mark this time as attempted
        if (selectedTime) {
            attemptedTimes.add(selectedTime);
            saveUserPreferences();
            updateAttemptedTimeSlots();
        }

        // Get all available times for the selected date
        const availableTimes = service.fakeTimes.filter(time => !attemptedTimes.has(time));

        if (availableTimes.length === 0) {
            // All times have been attempted, reset and try again
            attemptedTimes.clear();
            saveUserPreferences();
            updateAttemptedTimeSlots();
            console.log('All time slots attempted, resetting and trying again');

            // Show notification
            GM_notification({
                title: 'All Slots Attempted',
                text: 'All time slots have been tried, resetting and trying again',
                silent: false,
                timeout: 2000
            });

            // Try again with a fresh set of times
            const nextTime = getRandomTime(service.fakeTimes);
            selectedTime = nextTime;
            saveUserPreferences();

            setTimeout(() => {
                performRedirect();
            }, CONFIG.errorRetryDelay);
            return;
        }

        // Select a random time from the available times
        const nextTime = getRandomTime(availableTimes);
        selectedTime = nextTime;
        saveUserPreferences();
        console.log(`Trying next time slot: ${selectedTime}`);

        // Show notification
        GM_notification({
            title: 'Retrying with Different Time',
            text: `Attempting time slot ${selectedTime} after error`,
            silent: false,
            timeout: 2000
        });

        // Redirect again after short delay
        redirectInProgress = true;
        setTimeout(() => {
            performRedirect();
            redirectInProgress = false;
        }, CONFIG.errorRetryDelay);
    }

    // Get a random time from the available times
    function getRandomTime(times) {
        return times[Math.floor(Math.random() * times.length)];
    }

    // Update attempted time slots in the UI
    function updateAttemptedTimeSlots() {
        document.querySelectorAll('.time-slot').forEach(slot => {
            if (attemptedTimes.has(slot.dataset.time)) {
                slot.classList.add('attempted');
            } else {
                slot.classList.remove('attempted');
            }
        });
    }

    // Play success alarm when reaching the form page
    function playSuccessAlarm() {
        try {
            const audio = new Audio(CONFIG.alarmSound);
            audio.loop = false;
            audio.play().catch(err => console.warn("Alarm playback blocked by browser."));

            // Show notification
            GM_notification({
                title: 'Success!',
                text: 'Reached the appointment form page',
                silent: false,
                timeout: 5000
            });
        } catch (error) {
            console.warn('Error playing success alarm:', error);
        }
    }

    // Set up the checking interval
    function setupCheckInterval() {
        if (checkIntervalId) {
            clearInterval(checkIntervalId);
        }

        checkIntervalId = setInterval(() => {
            if (checkingActive) {
                startChecking();
            }
        }, CONFIG.checkInterval);
    }

    // Stop checking
    function stopChecking() {
        if (checkIntervalId) {
            clearInterval(checkIntervalId);
            checkIntervalId = null;
        }
    }

    // Display fake slots for all days in the selected month
    function displayFakeSlots() {
        const service = CONFIG.services[selectedService];
        if (!service) return;

        const slotsContainer = document.getElementById('slotsDisplay');
        slotsContainer.innerHTML = '';

        // Get number of days in the selected month
        const daysInMonth = new Date(CONFIG.currentYear, selectedMonth, 0).getDate();

        // Calculate start day (for Greece Work service, show only last 15 days)
        let startDay = 1;
        if (service.name === "Greece Work" && service.daysToShow < daysInMonth) {
            startDay = daysInMonth - service.daysToShow + 1;
        }

        // Generate fake slots for days in the month
        const fakeSlots = [];
        for (let day = startDay; day <= daysInMonth; day++) {
            fakeSlots.push({
                date: `${selectedMonth}/${day}/${CONFIG.currentYear}`,
                times: [...service.fakeTimes]
            });
        }

        // Display the fake slots
        fakeSlots.forEach(slot => {
            const slotElement = document.createElement('div');
            slotElement.className = `slot-day ${selectedDate === slot.date ? 'selected' : ''}`;
            slotElement.dataset.date = slot.date;

            const dateElement = document.createElement('div');
            dateElement.className = 'slot-date';
            dateElement.textContent = formatDate(slot.date);
            slotElement.appendChild(dateElement);

            const timesContainer = document.createElement('div');
            timesContainer.className = 'slot-times';

            slot.times.forEach(time => {
                const timeSpan = document.createElement('span');
                timeSpan.className = `time-slot ${selectedTime === time ? 'selected' : ''} ${attemptedTimes.has(time) ? 'attempted' : ''}`;
                timeSpan.textContent = time;
                timeSpan.dataset.time = time;

                // Check if this time is actually available
                if (isTimeActuallyAvailable(slot.date, time)) {
                    timeSpan.classList.add('real-available');
                }

                timeSpan.addEventListener('click', (e) => {
                    e.stopPropagation();
                    document.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));
                    timeSpan.classList.add('selected');
                    selectedTime = time;
                    document.querySelector('.time-selection-info').style.display = 'block';

                    // Also select the date if not already selected
                    if (selectedDate !== slot.date) {
                        document.querySelectorAll('.slot-day').forEach(el => el.classList.remove('selected'));
                        slotElement.classList.add('selected');
                        selectedDate = slot.date;
                        // Reset attempted times when changing date
                        attemptedTimes.clear();
                        saveUserPreferences();
                        updateAttemptedTimeSlots();
                    }

                    saveUserPreferences();
                    initiateRedirect();
                });
                timesContainer.appendChild(timeSpan);
            });

            slotElement.appendChild(timesContainer);
            slotsContainer.appendChild(slotElement);

            // Add click handler for date selection
            slotElement.addEventListener('click', () => {
                document.querySelectorAll('.slot-day').forEach(el => el.classList.remove('selected'));
                slotElement.classList.add('selected');
                selectedDate = slot.date;
                document.querySelector('.time-selection-info').style.display = 'block';

                // Reset attempted times when changing date
                attemptedTimes.clear();
                saveUserPreferences();
                updateAttemptedTimeSlots();

                // If only one time slot is available, auto-select it and redirect
                if (slot.times.length === 1) {
                    selectedTime = slot.times[0];
                    document.querySelectorAll('.time-slot').forEach(el => el.classList.remove('selected'));
                    document.querySelector(`.time-slot[data-time="${selectedTime}"]`).classList.add('selected');
                    saveUserPreferences();
                    initiateRedirect();
                } else if (selectedTime && slot.times.includes(selectedTime)) {
                    // Keep the selected time if it's available for this date
                    document.querySelector(`.time-slot[data-time="${selectedTime}"]`).classList.add('selected');
                } else {
                    // Otherwise require time selection
                    selectedTime = null;
                }
            });
        });

        if (fakeSlots.length > 0) {
            document.querySelector('.time-selection-info').style.display = 'block';
        }

        // Restore selection if any
        if (selectedDate) {
            const matchingSlot = fakeSlots.find(slot => slot.date === selectedDate);
            if (matchingSlot) {
                const slotElement = document.querySelector(`.slot-day[data-date="${selectedDate}"]`);
                if (slotElement) {
                    slotElement.classList.add('selected');

                    if (selectedTime && matchingSlot.times.includes(selectedTime)) {
                        const timeElement = document.querySelector(`.time-slot[data-time="${selectedTime}"]`);
                        if (timeElement) {
                            timeElement.classList.add('selected');
                        }
                    } else if (matchingSlot.times.length === 1) {
                        selectedTime = matchingSlot.times[0];
                        document.querySelector(`.time-slot[data-time="${selectedTime}"]`).classList.add('selected');
                        saveUserPreferences();
                    }
                }
            }
        }
    }

    // Check if a time is actually available (from real slots)
    function isTimeActuallyAvailable(date, time) {
        const realSlot = realAvailableSlots.find(slot => slot.date === date);
        if (!realSlot) return false;
        return realSlot.times.includes(time);
    }

    // Get client name by ID
    function getClientName(clientId) {
        const client = CLIENTS.find(c => c.id === clientId);
        return client ? `${client.firstName} ${client.lastName}` : 'Unknown';
    }

    // Toggle client dropdown
    function toggleClientDropdown() {
        const dropdown = document.querySelector('.client-selector-dropdown');
        dropdown.classList.toggle('show');
    }

    // Select a client
    function selectClient(clientId) {
        selectedClientId = clientId;
        saveUserPreferences();

        // Update button text
        const clientBtn = document.querySelector('.client-selector-btn');
        if (clientBtn) {
            clientBtn.textContent = `Client: ${getClientName(clientId)}`;
        }

        // Update dropdown selection
        document.querySelectorAll('.client-option').forEach(option => {
            option.classList.toggle('selected', parseInt(option.dataset.clientId) === clientId);
        });

        // Hide dropdown
        document.querySelector('.client-selector-dropdown').classList.remove('show');

        // Fill form if available
        if (document.getElementById('aebofirstname')) {
            fillFormWithClientData(clientId);
        }
    }

    // Fill form with client data
    function fillFormWithClientData(clientId) {
        const client = CLIENTS.find(c => c.id === clientId);
        if (!client) return;

        const fields = {
            'aebofirstname': client.firstName,
            'aebolastname': client.lastName,
            'aeboemail': client.email,
            'aebocountry': 'PK',
            'aebocity': client.city,
            'aeboaddress': client.address,
            'aebopostalcode': client.postalCode,
            'aebophone': client.telephone,
            'aebomobile': client.mobile,
            'aebccustom3': client.fatherName,
            'aebccustom2': client.employerName,
            'aebp1firstname': client.p1firstName,
            'aebp1lastname': client.p1lastName
        };

        for (const [id, value] of Object.entries(fields)) {
            const field = document.getElementById(id);
            if (field) field.value = value;
        }

        // Also check the agree box
        checkAgreeBox();
    }

    // Check agree checkbox
    function checkAgreeBox() {
        const agreeCheckbox = document.querySelector("#fmaebook > div.elx5_formrow > label > span");
        if (agreeCheckbox && !agreeCheckbox.classList.contains('checked')) {
            agreeCheckbox.click();
        }
    }

    // Set up form autofill observer
    function setupFormAutofill() {
        // Check for form immediately
        if (document.getElementById('aebofirstname') && selectedClientId) {
            fillFormWithClientData(selectedClientId);
        }

        // Also check when page content changes
        const observer = new MutationObserver(() => {
            if (document.getElementById('aebofirstname') && selectedClientId) {
                fillFormWithClientData(selectedClientId);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        // Run checkAgreeBox periodically
        setInterval(checkAgreeBox, 1000);
    }

    // Initialize audio elements
    function initAudio() {
        beepAudio = new Audio(GM_getResourceURL('beepSound'));
        alertAudio = new Audio(GM_getResourceURL('alertSound'));
    }

    // Update error status display
    function updateErrorStatus(message) {
        const errorElement = document.getElementById('errorStatus');
        errorElement.textContent = message;
        errorElement.style.display = message ? 'block' : 'none';
    }

    // Clear storage
    function clearStorage() {
        GM_setValue(CONFIG.storageKey, JSON.stringify([]));
        GM_setValue(CONFIG.userPrefsKey, JSON.stringify({}));
        document.getElementById('slotsDisplay').innerHTML = '';
        document.getElementById('helperStatus').textContent = 'Storage cleared';
        updateErrorStatus('');
        selectedDate = null;
        selectedTime = null;
        attemptedTimes.clear();
        document.getElementById('redirectNotice').style.display = 'none';
        document.querySelector('.time-selection-info').style.display = 'none';

        // Reset to defaults
        selectedService = 0;
        selectedMonth = new Date().getMonth() + 1;
        checkingActive = true;
        selectedClientId = null;

        // Update UI to reflect defaults
        const serviceSelect = document.getElementById('serviceSelect');
        if (serviceSelect) serviceSelect.selectedIndex = 0;

        const monthBtns = document.querySelectorAll('.month-btn');
        monthBtns.forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.month) === selectedMonth) {
                btn.classList.add('active');
            }
        });

        const clientBtn = document.querySelector('.client-selector-btn');
        if (clientBtn) {
            clientBtn.textContent = 'Select Client';
        }

        setTimeout(() => {
            document.getElementById('helperStatus').textContent = 'Ready to check';
        }, 1000);
    }

    // Format date for display (MM/DD/YYYY)
    function formatDate(dateStr) {
        const [month, day, year] = dateStr.split('/');
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
    }

    // Initiate redirect process
    function initiateRedirect() {
        if (isRedirecting) return;

        if (!selectedDate || !selectedTime) {
            updateErrorStatus('Please select both a date and time slot');
            return;
        }

        const service = CONFIG.services[selectedService];
        if (!service) {
            updateErrorStatus('Invalid service selected');
            return;
        }

        isRedirecting = true;
        const notice = document.getElementById('redirectNotice');
        notice.textContent = `Redirecting to ${formatDate(selectedDate)} at ${selectedTime}...`;
        notice.style.display = 'block';

        // Play alarm to notify user
        playAlarm();

        // Show notification
        GM_notification({
            title: 'Redirecting to Appointment',
            text: `You will be redirected to book your appointment for ${formatDate(selectedDate)} at ${selectedTime}`,
            silent: false,
            timeout: 3000
        });

        // Redirect after short delay
        setTimeout(() => {
            performRedirect();
        }, CONFIG.redirectDelay);
    }

    // Perform the actual redirect
    function performRedirect() {
        const service = CONFIG.services[selectedService];
        const [month, day, year] = selectedDate.split('/');
        const timeFormatted = selectedTime.replace(':', 'm');

        // Construct URL in the exact format used by the website
        const url = `https://appointment.mfa.gr/en/reservations/aero/book/?bid=${service.bid}&day=${day}&month=${month}&year=${year}&time=${timeFormatted}&adults=${CONFIG.adults}&children=${CONFIG.children}`;

        console.log('Redirecting to:', url);
        window.location.href = url;
    }

    // Play alarm sound
    function playAlarm() {
        try {
            const audio = new Audio(CONFIG.alarmSound);
            audio.loop = true;
            audio.play().catch(err => console.warn("Alarm playback blocked by browser."));
        } catch (error) {
            console.warn('Error playing alarm:', error);
        }
    }

    // Play alert sound
    function playAlert() {
        try {
            if (alertAudio) {
                alertAudio.currentTime = 0;
                alertAudio.play().catch(e => console.warn('Alert play failed:', e));
            }
        } catch (error) {
            console.warn('Error playing alert:', error);
        }
    }

    // Start checking for appointments
    function startChecking() {
        if (!checkingActive) return;

        const service = CONFIG.services[selectedService];
        if (!service) {
            updateErrorStatus('Invalid service selected');
            return;
        }

        // Don't check more than once every 5 seconds
        const now = new Date();
        if (lastCheckTime && (now - lastCheckTime) < 5000) {
            return;
        }
        lastCheckTime = now;

        document.getElementById('helperStatus').textContent = `Checking ${service.name} for ${getMonthName(selectedMonth)} ${CONFIG.currentYear}...`;
        updateErrorStatus('');

        checkMonthAvailability(CONFIG.currentYear, selectedMonth);
    }

    // Get month name
    function getMonthName(monthNumber) {
        const months = ['January', 'February', 'March', 'April', 'May', 'June',
                       'July', 'August', 'September', 'October', 'November', 'December'];
        return months[monthNumber - 1];
    }

    // Check month availability
    function checkMonthAvailability(year, month, attempt = 1) {
        const service = CONFIG.services[selectedService];
        if (!service) return;

        const params = new URLSearchParams();
        params.append('bid', service.bid);
        params.append('year', year);
        params.append('month', month);
        params.append('adults', CONFIG.adults);
        params.append('children', CONFIG.children);
        params.append('rnd', Math.floor(Math.random() * 100));

        GM_xmlhttpRequest({
            method: 'POST',
            url: 'https://appointment.mfa.gr/inner.php/en/reservations/aero/calendar',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'X-Requested-With': 'XMLHttpRequest'
            },
            data: params.toString(),
            timeout: 30000,
            onload: function(response) {
                if (response.status === 503 || response.responseText.includes('503 Service Unavailable')) {
                    handleRetry(year, month, attempt, '503 Service Unavailable');
                } else if (response.status >= 500) {
                    handleRetry(year, month, attempt, `Server Error: ${response.status}`);
                } else if (response.status >= 400) {
                    updateErrorStatus(`Client Error (${response.status}) for ${month}/${year}`);
                    console.warn(`Client Error checking ${month}/${year}:`, response.status);
                } else {
                    try {
                        processResponse(response.responseText, year, month);
                    // After processing, check if we should auto-redirect
                        if (selectedDate && selectedTime) {
                            const slot = realAvailableSlots.find(s => s.date === selectedDate && s.times.includes(selectedTime));
                            if (slot) {
                                initiateRedirect();
                            }
                        }
                    } catch (e) {
                        handleRetry(year, month, attempt, `Processing error: ${e.message}`);
                    }
                }
            },
            onerror: function(error) {
                handleRetry(year, month, attempt, `Connection Error: ${error}`);
            },
            ontimeout: function() {
                handleRetry(year, month, attempt, 'Request Timeout');
            }
        });
    }

    // Handle retry logic
    function handleRetry(year, month, attempt, errorMessage) {
        if (attempt < CONFIG.maxRetries) {
            const delay = CONFIG.initialRetryDelay * Math.pow(CONFIG.retryMultiplier, attempt - 1);
            const nextAttempt = attempt + 1;

            updateErrorStatus(`Retrying ${getMonthName(month)} ${year} (attempt ${nextAttempt}/${CONFIG.maxRetries}) - ${errorMessage}`);
            console.warn(`Retrying ${month}/${year} in ${delay}ms (attempt ${nextAttempt}) - ${errorMessage}`);

            setTimeout(() => checkMonthAvailability(year, month, nextAttempt), delay);
        } else {
            updateErrorStatus(`Failed after ${CONFIG.maxRetries} attempts for ${getMonthName(month)} ${year}`);
            console.error(`Gave up on ${month}/${year} after ${CONFIG.maxRetries} attempts`);
            document.getElementById('helperStatus').textContent = 'Check failed';
        }
    }

    // Process the response
    function processResponse(responseText, year, month) {
        try {
            const parser = new DOMParser();
            const doc = parser.parseFromString(responseText, 'text/html');
            const service = CONFIG.services[selectedService];

            // Check for 503 error in response
            if (doc.querySelector('title')?.textContent.includes('503')) {
                handleRetry(year, month, 1, '503 Service Unavailable');
                return;
            }

            // Find available slots
            const availableDays = doc.querySelectorAll('.aero_bcal_tdopen [class*="aero_bcal_day_"]');
            realAvailableSlots = [];

            availableDays.forEach(dayElement => {
                const dayCell = dayElement.closest('td');
                const scheduleData = dayCell.getAttribute('data-schedule');

                if (!scheduleData) return;

                // Parse available times
                const availableTimes = scheduleData.split('@')
                    .filter(time => time.trim())
                    .map(timeSlot => {
                        const parts = timeSlot.split(';');
                        return {
                            time: parts[0]?.trim() || '',
                            isBooked: parts[3] === '0'
                        };
                    })
                    .filter(slot => !slot.isBooked && slot.time)
                    .map(slot => slot.time);

                if (availableTimes.length > 0) {
                    const day = dayElement.textContent.trim();
                    if (day) {
                        realAvailableSlots.push({
                            date: `${month}/${day}/${year}`,
                            times: availableTimes
                        });
                    }
                }
            });

            if (realAvailableSlots.length > 0) {
                console.log(`Available slots for ${service.name} in ${month}/${year}:`, realAvailableSlots);
                document.getElementById('helperStatus').innerHTML = `Found ${realAvailableSlots.length} available days for <b>${service.name}</b> in <b>${getMonthName(month)} ${year}</b> - ${new Date().toLocaleTimeString()}`;

                // Update fake slots to highlight real availability
                updateFakeSlotsHighlighting();

                if (realAvailableSlots.length >= CONFIG.notificationThreshold) {
                    notifyAvailability(realAvailableSlots, month, year);
                }
            } else {
                playBeep();
                console.log(`No availability for ${service.name} in ${month}/${year}`);
                document.getElementById('helperStatus').innerHTML = `No availability for <b>${service.name}</b> in <b>${getMonthName(month)} ${year}</b> - ${new Date().toLocaleTimeString()}`;
            }

            updateErrorStatus(`Last checked: ${new Date().toLocaleTimeString()}`);
        } catch (error) {
            console.error(`Error processing response for ${month}/${year}:`, error);
            handleRetry(year, month, 1, `Response processing error: ${error.message}`);
        }
    }

    // Update fake slots highlighting based on real availability
    function updateFakeSlotsHighlighting() {
        const timeSlots = document.querySelectorAll('#slotsDisplay .time-slot');
        timeSlots.forEach(slot => {
            const date = slot.closest('.slot-day').dataset.date;
            const time = slot.dataset.time;

            // Remove previous highlighting
            slot.classList.remove('real-available');

            // Add highlighting if this time is actually available
            if (isTimeActuallyAvailable(date, time)) {
                slot.classList.add('real-available');
            }
        });
    }

    // Play beep sound
    function playBeep() {
        try {
            if (beepAudio) {
                beepAudio.currentTime = 0;
                beepAudio.play().catch(e => console.warn('Beep play failed:', e));
            }
        } catch (error) {
            console.warn('Error playing beep:', error);
        }
    }

    // Notify about available slots
    function notifyAvailability(slots, month, year) {
        const service = CONFIG.services[selectedService];
        const message = `Found ${slots.length} available days for ${service.name} in ${getMonthName(month)} ${year}`;
        console.log(message);
        playAlert();

        // Create notification badge
        const header = document.querySelector('.greek-consulate-helper .helper-header');
        if (header) {
            let badge = header.querySelector('.notification-badge');
            if (!badge) {
                badge = document.createElement('div');
                badge.className = 'notification-badge';
                header.appendChild(badge);
            }
            badge.textContent = slots.length;
            badge.style.display = 'flex';

            // Remove badge after 5 seconds
            setTimeout(() => {
                badge.style.display = 'none';
            }, 5000);
        }

        // Show desktop notification
        GM_notification({
            title: 'Appointment Available!',
            text: message,
            silent: false,
            timeout: 10000,
            onclick: function() {
                window.focus();
            }
        });
    }

    // Initialize the script
    setTimeout(() => {
        try {
            initUI();
        } catch (error) {
            console.error('Initialization error:', error);
            if (document.getElementById('errorStatus')) {
                document.getElementById('errorStatus').textContent = 'Initialization failed - check console';
            }
        }
    }, 1000);
})();