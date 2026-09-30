export type Language = 'en' | 'hi' | 'te';

export interface TranslationsSchema {
  appName: string;
  tagline: string;
  subTagline: string;
  syntheticBanner: string;
  scenarioActive: string;
  roles: {
    PHC_STAFF: string;
    DISTRICT_AUTHORITY: string;
    STATE_AUTHORITY: string;
    NATIONAL_AUTHORITY: string;
    ADMIN: string;
  };
  navGroups: {
    commandHospitals: string;
    predictiveAi: string;
    alertsTransfers: string;
    federatedAi: string;
    governance: string;
  };
  nav: {
    overview: string;
    phcNetwork: string;
    phcDetail: string;
    resourceIntelligence: string;
    forecasts: string;
    whatIfSimulator: string;
    emergencyCascade: string;
    alerts: string;
    recommendations: string;
    federatedIntelligence: string;
    aiCopilot: string;
    aiBriefing: string;
    modelPerformance: string;
    dataReliability: string;
    auditLog: string;
    systemArchitecture: string;
    demoControlCenter: string;
    settings: string;
  };
  kpi: {
    criticalHospitals: string;
    activeAlerts: string;
    pendingApprovals: string;
    dataReliability: string;
    totalHospitals: string;
    dailyFootfall: string;
    bedOccupancy: string;
    staffPresence: string;
    ptsPerDay: string;
    occupied: string;
    active: string;
    stockout48h: string;
    hierarchicalTier: string;
    humanInLoop: string;
    telemetryVerified: string;
  };
  map: {
    title: string;
    subtitle: string;
    allHospitals: string;
    criticalOnly: string;
    highRiskOnly: string;
    normalOnly: string;
    inspectHospital: string;
    viewForecast: string;
    occupancy: string;
    footfall: string;
    reliability: string;
    weather: string;
    outbreak: string;
    jumpToHospital: string;
    allDistricts: string;
    satellite: string;
    roadmap: string;
    contactSuperintendent: string;
    surplusCorridor: string;
  };
  common: {
    search: string;
    filterState: string;
    filterRisk: string;
    allStates: string;
    allRisks: string;
    status: string;
    actions: string;
    date: string;
    officer: string;
    loading: string;
    approved: string;
    rejected: string;
    pending: string;
    review: string;
    cancel: string;
    confirm: string;
    critical: string;
    high: string;
    medium: string;
    normal: string;
    low: string;
    quickDemo: string;
    runEmergency: string;
    resetBaseline: string;
    viewDetails: string;
    refresh: string;
    close: string;
    save: string;
    exportPdf: string;
  };
  table: {
    hospital: string;
    resource: string;
    stock: string;
    projectedDemand: string;
    riskLevel: string;
    daysLeft: string;
    action: string;
    district: string;
    state: string;
    occupancy: string;
    footfall: string;
  };
  buttons: {
    authorizeTransfer: string;
    rejectTransfer: string;
    runSimulation: string;
    runFederatedRound: string;
    generateBriefing: string;
    askQuestion: string;
    printReport: string;
    back: string;
    inspectFacility: string;
  };
}

