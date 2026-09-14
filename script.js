/* ═══════════════════════════════════════════════════════════════════════════
   RoG-उपाttam — Clinical History Assistant
   Frontend-only prototype. All state lives in memory.

   Sections:
     1. Global state
     2. Translations (English + Hindi)
     3. Clinical question bank (adaptive per concern)
     4. AYUSH parameters
     5. Utility helpers
     6. Navigation
     7. Voice input (Web Speech API)
     8. Document upload (prototype extraction)
     9. Red-flag safety rules
    10. Summary generation
    11. Render functions
    12. Event handlers
    13. Initialisation
   ═══════════════════════════════════════════════════════════════════════════ */


/* ═══════════════════════════════════════════════════════════════════════════
   1. GLOBAL STATE
   ═══════════════════════════════════════════════════════════════════════════ */

const state = {
  screen: 'welcome',
  lang: 'en',
  consented: false,
  selectedProblem: '',         // concern id or 'other'
  patientAnswers: {},          // { qid: { value, label } }
  currentQuestion: 0,
  uploadedDocument: null,      // { name, size, dataUrl, extracting, extraction }
  patientSummary: null,
  urgentFlag: null,            // { rule, reason }
  ayushAnswers: {},            // { paramId: optionId }
  physicianVerified: false,
  physicianReviewed: false,
  settingsOpen: false,

  accessibility: {
    touchOnly: false,
    largeText: false,
    highContrast: false,
    audio: true
  },

  voice: {
    listening: false,
    error: null,
    supported: true
  }
};


/* ═══════════════════════════════════════════════════════════════════════════
   2. TRANSLATIONS
   Every visible UI string lives here. Add a language by adding one key.
   ═══════════════════════════════════════════════════════════════════════════ */

const translations = {
  en: {
    appName: 'RoG-उपाttam',
    appTag:  'Clinical History Assistant',

    // Welcome
    welcomeTitle: 'Your health story, clearly prepared for your doctor.',
    welcomeSub:   'Speak naturally, answer by touch, or upload a medical document. RoG-उपाttam turns everything into a structured clinical history your doctor can review in seconds.',
    startAssessment: 'Start Health Assessment',
    language: 'Language',
    f1Title: 'Speak or tap',
    f1Desc:  'Answer questions naturally — by voice or by touch.',
    f2Title: 'Upload documents',
    f2Desc:  'Add photos of prescriptions, lab reports or discharge summaries.',
    f3Title: 'Accessible by design',
    f3Desc:  'Large touch targets. Works for elderly, low-literacy and non-speaking patients.',
    f4Title: 'AYUSH-aware',
    f4Desc:  'Optional Dashavidha Pariksha and Ahara-Vihara history collection.',

    // Consent
    consentTitle: 'Before we begin',
    consentBody:  'RoG-उपाttam records your health concern so a doctor can review it before your consultation. Nothing is sent anywhere from this session.',
    consentPoints: [
      'The assistant asks structured questions. It does not diagnose.',
      'You can stop at any time and continue using touch only.',
      'You can review everything before it reaches the doctor.',
      'A qualified healthcare professional makes all clinical decisions.'
    ],
    consentAgree: 'I Understand & Continue',
    hearExplanation: 'Hear explanation',

    // Home dashboard
    homeTitle: 'How would you like to proceed?',
    homeSub:   'Choose a section. You can return to this screen at any time.',
    startIntake:  'Start Health Assessment',
    startIntakeSub: 'Select a concern and answer guided questions.',
    uploadDocs:   'Upload Medical Documents',
    uploadDocsSub:'Digitize prescriptions, reports or summaries.',
    ayushHistory: 'AYUSH History',
    ayushHistorySub:'Optional Dashavidha Pariksha and Ahara-Vihara.',
    reviewInfo:   'Review My Information',
    reviewInfoSub:'Check and edit what has been collected.',
    accessibilityBtn: 'Accessibility',
    accessibilitySub: 'Large text, high contrast, touch-only mode.',

    // Concern selection
    chooseConcern: 'What is your main concern today?',
    chooseConcernSub: 'Select the option that best matches your situation.',
    otherConcern:  'Other Health Concern',
    otherConcernSub:'Describe your concern in your own words.',

    // Question screen
    question: 'Question',
    of: 'of',
    back: 'Back',
    continue: 'Continue',
    skip:   'Skip',
    tapToSpeak: 'Tap to speak',
    listening:  'Listening…',
    stop:       'Stop',
    orChoose:   'Or choose an option',
    typeHere:   'Or type your answer here',
    send:       'Confirm',
    repeatQ:    'Repeat question',
    voiceUnavailable: 'Voice input is not available on this device. Please use touch or text input.',
    micDenied:  'Microphone access was denied. Please allow it in your browser settings.',
    noSpeech:   'We didn\u2019t hear anything. Please try again.',
    voiceErr:   'Voice input did not work. You can continue with touch.',

    // Document
    docTitle: 'Add previous medical documents',
    docSub:   'Upload or photograph a prescription, lab report, discharge summary or other medical document. You may skip this step.',
    docUpload: 'Tap to upload or take a photo',
    docFormats: 'JPG · PNG · PDF · up to 10 MB',
    docAnalyzing: 'Analyzing document…',
    docAnalyzed:  'Document analysis preview',
    docNote: 'Preview of extracted information. Verify against the original document.',
    docSkip: 'Skip this step',
    docRemove: 'Remove',
    docAddAnother: 'Add another document',

    // Review
    reviewTitle: 'Review your health information',
    reviewSub: 'Check the answers below. Tap edit to correct any information before continuing.',
    reviewEdit: 'Edit',

    // Summary
    summaryTitle: 'Your health summary',
    summarySub: 'This is what will be shared with your doctor.',
    summaryGuidance: 'Automated guidance',
    summaryInfoOnly: 'This information is intended to help your healthcare professional understand your history. It is not a diagnosis.',
    openPhysician: 'Open doctor summary',
    newAssessment: 'Start a new assessment',

    // Urgent alert
    urgentTitle: 'Priority Medical Assessment Recommended',
    urgentBody:  'Some symptoms may require prompt medical attention. Please seek immediate assistance from hospital staff.',
    urgentNoDiagnosis: 'This is not a diagnosis. A qualified healthcare professional will assess your symptoms.',
    findHospital: 'Find Nearby Hospital / Emergency Care',
    contactStaff: 'Contact Hospital Staff',
    continueAnyway:'Continue to summary',

    // Nearby
    nearbyTitle: 'Nearby Medical Facilities',
    nearbySub:   'Sample facilities shown for demonstration. A production system would connect a live hospital directory or maps API.',
    directions:  'Directions',
    callHospital:'Call',

    // AYUSH
    ayushTitle: 'AYUSH History',
    ayushSub:   'This section collects Dashavidha Pariksha and Ahara-Vihara parameters for the AYUSH physician. No diagnosis or treatment is generated.',
    ayushSave:  'Save AYUSH history',

    // ABDM
    abdmTitle: 'Ready for secure health-record integration',
    abdmSub:   'RoG-उपाttam produces a structured clinical history compatible with standard health-record formats. The following integration points are planned for production deployment.',
    abdmReady: 'Ready',
    abdmFuture:'Planned',
    abdmBack:  'Back',

    // Physician
    physicianTitle: 'Clinical History Summary',
    physicianSub:   'Structured intake record prepared with RoG-उपाttam.',
    physicianBanner: 'Clinical information is patient-reported and should be reviewed and verified by the treating physician. The physician remains responsible for diagnosis and treatment decisions.',
    editSummary: 'Edit Summary',
    verifyHistory: 'Verify History',
    markReviewed: 'Mark Reviewed',
    verified: 'Information Verified',
    reviewed: 'Marked as Reviewed',

    // Settings
    settingsTitle: 'Accessibility & preferences',
    langLabel: 'Language',
    largeText: 'Large text',
    highContrast: 'High contrast',
    audioInstr: 'Read questions aloud',
    touchOnly: 'I cannot speak (touch only)',
    close: 'Close',

    // Misc
    yes: 'Yes',
    no: 'No',
    age: 'Age',
    day: 'day',
    days: 'days',
    etc: 'etc.'
  },

  hi: {
    appName: 'RoG-उपाttam',
    appTag:  'क्लिनिकल इतिहास सहायक',

    welcomeTitle: 'आपकी स्वास्थ्य कहानी, डॉक्टर के लिए स्पष्ट रूप से तैयार।',
    welcomeSub:   'स्वाभाविक रूप से बोलें, स्पर्श से उत्तर दें, या चिकित्सा दस्तावेज़ अपलोड करें। RoG-उपाttam सब कुछ एक संरचित क्लिनिकल इतिहास में बदल देता है जिसे आपके डॉक्टर सेकंडों में देख सकते हैं।',
    startAssessment: 'स्वास्थ्य मूल्यांकन शुरू करें',
    language: 'भाषा',
    f1Title: 'बोलें या टैप करें',
    f1Desc:  'प्रश्नों का उत्तर स्वाभाविक रूप से दें — आवाज़ या स्पर्श से।',
    f2Title: 'दस्तावेज़ अपलोड करें',
    f2Desc:  'पर्चे, लैब रिपोर्ट या डिस्चार्ज सारांश की फ़ोटो जोड़ें।',
    f3Title: 'सुगम्य डिज़ाइन',
    f3Desc:  'बड़े टच टार्गेट। वृद्ध, कम-साक्षर और न-बोलने वाले रोगियों के लिए उपयुक्त।',
    f4Title: 'आयुष-सक्षम',
    f4Desc:  'वैकल्पिक दशविध परीक्षा और आहार-विहार इतिहास संग्रह।',

    consentTitle: 'शुरू करने से पहले',
    consentBody:  'RoG-उपाttam आपकी स्वास्थ्य समस्या दर्ज करता है ताकि डॉक्टर परामर्श से पहले उसे देख सकें। इस सत्र से कोई जानकारी कहीं नहीं भेजी जाती।',
    consentPoints: [
      'सहायक संरचित प्रश्न पूछता है। यह निदान नहीं करता।',
      'आप कभी भी रुक सकते हैं और केवल स्पर्श से आगे बढ़ सकते हैं।',
      'डॉक्टर तक पहुँचने से पहले आप सब कुछ देख सकते हैं।',
      'सभी चिकित्सीय निर्णय योग्य स्वास्थ्य पेशेवर लेते हैं।'
    ],
    consentAgree: 'मैं समझता/समझती हूँ और आगे बढ़ूँ',
    hearExplanation: 'व्याख्या सुनें',

    homeTitle: 'आप कैसे आगे बढ़ना चाहेंगे?',
    homeSub:   'एक अनुभाग चुनें। आप कभी भी इस स्क्रीन पर वापस आ सकते हैं।',
    startIntake:  'स्वास्थ्य मूल्यांकन शुरू करें',
    startIntakeSub: 'समस्या चुनें और निर्देशित प्रश्नों के उत्तर दें।',
    uploadDocs:   'चिकित्सा दस्तावेज़ अपलोड करें',
    uploadDocsSub:'पर्चे, रिपोर्ट या सारांश डिजिटाइज़ करें।',
    ayushHistory: 'आयुष इतिहास',
    ayushHistorySub:'वैकल्पिक दशविध परीक्षा और आहार-विहार।',
    reviewInfo:   'मेरी जानकारी देखें',
    reviewInfoSub:'जो एकत्र किया गया है उसे देखें और संपादित करें।',
    accessibilityBtn: 'सुगम्यता',
    accessibilitySub: 'बड़ा टेक्स्ट, उच्च कंट्रास्ट, केवल-स्पर्श मोड।',

    chooseConcern: 'आज आपकी मुख्य समस्या क्या है?',
    chooseConcernSub: 'वह विकल्प चुनें जो आपकी स्थिति से सबसे अच्छा मेल खाता है।',
    otherConcern:  'अन्य स्वास्थ्य समस्या',
    otherConcernSub:'अपनी समस्या अपने शब्दों में बताएँ।',

    question: 'प्रश्न',
    of: 'में से',
    back: 'पीछे',
    continue: 'आगे बढ़ें',
    skip:   'छोड़ें',
    tapToSpeak: 'बोलने के लिए टैप करें',
    listening:  'सुन रहा हूँ…',
    stop:       'रोकें',
    orChoose:   'या नीचे से विकल्प चुनें',
    typeHere:   'या यहाँ अपना उत्तर लिखें',
    send:       'पुष्टि करें',
    repeatQ:    'प्रश्न दोबारा सुनें',
    voiceUnavailable: 'इस डिवाइस पर वॉइस इनपुट उपलब्ध नहीं है। कृपया स्पर्श या टेक्स्ट का उपयोग करें।',
    micDenied:  'माइक्रोफ़ोन की अनुमति अस्वीकृत। कृपया ब्राउज़र सेटिंग में अनुमति दें।',
    noSpeech:   'कोई आवाज़ नहीं सुनाई दी। कृपया पुनः प्रयास करें।',
    voiceErr:   'वॉइस इनपुट काम नहीं किया। आप स्पर्श से आगे बढ़ सकते हैं।',

    docTitle: 'पिछले चिकित्सा दस्तावेज़ जोड़ें',
    docSub:   'पर्चा, लैब रिपोर्ट, डिस्चार्ज सारांश या अन्य चिकित्सा दस्तावेज़ अपलोड करें या फ़ोटो लें। आप यह चरण छोड़ भी सकते हैं।',
    docUpload: 'अपलोड या फ़ोटो लेने के लिए टैप करें',
    docFormats: 'JPG · PNG · PDF · 10 MB तक',
    docAnalyzing: 'दस्तावेज़ का विश्लेषण हो रहा है…',
    docAnalyzed:  'दस्तावेज़ विश्लेषण पूर्वावलोकन',
    docNote: 'निकाली गई जानकारी का पूर्वावलोकन। मूल दस्तावेज़ से मिलाएँ।',
    docSkip: 'यह चरण छोड़ें',
    docRemove: 'हटाएँ',
    docAddAnother: 'एक और दस्तावेज़ जोड़ें',

    reviewTitle: 'अपनी स्वास्थ्य जानकारी देखें',
    reviewSub: 'नीचे दिए गए उत्तर जाँचें। आगे बढ़ने से पहले किसी भी जानकारी को संपादित करने के लिए संपादित करें पर टैप करें।',
    reviewEdit: 'संपादित करें',

    summaryTitle: 'आपका स्वास्थ्य सारांश',
    summarySub: 'यही जानकारी आपके डॉक्टर के साथ साझा की जाएगी।',
    summaryGuidance: 'स्वचालित मार्गदर्शन',
    summaryInfoOnly: 'यह जानकारी आपके स्वास्थ्य पेशेवर को आपका इतिहास समझने में मदद करने के लिए है। यह निदान नहीं है।',
    openPhysician: 'डॉक्टर सारांश खोलें',
    newAssessment: 'नया मूल्यांकन शुरू करें',

    urgentTitle: 'प्राथमिक चिकित्सीय मूल्यांकन की सलाह',
    urgentBody:  'कुछ लक्षणों के लिए तत्काल चिकित्सीय ध्यान आवश्यक हो सकता है। कृपया अस्पताल स्टाफ से तुरंत सहायता लें।',
    urgentNoDiagnosis: 'यह निदान नहीं है। योग्य स्वास्थ्य पेशेवर आपके लक्षणों का मूल्यांकन करेंगे।',
    findHospital: 'पास का अस्पताल / आपातकालीन देखभाल खोजें',
    contactStaff: 'अस्पताल स्टाफ से संपर्क करें',
    continueAnyway:'सारांश पर जाएँ',

    nearbyTitle: 'आस-पास की चिकित्सा सुविधाएँ',
    nearbySub:   'प्रदर्शन के लिए नमूना सुविधाएँ। उत्पादन प्रणाली में एक लाइव अस्पताल निर्देशिका या मैप्स API जोड़ी जाएगी।',
    directions:  'दिशा-निर्देश',
    callHospital:'कॉल',

    ayushTitle: 'आयुष इतिहास',
    ayushSub:   'यह अनुभाग आयुष चिकित्सक के लिए दशविध परीक्षा और आहार-विहार मान एकत्र करता है। कोई निदान या उपचार उत्पन्न नहीं होता।',
    ayushSave:  'आयुष इतिहास सहेजें',

    abdmTitle: 'सुरक्षित स्वास्थ्य-रिकॉर्ड एकीकरण के लिए तैयार',
    abdmSub:   'RoG-उपाttam एक संरचित क्लिनिकल इतिहास उत्पन्न करता है जो मानक स्वास्थ्य-रिकॉर्ड प्रारूपों के अनुकूल है। निम्नलिखित एकीकरण बिंदु उत्पादन परिनियोजन के लिए नियोजित हैं।',
    abdmReady: 'तैयार',
    abdmFuture:'नियोजित',
    abdmBack:  'पीछे',

    physicianTitle: 'क्लिनिकल इतिहास सारांश',
    physicianSub:   'RoG-उपाttam के साथ तैयार संरचित परिचय रिकॉर्ड।',
    physicianBanner: 'क्लिनिकल जानकारी रोगी द्वारा बताई गई है और उपचार करने वाले चिकित्सक द्वारा समीक्षा और सत्यापन की जानी चाहिए। निदान और उपचार के निर्णयों की जिम्मेदारी चिकित्सक की है।',
    editSummary: 'सारांश संपादित करें',
    verifyHistory: 'इतिहास सत्यापित करें',
    markReviewed: 'समीक्षित के रूप में चिह्नित करें',
    verified: 'जानकारी सत्यापित',
    reviewed: 'समीक्षित के रूप में चिह्नित',

    settingsTitle: 'सुगम्यता और प्राथमिकताएँ',
    langLabel: 'भाषा',
    largeText: 'बड़ा टेक्स्ट',
    highContrast: 'उच्च कंट्रास्ट',
    audioInstr: 'प्रश्न पढ़कर सुनाएँ',
    touchOnly: 'मैं बोल नहीं सकता/सकती (केवल स्पर्श)',
    close: 'बंद करें',

    yes: 'हाँ',
    no: 'नहीं',
    age: 'उम्र',
    day: 'दिन',
    days: 'दिन',
    etc: 'आदि'
  }
};

