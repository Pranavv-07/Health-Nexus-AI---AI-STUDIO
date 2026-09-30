import {
  PHC,
  ResourceItem,
  Alert,
  Recommendation,
  CascadeGraph,
  FederatedNode,
  FederatedRound,
  AuditLogEntry,
  SystemIntegrationStatus,
  ModelMetric
} from '../src/types.ts';

// Deterministic seed database
export class Database {
  public phcs: PHC[] = [];
  public resources: ResourceItem[] = [];
  public alerts: Alert[] = [];
  public recommendations: Recommendation[] = [];
  public auditLogs: AuditLogEntry[] = [];
  public federatedNodes: FederatedNode[] = [];
  public federatedRounds: FederatedRound[] = [];
  public integrations: SystemIntegrationStatus[] = [];
  public modelMetrics: ModelMetric[] = [];
  public currentScenarioName: string = 'Standard Operations';
  public lastScenarioTimestamp: string = new Date().toISOString();

  constructor() {
    this.initDatabase();
  }

  public initDatabase() {
    this.phcs = this.generateInitialPHCs();
    this.resources = this.generateInitialResources(this.phcs);
    this.alerts = this.generateInitialAlerts(this.phcs);
    this.recommendations = this.generateInitialRecommendations(this.phcs, this.resources);
    this.auditLogs = this.generateInitialAuditLogs();
    this.federatedNodes = this.generateInitialFederatedNodes();
    this.federatedRounds = this.generateInitialFederatedRounds();
    this.integrations = this.generateInitialIntegrations();
    this.modelMetrics = this.generateInitialModelMetrics();
    this.currentScenarioName = 'Standard Operations';
  }

