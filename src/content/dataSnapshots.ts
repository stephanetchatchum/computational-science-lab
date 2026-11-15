/** Which backup files (audit A3) belong to which project. Must match scripts/fetch_data.py. */
export const SNAPSHOTS: Record<string, { file: string; what: string }[]> = {
  s0p3: [{ file: 'worldbank_RWA_population.json', what: 'World Bank population, Rwanda' }],
  s0p4: [{ file: 'nasa_power_daily_kigali_2023.json', what: 'NASA POWER daily, Kigali 2023' }],
  s1p1: [{ file: 'nasa_power_monthly_T2M_nairobi_1991_2023.json', what: 'NASA POWER monthly temperature, Nairobi 1991–2023' }],
  s2p3: [{ file: 'owid_co2_data.csv', what: 'Our World in Data CO₂' }],
  s2p6: [{ file: 'noaa_gml_co2_mm_mlo.csv', what: 'NOAA Mauna Loa monthly CO₂' }, { file: 'nasa_power_daily_T2M_kigali_1994_2023.json', what: 'NASA POWER daily temperature, Kigali 1994–2023' }],
  s2p5: [{ file: 'geonames_cities15000.zip', what: 'GeoNames towns over 15 000 people' }],
  s3p3: [{ file: 'disease_sh_rwanda_historical.json', what: 'disease.sh COVID-19 history, Rwanda' }],
  s4p5: [{ file: 'nasa_power_monthly_PRECTOTCORR_grid64_1991_2023.json', what: 'NASA POWER monthly rainfall, 8 × 8 grid' }],
  s5p5: [{ file: 'worldbank_KEN_cereal_yield.json', what: 'World Bank cereal yield, Kenya' }],
  s5p6: [{ file: 'opentopodata_srtm30m_kigali_box.json', what: 'SRTM 30 m elevation grid, Kigali box' }],
};