// Get a translated string
function t(key) {
  const pack = translations[state.lang] || translations.en;
  return pack[key] !== undefined ? pack[key] : (translations.en[key] || key);
}

// Get a localised {en, hi} object
function L(obj) {
  if (!obj) return '';
  return obj[state.lang] || obj.en || '';
}


/* ═══════════════════════════════════════════════════════════════════════════
   3. CLINICAL QUESTION BANK
   Each concern has its own adaptive question list.
   Question shape:
     { id, text:{en,hi}, type:'options'|'number'|'text', options?:[{v,label:{en,hi}}] }
   ═══════════════════════════════════════════════════════════════════════════ */

const YES_NO = [
  { v:'yes', label:{ en:'Yes', hi:'हाँ' } },
  { v:'no',  label:{ en:'No',  hi:'नहीं' } }
];

const DURATION_OPTIONS = [
  { v:'today',    label:{ en:'Today', hi:'आज' } },
  { v:'1to3',     label:{ en:'1–3 days', hi:'1–3 दिन' } },
  { v:'4to7',     label:{ en:'4–7 days', hi:'4–7 दिन' } },
  { v:'gtweek',   label:{ en:'More than a week', hi:'एक हफ्ते से ज़्यादा' } }
];

const SEVERITY_3 = [
  { v:'mild',     label:{ en:'Mild', hi:'हल्का' } },
  { v:'moderate', label:{ en:'Moderate', hi:'मध्यम' } },
  { v:'severe',   label:{ en:'Severe', hi:'तेज़' } }
];

const CONCERNS = [
  {
    id: 'fever',
    emoji: '🤒',
    title: { en:'Fever', hi:'बुखार' },
    desc:  { en:'High temperature, chills, body ache', hi:'तेज़ तापमान, ठंड, शरीर दर्द' },
    questions: [
      { id:'duration', text:{ en:'When did the fever start?', hi:'बुखार कब शुरू हुआ?' }, options: DURATION_OPTIONS },
      { id:'pattern',  text:{ en:'Is the fever continuous or intermittent?', hi:'बुखार लगातार है या रुक-रुक कर?' },
        options:[
          { v:'continuous',   label:{ en:'Continuous', hi:'लगातार' } },
          { v:'intermittent', label:{ en:'Comes and goes', hi:'रुक-रुक कर' } },
          { v:'unsure',       label:{ en:'Not sure', hi:'पता नहीं' } }
        ]},
      { id:'temperature', text:{ en:'What is the highest temperature you have measured?', hi:'आपने जो सबसे तेज़ तापमान मापा है वह क्या है?' }, type:'number', unit:'°F' },
      { id:'chills',   text:{ en:'Do you have chills or shivering?', hi:'क्या आपको ठंड लग रही है या कंपकंपी हो रही है?' }, options: YES_NO },
      { id:'cough',    text:{ en:'Do you have a cough?', hi:'क्या आपको खांसी है?' }, options: YES_NO },
      { id:'vomiting', text:{ en:'Have you had vomiting?', hi:'क्या उल्टी हुई है?' }, options: YES_NO },
      { id:'diarrhea', text:{ en:'Have you had diarrhea?', hi:'क्या दस्त हुए हैं?' }, options: YES_NO },
      { id:'medicine', text:{ en:'Have you taken any medicine for the fever?', hi:'क्या बुखार के लिए कोई दवा ली है?' }, options: YES_NO },
      { id:'history',  text:{ en:'Do you have any previous medical conditions?', hi:'क्या आपको कोई पुरानी बीमारी है?' },
        options:[
          { v:'none',   label:{ en:'None', hi:'कोई नहीं' } },
          { v:'bp',     label:{ en:'High blood pressure', hi:'उच्च रक्तचाप' } },
          { v:'sugar',  label:{ en:'Diabetes', hi:'मधुमेह' } },
          { v:'other',  label:{ en:'Other', hi:'अन्य' } }
        ]}
    ]
  },

  {
    id: 'headache',
    emoji: '🤕',
    title: { en:'Headache', hi:'सिरदर्द' },
    desc:  { en:'Head pain, pressure, vision changes', hi:'सिर दर्द, दबाव, दृष्टि में बदलाव' },
    questions: [
      { id:'duration', text:{ en:'When did the headache start?', hi:'सिरदर्द कब शुरू हुआ?' }, options: DURATION_OPTIONS },
      { id:'location', text:{ en:'Where is the pain?', hi:'दर्द कहाँ है?' },
        options:[
          { v:'forehead', label:{ en:'Forehead', hi:'माथा' } },
          { v:'oneside',  label:{ en:'One side', hi:'एक तरफ़' } },
          { v:'back',     label:{ en:'Back of head', hi:'सिर के पीछे' } },
          { v:'whole',    label:{ en:'Whole head', hi:'पूरा सिर' } }
        ]},
      { id:'severity', text:{ en:'How severe is the headache?', hi:'सिरदर्द कितना तेज़ है?' }, options: SEVERITY_3 },
      { id:'onset',    text:{ en:'Did it start suddenly or gradually?', hi:'यह अचानक शुरू हुआ या धीरे-धीरे?' },
        options:[
          { v:'sudden',   label:{ en:'Suddenly', hi:'अचानक' } },
          { v:'gradual',  label:{ en:'Gradually', hi:'धीरे-धीरे' } }
        ]},
      { id:'vomiting', text:{ en:'Is it associated with vomiting?', hi:'क्या इसके साथ उल्टी हो रही है?' }, options: YES_NO },
      { id:'vision',   text:{ en:'Any vision problems?', hi:'क्या दृष्टि में कोई समस्या है?' }, options: YES_NO },
      { id:'weakness', text:{ en:'Any weakness or numbness?', hi:'क्या कोई कमजोरी या सुन्नपन है?' }, options: YES_NO },
      { id:'fever',    text:{ en:'Do you have fever as well?', hi:'क्या बुखार भी है?' }, options: YES_NO },
      { id:'history',  text:{ en:'Have you had similar headaches before?', hi:'क्या पहले भी ऐसे सिरदर्द हुए हैं?' }, options: YES_NO }
    ]
  },

  {
    id: 'abdominal',
    emoji: '🫃',
    title: { en:'Abdominal Pain', hi:'पेट दर्द' },
    desc:  { en:'Stomach pain, cramps, digestion issues', hi:'पेट दर्द, ऐंठन, पाचन समस्या' },
    questions: [
      { id:'location', text:{ en:'Where is the pain?', hi:'दर्द कहाँ है?' },
        options:[
          { v:'upper',  label:{ en:'Upper abdomen', hi:'ऊपरी पेट' } },
          { v:'lower',  label:{ en:'Lower abdomen', hi:'निचला पेट' } },
          { v:'right',  label:{ en:'Right side', hi:'दाईं ओर' } },
          { v:'left',   label:{ en:'Left side', hi:'बाईं ओर' } },
          { v:'navel',  label:{ en:'Around the navel', hi:'नाभि के आसपास' } }
        ]},
      { id:'duration', text:{ en:'When did the pain start?', hi:'दर्द कब शुरू हुआ?' }, options: DURATION_OPTIONS },
      { id:'severity', text:{ en:'How severe is the pain?', hi:'दर्द कितना तेज़ है?' }, options: SEVERITY_3 },
      { id:'pattern',  text:{ en:'Is it constant or does it come and go?', hi:'यह लगातार है या रुक-रुक कर?' },
        options:[
          { v:'constant', label:{ en:'Constant', hi:'लगातार' } },
          { v:'comes',    label:{ en:'Comes and goes', hi:'रुक-रुक कर' } }
        ]},
      { id:'vomiting', text:{ en:'Have you had vomiting?', hi:'क्या उल्टी हुई है?' }, options: YES_NO },
      { id:'diarrhea', text:{ en:'Have you had diarrhea?', hi:'क्या दस्त हुए हैं?' }, options: YES_NO },
      { id:'constipation', text:{ en:'Are you constipated?', hi:'क्या कब्ज़ है?' }, options: YES_NO },
      { id:'fever',    text:{ en:'Do you have fever?', hi:'क्या बुखार है?' }, options: YES_NO },
      { id:'food',     text:{ en:'Is the pain related to food?', hi:'क्या दर्द भोजन से संबंधित है?' },
        options:[
          { v:'worse',  label:{ en:'Worse after food', hi:'खाने के बाद बढ़ता है' } },
          { v:'better', label:{ en:'Better after food', hi:'खाने के बाद कम होता है' } },
          { v:'none',   label:{ en:'No relation', hi:'कोई संबंध नहीं' } }
        ]},
      { id:'history',  text:{ en:'Have you had abdominal problems before?', hi:'क्या पहले भी पेट की समस्या हुई है?' }, options: YES_NO }
    ]
  },

  {
    id: 'chest',
    emoji: '❤️',
    title: { en:'Chest Pain', hi:'सीने में दर्द' },
    desc:  { en:'Chest discomfort, pressure, tightness', hi:'सीने में बेचैनी, दबाव, कसाव' },
    questions: [
      { id:'duration', text:{ en:'When did the pain start?', hi:'दर्द कब शुरू हुआ?' }, options: DURATION_OPTIONS },
      { id:'location', text:{ en:'Where exactly is the pain?', hi:'दर्द ठीक कहाँ है?' },
        options:[
          { v:'center', label:{ en:'Centre of chest', hi:'सीने के बीच' } },
          { v:'left',   label:{ en:'Left side', hi:'बाईं ओर' } },
          { v:'right',  label:{ en:'Right side', hi:'दाईं ओर' } },
          { v:'whole',  label:{ en:'Whole chest', hi:'पूरा सीना' } }
        ]},
      { id:'severity', text:{ en:'How severe is the pain?', hi:'दर्द कितना तेज़ है?' }, options: SEVERITY_3 },
      { id:'character', text:{ en:'How would you describe the pain?', hi:'दर्द कैसा लगता है?' },
        options:[
          { v:'pressure', label:{ en:'Pressure / tightness', hi:'दबाव / कसाव' } },
          { v:'burning',  label:{ en:'Burning', hi:'जलन' } },
          { v:'stabbing', label:{ en:'Stabbing', hi:'तेज़ चुभने वाला' } },
          { v:'other',    label:{ en:'Other', hi:'अन्य' } }
        ]},
      { id:'spread',   text:{ en:'Does the pain spread anywhere?', hi:'क्या दर्द कहीं और फैलता है?' },
        options:[
          { v:'none',    label:{ en:'No', hi:'नहीं' } },
          { v:'leftarm', label:{ en:'Left arm', hi:'बाएं हाथ' } },
          { v:'rightarm',label:{ en:'Right arm', hi:'दाएं हाथ' } },
          { v:'back',    label:{ en:'Back', hi:'पीठ' } },
          { v:'jaw',     label:{ en:'Jaw / neck', hi:'जबड़ा / गर्दन' } }
        ]},
      { id:'activity', text:{ en:'Does it get worse with physical activity?', hi:'क्या शारीरिक गतिविधि से यह बढ़ता है?' }, options: YES_NO },
      { id:'breathing',text:{ en:'Are you having difficulty breathing?', hi:'क्या सांस लेने में तकलीफ़ है?' }, options: YES_NO },
      { id:'sweating', text:{ en:'Are you sweating excessively?', hi:'क्या अत्यधिक पसीना आ रहा है?' }, options: YES_NO },
      { id:'dizzy',    text:{ en:'Are you feeling dizzy or faint?', hi:'क्या चक्कर आ रहे हैं या बेहोशी लग रही है?' }, options: YES_NO },
      { id:'history',  text:{ en:'Any previous heart or lung problems?', hi:'क्या पहले कोई हृदय या फेफड़े की समस्या रही है?' }, options: YES_NO }
    ]
  },

  {
    id: 'cough',
    emoji: '😷',
    title: { en:'Cough / Breathing Difficulty', hi:'खांसी / सांस की तकलीफ़' },
    desc:  { en:'Cough, wheezing, breathing difficulty', hi:'खांसी, घरघराहट, सांस लेने में कठिनाई' },
    questions: [
      { id:'duration', text:{ en:'When did it begin?', hi:'यह कब शुरू हुआ?' }, options: DURATION_OPTIONS },
      { id:'type',     text:{ en:'Is the cough dry or with mucus?', hi:'खांसी सूखी है या बलगम के साथ?' },
        options:[
          { v:'dry',    label:{ en:'Dry', hi:'सूखी' } },
          { v:'mucus',  label:{ en:'With mucus', hi:'बलगम के साथ' } },
          { v:'both',   label:{ en:'Both', hi:'दोनों' } }
        ]},
      { id:'fever',    text:{ en:'Do you have fever?', hi:'क्या बुखार है?' }, options: YES_NO },
      { id:'breathing',text:{ en:'Are you having difficulty breathing?', hi:'क्या सांस लेने में तकलीफ़ है?' },
        options:[
          { v:'no',       label:{ en:'No', hi:'नहीं' } },
          { v:'mild',     label:{ en:'Mild', hi:'हल्की' } },
          { v:'moderate', label:{ en:'Moderate', hi:'मध्यम' } },
          { v:'severe',   label:{ en:'Severe', hi:'तेज़' } }
        ]},
      { id:'chest',    text:{ en:'Any chest discomfort?', hi:'क्या सीने में कोई बेचैनी है?' }, options: YES_NO },
      { id:'wheezing', text:{ en:'Do you have wheezing?', hi:'क्या घरघराहट हो रही है?' }, options: YES_NO },
      { id:'blood',    text:{ en:'Any blood in the sputum?', hi:'क्या बलगम में खून है?' }, options: YES_NO },
      { id:'history',  text:{ en:'Any previous asthma or lung disease?', hi:'क्या पहले कोई दमा या फेफड़े की बीमारी रही है?' }, options: YES_NO }
    ]
  },

  {
    id: 'child',
    emoji: '👶',
    title: { en:'Child / Infant Health Concern', hi:'बच्चे / शिशु की स्वास्थ्य समस्या' },
    desc:  { en:'Health concern for a baby or young child', hi:'शिशु या छोटे बच्चे की स्वास्थ्य समस्या' },
    questions: [
      { id:'age', text:{ en:'What is the child\u2019s age?', hi:'बच्चे की उम्र क्या है?' },
        options:[
          { v:'lt1m',   label:{ en:'Less than 1 month', hi:'1 महीने से कम' } },
          { v:'1to6m',  label:{ en:'1–6 months', hi:'1–6 महीने' } },
          { v:'6to12m', label:{ en:'6–12 months', hi:'6–12 महीने' } },
          { v:'1to2y',  label:{ en:'1–2 years', hi:'1–2 वर्ष' } },
          { v:'2to5y',  label:{ en:'2–5 years', hi:'2–5 वर्ष' } }
        ]},
      { id:'concern', text:{ en:'What is the main concern?', hi:'मुख्य चिंता क्या है?' },
        options:[
          { v:'fever',    label:{ en:'Fever', hi:'बुखार' } },
          { v:'cough',    label:{ en:'Cough', hi:'खांसी' } },
          { v:'breath',   label:{ en:'Breathing difficulty', hi:'सांस लेने में कठिनाई' } },
          { v:'vomit',    label:{ en:'Vomiting', hi:'उल्टी' } },
          { v:'diarrhea', label:{ en:'Diarrhea', hi:'दस्त' } },
          { v:'feeding',  label:{ en:'Poor feeding', hi:'कम दूध पीना' } },
          { v:'sleepy',   label:{ en:'Unusual sleepiness', hi:'असामान्य नींद' } },
          { v:'crying',   label:{ en:'Continuous crying', hi:'लगातार रोना' } },
          { v:'other',    label:{ en:'Other', hi:'अन्य' } }
        ]},
      { id:'duration', text:{ en:'How long has this been present?', hi:'यह कितने समय से है?' }, options: DURATION_OPTIONS },
      { id:'feeding',  text:{ en:'Is the child feeding normally?', hi:'क्या बच्चा सामान्य रूप से दूध पी रहा है?' }, options: YES_NO },
      { id:'breathing',text:{ en:'Is the child breathing normally?', hi:'क्या बच्चा सामान्य रूप से सांस ले रहा है?' }, options: YES_NO },
      { id:'fever',    text:{ en:'Does the child have fever?', hi:'क्या बच्चे को बुखार है?' }, options: YES_NO },
      { id:'vomiting', text:{ en:'Has the child vomited?', hi:'क्या बच्चे ने उल्टी की है?' }, options: YES_NO },
      { id:'diarrhea', text:{ en:'Has the child had diarrhea?', hi:'क्या बच्चे को दस्त हुए हैं?' }, options: YES_NO },
      { id:'sleepy',   text:{ en:'Is the child unusually sleepy or difficult to wake?', hi:'क्या बच्चा असामान्य रूप से सुस्त है या जगाना मुश्किल है?' }, options: YES_NO },
      { id:'crying',   text:{ en:'Is the child crying continuously?', hi:'क्या बच्चा लगातार रो रहा है?' }, options: YES_NO }
    ]
  },

  {
    id: 'other',
    emoji: '✚',
    title: { en:'Other Health Concern', hi:'अन्य स्वास्थ्य समस्या' },
    desc:  { en:'Describe your concern in your own words', hi:'अपनी समस्या अपने शब्दों में बताएँ' },
    questions: [
      { id:'description', text:{ en:'Please describe your main concern.', hi:'कृपया अपनी मुख्य समस्या बताएँ।' }, type:'text' },
      { id:'duration',    text:{ en:'How long has this been present?', hi:'यह कितने समय से है?' }, options: DURATION_OPTIONS },
      { id:'severity',    text:{ en:'How severe is it?', hi:'यह कितना तेज़ है?' }, options: SEVERITY_3 },
      { id:'worsening',   text:{ en:'Is it getting worse?', hi:'क्या यह बिगड़ रहा है?' }, options: YES_NO },
      { id:'history',     text:{ en:'Any previous medical conditions?', hi:'कोई पुरानी बीमारी है?' }, options: YES_NO }
    ]
  }
];