  private generateInitialPHCs(): PHC[] {
    return [
      {
        id: 'phc-ap-01',
        name: 'Government General Hospital (GGH), Guntur',
        code: 'GGH-AP-GNT-01',
        state: 'Andhra Pradesh',
        district: 'Guntur',
        cityTown: 'Kanna Vari Thota, Guntur',
        areaType: 'Urban',
        terrainType: 'Plain',
        isDisasterProne: true,
        populationServed: 125000,
        lat: 16.3067,
        lng: 80.4365,
        contactPerson: 'Dr. N. Prabhavathi (Medical Superintendent)',
        phone: '+91 863 2223456',
        overallRisk: 'CRITICAL',
        dataFreshnessMinutes: 4,
        dataCompleteness: 98,
        dataConsistency: 96,
        dataReliabilityScore: 97,
        dataReliabilityStatus: 'HIGH',
        patientFootfallDaily: 420,
        patientFootfallTrend: 42,
        bedCapacity: 120,
        bedOccupancy: 114,
        staffTotal: 48,
        staffAvailable: 34,
        specialistPresent: true,
        weather: {
          tempC: 33,
          rainfallMm: 145,
          condition: 'Heavy Rain',
          season: 'Monsoon'
        },
        dominantDiseaseTrend: {
          disease: 'Acute Diarrheal Disease & Gastroenteritis',
          weeklySurgePercent: 68,
          activeCases: 84
        },
        supplyLeadTimeDays: 4,
        lastSyncTimestamp: new Date(Date.now() - 4 * 60000).toISOString()
      },
      {
        id: 'phc-ap-02',
        name: 'New Government General Hospital, Vijayawada',
        code: 'GGH-AP-KRS-02',
        state: 'Andhra Pradesh',
        district: 'Krishna',
        cityTown: 'Gunadala, Vijayawada',
        areaType: 'Urban',
        terrainType: 'Plain',
        isDisasterProne: false,
        populationServed: 180000,
        lat: 16.5162,
        lng: 80.6380,
        contactPerson: 'Dr. Y. Kiran Kumar (Civil Surgeon)',
        phone: '+91 866 2483190',
        overallRisk: 'LOW',
        dataFreshnessMinutes: 2,
        dataCompleteness: 99,
        dataConsistency: 98,
        dataReliabilityScore: 98,
        dataReliabilityStatus: 'HIGH',
        patientFootfallDaily: 580,
        patientFootfallTrend: 5,
        bedCapacity: 150,
        bedOccupancy: 82,
        staffTotal: 62,
        staffAvailable: 58,
        specialistPresent: true,
        weather: {
          tempC: 32,
          rainfallMm: 35,
          condition: 'Moderate Rain',
          season: 'Monsoon'
        },
        dominantDiseaseTrend: {
          disease: 'Upper Respiratory Infection',
          weeklySurgePercent: 8,
          activeCases: 29
        },
        supplyLeadTimeDays: 1,
        lastSyncTimestamp: new Date(Date.now() - 2 * 60000).toISOString()
      },
      {
        id: 'phc-ap-03',
        name: 'District Headquarters Hospital, Machilipatnam',
        code: 'DHH-AP-KRS-03',
        state: 'Andhra Pradesh',
        district: 'Krishna',
        cityTown: 'Machilipatnam Port Area',
        areaType: 'Rural',
        terrainType: 'Coastal',
        isDisasterProne: true,
        populationServed: 65000,
        lat: 16.1875,
        lng: 81.1389,
        contactPerson: 'Dr. P. Srinivas (Resident Medical Officer)',
        phone: '+91 867 2221944',
        overallRisk: 'HIGH',
        dataFreshnessMinutes: 12,
        dataCompleteness: 94,
        dataConsistency: 92,
        dataReliabilityScore: 93,
        dataReliabilityStatus: 'HIGH',
        patientFootfallDaily: 285,
        patientFootfallTrend: 28,
        bedCapacity: 60,
        bedOccupancy: 52,
        staffTotal: 28,
        staffAvailable: 21,
        specialistPresent: false,
        weather: {
          tempC: 30,
          rainfallMm: 110,
          condition: 'Heavy Rain',
          season: 'Monsoon'
        },
        dominantDiseaseTrend: {
          disease: 'Vector-borne (Dengue/Malaria)',
          weeklySurgePercent: 35,
          activeCases: 41
        },
        supplyLeadTimeDays: 3,
        lastSyncTimestamp: new Date(Date.now() - 12 * 60000).toISOString()
      },
      {
        id: 'phc-ts-01',
        name: 'Government General Hospital, Mahabubnagar',
        code: 'GGH-TS-MHB-01',
        state: 'Telangana',
        district: 'Mahabubnagar',
        cityTown: 'Yenugonda, Mahabubnagar',
        areaType: 'Tribal',
        terrainType: 'Hilly',
        isDisasterProne: false,
        populationServed: 72000,
        lat: 16.7488,
        lng: 78.0035,
        contactPerson: 'Dr. K. Anitha (Medical Superintendent)',
        phone: '+91 854 2241550',
        overallRisk: 'HIGH',
        dataFreshnessMinutes: 38,
        dataCompleteness: 89,
        dataConsistency: 86,
        dataReliabilityScore: 82,
        dataReliabilityStatus: 'MEDIUM',
        patientFootfallDaily: 340,
        patientFootfallTrend: 31,
        bedCapacity: 80,
        bedOccupancy: 68,
        staffTotal: 34,
        staffAvailable: 23,
        specialistPresent: false,
        weather: {
          tempC: 31,
          rainfallMm: 45,
          condition: 'Moderate Rain',
          season: 'Monsoon'
        },
        dominantDiseaseTrend: {
          disease: 'Water-borne Infections',
          weeklySurgePercent: 44,
          activeCases: 52
        },
        supplyLeadTimeDays: 5,
        lastSyncTimestamp: new Date(Date.now() - 38 * 60000).toISOString()
      },
      {
        id: 'phc-ts-02',
        name: 'Osmania General Hospital, Hyderabad',
        code: 'OGH-TS-HYD-02',
        state: 'Telangana',
        district: 'Hyderabad',
        cityTown: 'Afzal Gunj, Hyderabad',
        areaType: 'Urban',
        terrainType: 'Plain',
        isDisasterProne: false,
        populationServed: 350000,
        lat: 17.3768,
        lng: 78.4735,
        contactPerson: 'Dr. B. Nagender (Superintendent)',
        phone: '+91 40 24600121',
        overallRisk: 'NORMAL',
        dataFreshnessMinutes: 1,
        dataCompleteness: 99,
        dataConsistency: 99,
        dataReliabilityScore: 99,
        dataReliabilityStatus: 'HIGH',
        patientFootfallDaily: 920,
        patientFootfallTrend: 3,
        bedCapacity: 220,
        bedOccupancy: 140,
        staffTotal: 95,
        staffAvailable: 90,
        specialistPresent: true,
        weather: {
          tempC: 30,
          rainfallMm: 12,
          condition: 'Humid',
          season: 'Monsoon'
        },
        dominantDiseaseTrend: {
          disease: 'Viral Pharyngitis',
          weeklySurgePercent: 4,
          activeCases: 38
        },
        supplyLeadTimeDays: 1,
        lastSyncTimestamp: new Date(Date.now() - 1 * 60000).toISOString()
      },
      {
        id: 'phc-ts-03',
        name: 'MGM Hospital & Medical College, Warangal',
        code: 'MGM-TS-WGL-03',
        state: 'Telangana',
        district: 'Warangal',
        cityTown: 'Mattewada, Warangal',
        areaType: 'Rural',
        terrainType: 'Plain',
        isDisasterProne: false,
        populationServed: 110000,
        lat: 17.9784,
        lng: 79.5941,
        contactPerson: 'Dr. V. Chandrasekhar (Superintendent)',
        phone: '+91 870 2441901',
        overallRisk: 'NORMAL',
        dataFreshnessMinutes: 6,
        dataCompleteness: 96,
        dataConsistency: 95,
        dataReliabilityScore: 96,
        dataReliabilityStatus: 'HIGH',
        patientFootfallDaily: 440,
        patientFootfallTrend: -2,
        bedCapacity: 110,
        bedOccupancy: 58,
        staffTotal: 46,
        staffAvailable: 43,
        specialistPresent: true,
        weather: {
          tempC: 32,
          rainfallMm: 22,
          condition: 'Moderate Rain',
          season: 'Monsoon'
        },
        dominantDiseaseTrend: {
          disease: 'Chronic Disease Followups',
          weeklySurgePercent: 2,
          activeCases: 21
        },
        supplyLeadTimeDays: 2,
        lastSyncTimestamp: new Date(Date.now() - 6 * 60000).toISOString()
      },
      {
        id: 'phc-mh-01',
        name: 'District Civil Hospital, Alibag (Raigad)',
        code: 'DCH-MH-RGD-01',
        state: 'Maharashtra',
        district: 'Raigad',
        cityTown: 'Alibag Coastal Belt',
        areaType: 'Rural',
        terrainType: 'Coastal',
        isDisasterProne: true,
        populationServed: 78000,
        lat: 18.6414,
        lng: 72.8722,
        contactPerson: 'Dr. Ashwini Deshmukh (Civil Surgeon)',
        phone: '+91 214 1222405',
        overallRisk: 'HIGH',
        dataFreshnessMinutes: 9,
        dataCompleteness: 95,
        dataConsistency: 94,
        dataReliabilityScore: 94,
        dataReliabilityStatus: 'HIGH',
        patientFootfallDaily: 380,
        patientFootfallTrend: 34,
        bedCapacity: 90,
        bedOccupancy: 76,
        staffTotal: 38,
        staffAvailable: 29,
        specialistPresent: false,
        weather: {
          tempC: 29,
          rainfallMm: 160,
          condition: 'Heavy Rain',
          season: 'Monsoon'
        },
        dominantDiseaseTrend: {
          disease: 'Leptospirosis & Gastro',
          weeklySurgePercent: 52,
          activeCases: 61
        },
        supplyLeadTimeDays: 3,
        lastSyncTimestamp: new Date(Date.now() - 9 * 60000).toISOString()
      },
      {
        id: 'phc-mh-02',
        name: 'Sassoon General Hospital & B.J. Medical College, Pune',
        code: 'SGH-MH-PUN-02',
        state: 'Maharashtra',
        district: 'Pune',
        cityTown: 'Station Road, Pune',
        areaType: 'Urban',
        terrainType: 'Plain',
        isDisasterProne: false,
        populationServed: 280000,
        lat: 18.5284,
        lng: 73.8743,
        contactPerson: 'Dr. Sanjeev Thakur (Dean & Superintendent)',
        phone: '+91 20 26123456',
        overallRisk: 'NORMAL',
        dataFreshnessMinutes: 3,
        dataCompleteness: 99,
        dataConsistency: 97,
        dataReliabilityScore: 98,
        dataReliabilityStatus: 'HIGH',
        patientFootfallDaily: 760,
        patientFootfallTrend: 4,
        bedCapacity: 200,
        bedOccupancy: 110,
        staffTotal: 88,
        staffAvailable: 84,
        specialistPresent: true,
        weather: {
          tempC: 28,
          rainfallMm: 40,
          condition: 'Moderate Rain',
          season: 'Monsoon'
        },
        dominantDiseaseTrend: {
          disease: 'Seasonal Flu',
          weeklySurgePercent: 6,
          activeCases: 32
        },
        supplyLeadTimeDays: 1,
        lastSyncTimestamp: new Date(Date.now() - 3 * 60000).toISOString()
      },
      {
        id: 'phc-mh-03',
        name: 'District General Hospital, Gadchiroli',
        code: 'DGH-MH-GDC-03',
        state: 'Maharashtra',
        district: 'Gadchiroli',
        cityTown: 'Complex Area, Gadchiroli',
        areaType: 'Tribal',
        terrainType: 'Hilly',
        isDisasterProne: true,
        populationServed: 45000,
        lat: 20.1804,
        lng: 80.0039,
        contactPerson: 'Dr. Pramod Khandate (Civil Surgeon)',
        phone: '+91 713 2222199',
        overallRisk: 'MEDIUM',
        dataFreshnessMinutes: 74,
        dataCompleteness: 78,
        dataConsistency: 79,
        dataReliabilityScore: 72,
        dataReliabilityStatus: 'LOW',
        patientFootfallDaily: 220,
        patientFootfallTrend: 15,
        bedCapacity: 50,
        bedOccupancy: 39,
        staffTotal: 22,
        staffAvailable: 15,
        specialistPresent: false,
        weather: {
          tempC: 31,
          rainfallMm: 70,
          condition: 'Moderate Rain',
          season: 'Monsoon'
        },
        dominantDiseaseTrend: {
          disease: 'Falciparum Malaria',
          weeklySurgePercent: 29,
          activeCases: 35
        },
        supplyLeadTimeDays: 6,
        lastSyncTimestamp: new Date(Date.now() - 74 * 60000).toISOString()
      },
      {
        id: 'phc-ka-01',
        name: 'K.R. Hospital (Mysore Medical College), Mysuru',
        code: 'KRH-KA-MYS-01',
        state: 'Karnataka',
        district: 'Mysuru',
        cityTown: 'Irwin Road, Mysuru',
        areaType: 'Rural',
        terrainType: 'Plain',
        isDisasterProne: false,
        populationServed: 190000,
        lat: 12.3168,
        lng: 76.6497,
        contactPerson: 'Dr. H. G. Manjunath (Medical Superintendent)',
        phone: '+91 821 2419870',
        overallRisk: 'NORMAL',
        dataFreshnessMinutes: 5,
        dataCompleteness: 97,
        dataConsistency: 96,
        dataReliabilityScore: 97,
        dataReliabilityStatus: 'HIGH',
        patientFootfallDaily: 510,
        patientFootfallTrend: 2,
        bedCapacity: 130,
        bedOccupancy: 72,
        staffTotal: 52,
        staffAvailable: 49,
        specialistPresent: true,
        weather: {
          tempC: 27,
          rainfallMm: 15,
          condition: 'Humid',
          season: 'Monsoon'
        },
        dominantDiseaseTrend: {
          disease: 'Hypertension & Diabetes OPD',
          weeklySurgePercent: 1,
          activeCases: 19
        },
        supplyLeadTimeDays: 2,
        lastSyncTimestamp: new Date(Date.now() - 5 * 60000).toISOString()
      },
      {
        id: 'phc-ka-02',
        name: 'Taluka General Hospital, Kumta (Uttara Kannada)',
        code: 'TGH-KA-UKN-02',
        state: 'Karnataka',
        district: 'Uttara Kannada',
        cityTown: 'Kumta Coastal Belt',
        areaType: 'Rural',
        terrainType: 'Coastal',
        isDisasterProne: true,
        populationServed: 55000,
        lat: 14.4250,
        lng: 74.4172,
        contactPerson: 'Dr. Rekha Hegde (Chief Medical Officer)',
        phone: '+91 838 6222180',
        overallRisk: 'MEDIUM',
        dataFreshnessMinutes: 14,
        dataCompleteness: 93,
        dataConsistency: 91,
        dataReliabilityScore: 91,
        dataReliabilityStatus: 'HIGH',
        patientFootfallDaily: 280,
        patientFootfallTrend: 19,
        bedCapacity: 60,
        bedOccupancy: 44,
        staffTotal: 26,
        staffAvailable: 22,
        specialistPresent: false,
        weather: {
          tempC: 28,
          rainfallMm: 130,
          condition: 'Heavy Rain',
          season: 'Monsoon'
        },
        dominantDiseaseTrend: {
          disease: 'Water Contamination Diarrhea',
          weeklySurgePercent: 31,
          activeCases: 37
        },
        supplyLeadTimeDays: 3,
        lastSyncTimestamp: new Date(Date.now() - 14 * 60000).toISOString()
      },
      {
        id: 'phc-tn-01',
        name: 'Thanjavur Medical College Hospital, Thanjavur',
        code: 'TMCH-TN-TNJ-01',
        state: 'Tamil Nadu',
        district: 'Thanjavur',
        cityTown: 'Medical College Road, Thanjavur',
        areaType: 'Rural',
        terrainType: 'Plain',
        isDisasterProne: false,
        populationServed: 160000,
        lat: 10.7570,
        lng: 79.1078,
        contactPerson: 'Dr. R. Balajinathan (Dean & Superintendent)',
        phone: '+91 436 2230191',
        overallRisk: 'NORMAL',
        dataFreshnessMinutes: 4,
        dataCompleteness: 99,
        dataConsistency: 98,
        dataReliabilityScore: 98,
        dataReliabilityStatus: 'HIGH',
        patientFootfallDaily: 620,
        patientFootfallTrend: 4,
        bedCapacity: 140,
        bedOccupancy: 76,
        staffTotal: 65,
        staffAvailable: 61,
        specialistPresent: true,
        weather: {
          tempC: 34,
          rainfallMm: 8,
          condition: 'Sunny',
          season: 'Summer'
        },
        dominantDiseaseTrend: {
          disease: 'Heat Exhaustion OPD',
          weeklySurgePercent: 5,
          activeCases: 23
        },
        supplyLeadTimeDays: 2,
        lastSyncTimestamp: new Date(Date.now() - 4 * 60000).toISOString()
      },
      {
        id: 'phc-tn-02',
        name: 'Government Head Hospital, Ooty (Nilgiris)',
        code: 'GHH-TN-NLG-02',
        state: 'Tamil Nadu',
        district: 'Nilgiris',
        cityTown: 'Hospital Road, Ooty',
        areaType: 'Tribal',
        terrainType: 'Hilly',
        isDisasterProne: true,
        populationServed: 42000,
        lat: 11.4102,
        lng: 76.6950,
        contactPerson: 'Dr. Palaniswamy (Joint Director of Health)',
        phone: '+91 423 2626100',
        overallRisk: 'HIGH',
        dataFreshnessMinutes: 21,
        dataCompleteness: 91,
        dataConsistency: 88,
        dataReliabilityScore: 89,
        dataReliabilityStatus: 'MEDIUM',
        patientFootfallDaily: 240,
        patientFootfallTrend: 26,
        bedCapacity: 45,
        bedOccupancy: 38,
        staffTotal: 22,
        staffAvailable: 16,
        specialistPresent: false,
        weather: {
          tempC: 19,
          rainfallMm: 95,
          condition: 'Heavy Rain',
          season: 'Monsoon'
        },
        dominantDiseaseTrend: {
          disease: 'Bronchopneumonia in Children',
          weeklySurgePercent: 41,
          activeCases: 38
        },
        supplyLeadTimeDays: 5,
        lastSyncTimestamp: new Date(Date.now() - 21 * 60000).toISOString()
      },
      {
        id: 'phc-od-01',
        name: 'District Headquarters Hospital (DHH), Puri',
        code: 'DHH-OD-PRI-01',
        state: 'Odisha',
        district: 'Puri',
        cityTown: 'Grand Road, Puri',
        areaType: 'Rural',
        terrainType: 'Coastal',
        isDisasterProne: true,
        populationServed: 95000,
        lat: 19.8135,
        lng: 85.8312,
        contactPerson: 'Dr. Sujata Mishra (Chief District Medical Officer)',
        phone: '+91 675 2223901',
        overallRisk: 'CRITICAL',
        dataFreshnessMinutes: 7,
        dataCompleteness: 96,
        dataConsistency: 95,
        dataReliabilityScore: 95,
        dataReliabilityStatus: 'HIGH',
        patientFootfallDaily: 480,
        patientFootfallTrend: 39,
        bedCapacity: 100,
        bedOccupancy: 95,
        staffTotal: 44,
        staffAvailable: 31,
        specialistPresent: true,
        weather: {
          tempC: 31,
          rainfallMm: 175,
          condition: 'Extreme Cyclone',
          season: 'Monsoon'
        },
        dominantDiseaseTrend: {
          disease: 'Cholera & Waterborne Outbreak',
          weeklySurgePercent: 74,
          activeCases: 76
        },
        supplyLeadTimeDays: 4,
        lastSyncTimestamp: new Date(Date.now() - 7 * 60000).toISOString()
      },
      {
        id: 'phc-od-02',
        name: 'Capital Hospital, Bhubaneswar',
        code: 'CAP-OD-KHD-02',
        state: 'Odisha',
        district: 'Khurda',
        cityTown: 'Unit 6, Bhubaneswar',
        areaType: 'Urban',
        terrainType: 'Plain',
        isDisasterProne: false,
        populationServed: 240000,
        lat: 20.2644,
        lng: 85.8281,
        contactPerson: 'Dr. Laxmidhar Sahoo (Director)',
        phone: '+91 674 2391090',
        overallRisk: 'NORMAL',
        dataFreshnessMinutes: 2,
        dataCompleteness: 99,
        dataConsistency: 98,
        dataReliabilityScore: 98,
        dataReliabilityStatus: 'HIGH',
        patientFootfallDaily: 790,
        patientFootfallTrend: 3,
        bedCapacity: 180,
        bedOccupancy: 98,
        staffTotal: 78,
        staffAvailable: 74,
        specialistPresent: true,
        weather: {
          tempC: 32,
          rainfallMm: 50,
          condition: 'Moderate Rain',
          season: 'Monsoon'
        },
        dominantDiseaseTrend: {
          disease: 'Dermatological Infections',
          weeklySurgePercent: 5,
          activeCases: 34
        },
        supplyLeadTimeDays: 1,
        lastSyncTimestamp: new Date(Date.now() - 2 * 60000).toISOString()
      }
    ];
  }