export const translations: Record<Language, TranslationsSchema> = {
  en: {
    appName: 'Health-Nexus AI',
    tagline: 'SEE. PREDICT. WARN. ACT. LEARN.',
    subTagline: 'Federated AI for Predictive Healthcare Resource Intelligence',
    syntheticBanner: 'GOVTECH DECISION SUPPORT PLATFORM — PREDICTIVE HEALTHCARE INTELLIGENCE',
    scenarioActive: 'Active Scenario',
    roles: {
      PHC_STAFF: 'Hospital Medical Officer',
      DISTRICT_AUTHORITY: 'District Health Officer',
      STATE_AUTHORITY: 'State Health Commissioner',
      NATIONAL_AUTHORITY: 'National Health Mission Lead',
      ADMIN: 'System Administrator'
    },
    navGroups: {
      commandHospitals: 'Command & Hospitals',
      predictiveAi: 'Predictive Intelligence',
      alertsTransfers: 'Alerts & Mutual-Aid',
      federatedAi: 'Federated AI & Copilot',
      governance: 'System & Governance'
    },
    nav: {
      overview: 'Command Center',
      phcNetwork: 'Hospital Network & Map',
      phcDetail: 'Facility Telemetry',
      resourceIntelligence: 'Resource Inventory',
      forecasts: '14-Day Forecasts',
      whatIfSimulator: 'What-If Simulator',
      emergencyCascade: 'Emergency Cascade',
      alerts: 'Early Warnings',
      recommendations: 'AI Redistribution',
      federatedIntelligence: 'Federated Learning',
      aiCopilot: 'Ask Copilot',
      aiBriefing: 'Executive Briefing',
      modelPerformance: 'Model Metrics',
      dataReliability: 'Data Reliability',
      auditLog: 'Audit Trail',
      systemArchitecture: 'Architecture',
      demoControlCenter: 'Judge Demo Hub',
      settings: 'Settings'
    },
    kpi: {
      criticalHospitals: 'Critical Hospitals',
      activeAlerts: 'Active Warnings',
      pendingApprovals: 'Pending Approvals',
      dataReliability: 'Data Reliability',
      totalHospitals: 'Monitored Hospitals',
      dailyFootfall: 'Daily Patient Inflow',
      bedOccupancy: 'System Bed Occupancy',
      staffPresence: 'Duty Staff Presence',
      ptsPerDay: 'patients/day',
      occupied: 'Occupied',
      active: 'Active',
      stockout48h: 'Stockout / Bed overflow < 48h',
      hierarchicalTier: 'Hierarchical Escalation',
      humanInLoop: 'Human-in-the-loop transfers',
      telemetryVerified: 'Verified Telemetry'
    },
    map: {
      title: 'Google Maps Live Hospital Intelligence Network',
      subtitle: 'Real-time geographic distribution of monitored tertiary hospitals and health centers',
      allHospitals: 'All Hospitals',
      criticalOnly: 'Critical Risk',
      highRiskOnly: 'High Risk',
      normalOnly: 'Normal',
      inspectHospital: 'Inspect Facility Telemetry',
      viewForecast: 'View 14-Day Forecast',
      occupancy: 'Bed Occupancy',
      footfall: 'Daily Footfall',
      reliability: 'Data Reliability',
      weather: 'Weather',
      outbreak: 'Outbreak Vector',
      jumpToHospital: 'Jump to Hospital...',
      allDistricts: 'All Districts',
      satellite: 'Satellite',
      roadmap: 'Roadmap',
      contactSuperintendent: 'Medical Superintendent',
      surplusCorridor: 'Mutual Aid Transport Corridor'
    },
    common: {
      search: 'Search hospitals, resources, or districts...',
      filterState: 'Filter by State',
      filterRisk: 'Filter by Risk',
      allStates: 'All States',
      allRisks: 'All Risks',
      status: 'Status',
      actions: 'Actions',
      date: 'Date & Time',
      officer: 'Authorized Officer',
      loading: 'Loading Health-Nexus Intelligence Platform...',
      approved: 'Approved',
      rejected: 'Rejected',
      pending: 'Pending Review',
      review: 'Review & Sign',
      cancel: 'Cancel',
      confirm: 'Confirm & Authorize',
      critical: 'CRITICAL',
      high: 'HIGH RISK',
      medium: 'MEDIUM RISK',
      normal: 'NORMAL / STABLE',
      low: 'LOW RISK',
      quickDemo: 'Quick Demo Controller',
      runEmergency: 'Trigger Full Emergency Scenario',
      resetBaseline: 'Reset Demo Baseline',
      viewDetails: 'View Telemetry',
      refresh: 'Refresh',
      close: 'Close',
      save: 'Save Changes',
      exportPdf: 'Export Dossier'
    },
    table: {
      hospital: 'Hospital & Facility',
      resource: 'Resource & Code',
      stock: 'On-Hand Stock',
      projectedDemand: '7-Day Projected Demand',
      riskLevel: 'Shortage Risk',
      daysLeft: 'Depletion Horizon',
      action: 'Action',
      district: 'District',
      state: 'State',
      occupancy: 'Beds',
      footfall: 'Daily Inflow'
    },
    buttons: {
      authorizeTransfer: 'Authorize Transfer',
      rejectTransfer: 'Reject Proposal',
      runSimulation: 'Simulate Projected System Impact',
      runFederatedRound: 'RUN FEDERATED ROUND',
      generateBriefing: "Generate Today's Briefing",
      askQuestion: 'Ask Health-Nexus Copilot',
      printReport: 'Print Dossier',
      back: 'Back to Hospital Directory',
      inspectFacility: 'Inspect Facility'
    }
  },
  hi: {
    appName: 'हेल्थ-नेक्सस एआई',
    tagline: 'देखें. पूर्वानुमान करें. चेतावनी दें. कार्य करें. सीखें.',
    subTagline: 'स्वास्थ्य सेवा संसाधन बुद्धिमत्ता हेतु फ़ेडरेटेड एआई',
    syntheticBanner: 'गवर्नमेंट हेल्थ डिसिजन सपोर्ट प्लेटफॉर्म — प्रिडिक्टिव हेल्थकेयर इंटेलिजेंस',
    scenarioActive: 'सक्रिय परिदृश्य',
    roles: {
      PHC_STAFF: 'अस्पताल चिकित्सा अधिकारी',
      DISTRICT_AUTHORITY: 'जिला स्वास्थ्य अधिकारी',
      STATE_AUTHORITY: 'राज्य स्वास्थ्य आयुक्त',
      NATIONAL_AUTHORITY: 'राष्ट्रीय स्वास्थ्य मिशन प्रमुख',
      ADMIN: 'सिस्टम व्यवस्थापक'
    },
    navGroups: {
      commandHospitals: 'कमांड व अस्पताल',
      predictiveAi: 'पूर्वानुमान इंटेलिजेंस',
      alertsTransfers: 'चेतावनियाँ व पुनर्वितरण',
      federatedAi: 'फ़ेडरेटेड एआई व कोपायलट',
      governance: 'सिस्टम व गवर्नेंस'
    },
    nav: {
      overview: 'कमांड सेंटर',
      phcNetwork: 'अस्पताल नेटवर्क व नक्शा',
      phcDetail: 'अस्पताल विस्तृत विवरण',
      resourceIntelligence: 'संसाधन इन्वेंट्री',
      forecasts: '14-दिवसीय पूर्वानुमान',
      whatIfSimulator: 'व्हाट-इफ सिम्युलेटर',
      emergencyCascade: 'आपातकालीन कैस्केड',
      alerts: 'प्रारंभिक चेतावनियाँ',
      recommendations: 'एआई पुनर्वितरण',
      federatedIntelligence: 'फ़ेडरेटेड लर्निंग',
      aiCopilot: 'कोपायलट से पूछें',
      aiBriefing: 'कार्यकारी ब्रीफिंग',
      modelPerformance: 'मॉडल प्रदर्शन',
      dataReliability: 'डेटा विश्वसनीयता',
      auditLog: 'ऑडिट ट्रेल',
      systemArchitecture: 'आर्किटेक्चर',
      demoControlCenter: 'डेमो कंट्रोल हब',
      settings: 'सेटिंग्स'
    },
    kpi: {
      criticalHospitals: 'गंभीर अस्पताल',
      activeAlerts: 'सक्रिय चेतावनियाँ',
      pendingApprovals: 'लंबित अनुमोदन',
      dataReliability: 'डेटा विश्वसनीयता',
      totalHospitals: 'निगरानी अस्पताल',
      dailyFootfall: 'दैनिक रोगी आवक',
      bedOccupancy: 'बिस्तर अधिभोग',
      staffPresence: 'ड्यूटी स्टाफ उपस्थिति',
      ptsPerDay: 'मरीज़/दिन',
      occupied: 'अधिभोग',
      active: 'सक्रिय',
      stockout48h: 'दवा/बिस्तर कमी < 48 घंटे',
      hierarchicalTier: 'श्रेणीबद्ध एस्केलेशन',
      humanInLoop: 'अधिकारी द्वारा स्वीकृत स्थानांतरण',
      telemetryVerified: 'सत्यापित टेलीमेट्री'
    },
    map: {
      title: 'गूगल मैप्स लाइव अस्पताल इंटेलिजेंस नेटवर्क',
      subtitle: 'प्रमुख तृतीयक अस्पतालों व स्वास्थ्य केंद्रों का वास्तविक समय भौगोलिक वितरण',
      allHospitals: 'सभी अस्पताल',
      criticalOnly: 'गंभीर जोखिम',
      highRiskOnly: 'उच्च जोखिम',
      normalOnly: 'सामान्य',
      inspectHospital: 'अस्पताल टेलीमेट्री देखें',
      viewForecast: '14-दिवसीय पूर्वानुमान देखें',
      occupancy: 'बिस्तर अधिभोग',
      footfall: 'दैनिक रोगी संख्या',
      reliability: 'डेटा विश्वसनीयता',
      weather: 'मौसम',
      outbreak: 'महामारी प्रकोप',
      jumpToHospital: 'अस्पताल पर जाएँ...',
      allDistricts: 'सभी ज़िले',
      satellite: 'सैटेलाइट',
      roadmap: 'रोडमैप',
      contactSuperintendent: 'चिकित्सा अधीक्षक',
      surplusCorridor: 'पारस्परिक सहायता गलियारा'
    },
    common: {
      search: 'अस्पताल, दवा या जिला खोजें...',
      filterState: 'राज्य अनुसार फ़िल्टर',
      filterRisk: 'जोखिम अनुसार फ़िल्टर',
      allStates: 'सभी राज्य',
      allRisks: 'सभी जोखिम स्तर',
      status: 'स्थिति',
      actions: 'कार्यवाही',
      date: 'दिनांक व समय',
      officer: 'अधिकृत अधिकारी',
      loading: 'हेल्थ-नेक्सस इंटेलिजेंस लोड हो रहा है...',
      approved: 'स्वीकृत',
      rejected: 'अस्वीकृत',
      pending: 'समीक्षा हेतु लंबित',
      review: 'समीक्षा व हस्ताक्षर',
      cancel: 'रद्द करें',
      confirm: 'पुष्टि व अधिकृत करें',
      critical: 'गंभीर जोखिम',
      high: 'उच्च जोखिम',
      medium: 'मध्यम जोखिम',
      normal: 'सामान्य / स्थिर',
      low: 'निम्न जोखिम',
      quickDemo: 'त्वरित डेमो कंट्रोलर',
      runEmergency: 'आपातकालीन परिदृश्य चलाएँ',
      resetBaseline: 'डेमो रीसेट करें',
      viewDetails: 'विवरण देखें',
      refresh: 'ताज़ा करें',
      close: 'बंद करें',
      save: 'परिवर्तन सहेजें',
      exportPdf: 'डॉसियर निर्यात करें'
    },
    table: {
      hospital: 'अस्पताल व स्वास्थ्य केंद्र',
      resource: 'संसाधन व कोड',
      stock: 'उपलब्ध स्टॉक',
      projectedDemand: '7-दिवसीय अनुमानित मांग',
      riskLevel: 'कमी का जोखिम',
      daysLeft: 'स्टॉक समाप्ति समय',
      action: 'कार्यवाही',
      district: 'ज़िला',
      state: 'राज्य',
      occupancy: 'बिस्तर',
      footfall: 'दैनिक आवक'
    },
    buttons: {
      authorizeTransfer: 'स्थानांतरण अधिकृत करें',
      rejectTransfer: 'प्रस्ताव अस्वीकार करें',
      runSimulation: 'अनुमानित प्रभाव सिमुलेट करें',
      runFederatedRound: 'फ़ेडरेटेड राउंड चलाएँ',
      generateBriefing: 'आज की ब्रीफिंग तैयार करें',
      askQuestion: 'हेल्थ-नेक्सस से पूछें',
      printReport: 'प्रिंट डॉसियर',
      back: 'अस्पताल सूची पर वापस जाएँ',
      inspectFacility: 'सुविधा का निरीक्षण करें'
    }
  },
  te: {
    appName: 'హెల్త్-నెక్సస్ AI',
    tagline: 'చూడండి. అంచనా వేయండి. హెచ్చరించండి. చర్య తీసుకోండి. నేర్చుకోండి.',
    subTagline: 'ఆరోగ్య సంరక్షణ వనరుల మేధస్సు కోసం ఫెడరేటెడ్ AI',
    syntheticBanner: 'ప్రభుత్వ ఆరోగ్య నిర్ణయ మద్దతు వేదిక — ప్రిడిక్టివ్ హెల్త్‌కేర్ ఇంటెలిజెన్స్',
    scenarioActive: 'క్రియాశీల దృష్టాంతం',
    roles: {
      PHC_STAFF: 'ఆసుపత్రి వైద్యాధికారి',
      DISTRICT_AUTHORITY: 'జిల్లా ఆరోగ్య అధికారి',
      STATE_AUTHORITY: 'రాష్ట్ర ఆరోగ్య కమిషనర్',
      NATIONAL_AUTHORITY: 'జాతీయ ఆరోగ్య మిషన్ లీడ్',
      ADMIN: 'సిస్టమ్ అడ్మినిస్ట్రేటర్'
    },
    navGroups: {
      commandHospitals: 'కమాండ్ & ఆసుపత్రులు',
      predictiveAi: 'ప్రిడిక్టివ్ ఇంటెలిజెన్స్',
      alertsTransfers: 'హెచ్చరికలు & పునఃపంపిణీ',
      federatedAi: 'ఫెడరేటెడ్ AI & కోపైలట్',
      governance: 'సిస్టమ్ & పాలన'
    },
    nav: {
      overview: 'కమాండ్ సెంటర్',
      phcNetwork: 'ఆసుపత్రుల నెట్‌వర్క్ & మ్యాప్',
      phcDetail: 'ఆసుపత్రి టెలిమెట్రీ',
      resourceIntelligence: 'వనరుల ఇన్వెంటరీ',
      forecasts: '14-రోజుల అంచనాలు',
      whatIfSimulator: 'వాట్-ఇఫ్ సిమ్యులేటర్',
      emergencyCascade: 'ఎమర్జెన్సీ కాస్కేడ్',
      alerts: 'ముందస్తు హెచ్చరికలు',
      recommendations: 'AI పునఃపంపిణీ',
      federatedIntelligence: 'ఫెడరేటెడ్ లెర్నింగ్',
      aiCopilot: 'కోపైలట్‌ను అడగండి',
      aiBriefing: 'ఎగ్జిక్యూటివ్ బ్రీఫింగ్',
      modelPerformance: 'మోడల్ పనితీరు',
      dataReliability: 'డేటా విశ్వసనీయత',
      auditLog: 'ఆడిట్ రికార్డు',
      systemArchitecture: 'ఆర్కిటెక్చర్',
      demoControlCenter: 'డెమో కంట్రోల్ హబ్',
      settings: 'సెట్టింగ్‌లు'
    },
    kpi: {
      criticalHospitals: 'క్లిష్టమైన ఆసుపత్రులు',
      activeAlerts: 'క్రియాశీల హెచ్చరికలు',
      pendingApprovals: 'ఆమోదం కోసం పెండింగ్',
      dataReliability: 'డేటా విశ్వసనీయత',
      totalHospitals: 'పర్యవేక్షించబడుతున్న ఆసుపత్రులు',
      dailyFootfall: 'రోజువారీ రోగుల ప్రవాహం',
      bedOccupancy: 'బెడ్ల వినియోగం',
      staffPresence: 'సిబ్బంది హాజరు',
      ptsPerDay: 'రోగులు/రోజుకు',
      occupied: 'వినియోగంలో ఉంది',
      active: 'క్రియాశీలం',
      stockout48h: 'ఔషధాల/బెడ్ల కొరత < 48 గంటలు',
      hierarchicalTier: 'శ్రేణుల హెచ్చరికల ప్రసరణ',
      humanInLoop: 'అధికారి ఆమోదిత బదిలీలు',
      telemetryVerified: 'ధృవీకరించబడిన టెలిమెట్రీ'
    },
    map: {
      title: 'గూగుల్ మ్యాప్స్ లైవ్ ఆసుపత్రి ఇంటెలిజెన్స్ నెట్‌వర్క్',
      subtitle: 'ప్రధాన ఆసుపత్రులు మరియు ఆరోగ్య కేంద్రాల ప్రత్యక్ష భౌగోళిక విస్తరణ',
      allHospitals: 'అన్ని ఆసుపత్రులు',
      criticalOnly: 'క్లిష్టమైన రిస్క్',
      highRiskOnly: 'అధిక రిస్క్',
      normalOnly: 'సాధారణం',
      inspectHospital: 'ఆసుపత్రి వివరాలు చూడండి',
      viewForecast: '14-రోజుల అంచనా చూడండి',
      occupancy: 'బెడ్ల ఆక్యుపెన్సీ',
      footfall: 'రోజువారీ రోగులు',
      reliability: 'డేటా విశ్వసనీయత',
      weather: 'వాతావరణం',
      outbreak: 'వ్యాధి వ్యాప్తి',
      jumpToHospital: 'ఆసుపత్రికి వెళ్ళండి...',
      allDistricts: 'అన్ని జిల్లాలు',
      satellite: 'శాటిలైట్',
      roadmap: 'రోడ్‌మ్యాప్',
      contactSuperintendent: 'మెడికల్ సూపరింటెండెంట్',
      surplusCorridor: 'పరస్పర సహాయ రవాణా కారిడార్'
    },
    common: {
      search: 'ఆసుపత్రి, మందు లేదా జిల్లా పేరు శోధించండి...',
      filterState: 'రాష్ట్రం వారీగా ఫిల్టర్',
      filterRisk: 'రిస్క్ వారీగా ఫిల్టర్',
      allStates: 'అన్ని రాష్ట్రాలు',
      allRisks: 'అన్ని రిస్క్ స్థాయిలు',
      status: 'స్థితి',
      actions: 'చర్యలు',
      date: 'తేదీ & సమయం',
      officer: 'అధీకృత అధికారి',
      loading: 'హెల్త్-నెక్సస్ ఇంటెలిజెన్స్ లోడ్ అవుతోంది...',
      approved: 'ఆమోదించబడింది',
      rejected: 'తిరస్కరించబడింది',
      pending: 'సమీక్ష కోసం వేచి ఉంది',
      review: 'సమీక్షించి సంతకం చేయండి',
      cancel: 'రద్దు చేయండి',
      confirm: 'ధృవీకరించి ఆమోదించండి',
      critical: 'తీవ్రమైన రిస్క్',
      high: 'అధిక రిస్క్',
      medium: 'మధ్యస్థ రిస్క్',
      normal: 'సాధారణం / స్థిరం',
      low: 'తక్కువ రిస్క్',
      quickDemo: 'త్వరిత డెమో కంట్రోలర్',
      runEmergency: 'అత్యవసర దృష్టాంతాన్ని అమలు చేయండి',
      resetBaseline: 'డెమో రీసెట్ చేయండి',
      viewDetails: 'వివరాలు చూడండి',
      refresh: 'తాజా చేయండి',
      close: 'మూసివేయండి',
      save: 'మార్పులను భద్రపరచండి',
      exportPdf: 'నివేదికను డౌన్‌లోడ్ చేయండి'
    },
    table: {
      hospital: 'ఆసుపత్రి & కేంద్రం',
      resource: 'వనరు & కోడ్',
      stock: 'ప్రస్తుత నిల్వ',
      projectedDemand: '7-రోజుల అంచనా డిమాండ్',
      riskLevel: 'కొరత ముప్పు',
      daysLeft: 'నిల్వ మిగిలిన సమయం',
      action: 'చర్య',
      district: 'జిల్లా',
      state: 'రాష్ట్రం',
      occupancy: 'బెడ్లు',
      footfall: 'రోజువారీ రోగులు'
    },
    buttons: {
      authorizeTransfer: 'బదిలీని ఆమోదించండి',
      rejectTransfer: 'ప్రతిపాదనను తిరస్కరించండి',
      runSimulation: 'ప్రభావాన్ని సిమ్యులేట్ చేయండి',
      runFederatedRound: 'ఫెడరేటెడ్ రౌండ్ ప్రారంభించండి',
      generateBriefing: 'ఈరోజు బ్రీఫింగ్ రూపొందించండి',
      askQuestion: 'హెల్త్-నెక్సస్‌ను అడగండి',
      printReport: 'నివేదికను ప్రింట్ చేయండి',
      back: 'ఆసుపత్రుల జాబితాకు తిరిగి వెళ్లండి',
      inspectFacility: 'సౌకర్యాన్ని తనిఖీ చేయండి'
    }
  }
};