/* ═══════════════════════════════════════════════════════════════════════════
   4. AYUSH PARAMETERS (Dashavidha Pariksha + Ahara-Vihara)
   Collection only. No diagnosis, no treatment.
   ═══════════════════════════════════════════════════════════════════════════ */

const AYUSH_PARAMS = [
  { id:'prakriti',    name:{ en:'Prakriti', hi:'प्रकृति' },
    opts:[{v:'vata',label:{en:'Vata',hi:'वात'}},{v:'pitta',label:{en:'Pitta',hi:'पित्त'}},{v:'kapha',label:{en:'Kapha',hi:'कफ'}},{v:'mixed',label:{en:'Mixed',hi:'मिश्रित'}},{v:'unsure',label:{en:'Not sure',hi:'पता नहीं'}}] },
  { id:'vikriti',     name:{ en:'Vikriti', hi:'विकृति' },
    opts:[{v:'vata',label:{en:'Vata',hi:'वात'}},{v:'pitta',label:{en:'Pitta',hi:'पित्त'}},{v:'kapha',label:{en:'Kapha',hi:'कफ'}},{v:'unsure',label:{en:'Not sure',hi:'पता नहीं'}}] },
  { id:'sara',        name:{ en:'Sara', hi:'सार' },
    opts:[{v:'good',label:{en:'Good',hi:'अच्छा'}},{v:'moderate',label:{en:'Moderate',hi:'मध्यम'}},{v:'poor',label:{en:'Poor',hi:'कमज़ोर'}}] },
  { id:'samhanana',   name:{ en:'Samhanana', hi:'संहनन' },
    opts:[{v:'thin',label:{en:'Thin',hi:'पतला'}},{v:'medium',label:{en:'Medium',hi:'मध्यम'}},{v:'broad',label:{en:'Broad',hi:'मोटा'}}] },
  { id:'pramana',     name:{ en:'Pramana', hi:'प्रमाण' },
    opts:[{v:'low',label:{en:'Below average',hi:'औसत से कम'}},{v:'avg',label:{en:'Average',hi:'औसत'}},{v:'high',label:{en:'Above average',hi:'औसत से ज़्यादा'}}] },
  { id:'satmya',      name:{ en:'Satmya', hi:'सात्म्य' },
    opts:[{v:'veg',label:{en:'Vegetarian',hi:'शाकाहारी'}},{v:'mixed',label:{en:'Mixed',hi:'मिश्रित'}},{v:'nonveg',label:{en:'Non-vegetarian',hi:'मांसाहारी'}}] },
  { id:'sattva',      name:{ en:'Sattva', hi:'सत्त्व' },
    opts:[{v:'high',label:{en:'Strong',hi:'मज़बूत'}},{v:'med',label:{en:'Moderate',hi:'मध्यम'}},{v:'low',label:{en:'Low',hi:'कमज़ोर'}}] },
  { id:'aharaShakti', name:{ en:'Ahara Shakti', hi:'आहार शक्ति' },
    opts:[{v:'low',label:{en:'Low',hi:'कम'}},{v:'med',label:{en:'Moderate',hi:'मध्यम'}},{v:'strong',label:{en:'Strong',hi:'तेज़'}},{v:'variable',label:{en:'Variable',hi:'बदलती'}}] },
  { id:'vyayamaShakti',name:{ en:'Vyayama Shakti', hi:'व्यायाम शक्ति' },
    opts:[{v:'low',label:{en:'Little',hi:'कम'}},{v:'med',label:{en:'Moderate',hi:'मध्यम'}},{v:'high',label:{en:'A lot',hi:'बहुत'}}] },
  { id:'vaya',        name:{ en:'Vaya', hi:'वय' },
    opts:[{v:'young',label:{en:'Young',hi:'युवा'}},{v:'middle',label:{en:'Middle-aged',hi:'मध्यम आयु'}},{v:'senior',label:{en:'Senior',hi:'वरिष्ठ'}}] },
  { id:'ahara',       name:{ en:'Ahara (diet)', hi:'आहार' },
    opts:[{v:'regular',label:{en:'Regular meals',hi:'नियमित भोजन'}},{v:'irregular',label:{en:'Irregular',hi:'अनियमित'}},{v:'spicy',label:{en:'Spicy / fried',hi:'मसालेदार / तला'}},{v:'light',label:{en:'Light meals',hi:'हल्का भोजन'}}] },
  { id:'vihara',      name:{ en:'Vihara (lifestyle)', hi:'विहार' },
    opts:[{v:'sedentary',label:{en:'Mostly sitting',hi:'ज़्यादातर बैठना'}},{v:'active',label:{en:'Active',hi:'सक्रिय'}},{v:'physical',label:{en:'Heavy physical work',hi:'भारी शारीरिक कार्य'}},{v:'poor-sleep',label:{en:'Poor sleep',hi:'खराब नींद'}}] }
];


