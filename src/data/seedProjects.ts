import { MaritimeProject } from '../types/maritime';

export const SEED_PROJECTS: MaritimeProject[] = [
  {
    id: 'PRJ-01',
    code: 'PSDX-LNG',
    name: 'Project Poseidon-X',
    category: 'Autonomous Vessel',
    vesselType: 'Ultra-Large Autonomous LNG Carrier',
    imoNumber: 'IMO 9874102',
    shipyard: 'Hyundai Heavy Industries (Ulsan)',
    client: 'Shell Marine Global & Equinor',
    contractValue: 245000000,
    status: 'Sea Trials & Testing',
    progressPercent: 88,
    deliveryDate: '2026-11-15',
    technicalSpecs: {
      lengthOverall: '299.5 meters',
      beam: '46.4 meters',
      draft: '12.2 meters',
      deadweight: '95,000 DWT',
      propulsion: 'Dual-Fuel WinGD X-DF with Electric Pods',
      fuelType: 'LNG / Bio-Methane with Ammonia-ready bunkering',
      speedKnots: '19.5 knots cruising',
      autonomyLevel: 'IMO Degree 3 (Autonomous with Remote Shore Control)'
    },
    milestones: [
      { id: 'm1', title: 'Hull Keel Laying Ceremony', date: '2024-03-12', status: 'completed', notes: 'Completed on schedule at Ulsan Dock 3.' },
      { id: 'm2', title: 'Cryogenic LNG Tank Installation', date: '2025-01-20', status: 'completed', notes: 'GTT Mark III Flex membrane system pressure tested.' },
      { id: 'm3', title: 'Autonomy Shore-to-Ship Telemetry Link', date: '2025-08-14', status: 'completed', notes: 'Starlink Maritime + LEO satellite duplex link verified.' },
      { id: 'm4', title: 'Deep Sea Sea Trials Stage 2', date: '2026-09-10', status: 'in-progress', notes: 'Turbine efficiency test in Yellow Sea underway.' },
      { id: 'm5', title: 'Final Handover at Maritime Expo', date: '2026-11-15', status: 'pending', notes: 'Formal flag change and certificate issuance.' }
    ],
    keyRisks: [
      { id: 'r1', severity: 'Medium', description: 'Dual-fuel cryogenic pump sensor intermittent telemetry packet loss.', mitigation: 'Added redundant optical bus encoder.' },
      { id: 'r2', severity: 'Low', description: 'Weather delay for deep water rudder torque stress testing.', mitigation: 'Rescheduled trial corridor off Jeju Island.' }
    ],
    chatSources: [
      {
        id: 'c1',
        source: 'WhatsApp',
        sender: 'Chief Engineer Miller',
        timestamp: '2026-10-14 09:15',
        message: 'WhatsApp update on Project Poseidon-X: Dual-fuel cryogenic tank leak test passed 100%. Starlink telemetry link delay is down to 42ms.',
        extractedAttributes: ['Cryogenic tank passed', 'Starlink telemetry 42ms']
      },
      {
        id: 'c2',
        source: 'WhatsApp',
        sender: 'Shipyard Director Park (HHI)',
        timestamp: '2026-10-18 14:32',
        message: 'Contract budget confirmed at $245M. We expect the autonomous collision avoidance tests to wrap before the Maritime Expo keynote.',
        extractedAttributes: ['Budget $245M', 'Autonomous collision tests']
      },
      {
        id: 'c3',
        source: 'WhatsApp',
        sender: 'Naval Architect Sarah Lin',
        timestamp: '2026-10-22 11:05',
        message: 'IMO 9874102 certificate draft is ready for review. WinGD engine trial showed 22% fuel reduction compared to baseline.',
        extractedAttributes: ['IMO 9874102', '22% fuel reduction']
      }
    ],
    keywords: ['poseidon', 'lng', 'carrier', 'autonomous', 'hyundai', 'wingd', 'cryogenic', 'shell', 'telemetry', 'hhi', 'imo 9874102'],
    summary: 'Flagship 299m autonomous LNG carrier equipped with AI collision avoidance, satellite shore-control telemetry, and ultra-efficient dual-fuel propulsion.',
    expoBoothNumber: 'Hall A - Booth 104 (Mega Vessels Pavilion)',
    leadEngineer: 'Dr. Jin-Woo Choi (Principal Marine Robotics Engineer)',
    contacts: [
      { name: 'Dr. Jin-Woo Choi', role: 'Lead Autonomy Architect', phone: '+82 52 202 1144', email: 'jw.choi@hhi-maritime.kr' },
      { name: 'Elena Rostova', role: 'Client Representative (Shell)', phone: '+31 70 377 9111', email: 'elena.rostova@shellmarine.com' }
    ],
    lastUpdated: '2026-10-25'
  },
  {
    id: 'PRJ-02',
    code: 'BLU-E-TUG',
    name: 'Project BlueHarbor',
    category: 'Green Propulsion',
    vesselType: 'All-Electric Zero-Emission Harbor Tug',
    imoNumber: 'IMO 9923841',
    shipyard: 'Damen Shipyards Gorinchem',
    client: 'Port of Rotterdam Authority',
    contractValue: 85000000,
    status: 'Dry Dock Construction',
    progressPercent: 74,
    deliveryDate: '2027-02-28',
    technicalSpecs: {
      lengthOverall: '28.5 meters',
      beam: '13.0 meters',
      draft: '5.8 meters',
      deadweight: '520 DWT',
      propulsion: 'Twin 2,400 kW Permanent Magnet Electric Motors',
      fuelType: '100% Lithium Iron Phosphate (LFP) 4.2 MWh Battery Bank',
      speedKnots: '13.2 knots max (85 tons bollard pull)',
      autonomyLevel: 'IMO Degree 2 (Assisted Autonomous Berthing)'
    },
    milestones: [
      { id: 'm201', title: 'Battery Container Housing Fabrication', date: '2025-05-18', status: 'completed', notes: 'Corvus Orca Energy storage units integrated.' },
      { id: 'm202', title: 'Shore Fast-Charging Station Installation', date: '2026-02-10', status: 'completed', notes: '6.5 MW shore charger deployed at Waalhaven pier.' },
      { id: 'm203', title: 'Azimuth Thruster Alignment', date: '2026-09-04', status: 'in-progress', notes: 'Kongsberg US 255 FP thruster shafts fitted.' },
      { id: 'm204', title: 'Harbor Push-Pull Dynamic Trials', date: '2026-12-15', status: 'pending', notes: 'Validation of 85-ton continuous bollard pull.' }
    ],
    keyRisks: [
      { id: 'r201', severity: 'Low', description: 'Thermal runaway suppression liquid coolant pump delivery lag.', mitigation: 'Stocked safety spares locally in Rotterdam.' }
    ],
    chatSources: [
      {
        id: 'c201',
        source: 'WhatsApp',
        sender: 'Port Engineer Mark van Dijk',
        timestamp: '2026-10-12 16:20',
        message: 'WhatsApp thread: BlueHarbor Damen tug will do 2 hours of heavy tow operations on a single 30-minute rapid charge. Battery life guaranteed for 10 years.',
        extractedAttributes: ['30-min charge', '85T bollard pull', 'Damen shipyard']
      },
      {
        id: 'c202',
        source: 'Slack',
        sender: 'Jan Bakker (Damen)',
        timestamp: '2026-10-19 10:45',
        message: 'Total contract value across 4 units is $85M. Vessel 1 hull painting starts this week in Gorinchem.',
        extractedAttributes: ['Contract $85M', 'Hull painting underway']
      }
    ],
    keywords: ['blueharbor', 'electric', 'tug', 'damen', 'rotterdam', 'battery', 'lfp', 'bollard pull', 'zero emission', 'thruster'],
    summary: 'High-torque 85-ton bollard pull all-electric harbor tug fleet powered by 4.2 MWh marine batteries and 6.5 MW shore fast-chargers.',
    expoBoothNumber: 'Hall B - Booth 212 (Green Harbor Innovations)',
    leadEngineer: 'Ir. Thijs de Vries (Damen Chief Electric Marine Systems)',
    contacts: [
      { name: 'Thijs de Vries', role: 'Chief Systems Engineer', phone: '+31 183 639 911', email: 't.devries@damen.com' },
      { name: 'Mark van Dijk', role: 'Harbor Operations VP', phone: '+31 10 252 1010', email: 'm.vandijk@portofrotterdam.com' }
    ],
    lastUpdated: '2026-10-24'
  },
  {
    id: 'PRJ-03',
    code: 'NTL-APEX',
    name: 'Project Nautilus-Apex',
    category: 'Oceanographic Research',
    vesselType: 'Abyssal Depth Research & Survey Vessel',
    imoNumber: 'IMO 9781920',
    shipyard: 'Freire Shipyard (Vigo, Spain)',
    client: 'Woods Hole Oceanographic Institution & NOAA',
    contractValue: 145000000,
    status: 'Engineering & Design',
    progressPercent: 58,
    deliveryDate: '2027-08-30',
    technicalSpecs: {
      lengthOverall: '106.0 meters',
      beam: '20.5 meters',
      draft: '7.1 meters',
      deadweight: '3,800 DWT',
      propulsion: 'Diesel-Electric Hybrid with Silent-R Acoustic Compliance',
      fuelType: 'MGO and Hydrotreated Vegetable Oil (HVO-100)',
      speedKnots: '15.0 knots cruising / 3.0 knots acoustic quiet mode',
      autonomyLevel: 'Dynamic Positioning DP-3 with Autonomous ROV Launchers'
    },
    milestones: [
      { id: 'm301', title: 'Acoustic Silent Tank Model Testing', date: '2025-06-25', status: 'completed', notes: 'DNV SILENT-R underwater radiated noise limits satisfied.' },
      { id: 'm302', title: 'Moonpool Structural Reinforcement', date: '2026-04-18', status: 'completed', notes: '7.2m x 7.2m central moonpool framed.' },
      { id: 'm303', title: 'Kongsberg Multibeam Sonar Gondola Fitting', date: '2026-10-02', status: 'in-progress', notes: 'EM 124 11,000m depth multibeam sonar array mounting.' },
      { id: 'm304', title: 'Autonomous Submersible Sea Trials', date: '2027-04-10', status: 'pending', notes: 'Coordinated trial with Alvin submersible replacement.' }
    ],
    keyRisks: [
      { id: 'r301', severity: 'High', description: 'Long lead time on ultra-deep 11,000m synthetic fiber winch cable.', mitigation: 'Secured secondary manufacturing slot with Cortland Cable.' }
    ],
    chatSources: [
      {
        id: 'c301',
        source: 'WhatsApp',
        sender: 'Dr. Rebecca Stone (WHOI)',
        timestamp: '2026-10-15 18:04',
        message: 'WhatsApp update from Vigo: Nautilus-Apex acoustic quiet mode tests confirmed in basin. Hydrophones detected zero cavitation at 6 knots!',
        extractedAttributes: ['Silent-R verified', 'Zero cavitation at 6 knots']
      },
      {
        id: 'c302',
        source: 'WhatsApp',
        sender: 'Freire Commercial Director',
        timestamp: '2026-10-21 08:30',
        message: 'The Woods Hole team asked for extra dry laboratory space on Deck 2. Revised project budget is $145M, delivery on track for Aug 2027.',
        extractedAttributes: ['Budget $145M', 'Extra laboratory Deck 2', 'Delivery Aug 2027']
      }
    ],
    keywords: ['nautilus', 'apex', 'oceanographic', 'research', 'woods hole', 'freire', 'sonar', 'deep sea', 'rov', 'silent-r', 'vessel'],
    summary: 'Ultra-silent deep ocean research vessel designed for 11,000m trench bathymetry, autonomous ROV deployment, and climate science.',
    expoBoothNumber: 'Hall C - Booth 315 (Deep Marine Science & Tech)',
    leadEngineer: 'Dr. Rebecca Stone (Chief Scientist of Expeditionary Craft)',
    contacts: [
      { name: 'Dr. Rebecca Stone', role: 'Principal Investigator', phone: '+1 508 289 2000', email: 'rstone@whoi.edu' },
      { name: 'Manuel Freire', role: 'Shipyard Project Lead', phone: '+34 986 233 000', email: 'mfreire@freireshipyard.com' }
    ],
    lastUpdated: '2026-10-26'
  },
  {
    id: 'PRJ-04',
    code: 'HYD-FEEDER',
    name: 'Project HydroVessel 400',
    category: 'Green Propulsion',
    vesselType: 'Liquid Hydrogen Fuel Cell Container Feeder',
    imoNumber: 'IMO 9951044',
    shipyard: 'Meyer Werft (Papenburg & Turku)',
    client: 'Northern Lights Maritime Consortium (Norway)',
    contractValue: 112000000,
    status: 'Engineering & Design',
    progressPercent: 46,
    deliveryDate: '2027-11-20',
    technicalSpecs: {
      lengthOverall: '142.0 meters',
      beam: '22.8 meters',
      draft: '6.4 meters',
      deadweight: '7,200 DWT (420 TEU)',
      propulsion: '6.0 MW Fuel Cell Power System (PEMFC) + Permanent Magnet Motor',
      fuelType: 'Compressed Green Hydrogen (350 bar) & Liquid H2 Cryo-tanks',
      speedKnots: '14.0 knots service speed',
      autonomyLevel: 'IMO Degree 1 (Automated Engine Room & Fuel Cell Health AI)'
    },
    milestones: [
      { id: 'm401', title: 'Fuel Cell Hazard & Operability (HAZOP) Study', date: '2025-09-12', status: 'completed', notes: 'DNV and Norwegian Maritime Authority approved safety blueprint.' },
      { id: 'm402', title: 'Modular 350-bar Tank Storage Testing', date: '2026-03-30', status: 'completed', notes: 'Hexagon Purus composite cylinders drop-test passed.' },
      { id: 'm403', title: 'Cryogenic Bunkering Manifold Assembly', date: '2026-10-15', status: 'in-progress', notes: 'Fitting safety vent masts and nitrogen purge systems.' },
      { id: 'm404', title: 'First Zero-Emission North Sea Route Trial', date: '2027-09-01', status: 'pending', notes: 'Oslo to Rotterdam corridor demonstration.' }
    ],
    keyRisks: [
      { id: 'r401', severity: 'High', description: 'Hydrogen bunkering infrastructure delays at Port of Gothenburg.', mitigation: 'Equipping vessel with dual-trailer mobile bunkering connection.' }
    ],
    chatSources: [
      {
        id: 'c401',
        source: 'WhatsApp',
        sender: 'Engineering Lead Lars Solberg',
        timestamp: '2026-10-16 11:15',
        message: 'WhatsApp note: HydroVessel 400 PEM fuel cell stack from PowerCell Sweden completed 1,000 hours of continuous load cycling. Zero degradation detected.',
        extractedAttributes: ['1000h continuous load', 'Zero degradation', 'PowerCell Sweden']
      },
      {
        id: 'c402',
        source: 'Email',
        sender: 'Meyer Werft Commercial Desk',
        timestamp: '2026-10-20 15:40',
        message: 'Northern Lights confirmed the budget at $112M. Hull steel cutting scheduled for next month.',
        extractedAttributes: ['Budget $112M', 'Hull steel cutting scheduled']
      }
    ],
    keywords: ['hydrogen', 'hydrovessel', 'fuel cell', 'meyer werft', 'feeder', 'container', 'green', 'h2', 'norway', 'pemfc'],
    summary: 'Pioneering 420-TEU container feeder vessel operating entirely on green hydrogen fuel cells with zero SOx, NOx, or CO2 emissions along coastal shipping corridors.',
    expoBoothNumber: 'Hall B - Booth 228 (Future Fuels Pavilion)',
    leadEngineer: 'Lars Solberg (Hydrogen Marine Specialist)',
    contacts: [
      { name: 'Lars Solberg', role: 'Fuel Cell Integration Lead', phone: '+47 22 40 5500', email: 'l.solberg@northernlightsmaritime.no' },
      { name: 'Gunnar Aas', role: 'Technical Director', phone: '+47 55 90 2200', email: 'g.aas@norwegianfleet.com' }
    ],
    lastUpdated: '2026-10-23'
  },
  {
    id: 'PRJ-05',
    code: 'AUR-POLAR',
    name: 'Project Aurora Borealis',
    category: 'Passenger & Expedition',
    vesselType: 'Polar Class 3 Hybrid Icebreaking Expedition Vessel',
    imoNumber: 'IMO 9866110',
    shipyard: 'VARD Shipyard (Alesund & Tulcea)',
    client: 'Viking Polar Expeditions Ltd',
    contractValue: 310000000,
    status: 'Dry Dock Construction',
    progressPercent: 78,
    deliveryDate: '2027-05-15',
    technicalSpecs: {
      lengthOverall: '189.2 meters',
      beam: '28.0 meters',
      draft: '7.8 meters',
      deadweight: '6,400 DWT (380 Guests / 240 Crew)',
      propulsion: 'Twin 8.5 MW Azipod VI Icebreaker Thrusters',
      fuelType: 'LNG Dual-Fuel + 5.0 MWh Peak Shaving Energy Storage',
      speedKnots: '17.5 knots open water / 5.0 knots continuous in 1.5m sea ice',
      autonomyLevel: 'IMO Degree 1 (Ice Navigation Radar & Satellite Route AI)'
    },
    milestones: [
      { id: 'm501', title: 'PC3 Ice-Belt High-Tensile Steel Welding', date: '2025-04-10', status: 'completed', notes: '45mm NV E36 cryogenic ice-belt plates certified by Lloyd’s Register.' },
      { id: 'm502', title: 'Submarine Hangar & Zodiac Gantry Integration', date: '2026-01-14', status: 'completed', notes: 'Twin 6-passenger U-Boat Worx submersibles garage mounted.' },
      { id: 'm503', title: 'Azipod Thruster Installation', date: '2026-08-22', status: 'in-progress', notes: 'Port side Azipod VI fitted in Tulcea drydock.' },
      { id: 'm504', title: 'Greenland Sea Ice Penetration Trial', date: '2027-03-20', status: 'pending', notes: 'Full-scale icebreaking performance verification.' }
    ],
    keyRisks: [
      { id: 'r501', severity: 'Medium', description: 'Specialized low-temperature hydraulic seal delivery from Austria delayed.', mitigation: 'Expedited air freight with factory certified technicians.' }
    ],
    chatSources: [
      {
        id: 'c501',
        source: 'WhatsApp',
        sender: 'Capt. Henrik Lindqvist',
        timestamp: '2026-10-17 13:48',
        message: 'WhatsApp briefing from VARD Alesund: Aurora Borealis PC3 hull passed winter simulation. Azipod seals tested down to -40 deg C with zero stiffness.',
        extractedAttributes: ['PC3 hull passed', 'Azipod seals -40C verified']
      },
      {
        id: 'c502',
        source: 'WhatsApp',
        sender: 'Project Controller Astrid Holm',
        timestamp: '2026-10-23 09:25',
        message: 'Total expenditure on Project Aurora Borealis is $310M. Viking Polar has scheduled its expo showcase for Hall A, showcasing the hybrid icebreaking helm.',
        extractedAttributes: ['Budget $310M', 'Expo showcase Hall A']
      }
    ],
    keywords: ['aurora', 'borealis', 'icebreaker', 'polar', 'vard', 'viking', 'azipod', 'expedition', 'lng', 'greenland'],
    summary: 'Luxury Polar Class 3 hybrid expedition cruise vessel capable of navigating 1.5-meter polar sea ice with dual submarine bays and zero-emission fjord battery mode.',
    expoBoothNumber: 'Hall A - Booth 118 (Arctic Exploration Pavilion)',
    leadEngineer: 'Sverre Mork (Chief Polar Naval Architect)',
    contacts: [
      { name: 'Capt. Henrik Lindqvist', role: 'Ice Master & Marine Operations', phone: '+47 70 11 3000', email: 'h.lindqvist@vikingcruises.com' },
      { name: 'Astrid Holm', role: 'Financial & Contract Director', phone: '+47 70 12 5588', email: 'a.holm@vard.com' }
    ],
    lastUpdated: '2026-10-25'
  },
  {
    id: 'PRJ-06',
    code: 'TTN-CRANE',
    name: 'Project Titan Crane 5000',
    category: 'Offshore Wind & Energy',
    vesselType: 'Next-Gen Heavy-Lift Offshore Wind Turbine Installation Vessel (WTIV)',
    imoNumber: 'IMO 9980042',
    shipyard: 'CIMC Raffles & SBM Offshore (Yantai)',
    client: 'Orsted & Equinor Offshore Wind',
    contractValue: 420000000,
    status: 'Dry Dock Construction',
    progressPercent: 62,
    deliveryDate: '2027-10-31',
    technicalSpecs: {
      lengthOverall: '215.0 meters',
      beam: '60.0 meters',
      draft: '8.5 meters',
      deadweight: '32,000 DWT',
      propulsion: '6 x 4,000 kW Retractable Azimuth Thrusters with DP-3',
      fuelType: 'Methanol Dual-Fuel + 12 MWh Battery Dynamic Load Buffer',
      speedKnots: '12.5 knots transit',
      autonomyLevel: 'Automated 130m Jack-Up Legs with Laser Seabed Profiling'
    },
    milestones: [
      { id: 'm601', title: '5,000-Ton Leg Encircling Crane Hub Delivery', date: '2025-11-04', status: 'completed', notes: 'Huisman heavy crane boom fabrication completed in Schiedam.' },
      { id: 'm602', title: 'Rack and Pinion Jacking Trials', date: '2026-06-19', status: 'completed', notes: '130-meter continuous leg deployment in test dock.' },
      { id: 'm603', title: 'Methanol Fuel Tank & Piping Integration', date: '2026-10-18', status: 'in-progress', notes: 'Corrosion-resistant 316L stainless steel lines installation.' },
      { id: 'm604', title: 'North Sea 20MW Turbine Installation Validation', date: '2027-08-15', status: 'pending', notes: 'Simulated lift of 1,200t nacelle at 175m hook height.' }
    ],
    keyRisks: [
      { id: 'r601', severity: 'High', description: 'Extreme crane hook oscillation during offshore wind gusts over 25 knots.', mitigation: 'Installed 3D Active Motion Compensation tagline winches.' }
    ],
    chatSources: [
      {
        id: 'c601',
        source: 'WhatsApp',
        sender: 'Offshore Super Chen Wei',
        timestamp: '2026-10-19 17:10',
        message: 'WhatsApp report from Yantai: Titan Crane 5000 jacking system handled 40,000 tons of preload effortlessly. Crane boom arrival confirmed.',
        extractedAttributes: ['Jacking system passed 40k tons', 'Crane boom arrival']
      },
      {
        id: 'c602',
        source: 'WhatsApp',
        sender: 'Orsted Project Director Thomas M.',
        timestamp: '2026-10-24 14:02',
        message: 'Titan Crane contract is locked at $420M. We need this ready for the Dogger Bank phase 4 turbine deployments.',
        extractedAttributes: ['Contract $420M', 'Dogger Bank Phase 4']
      }
    ],
    keywords: ['titan', 'crane', 'wtiv', 'wind turbine', 'offshore', 'cimc', 'orsted', 'huisman', 'jack-up', 'methanol', 'dp3'],
    summary: 'Massive 5,000-ton crane heavy-lift installation vessel designed to erect 20-megawatt next-generation offshore wind turbines in water depths up to 75 meters.',
    expoBoothNumber: 'Hall D - Booth 402 (Offshore Energy & Infrastructure)',
    leadEngineer: 'Chen Wei (Offshore Construction Director)',
    contacts: [
      { name: 'Chen Wei', role: 'Shipyard General Manager', phone: '+86 535 680 8888', email: 'chen.wei@cimc-raffles.com' },
      { name: 'Thomas Moeller', role: 'Offshore Fleet Director (Orsted)', phone: '+45 99 55 1111', email: 'thmoe@orsted.com' }
    ],
    lastUpdated: '2026-10-25'
  },
  {
    id: 'PRJ-07',
    code: 'AGS-PATROL',
    name: 'Project Aegis Patrol 85',
    category: 'Maritime Security & Defense',
    vesselType: 'High-Speed Hydrofoil Interceptor & Border Cutter',
    imoNumber: 'IMO 9890214',
    shipyard: 'Austal Shipyards (Henderson, Australia)',
    client: 'Maritime Border Command & Coast Guard Agency',
    contractValue: 68000000,
    status: 'Sea Trials & Testing',
    progressPercent: 92,
    deliveryDate: '2026-12-05',
    technicalSpecs: {
      lengthOverall: '58.0 meters',
      beam: '10.8 meters',
      draft: '2.1 meters',
      deadweight: '380 DWT',
      propulsion: 'Quad MTU 16V 4000 M93L Diesels with Kamewa S71 Waterjets',
      fuelType: 'Ultra-Low Sulfur Marine Gas Oil (MGO)',
      speedKnots: '44.0 knots sprint / 22.0 knots economic patrol',
      autonomyLevel: 'IMO Degree 2 (Automated Target Tracking & Thermal Camera AI)'
    },
    milestones: [
      { id: 'm701', title: 'Aluminum Hull High-Speed Hydrodynamic Tests', date: '2025-02-18', status: 'completed', notes: 'Hydrofoil ride control dampens 70% wave pitch in Sea State 5.' },
      { id: 'm702', title: 'Remote Weapon Station & Radar Integration', date: '2025-10-12', status: 'completed', notes: 'Hensoldt 3D surveillance radar calibration verified.' },
      { id: 'm703', title: 'High-Speed Waterjet Sprint Trials', date: '2026-09-28', status: 'completed', notes: 'Exceeded specification at 45.3 knots sprint off Rottnest Island.' },
      { id: 'm704', title: 'Commissioning & Handover to Border Command', date: '2026-12-05', status: 'in-progress', notes: 'Final defense acceptance trials.' }
    ],
    keyRisks: [
      { id: 'r701', severity: 'Low', description: 'Waterjet impeller biofouling during warm coastal moorings.', mitigation: 'Applied ultrasonic non-toxic hull transducer antifouling.' }
    ],
    chatSources: [
      {
        id: 'c701',
        source: 'WhatsApp',
        sender: 'Austal Trials Master Sean O’Connor',
        timestamp: '2026-10-11 15:55',
        message: 'WhatsApp sprint update: Aegis Patrol 85 clocked 45.3 knots sustained sprint. Waterjet response is instant. Zero cavitation on Kamewa impellers.',
        extractedAttributes: ['45.3 knots sprint', 'Kamewa waterjets', 'Sea State 5 ride control']
      },
      {
        id: 'c702',
        source: 'WhatsApp',
        sender: 'Cmdr. James Vance',
        timestamp: '2026-10-21 16:30',
        message: 'Budget stands firm at $68M for both vessels in tranche 1. Austal will feature the scale model and telemetry feed at Expo Hall C.',
        extractedAttributes: ['Budget $68M', 'Delivery Dec 2026']
      }
    ],
    keywords: ['aegis', 'patrol', 'austal', 'interceptor', 'waterjet', 'defense', 'cutter', 'fast', 'security', 'mtu'],
    summary: 'Ultra-fast 45-knot aluminum monohull interceptor equipped with hydrofoil active motion stabilization, surveillance radar, and high-speed interception waterjets.',
    expoBoothNumber: 'Hall C - Booth 330 (Maritime Defense & Security)',
    leadEngineer: 'Sean O’Connor (Chief Naval Architect - High Speed Craft)',
    contacts: [
      { name: 'Sean O’Connor', role: 'Head of Trials', phone: '+61 8 9410 1111', email: 's.oconnor@austal.com' },
      { name: 'Cmdr. James Vance', role: 'Acquisition Officer', phone: '+61 2 6265 9111', email: 'j.vance@bordersecurity.gov.au' }
    ],
    lastUpdated: '2026-10-26'
  },
  {
    id: 'PRJ-08',
    code: 'SOL-FERRY',
    name: 'Project Solaria Wave',
    category: 'Ferry & Urban Transit',
    vesselType: 'Solar-Assisted Electric Commuter Catamaran',
    imoNumber: 'IMO 9973211',
    shipyard: 'Navantia Shipyards (Cadiz, Spain)',
    client: 'Balearia Ferry Line (Mallorca - Ibiza)',
    contractValue: 52000000,
    status: 'Sea Trials & Testing',
    progressPercent: 90,
    deliveryDate: '2026-11-28',
    technicalSpecs: {
      lengthOverall: '48.5 meters',
      beam: '14.2 meters',
      draft: '1.9 meters',
      deadweight: '160 DWT (450 Passengers / 30 Vehicles)',
      propulsion: 'Twin 1,600 kW Electric Motors with Torqeedo Pods',
      fuelType: '3.0 MWh LFP Batteries + 480 sq.m Bifacial Solar Deck Array (120 kWp)',
      speedKnots: '24.0 knots sprint / 18.0 knots eco cruising',
      autonomyLevel: 'IMO Degree 2 (Automated Docking & Passenger Flow Telemetry)'
    },
    milestones: [
      { id: 'm801', title: 'Carbon-Fiber Superstructure Weight Verification', date: '2025-05-12', status: 'completed', notes: 'Achieved 35% weight reduction versus conventional aluminum.' },
      { id: 'm802', title: 'Solar Roof Photovoltaic Array Integration', date: '2025-11-30', status: 'completed', notes: '480 m2 bifacial solar glass installed on sun deck.' },
      { id: 'm803', title: 'Harbor Automated Docking Laser Alignment', date: '2026-08-14', status: 'completed', notes: 'Laser-guided berthing within 5cm tolerance at Ibiza port.' },
      { id: 'm804', title: 'Final Passenger Sea Trials', date: '2026-10-30', status: 'in-progress', notes: 'Acoustic comfort and cabin air filtration testing.' }
    ],
    keyRisks: [
      { id: 'r801', severity: 'Low', description: 'Salt-spray accumulation on solar panel glass reducing efficiency.', mitigation: 'Installed robotic low-water de-ionized cleaning wipers.' }
    ],
    chatSources: [
      {
        id: 'c801',
        source: 'WhatsApp',
        sender: 'Navantia Project Manager Mateo Gomez',
        timestamp: '2026-10-15 10:12',
        message: 'WhatsApp update: Solaria Wave solar roof is generating 118 kW in full Mediterranean sun. Hotel passenger load running completely free off the sun!',
        extractedAttributes: ['118 kW solar generation', 'Zero-emission hotel load']
      },
      {
        id: 'c802',
        source: 'WhatsApp',
        sender: 'Balearia Fleet Director Carmen Ortiz',
        timestamp: '2026-10-22 17:40',
        message: 'Balearia is extremely pleased with the $52M investment. We will launch the Expo press release ahead of the Palma de Mallorca maiden voyage.',
        extractedAttributes: ['Budget $52M', 'Palma maiden voyage']
      }
    ],
    keywords: ['solaria', 'wave', 'ferry', 'solar', 'catamaran', 'electric', 'balearia', 'navantia', 'passenger', 'ibiza'],
    summary: 'Ultra-quiet 450-passenger solar-electric catamaran ferry with lightweight carbon fiber build and bifacial solar roof powering zero-emission Mediterranean island crossings.',
    expoBoothNumber: 'Hall B - Booth 204 (Clean Urban Waterways)',
    leadEngineer: 'Mateo Gomez (Lead Marine Composite & Solar Engineer)',
    contacts: [
      { name: 'Mateo Gomez', role: 'Composite Engineering Head', phone: '+34 956 298 000', email: 'mgomez@navantia.es' },
      { name: 'Carmen Ortiz', role: 'Balearia Fleet Operations', phone: '+34 971 789 000', email: 'carmen.ortiz@balearia.com' }
    ],
    lastUpdated: '2026-10-25'
  },
  {
    id: 'PRJ-09',
    code: 'OCN-CLEAN',
    name: 'Project OceanCleanse',
    category: 'Ocean Environmental',
    vesselType: 'Autonomous Ocean Macro-Plastic Harvester Vessel',
    imoNumber: 'IMO 9934188',
    shipyard: 'Fincantieri (Monfalcone & Genoa)',
    client: 'The Ocean Cleanup Foundation & UN Ocean Envoy',
    contractValue: 78000000,
    status: 'Engineering & Design',
    progressPercent: 52,
    deliveryDate: '2027-04-20',
    technicalSpecs: {
      lengthOverall: '88.0 meters',
      beam: '24.0 meters',
      draft: '4.5 meters',
      deadweight: '2,900 DWT',
      propulsion: 'Diesel-Electric Hybrid with 2 x 1,200 kW Azimuth Pods',
      fuelType: 'Biofuel (HVO) + Sail-Assist Rigid Wing Solar Wings (OceanWings)',
      speedKnots: '10.0 knots transit / 2.5 knots harvesting sweep',
      autonomyLevel: 'IMO Degree 3 (Autonomous Plastic Convergence Tracking AI)'
    },
    milestones: [
      { id: 'm901', title: 'Submerged Collection Conveyor Flow Tests', date: '2025-08-20', status: 'completed', notes: 'Bio-mesh conveyor successfully separated microfauna while capturing 99% surface plastics.' },
      { id: 'm902', title: 'OceanWings Rigid Wing Sail Installation', date: '2026-04-15', status: 'completed', notes: 'Twin 30m composite wings fitted for 28% wind propulsion assist.' },
      { id: 'm903', title: 'Onboard Plastic Shredding & Compactor Trials', date: '2026-10-12', status: 'in-progress', notes: 'Hydraulic baler compaction of 50 tons of debris per cycle.' },
      { id: 'm904', title: 'North Pacific Gyre Deployment Pilot', date: '2027-06-01', status: 'pending', notes: 'First 90-day continuous harvesting mission.' }
    ],
    keyRisks: [
      { id: 'r901', severity: 'Medium', description: 'Entanglement of marine mammals in floating guide booms.', mitigation: 'Installed AI multi-spectral sonar cameras that auto-open boom escape doors.' }
    ],
    chatSources: [
      {
        id: 'c901',
        source: 'WhatsApp',
        sender: 'Marine Bio Lead Dr. Boyan S.',
        timestamp: '2026-10-14 12:44',
        message: 'WhatsApp memo: OceanCleanse AI vision tested in Monaco waters. Detected ghost nets and submerged PET bottles with 96.8% accuracy. Fish escape gates worked flawlessly.',
        extractedAttributes: ['AI detection 96.8%', 'Fish escape gates verified']
      },
      {
        id: 'c902',
        source: 'WhatsApp',
        sender: 'Fincantieri Program Manager Marco Rossi',
        timestamp: '2026-10-23 11:18',
        message: 'The $78M grant funding is fully cleared. Hull block assembly in Monfalcone is currently ahead of schedule.',
        extractedAttributes: ['Budget $78M', 'Hull assembly ahead of schedule']
      }
    ],
    keywords: ['oceancleanse', 'plastic', 'fincantieri', 'cleanup', 'ocean', 'autonomous', 'wingsail', 'biofuel', 'environmental', 'baler'],
    summary: 'Autonomous high-capacity ocean debris recovery ship featuring rigid wing-sails, automated marine mammal escape gates, and onboard hydraulic baling of recovered ocean plastics.',
    expoBoothNumber: 'Hall C - Booth 342 (Marine Ecological Technologies)',
    leadEngineer: 'Dr. Marco Rossi (Fincantieri Green Marine Director)',
    contacts: [
      { name: 'Dr. Marco Rossi', role: 'Naval Director', phone: '+39 0481 498 111', email: 'm.rossi@fincantieri.it' },
      { name: 'Dr. Boyan Slater', role: 'Mission Director', phone: '+31 10 307 2000', email: 'b.slater@theoceancleanup.org' }
    ],
    lastUpdated: '2026-10-26'
  },
  {
    id: 'PRJ-10',
    code: 'CORAL-SWARM',
    name: 'Project CoralSentinel',
    category: 'Autonomous Subsea & Robotics',
    vesselType: 'Autonomous Underwater Vehicle (AUV) Reef Monitoring Mothership',
    imoNumber: 'IMO 9965007',
    shipyard: 'Austal & Teledyne Marine (Perth, Australia)',
    client: 'Great Barrier Reef Foundation & CSIRO Marine',
    contractValue: 34000000,
    status: 'Sea Trials & Testing',
    progressPercent: 95,
    deliveryDate: '2026-11-10',
    technicalSpecs: {
      lengthOverall: '36.0 meters',
      beam: '9.4 meters',
      draft: '1.8 meters',
      deadweight: '120 DWT',
      propulsion: 'Hybrid Electric with Twin Rim-Driven Silent Thrusters',
      fuelType: 'Lithium Titanate (LTO) Batteries + Solar Array + Clean Diesel Generator',
      speedKnots: '16.0 knots transit / 4.0 knots acoustic docking',
      autonomyLevel: 'IMO Degree 4 (Fully Unmanned Autonomous Operation)'
    },
    milestones: [
      { id: 'm1001', title: 'Subsea Autonomous Docking Cage Fabrication', date: '2025-04-10', status: 'completed', notes: 'Underwater inductive wireless charging for 6 micro-AUVs.' },
      { id: 'm1002', title: 'Coral Hyperspectral Bleaching AI Validation', date: '2025-11-18', status: 'completed', notes: '3D photogrammetry reconstructs 10,000 sq.m of reef in 4 hours.' },
      { id: 'm1003', title: 'Unmanned Remote Command Sea Trials', date: '2026-08-25', status: 'completed', notes: '48-hour continuous autonomous operation off Exmouth without human intervention.' },
      { id: 'm1004', title: 'Deployment to Great Barrier Reef Hub', date: '2026-11-10', status: 'in-progress', notes: 'Operational readiness ceremony at Maritime Expo.' }
    ],
    keyRisks: [
      { id: 'r1001', severity: 'Low', description: 'AUV acoustic beacon interference with migrating humpback whales.', mitigation: 'Integrated real-time marine mammal passive acoustic listener.' }
    ],
    chatSources: [
      {
        id: 'c1001',
        source: 'WhatsApp',
        sender: 'CSIRO Marine Scientist Dr. Liam Vance',
        timestamp: '2026-10-18 08:50',
        message: 'WhatsApp report: CoralSentinel swarm completed 60km reef survey. Inductive underwater dock recharged all 6 AUVs in 45 minutes wirelessly.',
        extractedAttributes: ['6 AUVs recharged wirelessly', '45 min wireless dock', '60km reef survey']
      },
      {
        id: 'c1002',
        source: 'WhatsApp',
        sender: 'Austal Commercial Lead Chloe Davies',
        timestamp: '2026-10-24 16:15',
        message: 'Total project cost finalized at $34M. Live 3D reef reconstruction data stream will be beamed into Maritime Expo Booth 108.',
        extractedAttributes: ['Budget $34M', 'Live 3D reef data stream at Expo']
      }
    ],
    keywords: ['coral', 'sentinel', 'auv', 'reef', 'csiro', 'teledyne', 'austal', 'autonomous', 'unmanned', 'drone', 'swarm'],
    summary: 'Fully unmanned 36m mothership vessel deploying a swarm of 6 autonomous underwater drones for hyperspectral coral reef health mapping, wireless subsea docking, and AI biodiversity tracking.',
    expoBoothNumber: 'Hall A - Booth 108 (Autonomous Subsea Systems)',
    leadEngineer: 'Dr. Liam Vance (Head of Marine Robotic Swarms)',
    contacts: [
      { name: 'Dr. Liam Vance', role: 'Lead Roboticist', phone: '+61 8 9333 6000', email: 'liam.vance@csiro.au' },
      { name: 'Chloe Davies', role: 'Commercial Director', phone: '+61 8 9410 2233', email: 'chloe.davies@austal.com' }
    ],
    lastUpdated: '2026-10-26'
  }
];