  private generateInitialResources(phcs: PHC[]): ResourceItem[] {
    const list: ResourceItem[] = [];

    phcs.forEach(phc => {
      const isCritical = phc.overallRisk === 'CRITICAL';
      const isHigh = phc.overallRisk === 'HIGH';

      // 1. Oral Rehydration Salts (ORS)
      list.push({
        id: `res-${phc.id}-ors`,
        phcId: phc.id,
        category: 'medicines',
        name: 'Oral Rehydration Salts (ORS)',
        code: 'MED-ORS-S1',
        currentStock: isCritical ? 380 : isHigh ? 720 : 2100,
        safetyStockLevel: 500,
        unit: 'sachets',
        dailyConsumptionRate: isCritical ? 210 : isHigh ? 130 : 60,
        expiryDate: '2027-11-30',
        predictedDemand7d: isCritical ? 1470 : isHigh ? 910 : 420,
        predictedRange7d: isCritical ? [1320, 1620] : isHigh ? [800, 1020] : [380, 480],
        shortageProbability: isCritical ? 92 : isHigh ? 64 : 4,
        daysUntilShortage: isCritical ? 2 : isHigh ? 5 : 35,
        riskLevel: isCritical ? 'CRITICAL' : isHigh ? 'HIGH' : 'NORMAL',
        confidence: phc.dataReliabilityStatus === 'HIGH' ? 'HIGH' : 'MEDIUM'
      });

      // 2. Ciprofloxacin / Antibiotics
      list.push({
        id: `res-${phc.id}-cipro`,
        phcId: phc.id,
        category: 'medicines',
        name: 'Ciprofloxacin 500mg (Antibiotic)',
        code: 'MED-CIP-500',
        currentStock: isCritical ? 420 : 1600,
        safetyStockLevel: 450,
        unit: 'tablets',
        dailyConsumptionRate: isCritical ? 140 : 45,
        expiryDate: '2027-08-15',
        predictedDemand7d: isCritical ? 980 : 315,
        predictedRange7d: isCritical ? [880, 1100] : [280, 360],
        shortageProbability: isCritical ? 88 : 6,
        daysUntilShortage: isCritical ? 3 : 32,
        riskLevel: isCritical ? 'HIGH' : 'NORMAL',
        confidence: phc.dataReliabilityStatus === 'HIGH' ? 'HIGH' : 'MEDIUM'
      });

      // 3. Paracetamol 650mg
      list.push({
        id: `res-${phc.id}-pcm`,
        phcId: phc.id,
        category: 'medicines',
        name: 'Paracetamol 650mg Tablets',
        code: 'MED-PCM-650',
        currentStock: 3400,
        safetyStockLevel: 1000,
        unit: 'tablets',
        dailyConsumptionRate: 180,
        expiryDate: '2028-02-28',
        predictedDemand7d: 1260,
        predictedRange7d: [1100, 1420],
        shortageProbability: 2,
        daysUntilShortage: 18,
        riskLevel: 'NORMAL',
        confidence: 'HIGH'
      });

      // 4. Inpatient Beds
      list.push({
        id: `res-${phc.id}-beds`,
        phcId: phc.id,
        category: 'beds',
        name: 'Inpatient General & Emergency Beds',
        code: 'BED-GEN-01',
        currentStock: phc.bedCapacity - phc.bedOccupancy,
        safetyStockLevel: 4,
        unit: 'vacant beds',
        dailyConsumptionRate: 2,
        predictedDemand7d: isCritical ? 18 : 6,
        predictedRange7d: isCritical ? [15, 21] : [4, 8],
        shortageProbability: isCritical ? 84 : isHigh ? 55 : 8,
        daysUntilShortage: isCritical ? 1 : isHigh ? 3 : 14,
        riskLevel: isCritical ? 'CRITICAL' : isHigh ? 'HIGH' : 'NORMAL',
        confidence: 'HIGH'
      });

      // 5. Medical Staff (Nurses/Duty Doctors)
      list.push({
        id: `res-${phc.id}-staff`,
        phcId: phc.id,
        category: 'staff',
        name: 'Duty Doctors & Nursing Officers',
        code: 'STF-MED-01',
        currentStock: phc.staffAvailable,
        safetyStockLevel: Math.ceil(phc.staffTotal * 0.75),
        unit: 'duty personnel',
        dailyConsumptionRate: 0,
        predictedDemand7d: Math.ceil(phc.patientFootfallDaily / 20),
        predictedRange7d: [10, 18],
        shortageProbability: isCritical ? 76 : isHigh ? 48 : 5,
        daysUntilShortage: isCritical ? 2 : 12,
        riskLevel: isCritical ? 'HIGH' : 'NORMAL',
        confidence: 'HIGH'
      });

      // 6. Rapid Diagnostic Test Kits (Dengue/Malaria/Gastro)
      list.push({
        id: `res-${phc.id}-rdt`,
        phcId: phc.id,
        category: 'diagnostics',
        name: 'Rapid Vector & Enteric Test Kits',
        code: 'DX-RDT-ENT',
        currentStock: isCritical ? 120 : isHigh ? 240 : 850,
        safetyStockLevel: 200,
        unit: 'test cassettes',
        dailyConsumptionRate: isCritical ? 65 : 18,
        expiryDate: '2027-05-30',
        predictedDemand7d: isCritical ? 455 : 126,
        predictedRange7d: isCritical ? [410, 520] : [100, 160],
        shortageProbability: isCritical ? 89 : 12,
        daysUntilShortage: isCritical ? 2 : 28,
        riskLevel: isCritical ? 'CRITICAL' : 'NORMAL',
        confidence: 'HIGH'
      });

      // 7. Medical Oxygen & Emergency Life Support
      list.push({
        id: `res-${phc.id}-o2`,
        phcId: phc.id,
        category: 'emergency',
        name: 'Medical Oxygen B-Type Cylinders',
        code: 'EMG-O2-B',
        currentStock: isCritical ? 6 : 18,
        safetyStockLevel: 8,
        unit: 'cylinders',
        dailyConsumptionRate: isCritical ? 3 : 1,
        predictedDemand7d: isCritical ? 21 : 7,
        predictedRange7d: isCritical ? [18, 25] : [5, 9],
        shortageProbability: isCritical ? 81 : 5,
        daysUntilShortage: isCritical ? 2 : 16,
        riskLevel: isCritical ? 'HIGH' : 'NORMAL',
        confidence: 'HIGH'
      });
    });

    return list;
  }