/* ═══════════════════════════════════════════════════════════════════════════
   5. UTILITY HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function $(selector) { return document.querySelector(selector); }

function escapeHtml(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showToast(message, kind) {
  const host = document.getElementById('toast-host');
  if (!host) return;
  const el = document.createElement('div');
  el.className = 'toast' + (kind ? ' ' + kind : '');
  el.textContent = message;
  host.appendChild(el);
  setTimeout(() => {
    el.style.transition = 'opacity .3s, transform .3s';
    el.style.opacity = '0';
    el.style.transform = 'translateY(-6px)';
    setTimeout(() => el.remove(), 300);
  }, 2600);
}

// Simple SVG icon helper
function icon(name, size = 20) {
  const icons = {
    'arrow-left':      '<path d="m15 18-6-6 6-6"/>',
    'arrow-right':     '<path d="M5 12h14M12 5l7 7-7 7"/>',
    'check':           '<path d="M20 6 9 17l-5-5"/>',
    'check-circle':    '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
    'mic':             '<path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3M8 22h8"/>',
    'square':          '<rect width="14" height="14" x="5" y="5" rx="2"/>',
    'upload':          '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/>',
    'file':            '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/>',
    'file-text':       '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8"/>',
    'loader':          '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
    'settings':        '<path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/>',
    'x':               '<path d="M18 6 6 18M6 6l12 12"/>',
    'lock':            '<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    'shield':          '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>',
    'shield-check':    '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/>',
    'alert-triangle':  '<path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"/><path d="M12 9v4M12 17h.01"/>',
    'alert-circle':    '<circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>',
    'heart':           '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78Z"/>',
    'activity':        '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    'stethoscope':     '<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"/><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"/><circle cx="20" cy="10" r="2"/>',
    'user-check':      '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="m16 11 2 2 4-4"/>',
    'map-pin':         '<path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/><circle cx="12" cy="10" r="3"/>',
    'hospital':        '<path d="M12 6v4M14 8h-4M3 21h18M5 21V7l7-4 7 4v14"/><path d="M10 21v-4a2 2 0 0 1 4 0v4"/>',
    'siren':           '<path d="M7 18v-6a5 5 0 1 1 10 0v6"/><path d="M5 21a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-1a2 2 0 0 0-2-2H7a2 2 0 0 0-2 2v1Z"/><path d="M21 12h1M22 18h1M2 12h1M1 18h1M6.6 6.6 5.2 5.2M18.8 5.2l-1.4 1.4"/>',
    'leaf':            '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
    'link':            '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>',
    'plus':            '<path d="M5 12h14M12 5v14"/>',
    'sparkles':        '<path d="m12 3-1.9 5.8L4 10l6.1 1.2L12 17l1.9-5.8L20 10l-6.1-1.2z"/>',
    'clipboard-list':  '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2M12 11h4M12 16h4M8 11h.01M8 16h.01"/>',
    'edit':            '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4Z"/>',
    'printer':         '<path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v8H6z"/>',
    'rotate-ccw':      '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    'volume':          '<path d="M11 5 6 9H2v6h4l5 4z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07M19.07 4.93a10 10 0 0 1 0 14.14"/>',
    'home':            '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
    'clipboard-check': '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>'
  };
  const path = icons[name] || icons['circle'];
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
}


/* ═══════════════════════════════════════════════════════════════════════════
   6. NAVIGATION
   ═══════════════════════════════════════════════════════════════════════════ */

function go(screen) {
  state.screen = screen;
  window.scrollTo({ top: 0, behavior: 'auto' });
  render();
}

function setLanguage(lang) {
  if (lang !== 'en' && lang !== 'hi') return;
  state.lang = lang;
  applyBodyClasses();
  render();
}


/* ═══════════════════════════════════════════════════════════════════════════
   7. VOICE INPUT — Web Speech API
   Real, browser-native. No backend. No API key.
   Falls back gracefully if unsupported or permission denied.
   ═══════════════════════════════════════════════════════════════════════════ */

let recognition = null;

function checkVoiceSupport() {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  state.voice.supported = !!SR;
}

// Start listening. `onResult` is called with the transcript.
function startListening(onResult) {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    state.voice.error = t('voiceUnavailable');
    render();
    return;
  }

  stopListening();

  recognition = new SR();
  recognition.lang = state.lang === 'hi' ? 'hi-IN' : 'en-IN';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.continuous = false;

  recognition.onresult = (event) => {
    const text = event.results[0][0].transcript;
    state.voice.listening = false;
    state.voice.error = null;
    if (typeof onResult === 'function') {
      onResult(text);
    } else {
      render();
    }
  };

  recognition.onerror = (event) => {
    state.voice.listening = false;
    const err = event.error || '';
    if (err === 'not-allowed' || err === 'service-not-allowed') {
      state.voice.error = t('micDenied');
    } else if (err === 'no-speech') {
      state.voice.error = t('noSpeech');
    } else if (err === 'aborted') {
      state.voice.error = null;
    } else {
      state.voice.error = t('voiceErr');
    }
    render();
  };

  recognition.onend = () => {
    state.voice.listening = false;
    render();
  };

  try {
    recognition.start();
    state.voice.listening = true;
    state.voice.error = null;
    render();
  } catch (e) {
    state.voice.error = t('voiceUnavailable');
    render();
  }
}

function stopListening() {
  if (recognition) {
    try { recognition.stop(); } catch (e) {}
    recognition = null;
  }
  state.voice.listening = false;
  render();
}

// Optional text-to-speech for question reading
function speak(text) {
  if (!state.accessibility.audio) return;
  if (!('speechSynthesis' in window)) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = state.lang === 'hi' ? 'hi-IN' : 'en-IN';
    u.rate = 0.92;
    window.speechSynthesis.speak(u);
  } catch (e) { /* silent */ }
}


/* ═══════════════════════════════════════════════════════════════════════════
   8. DOCUMENT UPLOAD — prototype extraction
   The file is read locally. Extraction is simulated with realistic sample data
   and clearly labelled as a preview.
   ═══════════════════════════════════════════════════════════════════════════ */

// Sample extraction sets. In production these would come from an OCR pipeline.
const SAMPLE_EXTRACTIONS = [
  {
    type: 'Prescription',
    date: '12 Aug 2026',
    fields: [
      { k:{en:'Doctor',      hi:'डॉक्टर'},   v:'Dr. A. Sharma, MD' },
      { k:{en:'Date',        hi:'तारीख'},    v:'12 Aug 2026' },
      { k:{en:'Medicine',    hi:'दवा'},      v:'Amlodipine' },
      { k:{en:'Dosage',      hi:'खुराक'},    v:'5 mg' },
      { k:{en:'Frequency',   hi:'आवृत्ति'},  v:'Once daily' },
      { k:{en:'Medicine',    hi:'दवा'},      v:'Paracetamol 500 mg' },
      { k:{en:'Frequency',   hi:'आवृत्ति'},  v:'Twice daily, if needed' }
    ]
  },
  {
    type: 'Laboratory Report',
    date: '04 Mar 2025',
    fields: [
      { k:{en:'Investigation', hi:'जाँच'},          v:'Hemoglobin' },
      { k:{en:'Result',        hi:'परिणाम'},        v:'10.2 g/dL' },
      { k:{en:'Reference',     hi:'संदर्भ'},        v:'12 – 16 g/dL' },
      { k:{en:'Status',        hi:'स्थिति'},        v:'Below reference range', warn:true },
      { k:{en:'Investigation', hi:'जाँच'},          v:'Fasting Glucose' },
      { k:{en:'Result',        hi:'परिणाम'},        v:'126 mg/dL' },
      { k:{en:'Reference',     hi:'संदर्भ'},        v:'70 – 100 mg/dL' }
    ]
  },
  {
    type: 'Discharge Summary',
    date: '18 Nov 2024',
    fields: [
      { k:{en:'Admission',    hi:'प्रवेश'},           v:'14 Nov 2024' },
      { k:{en:'Discharge',    hi:'छुट्टी'},           v:'18 Nov 2024' },
      { k:{en:'Diagnosis',    hi:'निदान'},            v:'Hypertension (recorded)', warn:true },
      { k:{en:'Medication',   hi:'दवा'},              v:'Amlodipine 5 mg, once daily' },
      { k:{en:'Follow-up',    hi:'अनुवर्ती'},         v:'Review after 4 weeks' }
    ]
  }
];

function handleFile(event) {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  // 10 MB limit
  if (file.size > 10 * 1024 * 1024) {
    showToast(state.lang === 'hi' ? 'फ़ाइल बहुत बड़ी है। अधिकतम 10 MB।' : 'File too large. Maximum 10 MB.', 'err');
    event.target.value = '';
    return;
  }

  const reader = new FileReader();
  reader.onload = (e) => {
    state.uploadedDocument = {
      name: file.name,
      size: file.size,
      dataUrl: e.target.result,
      analyzing: true,
      extraction: null
    };
    render();

    // Simulate the extraction delay
    setTimeout(() => {
      if (!state.uploadedDocument) return;
      const pick = SAMPLE_EXTRACTIONS[Math.floor(Math.random() * SAMPLE_EXTRACTIONS.length)];
      state.uploadedDocument.analyzing = false;
      state.uploadedDocument.extraction = pick;
      render();
    }, 1800);
  };
  reader.readAsDataURL(file);
  event.target.value = '';
}

function removeDocument() {
  state.uploadedDocument = null;
  render();
}


/* ═══════════════════════════════════════════════════════════════════════════
   9. RED-FLAG SAFETY RULES
   Simple, transparent, deterministic. Never diagnoses.
   Each rule returns { rule, reason:{en,hi} } or null.
   ═══════════════════════════════════════════════════════════════════════════ */

function checkForUrgentSymptoms() {
  const p = state.selectedProblem;
  const a = state.patientAnswers;

  const val = (qid) => (a[qid] ? a[qid].value : null);

  // Rule 1: Severe chest pain + difficulty breathing
  if (p === 'chest' && val('severity') === 'severe' && val('breathing') === 'yes') {
    return {
      rule: 'chest_severe_breathing',
      reason: {
        en: 'You reported severe chest pain together with difficulty breathing. These symptoms may require prompt medical attention.',
        hi: 'आपने तेज़ सीने का दर्द और सांस लेने में तकलीफ़ बताई है। इन लक्षणों के लिए तत्काल चिकित्सीय ध्यान आवश्यक हो सकता है।'
      }
    };
  }

  // Rule 2: Severe chest pain + dizziness/faintness
  if (p === 'chest' && val('severity') === 'severe' && val('dizzy') === 'yes') {
    return {
      rule: 'chest_severe_dizzy',
      reason: {
        en: 'You reported severe chest pain together with dizziness or faintness. These symptoms may require prompt medical attention.',
        hi: 'आपने तेज़ सीने का दर्द और चक्कर या बेहोशी बताई है। इन लक्षणों के लिए तत्काल चिकित्सीय ध्यान आवश्यक हो सकता है।'
      }
    };
  }

  // Rule 3: Sudden severe headache + vision problems
  if (p === 'headache' && val('onset') === 'sudden' && val('severity') === 'severe' && val('vision') === 'yes') {
    return {
      rule: 'headache_sudden_vision',
      reason: {
        en: 'You reported a sudden severe headache together with vision problems. These symptoms may require prompt medical assessment.',
        hi: 'आपने अचानक तेज़ सिरदर्द और दृष्टि की समस्या बताई है। इन लक्षणों के लिए तत्काल चिकित्सीय मूल्यांकन आवश्यक हो सकता है।'
      }
    };
  }

  // Rule 4: Sudden severe headache + weakness or numbness
  if (p === 'headache' && val('onset') === 'sudden' && (val('weakness') === 'yes' || val('vision') === 'yes')) {
    return {
      rule: 'headache_sudden_neuro',
      reason: {
        en: 'You reported a sudden headache together with weakness, numbness, or vision problems. These symptoms may require prompt medical assessment.',
        hi: 'आपने अचानक सिरदर्द और कमजोरी, सुन्नपन या दृष्टि की समस्या बताई है। इन लक्षणों के लिए तत्काल चिकित्सीय मूल्यांकन आवश्यक हो सकता है।'
      }
    };
  }

  // Rule 5: Child with breathing difficulty concern
  if (p === 'child' && val('concern') === 'breath') {
    return {
      rule: 'child_breathing',
      reason: {
        en: 'A child with breathing difficulty may require prompt assessment. Please seek medical attention immediately.',
        hi: 'सांस लेने में कठिनाई वाले बच्चे के लिए तत्काल मूल्यांकन आवश्यक हो सकता है। कृपया तुरंत चिकित्सा सहायता लें।'
      }
    };
  }

  // Rule 6: Child not breathing normally
  if (p === 'child' && val('breathing') === 'no') {
    return {
      rule: 'child_abnormal_breathing',
      reason: {
        en: 'You reported that the child is not breathing normally. This requires prompt medical assessment.',
        hi: 'आपने बताया कि बच्चा सामान्य रूप से सांस नहीं ले रहा। इसके लिए तत्काल चिकित्सीय मूल्यांकन आवश्यक है।'
      }
    };
  }

  // Rule 7: Child unusually sleepy or difficult to wake
  if (p === 'child' && val('sleepy') === 'yes') {
    return {
      rule: 'child_sleepy',
      reason: {
        en: 'You reported that the child is unusually sleepy or difficult to wake. This may require prompt medical assessment.',
        hi: 'आपने बताया कि बच्चा असामान्य रूप से सुस्त है या जगाना मुश्किल है। इसके लिए तत्काल चिकित्सीय मूल्यांकन आवश्यक हो सकता है।'
      }
    };
  }

  // Rule 8: Child not feeding normally AND very young
  if (p === 'child' && val('feeding') === 'no' && (val('age') === 'lt1m' || val('age') === '1to6m')) {
    return {
      rule: 'child_poor_feeding_young',
      reason: {
        en: 'A very young infant not feeding normally may require prompt medical assessment.',
        hi: 'बहुत छोटा शिशु जो सामान्य रूप से दूध नहीं पी रहा, उसके लिए तत्काल चिकित्सीय मूल्यांकन आवश्यक हो सकता है।'
      }
    };
  }

  // Rule 9: Severe breathing difficulty with cough
  if (p === 'cough' && val('breathing') === 'severe') {
    return {
      rule: 'cough_severe_breathing',
      reason: {
        en: 'You reported severe difficulty breathing. This may require prompt medical attention.',
        hi: 'आपने सांस लेने में तेज़ कठिनाई बताई है। इसके लिए तत्काल चिकित्सीय ध्यान आवश्यक हो सकता है।'
      }
    };
  }

  // Rule 10: Blood in sputum
  if (p === 'cough' && val('blood') === 'yes') {
    return {
      rule: 'cough_hemoptysis',
      reason: {
        en: 'You reported blood in the sputum. This may require prompt medical assessment.',
        hi: 'आपने बलगम में खून बताया है। इसके लिए तत्काल चिकित्सीय मूल्यांकन आवश्यक हो सकता है।'
      }
    };
  }

  return null;
}


