let pistonAcft = ['C172', 'C182', 'C152', 'P28A', 'SR20', 'H47', 'C150', 'PA22', 'C82R', 'AP32', 'C208', 'LA4', 'AA5', 'DV20', 'P28S', 'SR22', 'M20T', 'C42', 'TB20', 'VL3', 'ULAC', 'B36T', 'P32R', 'DIMO', 'PC12',
    'M20P', 'EFOX', 'PNR3', 'RV9', 'PIVI', 'NG5', 'SIRA', 'SHRK', 'RV14', 'S22T', 'SF25', 'DA40', 'A210', 'DR40', 'DIAMO02', 'AC11', 'B209', 'WT9', 'BW6T', 'BR23', 'PC9', 'TL30',
    'P208', 'P28T', 'PC21', 'TL20', 'BU31', 'F260', 'PRIM', 'PC7', 'Z42', 'DA50', 'TOBA', 'HR20', 'BREZ', 'TBM9', 'PA32', 'G115', 'BDOG', 'JAB4', 'SKRA', 'RV10', 'PA24', 'CRUZ', 'RV8', 'BE36', 'PA11',
    'AUJ2', 'G109', 'PA46', 'BE33', 'RV4', 'DR10', 'P28R', 'SUBA', 'P210', 'TWEN', 'YK52', 'RF6', 'G3', 'BE35', 'ALTO', 'EV97', 'FK9', 'NIMB', 'ARCP', 'CH60', 'GX', 'E500', 'PA18', 'S10S',
    'RALL', 'PA44', 'C206', 'PNR2', 'C10T', 'EVSS', 'FDCT', 'STRE', 'SLG2', 'TAMP', 'SLG2', 'AS02', 'C82T', 'C177', 'C210', 'OSCR', 'RV12', 'P46T', 'TEX2', 'M7', 'C72R', 'BT36', 'T206', 'CH2T', 'AA5',
    'GC1', 'C82S', 'C77R', 'BL8', 'C180', 'COL4', 'COL3', 'T210', 'GLST', 'PIAT', 'RV7', 'K100', 'IR23', 'D253', 'MCR1', 'ECHO', 'HUSK', 'S12S', 'LGND', 'IMPU', 'FAET', 'PULS', 'A32E', 'VNTR', 'P28B',
    'AAT3', 'TB21', 'LNCE', 'DG50', 'BE18', 'AP22', 'S05R', 'PA38', 'CH75', 'P28U', 'WAIX', 'SV4', 'CRES', 'C170', 'TBM7', 'MOR2', 'TBM7', 'FBA2', 'BOLT', 'SAVG', 'RISN', 'R90R', 'ALSL', 'R200',  
    'P149', 'AVID', 'UF13', 'AS29', 'PA30', 'C337', 'TBM8', 'CH7A', 'DAL4', 'R300', 'JUNR', 'C175', 'C140', 'PC6T', 'M700', 'LXR', 'BE23', 'LNC2', 'AT8T', 'SB91'               

];
let gliderAcft = ['DG80', 'DG40', 'EB29', 'AS31', 'AS25', 'DUOD', 'VENT', 'DISC'];
let turboAcft = ['B350', 'L2T', 'F406', 'SF34', 'V22', 'BE30', 'C414', 'DA62', 'AT76', 'SW4', 'DA42', 'SC7', 'PA34', 'DA42', 'P68', 'BE9L', 'DHC6', 'AT75', 'AN30', 'C212', 'D228', 'C310', 'AT45',
    'PA31', 'C404', 'P06T', 'DH8A', 'P3', 'BN2P', 'C425', 'P180', 'C441', 'CN35', 'AT72', 'BE20', 'B190', 'BE58', 'C421', 'BE60', 'SW3', 'C340', 'BE99', 'DH8D', 'D328', 'P212', 'DH8B', 'L410', 'M28',
    'DC3', 'PA27', 'AT73', 'BE76', 'C320', 'PA23'  
];
let helAcft = ['EC35', 'EC45', 'EC30', 'EC55', 'H60', 'R44', 'MI8', 'A139', 'AS32', 'G2CA', 'EC20', 'B505', 'EC75', 'A169', 'A109', 'AS55', 'R22', 'AS3B', 'LYNX', 'AS65', 'B407', 'H53S', 'AS50', 'B429',
    'B06', 'H500', 'H64', 'NH90', 'R66', 'S92', 'MM16', 'CDUS', 'A189', 'MT', 'S76', 'EXPL', 'CLON', 'BK17'      
   ];
let twoEngAcft = ['B738', 'B737', 'A321', 'B752', 'A320', 'A333', 'B38M', 'A20N', 'B789', 'B77W', 'A21N', 'B789', 'B38M', 'B739', 'BCS3', 'B762', 'B763', 'A332', 'A319', 'B734', 'A359', 'B788', 'B77W', 'B77L', 'B763', 'A339',
    'B734', 'B78X', 'A35K', 'A332', 'E75L', 'E190', 'B753', 'E190', 'E295', 'B78X', 'E190', 'A30B', 'B39M', 'B772', 'E170', 'B764', 'E195', 'E290', 'A306', 'BCS1',       
];
let fourEngAcft = ['C17', 'A388', 'B748', 'B744', 'A343', 'A400', 'A346', 'A124', 'K35R', 'C5M',  ];
let businessAcft = ['LJ45', 'GL5T', 'CL60', 'GL7T', 'GLF5', 'GA6C', 'GLEX', 'C525', 'PRM1', 'F900', 'C700', 'C550', 'E55P', 'C56X', 'E55P', 'LJ35', 'PC24', 'C25C', 'C25A', 'CRJX', 'SF50', 'C680',
    'CRJ9', 'E145', 'E50P', 'C68A', 'GLF6', 'CL35', 'G550', 'CRJ7', 'E45X', 'BE40', 'C130', 'C30J', 'CL30', 'GLF4', 'F2TH', 'C25B', 'G280', 'C510', 'LJ60', 'CRJ2', 'HDJT', 'C750', 'C560', 'WW24',
    'C25M', 'E3TF', 'FA7X', 'E35L'              
]