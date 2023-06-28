export interface SearchParams {
  take?: number;
  skip?: number;
  countryId?: string;
  programmingLanguageUuids?: string;
  languageUuids?:[];
  programmingLanguages? : [];
  countryName?: string;
  cityName?: string;
  universityName?: string;
  languageName?: string;
  frameworkName?: string;
  position?: string;
}