/* ═══════════════════════════════════════════════════════════════════════════
   10. SUMMARY GENERATION
   ═══════════════════════════════════════════════════════════════════════════ */

function getConcern() {
  return CONCERNS.find(c => c.id === state.selectedProblem) || null;
}

function generateSummary() {
  const concern = getConcern();
  if (!concern) return;

  // Build a list of Q&A rows from the answers
  const rows = concern.questions.map(q => {
    const ans = state.patientAnswers[q.id];
    return {
      label: L(q.text),
      value: ans ? ans.label : '—'
    };
  });

  // Determine the informational guidance (never a diagnosis)
  const guidanceByConcern = {
    fever: {
      en: 'Fever can have many causes. Based on the information provided, please monitor your symptoms and consult a healthcare professional if they are severe, persistent, or worsening.',
      hi: 'बुखार के कई कारण हो सकते हैं। दी गई जानकारी के आधार पर, लक्षणों पर नज़र रखें और यदि वे गंभीर, लगातार या बिगड़ते हों तो स्वास्थ्य पेशेवर से परामर्श करें।'
    },
    headache: {
      en: 'Headaches have many possible causes. Based on the information provided, please seek medical advice if the headache is severe, sudden, or accompanied by other symptoms.',
      hi: 'सिरदर्द के कई संभावित कारण होते हैं। दी गई जानकारी के आधार पर, यदि सिरदर्द तेज़, अचानक या अन्य लक्षणों के साथ हो तो चिकित्सीय सलाह लें।'
    },
    abdominal: {
      en: 'Persistent or worsening abdominal pain should be evaluated by a healthcare professional. Please monitor your symptoms and seek advice if they continue.',
      hi: 'लगातार या बिगड़ता पेट दर्द स्वास्थ्य पेशेवर द्वारा जाँचा जाना चाहिए। लक्षणों पर नज़र रखें और यदि वे जारी रहें तो सलाह लें।'
    },
    chest: {
      en: 'Chest discomfort can have several causes. Based on the information provided, please consult a healthcare professional promptly for assessment.',
      hi: 'सीने में बेचैनी के कई कारण हो सकते हैं। दी गई जानकारी के आधार पर, मूल्यांकन हेतु शीघ्र स्वास्थ्य पेशेवर से परामर्श करें।'
    },
    cough: {
      en: 'Cough and breathing symptoms have many causes. Based on the information provided, please consult a healthcare professional if symptoms persist or worsen.',
      hi: 'खांसी और सांस के लक्षणों के कई कारण होते हैं। दी गई जानकारी के आधार पर, लक्षण बने रहने या बिगड़ने पर स्वास्थ्य पेशेवर से परामर्श करें।'
    },
    child: {
      en: 'Because this concerns a child, all symptoms should be reviewed by a qualified paediatric healthcare professional promptly.',
      hi: 'चूँकि यह बच्चे से संबंधित है, सभी लक्षणों की समीक्षा योग्य शिशु चिकित्सक द्वारा शीघ्र की जानी चाहिए।'
    },
    other: {
      en: 'Thank you for describing your concern. Based on the information provided, please consult a healthcare professional for further evaluation.',
      hi: 'अपनी समस्या बताने के लिए धन्यवाद। दी गई जानकारी के आधार पर, आगे के मूल्यांकन के लिए स्वास्थ्य पेशेवर से परामर्श करें।'
    }
  };

  state.patientSummary = {
    concernTitle: L(concern.title),
    concernEmoji: concern.emoji,
    rows: rows,
    guidance: guidanceByConcern[state.selectedProblem] || guidanceByConcern.other,
    urgent: state.urgentFlag,
    document: state.uploadedDocument,
    ayush: buildAyushSummary()
  };

  state.physicianVerified = false;
  state.physicianReviewed = false;
  go('summary');
}

function buildAyushSummary() {
  const hasAny = Object.keys(state.ayushAnswers).length > 0;
  if (!hasAny) return null;
  return AYUSH_PARAMS
    .map(p => {
      const v = state.ayushAnswers[p.id];
      if (!v) return null;
      const opt = p.opts.find(o => o.v === v);
      return { label: L(p.name), value: opt ? L(opt.label) : v };
    })
    .filter(Boolean);
}


/* ═══════════════════════════════════════════════════════════════════════════
   11. RENDER FUNCTIONS
   Each screen has one render function that returns an HTML string.
   ═══════════════════════════════════════════════════════════════════════════ */

function render() {
  const app = document.getElementById('app');
  if (!app) return;

  app.innerHTML = `
    <div class="app">
      ${renderHeader()}
      <main class="screen">
        <div class="container">
          ${renderScreen()}
        </div>
      </main>
      ${renderFooter()}
    </div>
    ${renderSettingsSheet()}
  `;
}

function renderHeader() {
  const otherLang = state.lang === 'en' ? 'हिन्दी' : 'English';
  return `
  <header class="header">
    <div class="header-inner">
      <div class="brand" onclick="go('welcome')" style="cursor:pointer;">
        <div class="brand-mark">R</div>
        <div>
          <div class="brand-name">${t('appName')}</div>
          <div class="brand-tag">${t('appTag')}</div>
        </div>
      </div>
      <div class="header-actions">
        <button class="btn btn-outline btn-sm" onclick="toggleLanguage()" style="min-width:86px;">
          ${otherLang}
        </button>
        <button class="btn btn-ghost btn-icon" onclick="openSettings()" aria-label="${t('settingsTitle')}">
          ${icon('settings', 20)}
        </button>
      </div>
    </div>
  </header>`;
}

function renderFooter() {
  return `
  <footer class="footer">
    <div class="footer-inner">
      <div><strong>${t('appName')}</strong> · ${t('appTag')}</div>
      <div>${t('summaryInfoOnly')}</div>
    </div>
  </footer>`;
}

function renderSettingsSheet() {
  const open = state.settingsOpen ? 'open' : '';
  return `
  <div class="sheet-mask ${open}" onclick="closeSettings()"></div>
  <aside class="sheet-panel ${open}" aria-hidden="${!state.settingsOpen}">
    <div class="row-between mb-6">
      <h2 style="font-size:20px; font-weight:800; letter-spacing:-.02em;">${t('settingsTitle')}</h2>
      <button class="btn btn-ghost btn-icon" onclick="closeSettings()" aria-label="${t('close')}">
        ${icon('x', 20)}
      </button>
    </div>

    <div class="setting-row">
      <div>
        <div class="label">${t('langLabel')}</div>
        <div class="hint">English / हिन्दी</div>
      </div>
      <div class="row" style="gap:6px;">
        <button class="btn ${state.lang === 'en' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="setLanguage('en')">English</button>
        <button class="btn ${state.lang === 'hi' ? 'btn-primary' : 'btn-outline'} btn-sm" onclick="setLanguage('hi')">हिन्दी</button>
      </div>
    </div>

    <div class="setting-row">
      <div><div class="label">${t('largeText')}</div></div>
      <label class="switch">
        <input type="checkbox" ${state.accessibility.largeText ? 'checked' : ''} onchange="toggleAccessibility('largeText', this.checked)">
        <span class="switch-track"></span>
      </label>
    </div>

    <div class="setting-row">
      <div><div class="label">${t('highContrast')}</div></div>
      <label class="switch">
        <input type="checkbox" ${state.accessibility.highContrast ? 'checked' : ''} onchange="toggleAccessibility('highContrast', this.checked)">
        <span class="switch-track"></span>
      </label>
    </div>

    <div class="setting-row">
      <div>
        <div class="label">${t('audioInstr')}</div>
        <div class="hint">${state.lang === 'hi' ? 'प्रश्न पढ़कर सुनाएँ' : 'Questions are read aloud'}</div>
      </div>
      <label class="switch">
        <input type="checkbox" ${state.accessibility.audio ? 'checked' : ''} onchange="toggleAccessibility('audio', this.checked)">
        <span class="switch-track"></span>
      </label>
    </div>

    <div class="setting-row">
      <div>
        <div class="label">${t('touchOnly')}</div>
        <div class="hint">${state.lang === 'hi' ? 'माइक्रोफ़ोन छिपाएँ' : 'Hides the microphone'}</div>
      </div>
      <label class="switch">
        <input type="checkbox" ${state.accessibility.touchOnly ? 'checked' : ''} onchange="toggleAccessibility('touchOnly', this.checked)">
        <span class="switch-track"></span>
      </label>
    </div>

    <div class="mt-6" style="padding-top:20px; border-top:1px solid var(--slate-100);">
      <p style="font-size:12.5px; color:var(--slate-500); line-height:1.6; font-weight:500;">
        ${t('summaryInfoOnly')}
      </p>
    </div>
  </aside>`;
}

function renderScreen() {
  switch (state.screen) {
    case 'welcome':    return renderWelcome();
    case 'consent':    return renderConsent();
    case 'home':       return renderHome();
    case 'concern':    return renderConcernSelect();
    case 'question':   return renderQuestion();
    case 'documents':  return renderDocuments();
    case 'review':     return renderReview();
    case 'summary':    return renderSummary();
    case 'urgent':     return renderUrgent();
    case 'nearby':     return renderNearby();
    case 'ayush':      return renderAyush();
    case 'abdm':       return renderAbdm();
    case 'physician':  return renderPhysician();
    default:           return renderWelcome();
  }
}

/* ── Welcome ────────────────────────────────────────────────────────────── */
function renderWelcome() {
  return `
  <section class="hero">
    <div class="pill pill-teal" style="margin-bottom:22px;">
      ${icon('activity', 12)} ${t('appTag').toUpperCase()}
    </div>
    <h1 class="hero-title">${t('welcomeTitle')}</h1>
    <p class="hero-sub">${t('welcomeSub')}</p>

    <div class="hero-actions">
      <button class="btn btn-primary btn-lg" onclick="startIntake()">
        ${icon('clipboard-check', 18)} ${t('startAssessment')}
      </button>
      <button class="btn btn-outline btn-lg" onclick="go('ayush')">
        ${icon('leaf', 18)} ${t('ayushHistory')}
      </button>
    </div>

    <div class="lang-switch">
      <button class="${state.lang === 'en' ? 'active' : ''}" onclick="setLanguage('en')">English</button>
      <button class="${state.lang === 'hi' ? 'active' : ''}" onclick="setLanguage('hi')">हिन्दी</button>
    </div>
  </section>

  <section class="feature-grid">
    <div class="feature">
      <div class="feature-icon">${icon('mic', 22)}</div>
      <h4>${t('f1Title')}</h4>
      <p>${t('f1Desc')}</p>
    </div>
    <div class="feature">
      <div class="feature-icon">${icon('upload', 22)}</div>
      <h4>${t('f2Title')}</h4>
      <p>${t('f2Desc')}</p>
    </div>
    <div class="feature">
      <div class="feature-icon">${icon('shield-check', 22)}</div>
      <h4>${t('f3Title')}</h4>
      <p>${t('f3Desc')}</p>
    </div>
    <div class="feature">
      <div class="feature-icon">${icon('leaf', 22)}</div>
      <h4>${t('f4Title')}</h4>
      <p>${t('f4Desc')}</p>
    </div>
  </section>`;
}

/* ── Consent ────────────────────────────────────────────────────────────── */
function renderConsent() {
  const points = translations[state.lang].consentPoints || translations.en.consentPoints;
  return `
  <div class="consent-box">
    <button class="btn btn-outline btn-sm mb-6" onclick="go('welcome')">
      ${icon('arrow-left', 16)} ${t('back')}
    </button>

    <div class="card card-pad">
      <div class="consent-icon">${icon('lock', 32)}</div>
      <h1 style="font-size:28px; font-weight:800; letter-spacing:-.02em; color:var(--slate-900); margin-bottom:12px;">
        ${t('consentTitle')}
      </h1>
      <p style="font-size:15.5px; color:var(--slate-600); font-weight:500; line-height:1.6;">
        ${t('consentBody')}
      </p>

      <ul class="consent-list">
        ${points.map(p => `
          <li>
            <span class="check">${icon('check', 14)}</span>
            <span class="txt">${escapeHtml(p)}</span>
          </li>`).join('')}
      </ul>

      <div class="row mt-6" style="gap:10px; flex-wrap:wrap;">
        <button class="btn btn-outline" onclick="speakConsent()">
          ${icon('volume', 16)} ${t('hearExplanation')}
        </button>
        <button class="btn btn-primary btn-lg" style="flex:1; min-width:220px;" onclick="acceptConsent()">
          ${icon('check', 18)} ${t('consentAgree')}
        </button>
      </div>
    </div>
  </div>`;
}

/* ── Home dashboard ─────────────────────────────────────────────────────── */
function renderHome() {
  return `
  <div>
    <div class="pill pill-teal mb-4">${icon('home', 12)} DASHBOARD</div>
    <h1 class="dash-title">${t('homeTitle')}</h1>
    <p class="dash-sub">${t('homeSub')}</p>

    <div class="dash-grid">
      <button class="dash-card" onclick="go('concern')">
        <div class="icon teal">${icon('clipboard-check', 24)}</div>
        <div>
          <h3>${t('startIntake')}</h3>
          <p>${t('startIntakeSub')}</p>
        </div>
      </button>

      <button class="dash-card" onclick="go('documents')">
        <div class="icon slate">${icon('upload', 24)}</div>
        <div>
          <h3>${t('uploadDocs')}</h3>
          <p>${t('uploadDocsSub')}</p>
        </div>
      </button>

      <button class="dash-card" onclick="go('ayush')">
        <div class="icon amber">${icon('leaf', 24)}</div>
        <div>
          <h3>${t('ayushHistory')}</h3>
          <p>${t('ayushHistorySub')}</p>
        </div>
      </button>

      <button class="dash-card" onclick="openReviewOrConcern()">
        <div class="icon emerald">${icon('file-text', 24)}</div>
        <div>
          <h3>${t('reviewInfo')}</h3>
          <p>${t('reviewInfoSub')}</p>
        </div>
      </button>

      <button class="dash-card" onclick="openSettings()">
        <div class="icon slate">${icon('settings', 24)}</div>
        <div>
          <h3>${t('accessibilityBtn')}</h3>
          <p>${t('accessibilitySub')}</p>
        </div>
      </button>

      <button class="dash-card" onclick="go('abdm')">
        <div class="icon teal">${icon('link', 24)}</div>
        <div>
          <h3>${state.lang === 'hi' ? 'स्वास्थ्य-रिकॉर्ड एकीकरण' : 'Health-record integration'}</h3>
          <p>${state.lang === 'hi' ? 'ABHA · HIS · FHIR के लिए तैयार' : 'Ready for ABHA · HIS · FHIR'}</p>
        </div>
      </button>
    </div>
  </div>`;
}