  private generateInitialAlerts(phcs: PHC[]): Alert[] {
    return [
      {
        id: 'alt-001',
        phcId: 'phc-ap-01',
        phcName: 'Government General Hospital (GGH), Guntur',
        district: 'Guntur',
        state: 'Andhra Pradesh',
        resourceCategory: 'medicines',
        resourceName: 'Oral Rehydration Salts (ORS)',
        severity: 'CRITICAL',
        escalationLevel: 'District',
        title: 'Projected Stock-out of ORS within 48 Hours',
        message: 'Acute Diarrheal surge (+68%) combined with 145mm rainfall has accelerated ORS consumption to 210 sachets/day. Current stock will deplete in ~2 days.',
        currentCondition: 'Stock: 380 sachets | Daily Burn: 210 | Active Gastro cases: 84',
        predictedCondition: '7-Day Demand: 1,470 sachets (Expected Range: 1,320 - 1,620)',
        expectedImpact: 'Critical clinical gap in outpatient hydration therapy, risking severe dehydration cases and emergency hospital transfers.',
        recommendedAction: 'Execute emergency inter-hospital stock redistribution of 650+ ORS sachets from New GGH Vijayawada surplus nodes.',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        status: 'ACTIVE',
        recommendationId: 'rec-001'
      },
      {
        id: 'alt-002',
        phcId: 'phc-od-01',
        phcName: 'District Headquarters Hospital (DHH), Puri',
        district: 'Puri',
        state: 'Odisha',
        resourceCategory: 'beds',
        resourceName: 'Inpatient General & Emergency Beds',
        severity: 'CRITICAL',
        escalationLevel: 'District',
        title: 'Bed Capacity Breach Imminent (Occupancy at 95%)',
        message: 'Extreme coastal cyclone weather and cholera water contamination spike has pushed occupancy to 95/100 beds with 24 expected admissions today.',
        currentCondition: 'Occupancy: 95/100 beds | Emergency admissions surge: +74%',
        predictedCondition: 'Surge Requirement: 36 additional bed-days required over next 72 hrs',
        expectedImpact: 'Triage overflow into outpatient waiting areas; inability to admit acute dehydration/cholera patients.',
        recommendedAction: 'Deploy 20 mobile surge cots, alert Capital Hospital Bhubaneswar for step-down transfers, and requisition 8 nursing staff.',
        timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
        status: 'ACTIVE',
        recommendationId: 'rec-002'
      },
      {
        id: 'alt-003',
        phcId: 'phc-mh-01',
        phcName: 'District Civil Hospital, Alibag (Raigad)',
        district: 'Raigad',
        state: 'Maharashtra',
        resourceCategory: 'diagnostics',
        resourceName: 'Rapid Vector & Enteric Test Kits',
        severity: 'HIGH',
        escalationLevel: 'District',
        title: 'Rapid Vector & Enteric Test Kits Depleting',
        message: 'Heavy coastal rainfall (160mm) caused sharp rise in leptospirosis testing. Rapid test stock down to 120 cassettes against 65/day test load.',
        currentCondition: 'Stock: 120 cassettes | Burn Rate: 65 tests/day',
        predictedCondition: 'Deficit expected within 40 hours under ongoing monsoon deluge.',
        expectedImpact: 'Diagnostic delays for leptospirosis leading to delayed penicillin/doxycycline administration.',
        recommendedAction: 'Requisition 350 test cassettes from Sassoon General Hospital Pune central reserve.',
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
        status: 'ACTIVE',
        recommendationId: 'rec-003'
      },
      {
        id: 'alt-004',
        phcId: 'phc-ts-01',
        phcName: 'Government General Hospital, Mahabubnagar',
        district: 'Mahabubnagar',
        state: 'Telangana',
        resourceCategory: 'staff',
        resourceName: 'Duty Doctors & Nursing Officers',
        severity: 'HIGH',
        escalationLevel: 'District',
        title: 'Medical Officer & Nursing Absence in Tribal Outpost',
        message: 'Staff availability dropped to 67% during a 31% patient footfall increase due to viral diarrhea.',
        currentCondition: 'Staff: 23 on duty | Footfall: 340 daily | Specialist: Absent',
        predictedCondition: 'Workforce strain exceeding 26 patients/hour per medical officer.',
        expectedImpact: 'Extended triage wait times (>3.5 hrs), delayed critical patient stabilization.',
        recommendedAction: 'Authorize temporary deputation of 4 medical officers from Osmania General Hospital Hyderabad reserve.',
        timestamp: new Date(Date.now() - 90 * 60000).toISOString(),
        status: 'ACTIVE'
      }
    ];
  }

