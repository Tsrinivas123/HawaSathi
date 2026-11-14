export const BHOPAL_MESSY_SAMPLE_CSV = `Site Area,Ward_No,Sensor_Id,Date / Time,PM 2.5 (ug/m3),PM10 raw,Overall_AQI,NO2,SO2,CO [ppm],O3
MP Nagar Zone-1,Ward 48,MP-N-01,2026-11-14 08:30,148.5,235.0,322,48.2,18.4,2.4 ppm,35.1
TT Nagar Stadium,Ward 32,TT-N-04,2026-11-14 08:30,86.2,142.1,188,32.0,12.1,1.1 ppm,42.5
TT Nagar Stadium,Ward 32,TT-N-04,2026-11-14 08:30,86.2,142.1,188,32.0,12.1,1.1 ppm,42.5
Govindpura Industrial Complex,Ward 60,IND-G-02,2026-11-14 08:45,210.4,999.0,385,76.5,42.1,4.2 ppm,22.0
Shahpura Lake Promenade,Ward 52,LAK-S-01,2026-11-14 08:15,42.1,78.4,115,18.4,8.2,0.6 ppm,55.3
Bairagarh Sant Hirdaram Nagar,Ward 04,BRG-W-03,2026-11-14 09:00,165.8,280.5,338,58.9,24.6,3.1 ppm,29.4
Karond Krishi Upaj Mandi,Ward 12,KRD-M-05,2026-11-14 08:40,188.0,310.2,354,64.2,21.0,3.5 ppm,18.2
AIIMS Bhopal Sensitive Zone,Ward 54,MED-A-01,2026-11-14 08:20,55.0,N/A,145,22.1,9.5,0.8 ppm,48.0
Kolar Road Mahabali Nagar,Ward 81,KLR-S-02,2026-11-14 09:10,112.4,195.0,274,38.6,15.2,1.8 ppm,38.9
Arera Colony E-7 Green Belt,Ward 46,ARC-G-01,2026-11-14 08:00,38.5,65.2,98,16.0,7.1,0.5 ppm,62.1`;

export const CLEAN_BENCHMARK_CSV = `Location,Ward,Station,Timestamp,PM2.5,PM10,AQI,NO2,SO2,CO,O3
MP Nagar Zone-1,Ward 48,MP-N-01,2026-11-13 08:30,112.0,185.0,274,38.0,15.0,1.8,40.0
TT Nagar Stadium,Ward 32,TT-N-04,2026-11-13 08:30,72.0,120.0,140,28.0,10.0,1.0,45.0
Govindpura Industrial,Ward 60,IND-G-02,2026-11-13 08:45,175.0,290.0,342,65.0,35.0,3.2,25.0
Shahpura Lake,Ward 52,LAK-S-01,2026-11-13 08:15,35.0,60.0,90,15.0,7.0,0.5,58.0
Bairagarh Hub,Ward 04,BRG-W-03,2026-11-13 09:00,130.0,220.0,305,48.0,19.0,2.5,32.0
Karond Mandi,Ward 12,KRD-M-05,2026-11-13 08:40,145.0,240.0,318,52.0,17.0,2.8,22.0
AIIMS Hospital Zone,Ward 54,MED-A-01,2026-11-13 08:20,48.0,85.0,125,19.0,8.0,0.7,50.0
Kolar Road,Ward 81,KLR-S-02,2026-11-13 09:10,95.0,160.0,210,32.0,12.0,1.4,42.0
Arera Colony,Ward 46,ARC-G-01,2026-11-13 08:00,32.0,55.0,85,14.0,6.0,0.4,65.0`;

export const PREVIOUS_BRIEFING_RECORD = {
  date: "2026-11-13 09:00 IST",
  averageAqi: 211,
  aqiCategory: "Poor",
  primaryHotspots: ["Govindpura Industrial Complex (AQI 342)", "Karond Krishi Upaj Mandi (AQI 318)"],
  implementedActions: [
    "Mist cannon deployed at MP Nagar main junction (6 AM - 8 AM)",
    "Temporary heavy vehicle diversion around Karond bypass"
  ]
};