/* ── Concern selection ──────────────────────────────────────────────────── */
function renderConcernSelect() {
  return `
  <div>
    <button class="btn btn-outline btn-sm mb-6" onclick="go('home')">
      ${icon('arrow-left', 16)} ${t('back')}
    </button>

    <div class="center mb-6">
      <div class="pill pill-teal" style="margin-bottom:14px;">STEP 1 OF 4</div>
      <h1 style="font-size:clamp(22px, 3.4vw, 32px); font-weight:800; letter-spacing:-.025em; color:var(--slate-900); line-height:1.18;">
        ${t('chooseConcern')}
      </h1>
      <p style="font-size:14.5px; color:var(--slate-500); margin-top:10px; font-weight:500;">
        ${t('chooseConcernSub')}
      </p>
    </div>

    <div class="concern-grid">
      ${CONCERNS.map(c => `
        <button class="concern-card" onclick="selectProblem('${c.id}')">
          <span class="concern-emoji">${c.emoji}</span>
          <div>
            <div class="concern-title">${L(c.title)}</div>
            <div class="concern-desc">${L(c.desc)}</div>
          </div>
        </button>`).join('')}
    </div>
  </div>`;
}

/* ── Question screen ────────────────────────────────────────────────────── */
function renderQuestion() {
  const concern = getConcern();
  if (!concern) return renderConcernSelect();

  const q = concern.questions[state.currentQuestion];
  if (!q) return renderDocuments();

  const total = concern.questions.length;
  const idx = state.currentQuestion;
  const pct = Math.round((idx / total) * 100);
  const saved = state.patientAnswers[q.id];

  const voiceDisabled = state.accessibility.touchOnly || !state.voice.supported;

  return `
  <div class="q-wrap">
    <div class="q-top">
      <button class="btn btn-outline btn-icon" onclick="prevQuestion()" aria-label="${t('back')}">
        ${icon('arrow-left', 18)}
      </button>
      <div class="q-bar">
        <div class="q-meta">${concern.emoji} ${L(concern.title).toUpperCase()} · ${t('question')} ${idx + 1} ${t('of')} ${total}</div>
        <div class="progress" style="margin-top:8px;">
          <div class="progress-fill" style="width:${pct}%;"></div>
        </div>
      </div>
      <button class="btn btn-ghost btn-icon" onclick="repeatQuestion()" aria-label="${t('repeatQ')}" title="${t('repeatQ')}">
        ${icon('volume', 18)}
      </button>
    </div>

    <div class="card card-pad">
      <h2 class="q-text">${L(q.text)}</h2>

      ${q.type === 'number' ? renderNumberInput(q) : ''}
      ${q.type === 'text'   ? renderTextInput(q) : ''}
      ${q.options ? `
        ${!voiceDisabled ? renderVoicePanel() : ''}

        <div class="mt-6" style="display:flex; align-items:center; gap:12px;">
          <div style="flex:1; height:1px; background:var(--slate-200);"></div>
          <span style="font-size:11px; font-weight:800; letter-spacing:.1em; color:var(--slate-400);">
            ${voiceDisabled ? t('orChoose').toUpperCase() : t('orChoose').toUpperCase()}
          </span>
          <div style="flex:1; height:1px; background:var(--slate-200);"></div>
        </div>

        <div class="options ${q.options.length === 2 ? 'two-col' : q.options.length >= 5 ? 'three-col' : ''}">
          ${q.options.map((o, i) => `
            <button class="option-btn ${saved && saved.value === o.v ? 'selected' : ''}"
                    onclick="saveAnswerAndAdvance('${q.id}', '${o.v}', '${escapeAttr(L(o.label))}')">
              ${q.options.length > 2 ? `<span class="letter">${String.fromCharCode(65 + i)}</span>` : ''}
              <span>${L(o.label)}</span>
            </button>`).join('')}
        </div>
      ` : ''}

      ${state.voice.error ? `
        <div class="alert alert-amber mt-4" style="padding:14px 18px;">
          <div class="alert-icon" style="width:38px;height:38px;border-radius:10px;">${icon('alert-circle', 18)}</div>
          <div><p style="font-size:14px;">${escapeHtml(state.voice.error)}</p></div>
        </div>` : ''}
    </div>

    ${state.urgentFlag ? `
      <div class="flag-indicator">
        ${icon('alert-triangle', 16)}
        <span>${state.lang === 'hi' ? 'प्राथमिक चिकित्सीय मूल्यांकन की सलाह दी गई है' : 'Priority medical assessment recommended'}</span>
      </div>` : ''}
  </div>`;
}

function renderNumberInput(q) {
  const saved = state.patientAnswers[q.id];
  const value = saved ? saved.value : '';
  return `
  <div class="mt-6">
    <div class="row" style="gap:12px;">
      <input id="number-input" class="text-input" type="number" inputmode="decimal"
             value="${escapeAttr(value)}"
             placeholder="${state.lang === 'hi' ? 'तापमान दर्ज करें' : 'Enter temperature'}"
             style="flex:1; font-size:18px; padding:18px 22px;"
             onkeydown="if(event.key === 'Enter') submitNumber('${q.id}', '${q.unit || ''}')">
      ${q.unit ? `<span style="font-size:18px; font-weight:800; color:var(--slate-500);">${q.unit}</span>` : ''}
    </div>
    <button class="btn btn-primary btn-lg btn-block mt-4" onclick="submitNumber('${q.id}', '${q.unit || ''}')">
      ${t('continue')} ${icon('arrow-right', 18)}
    </button>
    <button class="btn btn-ghost btn-block mt-2" onclick="skipQuestion()">
      ${t('skip')}
    </button>
  </div>`;
}

function renderTextInput(q) {
  const saved = state.patientAnswers[q.id];
  const value = saved ? saved.value : '';
  const voiceDisabled = state.accessibility.touchOnly || !state.voice.supported;
  return `
  <div class="mt-6">
    <textarea id="text-input" class="text-input" rows="3"
              placeholder="${t('typeHere')}"
              style="width:100%; resize:vertical; font-weight:600;">${escapeHtml(value)}</textarea>

    ${!voiceDisabled ? `
      <div style="text-align:center; margin-top:16px;">
        <button class="mic-btn ${state.voice.listening ? 'listening' : ''}" onclick="toggleVoiceForText('${q.id}')" aria-label="${t('tapToSpeak')}">
          ${state.voice.listening ? icon('square', 34) : icon('mic', 34)}
        </button>
        <div class="mic-label">${state.voice.listening ? t('listening') : t('tapToSpeak')}</div>
      </div>
    ` : `
      <p class="mt-4" style="font-size:13px; color:var(--slate-500); font-weight:600; text-align:center;">
        ${t('voiceUnavailable')}
      </p>
    `}

    <button class="btn btn-primary btn-lg btn-block mt-4" onclick="submitText('${q.id}')">
      ${t('continue')} ${icon('arrow-right', 18)}
    </button>

    ${state.voice.error ? `
      <div class="alert alert-amber mt-4" style="padding:14px 18px;">
        <div class="alert-icon" style="width:38px;height:38px;border-radius:10px;">${icon('alert-circle', 18)}</div>
        <div><p style="font-size:14px;">${escapeHtml(state.voice.error)}</p></div>
      </div>` : ''}
  </div>`;
}

function renderVoicePanel() {
  const listening = state.voice.listening;
  return `
  <div class="voice-panel">
    ${listening ? `
      <div class="wave"><span></span><span></span><span></span><span></span><span></span><span></span><span></span></div>
      <div class="mic-label">${t('listening')}</div>
      <button class="btn btn-outline mt-4" onclick="stopListening()">
        ${icon('square', 14)} ${t('stop')}
      </button>
    ` : `
      <button class="mic-btn" onclick="toggleVoiceForQuestion()" aria-label="${t('tapToSpeak')}">
        ${icon('mic', 38)}
      </button>
      <div class="mic-label">${t('tapToSpeak')}</div>
      <div class="mic-sublabel">${state.lang === 'hi' ? 'हिन्दी में बोलें' : 'Speak in English'}</div>
    `}
  </div>`;
}

/* ── Documents ──────────────────────────────────────────────────────────── */
function renderDocuments() {
  const d = state.uploadedDocument;
  return `
  <div class="q-wrap">
    <div class="q-top">
      <button class="btn btn-outline btn-icon" onclick="prevFromDocuments()" aria-label="${t('back')}">
        ${icon('arrow-left', 18)}
      </button>
      <div class="q-bar">
        <div class="q-meta">STEP 3 OF 4 · DOCUMENTS</div>
        <div class="progress" style="margin-top:8px;">
          <div class="progress-fill" style="width:75%;"></div>
        </div>
      </div>
    </div>

    <div class="card card-pad">
      <h2 class="q-text">${t('docTitle')}</h2>
      <p class="q-hint">${t('docSub')}</p>

      ${!d ? `
        <label for="file-input" class="upload-zone" style="display:block;">
          ${icon('upload', 48)}
          <div class="t">${t('docUpload')}</div>
          <div class="s">${t('docFormats')}</div>
        </label>
        <input type="file" id="file-input" accept="image/*,.pdf" style="display:none;" onchange="handleFile(event)">
        <button class="btn btn-ghost btn-block mt-4" onclick="proceedFromDocuments()">
          ${t('docSkip')} ${icon('arrow-right', 16)}
        </button>
      ` : `
        <div class="doc-layout">
          <div class="doc-thumb">
            ${d.dataUrl && d.dataUrl.startsWith('data:image')
              ? `<img src="${escapeAttr(d.dataUrl)}" alt="Document preview">`
              : icon('file-text', 52)
            }
          </div>
          <div>
            <div style="font-size:14px; font-weight:800; color:var(--slate-800);">${escapeHtml(d.name)}</div>
            <div style="font-size:12px; color:var(--slate-500); font-weight:600; margin-top:4px;">
              ${(d.size / 1024).toFixed(1)} KB
            </div>

            ${d.analyzing ? `
              <div class="alert alert-teal mt-4" style="padding:18px;">
                <div class="alert-icon" style="width:40px;height:40px;border-radius:11px;">
                  <span style="display:inline-block; animation: spin 1s linear infinite;">${icon('loader', 20)}</span>
                </div>
                <div>
                  <h3 style="font-size:15px;">${t('docAnalyzing')}</h3>
                </div>
              </div>
            ` : d.extraction ? `
              <div class="alert alert-teal mt-4" style="padding:18px;">
                <div class="alert-icon" style="width:40px;height:40px;border-radius:11px;">${icon('check', 20)}</div>
                <div>
                  <h3 style="font-size:15px;">${t('docAnalyzed')}</h3>
                  <p style="font-size:13px; margin-top:2px;">${t('docNote')}</p>
                </div>
              </div>

              <div class="extract-list mt-4">
                <div class="extract-row" style="padding-top:16px; padding-bottom:16px;">
                  <span class="k">${state.lang === 'hi' ? 'प्रकार' : 'Type'}</span>
                  <span class="v">${escapeHtml(d.extraction.type)}</span>
                </div>
                <div class="extract-row">
                  <span class="k">${state.lang === 'hi' ? 'तारीख' : 'Date'}</span>
                  <span class="v">${escapeHtml(d.extraction.date)}</span>
                </div>
                ${d.extraction.fields.map(f => `
                  <div class="extract-row">
                    <span class="k">${escapeHtml(L(f.k))}</span>
                    <span class="v ${f.warn ? 'warn' : ''}">${escapeHtml(f.v)}</span>
                  </div>`).join('')}
              </div>
            ` : ''}
          </div>
        </div>

        <div class="row mt-6" style="gap:10px; flex-wrap:wrap;">
          <button class="btn btn-outline" onclick="removeDocument()">
            ${icon('x', 16)} ${t('docRemove')}
          </button>
          <button class="btn btn-primary" style="flex:1; min-width:180px;" onclick="proceedFromDocuments()" ${d.analyzing ? 'disabled' : ''}>
            ${t('continue')} ${icon('arrow-right', 18)}
          </button>
        </div>
      `}
    </div>
  </div>`;
}

/* ── Review ─────────────────────────────────────────────────────────────── */
function renderReview() {
  const concern = getConcern();
  if (!concern) return renderConcernSelect();

  return `
  <div class="q-wrap">
    <div class="q-top">
      <button class="btn btn-outline btn-icon" onclick="go('documents')" aria-label="${t('back')}">
        ${icon('arrow-left', 18)}
      </button>
      <div class="q-bar">
        <div class="q-meta">STEP 4 OF 4 · REVIEW</div>
        <div class="progress" style="margin-top:8px;">
          <div class="progress-fill" style="width:100%;"></div>
        </div>
      </div>
    </div>

    <div class="card card-pad">
      <h2 class="q-text">${t('reviewTitle')}</h2>
      <p class="q-hint">${t('reviewSub')}</p>

      <div class="review-list">
        <div class="review-item">
          <div style="width:44px; height:44px; border-radius:12px; background:var(--teal-50); color:var(--teal-700); display:grid; place-items:center; font-size:22px; flex-shrink:0;">
            ${concern.emoji}
          </div>
          <div class="qv">
            <div class="q">${state.lang === 'hi' ? 'मुख्य समस्या' : 'Main concern'}</div>
            <div class="a">${L(concern.title)}</div>
          </div>
        </div>

        ${concern.questions.map((q, i) => {
          const ans = state.patientAnswers[q.id];
          return `
          <div class="review-item">
            <div class="qv">
              <div class="q">${escapeHtml(L(q.text))}</div>
              <div class="a ${!ans ? 'empty' : ''}">${ans ? escapeHtml(ans.label) : '—'}</div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="editQuestion(${i})">
              ${icon('edit', 14)} ${t('reviewEdit')}
            </button>
          </div>`;
        }).join('')}

        ${state.uploadedDocument ? `
          <div class="review-item">
            <div class="qv">
              <div class="q">${state.lang === 'hi' ? 'दस्तावेज़' : 'Document'}</div>
              <div class="a">${escapeHtml(state.uploadedDocument.name)}</div>
            </div>
            <button class="btn btn-ghost btn-sm" onclick="go('documents')">
              ${icon('edit', 14)} ${t('reviewEdit')}
            </button>
          </div>` : ''}
      </div>

      <button class="btn btn-primary btn-lg btn-block mt-6" onclick="generateSummary()">
        ${icon('sparkles', 18)} ${state.lang === 'hi' ? 'सारांश बनाएँ' : 'Generate Summary'}
      </button>
    </div>
  </div>`;
}