export const SAMPLE_WHATSAPP_LOGS = [
  {
    title: 'Sample 1: Poseidon-X Sea Trials WhatsApp Log',
    description: 'Fresh WhatsApp chat export discussing sea trials, engine telemetry and delivery date',
    text: `[25/10/26, 09:12:18] Chief Engineer Miller: Good morning team. Here is the latest WhatsApp update from Ulsan on Project Poseidon-X (IMO 9874102).
[25/10/26, 09:14:40] Naval Architect Sarah Lin: Morning Miller. How did the dual-fuel cryogenic engine load tests perform overnight?
[25/10/26, 09:16:05] Chief Engineer Miller: Exceptional. WinGD X-DF gas turbine showed 22.4% fuel savings at 19.5 knots cruising speed.
[25/10/26, 09:17:22] Shipyard Director Park (HHI): Excellent. Delivery milestone is locked for 2026-11-15 at the Maritime Expo handover.
[25/10/26, 09:20:11] Elena Rostova (Shell): Shell Marine management has signed off on the remaining milestone payment against the $245,000,000 contract value.
[25/10/26, 09:22:30] Chief Engineer Miller: Action item: Final Starlink maritime low-latency tele-operation test tomorrow off Jeju Island.`
  },
  {
    title: 'Sample 2: HydroVessel 400 Fuel Cell Bunkering Chat',
    description: 'WhatsApp discussion between Meyer Werft and Northern Lights Consortium on fuel cells',
    text: `[24/10/26, 14:02:11] Lars Solberg: WhatsApp sync regarding Project HydroVessel 400 (IMO 9951044).
[24/10/26, 14:05:33] Gunnar Aas: Has PowerCell Sweden finished the 350-bar liquid hydrogen test manifolds?
[24/10/26, 14:07:44] Lars Solberg: Yes, full 6.0 MW PEM fuel cell bank completed 1,000 continuous hours. Zero voltage drops.
[24/10/26, 14:10:02] Meyer Werft Commercial Desk: Meyer Werft Papenburg confirmed hull steel cutting date is 2026-11-01. Budget confirmed at $112M.
[24/10/26, 14:12:50] Lars Solberg: Delivery date remains on track for 2027-11-20. We will exhibit the scale hydrogen fuel cell model in Hall B Booth 228.`
  },
  {
    title: 'Sample 3: BlueHarbor Battery & Fast Charger Chat',
    description: 'WhatsApp chat regarding Damen Shipyards electric tug and Port of Rotterdam shore charging',
    text: `[26/10/26, 08:30:15] Mark van Dijk: BlueHarbor team, Port of Rotterdam Waalhaven 6.5MW rapid charging station passed power grid connection test!
[26/10/26, 08:33:40] Thijs de Vries (Damen): Outstanding news Mark. That means the electric tug can recharge from 20% to 90% in just 28 minutes.
[26/10/26, 08:35:10] Jan Bakker: Bollard pull tested at 86.2 tons in the test basin, beating the 85-ton contract spec.
[26/10/26, 08:38:22] Mark van Dijk: Contract value $85M on track. Ready for the live demo at Maritime Expo Hall B.`
  }
];
