interface RenderStatistics {
  getLastUpdateDetails(): [[string, number]] | null;
  getLastUpdateTimeMs(): number;
}