/* ── Summary ────────────────────────────────────────────────────────────── */
function renderSummary() {
  const s = state.patientSummary;
  if (!s) return renderConcernSelect();

  return `
  <div class="q-wrap">
    <div class="card card-pad">
      <div class="pill pill-teal mb-4">
        ${icon('check-circle', 12)} ${state.lang === 'hi' ? 'तैयार' : 'READY'}
      </div>
      <h1 style="font-size:clamp(22px, 3.4vw, 30px); font-weight:800; letter-spacing:-.025em; color:var(--slate-900); line-height:1.2;">
        ${t('summaryTitle')}
      </h1>
      <p style="font-size:14.5px; color:var(--slate-500); margin-top:8px; font-weight:500;">
        ${t('summarySub')}
      </p>

      <div style="margin-top:24px; border-top:1px solid var(--slate-100);">
        <div class="summary-section">
          <div class="summary-label">${state.lang === 'hi' ? 'मुख्य समस्या' : 'CHIEF CONCERN'}</div>
          <div class="summary-value">${escapeHtml(s.concernEmoji)} ${escapeHtml(s.concernTitle)}</div>
        </div>

        ${s.rows.map(r => `
          <div class="summary-section">
            <div class="summary-label">${escapeHtml(r.label)}</div>
            <div class="summary-value ${r.value === '—' ? 'empty' : ''}">${escapeHtml(r.value)}</div>
          </div>`).join('')}

        ${s.document ? `
          <div class="summary-section">
            <div class="summary-label">${state.lang === 'hi' ? 'अपलोड किया दस्तावेज़' : 'UPLOADED DOCUMENT'}</div>
            <div class="summary-value">${escapeHtml(s.document.name)} · ${s.document.extraction ? escapeHtml(s.document.extraction.type) : '—'}</div>
          </div>` : ''}

        ${s.ayush && s.ayush.length ? `
          <div class="summary-section">
            <div class="summary-label">AYUSH · ${state.lang === 'hi' ? 'दशविध परीक्षा' : 'DASHAVIDHA PARIKSHA'}</div>
            ${s.ayush.map(a => `
              <div style="display:flex; justify-content:space-between; gap:16px; padding:6px 0; font-size:14px;">
                <span style="color:var(--slate-500); font-weight:600;">${escapeHtml(a.label)}</span>
                <span style="font-weight:700;">${escapeHtml(a.value)}</span>
              </div>`).join('')}
          </div>` : ''}
      </div>
    </div>

    <div class="card card-pad mt-4" style="background:linear-gradient(180deg, #fff, var(--teal-50)); border:1px solid var(--teal-200);">
      <div class="row" style="gap:14px; align-items:flex-start;">
        <div style="width:44px; height:44px; border-radius:12px; background:#fff; border:1px solid var(--teal-200); display:grid; place-items:center; color:var(--teal-700); flex-shrink:0;">
          ${icon('alert-circle', 22)}
        </div>
        <div style="flex:1;">
          <div style="font-size:15px; font-weight:800; color:var(--teal-800); margin-bottom:6px;">
            ${t('summaryGuidance')}
          </div>
          <p style="font-size:14.5px; color:var(--teal-800); line-height:1.55; font-weight:500;">
            ${L(s.guidance)}
          </p>
          <p style="font-size:12.5px; color:var(--teal-700); margin-top:10px; font-weight:600; opacity:.85;">
            ${t('summaryInfoOnly')}
          </p>
        </div>
      </div>
    </div>

    <div class="row mt-6" style="gap:10px; flex-wrap:wrap;">
      <button class="btn btn-outline" onclick="startNewAssessment()">
        ${icon('rotate-ccw', 16)} ${t('newAssessment')}
      </button>
      <button class="btn btn-primary btn-lg" style="flex:1; min-width:200px;" onclick="go('physician')">
        ${icon('stethoscope', 18)} ${t('openPhysician')}
      </button>
    </div>
  </div>`;
}

/* ── Urgent alert ───────────────────────────────────────────────────────── */
function renderUrgent() {
  const u = state.urgentFlag;
  if (!u) return renderSummary();

  return `
  <div class="q-wrap" style="max-width: 720px;">
    <div class="alert alert-red anim-pop">
      <div class="alert-icon">${icon('siren', 24)}</div>
      <div style="flex:1;">
        <h3>${t('urgentTitle')}</h3>
        <p style="margin-bottom:14px;">${t('urgentBody')}</p>
        <div style="background:#fff; border:1px solid var(--red-100); border-radius:12px; padding:14px 16px; margin-bottom:14px;">
          <div style="font-size:11px; font-weight:800; letter-spacing:.08em; color:var(--red-600); text-transform:uppercase; margin-bottom:6px;">
            ${state.lang === 'hi' ? 'रिकॉर्ड किया गया कारण' : 'REASON RECORDED'}
          </div>
          <div style="font-size:14.5px; font-weight:700; color:var(--red-800); line-height:1.55;">
            ${L(u.reason)}
          </div>
        </div>
        <p style="font-size:13px; color:var(--red-700); margin-bottom:16px;">${t('urgentNoDiagnosis')}</p>
        <div class="row" style="gap:10px; flex-wrap:wrap;">
          <button class="btn btn-danger" onclick="go('nearby')">
            ${icon('map-pin', 16)} ${t('findHospital')}
          </button>
          <button class="btn btn-outline" onclick="contactStaff()">
            ${icon('siren', 16)} ${t('contactStaff')}
          </button>
        </div>
      </div>
    </div>

    <button class="btn btn-ghost btn-block mt-6" onclick="go('summary')">
      ${t('continueAnyway')} ${icon('arrow-right', 16)}
    </button>
  </div>`;
}

/* ── Nearby care ────────────────────────────────────────────────────────── */
function renderNearby() {
  // Prototype sample facilities. In production this would come from a live directory.
  const facilities = [
    { name: state.lang === 'hi' ? 'सिटी अस्पताल' : 'City Hospital',                distance: '2.1 km', type: 'emergency', tag: state.lang === 'hi' ? 'आपातकालीन' : 'Emergency' },
    { name: state.lang === 'hi' ? 'जिला अस्पताल' : 'District Hospital',            distance: '4.5 km', type: 'emergency', tag: state.lang === 'hi' ? 'आपातकालीन' : 'Emergency' },
    { name: state.lang === 'hi' ? 'आपातकालीन चिकित्सा केंद्र' : 'Emergency Medical Center', distance: '5.2 km', type: 'emergency', tag: state.lang === 'hi' ? 'आपातकालीन' : 'Emergency' },
    { name: state.lang === 'hi' ? 'प्राथमिक स्वास्थ्य केंद्र' : 'Primary Health Centre', distance: '3.4 km', type: 'open', tag: state.lang === 'hi' ? 'खुला' : 'Open' }
  ];

  return `
  <div class="q-wrap" style="max-width: 780px;">
    <button class="btn btn-outline btn-sm mb-6" onclick="go('urgent')">
      ${icon('arrow-left', 16)} ${t('back')}
    </button>

    <div class="card card-pad">
      <div class="row" style="gap:14px;">
        <div style="width:52px; height:52px; border-radius:13px; background:var(--red-50); color:var(--red-600); display:grid; place-items:center; flex-shrink:0;">
          ${icon('map-pin', 26)}
        </div>
        <div>
          <h1 style="font-size:24px; font-weight:800; letter-spacing:-.02em; color:var(--slate-900);">
            ${t('nearbyTitle')}
          </h1>
          <p style="font-size:13px; color:var(--slate-500); margin-top:4px; font-weight:500;">
            ${t('nearbySub')}
          </p>
        </div>
      </div>

      <div style="margin-top:20px; border-top:1px solid var(--slate-100);">
        ${facilities.map(f => `
          <div class="facility">
            <div class="facility-icon">${icon('hospital', 22)}</div>
            <div>
              <div class="facility-name">${escapeHtml(f.name)}</div>
              <div class="facility-meta">
                <span>${escapeHtml(f.distance)}</span>
                <span class="facility-tag ${f.type === 'emergency' ? 'tag-emergency' : 'tag-open'}">${escapeHtml(f.tag)}</span>
              </div>
            </div>
            <div class="actions" style="display:flex; gap:8px;">
              <button class="btn btn-outline btn-sm" onclick="callFacility('${escapeAttr(f.name)}')">
                ${icon('siren', 14)} ${t('callHospital')}
              </button>
              <button class="btn btn-outline btn-sm" onclick="showDirections('${escapeAttr(f.name)}')">
                ${icon('map-pin', 14)} ${t('directions')}
              </button>
            </div>
          </div>`).join('')}
      </div>
    </div>

    <div class="alert alert-amber mt-4">
      <div class="alert-icon" style="width:38px; height:38px; border-radius:10px;">${icon('alert-triangle', 18)}</div>
      <div>
        <p style="font-size:13px;">
          ${state.lang === 'hi'
            ? 'ये नमूना सुविधाएँ हैं। एक उत्पादन प्रणाली एक लाइव अस्पताल निर्देशिका या मैप्स API से जुड़ेगी।'
            : 'These are sample facilities. A production system would connect a live hospital directory or maps API.'}
        </p>
      </div>
    </div>
  </div>`;
}

/* ── AYUSH ──────────────────────────────────────────────────────────────── */
function renderAyush() {
  return `
  <div style="max-width: 1000px; margin: 0 auto;">
    <button class="btn btn-outline btn-sm mb-6" onclick="go('home')">
      ${icon('arrow-left', 16)} ${t('back')}
    </button>

    <div class="card card-pad">
      <div class="row" style="gap:14px;">
        <div style="width:52px; height:52px; border-radius:13px; background:linear-gradient(140deg,#f59e0b,#b45309); color:#fff; display:grid; place-items:center; flex-shrink:0;">
          ${icon('leaf', 26)}
        </div>
        <div>
          <h1 style="font-size:26px; font-weight:800; letter-spacing:-.02em; color:var(--slate-900);">
            ${t('ayushTitle')}
          </h1>
          <p style="font-size:13.5px; color:var(--slate-500); margin-top:4px; font-weight:500; line-height:1.55; max-width:640px;">
            ${t('ayushSub')}
          </p>
        </div>
      </div>

      <div class="ayush-grid">
        ${AYUSH_PARAMS.map(p => {
          const sel = state.ayushAnswers[p.id];
          return `
          <div class="ayush-card">
            <div class="name">${L(p.name)}</div>
            <div class="ayush-opts">
              ${p.opts.map(o => `
                <button class="ayush-opt ${sel === o.v ? 'selected' : ''}"
                        onclick="saveAyush('${p.id}', '${o.v}')">
                  ${L(o.label)}
                </button>`).join('')}
            </div>
          </div>`;
        }).join('')}
      </div>

      <div class="row mt-6" style="gap:10px; flex-wrap:wrap;">
        <button class="btn btn-outline" onclick="go('home')">${t('back')}</button>
        <button class="btn btn-primary" style="flex:1; min-width:220px;" onclick="saveAyushAndFinish()">
          ${icon('check', 16)} ${t('ayushSave')}
        </button>
      </div>
    </div>
  </div>`;
}

/* ── ABDM ───────────────────────────────────────────────────────────────── */
function renderAbdm() {
  return `
  <div class="q-wrap" style="max-width: 780px;">
    <button class="btn btn-outline btn-sm mb-6" onclick="go('home')">
      ${icon('arrow-left', 16)} ${t('abdmBack')}
    </button>

    <div class="abdm-hero">
      <div class="tag">${state.lang === 'hi' ? 'इंटरऑपरेबिलिटी' : 'INTEROPERABILITY'}</div>
      <h2>${t('abdmTitle')}</h2>
      <p>${t('abdmSub')}</p>
    </div>

    <div class="abdm-rows">
      <div class="abdm-row">
        <span class="k">ABHA · ${state.lang === 'hi' ? 'आभा' : 'Health ID'}</span>
        <span class="v future">○ ${t('abdmFuture')}</span>
      </div>
      <div class="abdm-row">
        <span class="k">${state.lang === 'hi' ? 'अस्पताल सूचना प्रणाली (HIS)' : 'Hospital Information System (HIS)'}</span>
        <span class="v future">○ ${t('abdmFuture')}</span>
      </div>
      <div class="abdm-row">
        <span class="k">${state.lang === 'hi' ? 'इलेक्ट्रॉनिक मेडिकल रिकॉर्ड (EMR)' : 'Electronic Medical Record (EMR)'}</span>
        <span class="v future">○ ${t('abdmFuture')}</span>
      </div>
      <div class="abdm-row">
        <span class="k">FHIR R4 ${state.lang === 'hi' ? 'संरचित इतिहास प्रारूप' : 'structured history format'}</span>
        <span class="v ready">● ${t('abdmReady')}</span>
      </div>
    </div>

    <div class="alert alert-teal mt-4">
      <div class="alert-icon" style="width:38px; height:38px; border-radius:10px;">${icon('shield-check', 18)}</div>
      <div>
        <p style="font-size:13px;">
          ${state.lang === 'hi'
            ? 'यह एक UI अवधारणा है। RoG-उपाttam वर्तमान में किसी भी लाइव स्वास्थ्य-रिकॉर्ड प्रणाली से जुड़ा नहीं है। उत्पादन परिनियोजन में सुरक्षित एकीकरण जोड़ा जाएगा।'
            : 'This is a UI concept. RoG-उपाttam is not currently connected to any live health-record system. Secure integration would be added in a production deployment.'}
        </p>
      </div>
    </div>
  </div>`;
}