  private generateInitialRecommendations(phcs: PHC[], resources: ResourceItem[]): Recommendation[] {
    return [
      {
        id: 'rec-001',
        alertId: 'alt-001',
        targetPhcId: 'phc-ap-01',
        targetPhcName: 'Government General Hospital (GGH), Guntur',
        targetDistrict: 'Guntur',
        targetState: 'Andhra Pradesh',
        resourceCategory: 'medicines',
        resourceName: 'Oral Rehydration Salts (ORS)',
        requiredQuantity: 650,
        unit: 'sachets',
        shortageProbability: 92,
        daysUntilShortage: 2,
        riskLevel: 'CRITICAL',
        confidence: 'HIGH',
        selectedSource: {
          sourcePhcId: 'phc-ap-02',
          sourcePhcName: 'New Government General Hospital, Vijayawada',
          sourceDistrict: 'Krishna',
          surplusAvailable: 1100,
          distanceKm: 34,
          estimatedTransitHours: 1.2,
          sourceRiskLevel: 'LOW',
          transferFeasibility: 'HIGH',
          feasibilityScore: 94
        },
        alternativeSources: [
          {
            sourcePhcId: 'phc-ap-03',
            sourcePhcName: 'District Headquarters Hospital, Machilipatnam',
            sourceDistrict: 'Krishna',
            surplusAvailable: 420,
            distanceKm: 68,
            estimatedTransitHours: 2.4,
            sourceRiskLevel: 'HIGH',
            transferFeasibility: 'MEDIUM',
            feasibilityScore: 68
          }
        ],
        whyExplanation: 'Patient footfall surge (+42%) triggered by monsoon heavy rainfall (145mm) and acute gastroenteritis outbreak (84 active cases).',
        whatExplanation: 'Projected ORS demand over the next 7 days is 1,470 sachets against on-hand stock of only 380 sachets (deficit: 1,090).',
        whenExplanation: 'Stockout is projected within 48 hours (Day 2 of current forecasting cycle).',
        certaintyExplanation: '92% Shortage Probability derived from Adaptive Ensemble AI (Tree-based: 1,490, Time-series: 1,420, Contextual: 1,510) with High Data Reliability (97%).',
        sourceExplanation: 'New GGH Vijayawada holds 2,100 sachets with stable urban demand (60/day) and low seasonal exposure (surplus buffer: 1,100 sachets).',
        whyThisSourceExplanation: 'Low transit distance (34 km, ~1.2 hrs transit time via NH16 corridor), source risk is LOW, zero risk of compromising source clinic operations, and source data reliability is 98%.',
        actionSummary: 'Rebalance 650 ORS sachets from New GGH Vijayawada to GGH Guntur via emergency medical courier.',
        requiredApprovalRole: 'DISTRICT_AUTHORITY',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 15 * 60000).toISOString()
      },
      {
        id: 'rec-002',
        alertId: 'alt-002',
        targetPhcId: 'phc-od-01',
        targetPhcName: 'District Headquarters Hospital (DHH), Puri',
        targetDistrict: 'Puri',
        targetState: 'Odisha',
        resourceCategory: 'beds',
        resourceName: 'Emergency Inpatient Surge Beds & Staff',
        requiredQuantity: 20,
        unit: 'surge cots & beds',
        shortageProbability: 84,
        daysUntilShortage: 1,
        riskLevel: 'CRITICAL',
        confidence: 'HIGH',
        selectedSource: {
          sourcePhcId: 'phc-od-02',
          sourcePhcName: 'Capital Hospital, Bhubaneswar',
          sourceDistrict: 'Khurda',
          surplusAvailable: 45,
          distanceKm: 58,
          estimatedTransitHours: 1.5,
          sourceRiskLevel: 'LOW',
          transferFeasibility: 'HIGH',
          feasibilityScore: 91
        },
        alternativeSources: [],
        whyExplanation: 'Severe cyclone-induced flooding contaminated drinking sources, creating a +74% weekly surge in acute cholera cases.',
        whatExplanation: 'Current 95/100 beds occupied. Projected 36 additional bed-days needed over next 72 hours.',
        whenExplanation: 'Total capacity breach projected within 18 hours without immediate intervention.',
        certaintyExplanation: '84% Shortage Probability calculated via dynamic epidemiological regression model.',
        sourceExplanation: 'Capital Hospital Bhubaneswar has 45 available beds, 74 active medical staff, and emergency buffer capacity.',
        whyThisSourceExplanation: 'Direct National Highway connectivity (58 km), high logistics feasibility, and dedicated state emergency dispatch support.',
        actionSummary: 'Authorize dispatch of 20 rapid-deployment surge beds and 4 rotating duty nurses from Capital Hospital Bhubaneswar to DHH Puri.',
        requiredApprovalRole: 'STATE_AUTHORITY',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 25 * 60000).toISOString()
      },
      {
        id: 'rec-003',
        alertId: 'alt-003',
        targetPhcId: 'phc-mh-01',
        targetPhcName: 'District Civil Hospital, Alibag (Raigad)',
        targetDistrict: 'Raigad',
        targetState: 'Maharashtra',
        resourceCategory: 'diagnostics',
        resourceName: 'Rapid Vector & Enteric Test Kits',
        requiredQuantity: 250,
        unit: 'test cassettes',
        shortageProbability: 89,
        daysUntilShortage: 2,
        riskLevel: 'HIGH',
        confidence: 'HIGH',
        selectedSource: {
          sourcePhcId: 'phc-mh-02',
          sourcePhcName: 'Sassoon General Hospital & B.J. Medical College, Pune',
          sourceDistrict: 'Pune',
          surplusAvailable: 600,
          distanceKm: 85,
          estimatedTransitHours: 2.6,
          sourceRiskLevel: 'LOW',
          transferFeasibility: 'HIGH',
          feasibilityScore: 88
        },
        alternativeSources: [],
        whyExplanation: 'Heavy coastal rainfall (160mm) accelerated leptospirosis and waterborne infection screening requirements.',
        whatExplanation: 'On-hand stock is 120 cassettes; testing demand is 65/day. Stockout in ~40 hours.',
        whenExplanation: 'Shortage projected in 2 days.',
        certaintyExplanation: '89% Shortage Probability with high context correlation with rainfall intensity.',
        sourceExplanation: 'Sassoon General Hospital Pune has 850 test cassettes in central reserve with consumption of only 18/day.',
        whyThisSourceExplanation: 'Direct expressway corridor transit, ample surplus stock remaining at source (600+ buffer).',
        actionSummary: 'Transfer 250 diagnostic cassettes from Sassoon General Hospital Pune to Alibag Civil Hospital.',
        requiredApprovalRole: 'DISTRICT_AUTHORITY',
        status: 'PENDING',
        createdAt: new Date(Date.now() - 45 * 60000).toISOString()
      }
    ];
  }

  private generateInitialAuditLogs(): AuditLogEntry[] {
    return [
      {
        id: 'log-001',
        timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
        user: 'system.adaptive_ai',
        role: 'ADMIN',
        action: 'ENSEMBLE_FORECAST_GENERATED',
        entityType: 'FORECAST',
        entityId: 'ALL_PHCS',
        status: 'SUCCESS',
        details: 'Daily multi-resource forecasting cycle finished for 15 nodes with tree, time-series, and context ensemble.',
        ipAddress: '127.0.0.1 (Internal Engine)'
      },
      {
        id: 'log-002',
        timestamp: new Date(Date.now() - 65 * 60000).toISOString(),
        user: 'system.reliability_engine',
        role: 'ADMIN',
        action: 'DATA_QUALITY_EVALUATED',
        entityType: 'PHC',
        entityId: 'phc-ap-01',
        status: 'SUCCESS',
        details: 'Guntur Rural sync verified: 98% completeness, 96% consistency, 4 min freshness.',
        ipAddress: '10.0.4.12'
      },
      {
        id: 'log-003',
        timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
        user: 'system.alert_dispatcher',
        role: 'ADMIN',
        action: 'HIERARCHICAL_ALERT_TRIGGERED',
        entityType: 'ALERT',
        entityId: 'alt-001',
        status: 'WARNING',
        details: 'Critical ORS stockout warning escalated to District Authority (Guntur District Health Office).',
        ipAddress: '10.0.4.15'
      },
      {
        id: 'log-004',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        user: 'system.redistribution_engine',
        role: 'ADMIN',
        action: 'RECOMMENDATION_CREATED',
        entityType: 'RECOMMENDATION',
        entityId: 'rec-001',
        status: 'SUCCESS',
        details: 'Surplus match found: Recommending 650 ORS from Vijayawada West (PHC-AP-KRS-02). Feasibility score: 94/100.',
        ipAddress: '10.0.4.18'
      }
    ];
  }

  private generateInitialFederatedNodes(): FederatedNode[] {
    return [
      {
        id: 'fed-node-ap',
        state: 'Andhra Pradesh',
        nodeName: 'Andhra Coastal & Plain Health Intelligence Node',
        activePhcsCount: 3,
        localDatasetSize: 48200,
        localAccuracy: 94.2,
        localLoss: 0.084,
        lastRoundContributionWeight: 0.22,
        characteristic: 'High monsoon rainfall sensitivity & waterborne epidemiological spikes',
        dataDistributionType: 'Non-IID (Coastal / Flood prone)',
        status: 'SYNCED'
      },
      {
        id: 'fed-node-ts',
        state: 'Telangana',
        nodeName: 'Telangana Deccan Plateau & Tribal Node',
        activePhcsCount: 3,
        localDatasetSize: 39500,
        localAccuracy: 92.8,
        localLoss: 0.096,
        lastRoundContributionWeight: 0.18,
        characteristic: 'High urban footfall density & isolated tribal healthcare logistics',
        dataDistributionType: 'Non-IID (Urban & Tribal mix)',
        status: 'SYNCED'
      },
      {
        id: 'fed-node-mh',
        state: 'Maharashtra',
        nodeName: 'Maharashtra Western Ghats & Coastal Node',
        activePhcsCount: 3,
        localDatasetSize: 52100,
        localAccuracy: 95.1,
        localLoss: 0.072,
        lastRoundContributionWeight: 0.24,
        characteristic: 'Heavy Konkan rainfall impact & high secondary referral volume',
        dataDistributionType: 'Non-IID (Heavy precipitation variance)',
        status: 'SYNCED'
      },
      {
        id: 'fed-node-ka',
        state: 'Karnataka',
        nodeName: 'Karnataka Southern Plain & Coast Node',
        activePhcsCount: 2,
        localDatasetSize: 31400,
        localAccuracy: 93.6,
        localLoss: 0.091,
        lastRoundContributionWeight: 0.14,
        characteristic: 'Moderate seasonal variation with chronic disease load',
        dataDistributionType: 'Non-IID (Semi-arid to Coastal)',
        status: 'SYNCED'
      },
      {
        id: 'fed-node-tn',
        state: 'Tamil Nadu',
        nodeName: 'Tamil Nadu Delta & Western Ghats Node',
        activePhcsCount: 2,
        localDatasetSize: 36800,
        localAccuracy: 94.9,
        localLoss: 0.079,
        lastRoundContributionWeight: 0.16,
        characteristic: 'High temperature exposure and hilly tribal child health dynamics',
        dataDistributionType: 'Non-IID (Hilly tribal & Summer heatwave)',
        status: 'SYNCED'
      },
      {
        id: 'fed-node-od',
        state: 'Odisha',
        nodeName: 'Odisha Bay of Bengal Disaster Response Node',
        activePhcsCount: 2,
        localDatasetSize: 28900,
        localAccuracy: 91.7,
        localLoss: 0.108,
        lastRoundContributionWeight: 0.06,
        characteristic: 'Extreme tropical cyclone vulnerability & emergency bed surge dynamics',
        dataDistributionType: 'Non-IID (Disaster-prone coastal)',
        status: 'SYNCED'
      }
    ];
  }

  private generateInitialFederatedRounds(): FederatedRound[] {
    return [
      {
        roundNumber: 1,
        timestamp: new Date(Date.now() - 14 * 86400000).toISOString(),
        participatingNodes: 6,
        globalAccuracy: 88.4,
        globalLoss: 0.162,
        aggregationAlgorithm: 'FedAvg (Federated Averaging with Non-IID Weighting)',
        accuracyGainPercent: 3.8,
        status: 'COMPLETED',
        notes: 'Initial cold-start aggregation across 6 state edge clusters.'
      },
      {
        roundNumber: 2,
        timestamp: new Date(Date.now() - 7 * 86400000).toISOString(),
        participatingNodes: 6,
        globalAccuracy: 91.9,
        globalLoss: 0.118,
        aggregationAlgorithm: 'FedAvg + Differential Privacy (epsilon=1.2)',
        accuracyGainPercent: 3.5,
        status: 'COMPLETED',
        notes: 'Integrated monsoon context feature embeddings without raw patient record movement.'
      },
      {
        roundNumber: 3,
        timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
        participatingNodes: 6,
        globalAccuracy: 94.4,
        globalLoss: 0.082,
        aggregationAlgorithm: 'Adaptive FedProx with Straggler Mitigation',
        accuracyGainPercent: 2.5,
        status: 'COMPLETED',
        notes: 'Improved multi-resource cross-elasticity weights. Verified zero PHC sensitive data leakage.'
      }
    ];
  }

  private generateInitialIntegrations(): SystemIntegrationStatus[] {
    return [
      {
        connectorName: 'Patient Registration & EMR Connector',
        endpoint: '/api/integrations/patient',
        sourceSystem: 'National e-Hospital & State PHC Portal',
        status: 'HEALTHY',
        lastSync: '2 minutes ago',
        recordsIngested: 14820,
        syncFrequency: 'Every 5 min',
        errorRate: 0.02
      },
      {
        connectorName: 'DVDMS Medicine & Inventory Gateway',
        endpoint: '/api/integrations/inventory',
        sourceSystem: 'Drugs & Vaccine Distribution Management System',
        status: 'HEALTHY',
        lastSync: '4 minutes ago',
        recordsIngested: 8940,
        syncFrequency: 'Every 10 min',
        errorRate: 0.01
      },
      {
        connectorName: 'Bed Availability & Inpatient Management',
        endpoint: '/api/integrations/beds',
        sourceSystem: 'State Live Bed Occupancy Registry',
        status: 'HEALTHY',
        lastSync: '3 minutes ago',
        recordsIngested: 1240,
        syncFrequency: 'Every 5 min',
        errorRate: 0.00
      },
      {
        connectorName: 'HRMS Staff Attendance & Duty Roster',
        endpoint: '/api/integrations/staff',
        sourceSystem: 'Biometric Attendance & Leave Portal',
        status: 'HEALTHY',
        lastSync: '8 minutes ago',
        recordsIngested: 620,
        syncFrequency: 'Every 15 min',
        errorRate: 0.04
      },
      {
        connectorName: 'Laboratory & Diagnostic Information System',
        endpoint: '/api/integrations/diagnostics',
        sourceSystem: 'National Viral & Enteric Surveillance LIMS',
        status: 'HEALTHY',
        lastSync: '6 minutes ago',
        recordsIngested: 4310,
        syncFrequency: 'Every 10 min',
        errorRate: 0.01
      },
      {
        connectorName: 'State Central Medical Store Supply Depot',
        endpoint: '/api/integrations/supply',
        sourceSystem: 'State Supply Chain Logistics ERP',
        status: 'HEALTHY',
        lastSync: '12 minutes ago',
        recordsIngested: 3100,
        syncFrequency: 'Every 30 min',
        errorRate: 0.03
      }
    ];
  }

  private generateInitialModelMetrics(): ModelMetric[] {
    return [
      {
        modelName: 'Gradient Boosted Trees (Features & Inter-resource)',
        modelType: 'Tree-based Non-linear Ensemble',
        resourceCategory: 'medicines',
        mae: 14.2,
        rmse: 19.8,
        r2Score: 0.942,
        currentWeight: 0.45,
        sampleCount: 24500
      },
      {
        modelName: 'Seasonal Temporal Holt-Winters / SARIMA',
        modelType: 'Time-Series Trend Decomposition',
        resourceCategory: 'medicines',
        mae: 18.6,
        rmse: 24.1,
        r2Score: 0.912,
        currentWeight: 0.30,
        sampleCount: 24500
      },
      {
        modelName: 'Contextual Environmental & Epidemiological Regressor',
        modelType: 'Weather & Disease Driven Model',
        resourceCategory: 'medicines',
        mae: 16.1,
        rmse: 21.5,
        r2Score: 0.931,
        currentWeight: 0.25,
        sampleCount: 24500
      },
      {
        modelName: 'Poisson Surge Bed Occupancy Forecaster',
        modelType: 'Queueing & Epidemic Inpatient Model',
        resourceCategory: 'beds',
        mae: 1.4,
        rmse: 2.1,
        r2Score: 0.954,
        currentWeight: 0.50,
        sampleCount: 18200
      },
      {
        modelName: 'Staff Workload Pressure Estimator',
        modelType: 'Patient-to-Staff Ratio Optimization',
        resourceCategory: 'staff',
        mae: 0.9,
        rmse: 1.3,
        r2Score: 0.938,
        currentWeight: 0.50,
        sampleCount: 12100
      }
    ];
  }
}

export const db = new Database();