/* ── Physician view ─────────────────────────────────────────────────────── */
function renderPhysician() {
  const s = state.patientSummary;
  if (!s) return renderConcernSelect();

  const concern = getConcern();
  const editable = !state.physicianVerified;

  // Build physician sections
  const sections = [
    { label: state.lang === 'hi' ? 'मुख्य शिकायत' : 'Chief complaint',           value: `${s.concernEmoji} ${s.concernTitle}` },
    ...s.rows.map(r => ({ label: r.label, value: r.value }))
  ];

  if (s.document) {
    sections.push({
      label: state.lang === 'hi' ? 'अपलोड किए दस्तावेज़' : 'Uploaded documents',
      value: `${s.document.name}${s.document.extraction ? ' — ' + s.document.extraction.type + ', ' + s.document.extraction.date : ''}`
    });
  }

  if (s.ayush && s.ayush.length) {
    sections.push({
      label: 'AYUSH',
      value: s.ayush.map(a => `${a.label}: ${a.value}`).join('\n')
    });
  }

  if (s.urgent) {
    sections.push({
      label: state.lang === 'hi' ? 'महत्वपूर्ण अलर्ट' : 'Important alerts',
      value: L(s.urgent.reason),
      alert: true
    });
  }

  return `
  <div style="max-width: 900px; margin: 0 auto;">
    <div class="row-between mb-6" style="flex-wrap:wrap; gap:12px;">
      <button class="btn btn-outline btn-sm" onclick="go('summary')">
        ${icon('arrow-left', 16)} ${t('back')}
      </button>
      <div class="pill pill-slate">
        ${icon('stethoscope', 12)} ${state.lang === 'hi' ? 'चिकित्सक दृश्य' : 'PHYSICIAN VIEW'}
      </div>
    </div>

    ${state.physicianVerified ? `
      <div class="alert alert-teal mb-4 anim-pop">
        <div class="alert-icon" style="width:44px; height:44px; border-radius:12px;">${icon('check-circle', 22)}</div>
        <div>
          <h3 style="font-size:16px;">${icon('check', 14)} ${t('verified')}</h3>
          <p style="font-size:13px; margin-top:2px;">
            ${state.lang === 'hi' ? 'सत्यापन समय' : 'Verified at'} ${new Date().toLocaleTimeString(state.lang === 'hi' ? 'hi-IN' : 'en-IN', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>` : ''}

    ${state.physicianReviewed ? `
      <div class="alert alert-teal mb-4 anim-pop">
        <div class="alert-icon" style="width:44px; height:44px; border-radius:12px;">${icon('clipboard-check', 22)}</div>
        <div>
          <h3 style="font-size:16px;">${t('reviewed')}</h3>
        </div>
      </div>` : ''}

    <div class="card card-pad">
      <div class="row-between mb-6" style="align-items:flex-start; flex-wrap:wrap; gap:12px;">
        <div>
          <h1 style="font-size:26px; font-weight:800; letter-spacing:-.02em; color:var(--slate-900);">
            ${t('physicianTitle')}
          </h1>
          <p style="font-size:13.5px; color:var(--slate-500); margin-top:4px; font-weight:500;">
            ${t('physicianSub')}
          </p>
        </div>
        <div class="pill pill-slate">
          ${new Date().toLocaleDateString(state.lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </div>
      </div>

      <div style="border-top:1px solid var(--slate-100);">
        ${sections.map((sec, i) => `
          <div class="summary-section">
            <div class="summary-label">${escapeHtml(sec.label).toUpperCase()}</div>
            ${sec.alert ? `
              <div class="alert alert-amber" style="padding:14px 18px;">
                <div class="alert-icon" style="width:36px; height:36px; border-radius:10px;">${icon('alert-triangle', 18)}</div>
                <div><p style="font-size:13.5px;">${escapeHtml(sec.value)}</p></div>
              </div>
            ` : `
              <div class="summary-value"
                   data-edit-id="${i}"
                   ${editable ? 'contenteditable="true"' : ''}
                   onblur="savePhysicianEdit(${i}, this.innerText)"
                   >${escapeHtml(sec.value) || '<span class="empty">—</span>'}</div>
            `}
          </div>`).join('')}
      </div>

      <div class="phys-banner">
        ${icon('shield-check', 20)}
        <p><strong>${state.lang === 'hi' ? 'महत्वपूर्ण:' : 'Important:'}</strong> ${t('physicianBanner')}</p>
      </div>

      <div class="row mt-6" style="gap:10px; flex-wrap:wrap;">
        <button class="btn btn-outline" onclick="window.print()">
          ${icon('printer', 16)} ${state.lang === 'hi' ? 'प्रिंट करें' : 'Print'}
        </button>
        ${!state.physicianVerified ? `
          <button class="btn btn-primary" style="flex:1; min-width:180px;" onclick="verifyPhysicianSummary()">
            ${icon('check', 16)} ${t('verifyHistory')}
          </button>
        ` : !state.physicianReviewed ? `
          <button class="btn btn-primary" style="flex:1; min-width:180px;" onclick="markReviewed()">
            ${icon('clipboard-check', 16)} ${t('markReviewed')}
          </button>
        ` : ''}
      </div>
    </div>
  </div>`;
}


/* ═══════════════════════════════════════════════════════════════════════════
   12. EVENT HANDLERS (global functions called from onclick="")
   ═══════════════════════════════════════════════════════════════════════════ */

/* Welcome → Consent */
function startIntake() {
  if (state.consented) {
    go('concern');
  } else {
    go('consent');
  }
}

function acceptConsent() {
  state.consented = true;
  go('home');
}

function speakConsent() {
  const text = t('consentBody') + ' ' + (translations[state.lang].consentPoints || []).join(' ');
  speak(text);
}

/* Language toggle from header */
function toggleLanguage() {
  state.lang = state.lang === 'en' ? 'hi' : 'en';
  applyBodyClasses();
  render();
}

/* Concern selection */
function selectProblem(id) {
  state.selectedProblem = id;
  state.currentQuestion = 0;
  state.patientAnswers = {};
  state.urgentFlag = null;
  state.physicianVerified = false;
  state.physicianReviewed = false;

  const concern = CONCERNS.find(c => c.id === id);
  if (concern && concern.questions.length) {
    // Read the first question aloud if audio is on
    setTimeout(() => speak(L(concern.questions[0].text)), 350);
  }

  go('question');
}

/* Question navigation */
function prevQuestion() {
  if (state.currentQuestion > 0) {
    state.currentQuestion--;
    render();
  } else {
    go('concern');
  }
}

function repeatQuestion() {
  const concern = getConcern();
  if (!concern) return;
  const q = concern.questions[state.currentQuestion];
  if (q) speak(L(q.text));
}

function skipQuestion() {
  const concern = getConcern();
  if (!concern) return;
  const q = concern.questions[state.currentQuestion];
  if (q) {
    state.patientAnswers[q.id] = { value: 'skipped', label: state.lang === 'hi' ? 'छोड़ा गया' : 'Skipped' };
  }
  advanceQuestion();
}

function saveAnswerAndAdvance(qid, value, label) {
  state.patientAnswers[qid] = { value, label };

  // Re-check red flags after every answer
  const flag = checkForUrgentSymptoms();
  if (flag) state.urgentFlag = flag;

  render();

  // Small delay for visual feedback then advance
  setTimeout(() => advanceQuestion(), 240);
}

function advanceQuestion() {
  const concern = getConcern();
  if (!concern) return;

  state.currentQuestion++;

  if (state.currentQuestion >= concern.questions.length) {
    // Completed all questions — show urgent alert if flagged, else go to documents
    if (state.urgentFlag) {
      go('urgent');
    } else {
      go('documents');
    }
    return;
  }

  // Read the next question aloud
  const q = concern.questions[state.currentQuestion];
  if (q) setTimeout(() => speak(L(q.text)), 200);

  render();
}

function submitNumber(qid, unit) {
  const el = document.getElementById('number-input');
  if (!el) return;
  const raw = (el.value || '').trim();
  if (!raw) {
    skipQuestion();
    return;
  }
  const display = raw + (unit ? ' ' + unit : '');
  state.patientAnswers[qid] = { value: raw, label: display };
  render();
  setTimeout(() => advanceQuestion(), 200);
}

function submitText(qid) {
  const el = document.getElementById('text-input');
  if (!el) return;
  const raw = (el.value || '').trim();
  if (!raw) {
    skipQuestion();
    return;
  }
  state.patientAnswers[qid] = { value: raw, label: raw };
  render();
  setTimeout(() => advanceQuestion(), 200);
}

/* Voice on option-questions */
function toggleVoiceForQuestion() {
  if (state.voice.listening) {
    stopListening();
    return;
  }
  startListening((text) => {
    const concern = getConcern();
    if (!concern) { render(); return; }
    const q = concern.questions[state.currentQuestion];
    if (!q) { render(); return; }

    // Try to match transcript to an option
    let matched = null;
    if (q.options) {
      const lower = text.toLowerCase();
      for (const o of q.options) {
        const enLabel = o.label.en.toLowerCase();
        const hiLabel = o.label.hi;
        if (lower.includes(enLabel) || text.includes(hiLabel)) {
          matched = o;
          break;
        }
      }
    }

    if (matched) {
      saveAnswerAndAdvance(q.id, matched.v, L(matched.label));
    } else {
      // Free-text answer, stored verbatim
      state.patientAnswers[q.id] = { value: text, label: text };
      render();
      setTimeout(() => advanceQuestion(), 500);
    }
  });
}

/* Voice on free-text questions */
function toggleVoiceForText(qid) {
  if (state.voice.listening) {
    stopListening();
    return;
  }
  startListening((text) => {
    const el = document.getElementById('text-input');
    if (el) {
      el.value = text;
      el.focus();
    }
    render();
  });
}

/* Documents */
function proceedFromDocuments() {
  go('review');
}

function prevFromDocuments() {
  go('question');
}

/* Review → back to a specific question */
function editQuestion(index) {
  state.currentQuestion = index;
  go('question');
}

/* Summary → new assessment */
function startNewAssessment() {
  state.selectedProblem = '';
  state.currentQuestion = 0;
  state.patientAnswers = {};
  state.uploadedDocument = null;
  state.patientSummary = null;
  state.urgentFlag = null;
  state.physicianVerified = false;
  state.physicianReviewed = false;
  go('concern');
}

/* Urgent → nearby */
function contactStaff() {
  showToast(
    state.lang === 'hi' ? 'अस्पताल स्टाफ को सूचित किया गया (प्रदर्शन)।' : 'Hospital staff notified (demonstration).',
    'warn'
  );
}

/* Nearby facilities */
function callFacility(name) {
  showToast(
    state.lang === 'hi' ? `${name} को कॉल करने का अनुकरण।` : `Simulating call to ${name}.`,
    'info'
  );
}

function showDirections(name) {
  showToast(
    state.lang === 'hi' ? `${name} के लिए दिशा-निर्देश उपलब्ध नहीं।` : `Directions to ${name} not available in this build.`,
    'info'
  );
}

/* AYUSH */
function saveAyush(paramId, value) {
  state.ayushAnswers[paramId] = value;
  render();
}

function saveAyushAndFinish() {
  showToast(
    state.lang === 'hi' ? 'आयुष इतिहास सहेजा गया।' : 'AYUSH history saved.',
    'ok'
  );
  go('home');
}

/* Physician */
function savePhysicianEdit(index, text) {
  // Edits are held in the DOM; this hook is where a real backend would persist.
  // No-op for the prototype.
}

function verifyPhysicianSummary() {
  state.physicianVerified = true;
  render();
  showToast(t('verified'), 'ok');
}

function markReviewed() {
  state.physicianReviewed = true;
  render();
  showToast(t('reviewed'), 'ok');
}

/* Home dashboard shortcuts */
function openReviewOrConcern() {
  if (state.patientSummary) {
    go('summary');
  } else if (state.selectedProblem) {
    go('review');
  } else {
    showToast(
      state.lang === 'hi' ? 'पहले स्वास्थ्य मूल्यांकन शुरू करें।' : 'Start a health assessment first.',
      'warn'
    );
    go('concern');
  }
}

/* Settings */
function openSettings() {
  state.settingsOpen = true;
  render();
}
function closeSettings() {
  state.settingsOpen = false;
  render();
}

function toggleAccessibility(key, value) {
  state.accessibility[key] = value;
  applyBodyClasses();
  render();
}

function applyBodyClasses() {
  document.body.classList.toggle('large-text', !!state.accessibility.largeText);
  document.body.classList.toggle('high-contrast', !!state.accessibility.highContrast);
  document.documentElement.lang = state.lang;
}


/* ═══════════════════════════════════════════════════════════════════════════
   INTERNAL HELPERS
   ═══════════════════════════════════════════════════════════════════════════ */

function escapeAttr(str) {
  return String(str == null ? '' : str)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}


/* ═══════════════════════════════════════════════════════════════════════════
   13. INITIALISATION
   ═══════════════════════════════════════════════════════════════════════════ */

(function init() {
  // Detect voice support
  checkVoiceSupport();
  if (!state.voice.supported) {
    state.voice.error = null; // We won't show the error until the patient tries to use voice
  }

  // Apply accessibility + language to <body>
  applyBodyClasses();

  // Close settings on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.settingsOpen) closeSettings();
  });

  // First render
  render();
})();