const fs = require('fs');
const path = require('path');

// Read the source file
const countriesData = require('./countries1.json');

// Transform the data to match the format of countries.json
const transformedCountries = countriesData.map(country => ({
  name: {
    common: country.name,
    official: country.name,
    nativeName: {}
  },
  tld: [],
  cca2: country.code2,
  ccn3: "",
  cca3: country.code3,
  cioc: "",
  independent: true,
  status: "officially-assigned",
  unMember: true,
  currencies: {},
  idd: {},
  capital: [country.capital],
  altSpellings: [],
  region: country.region,
  subregion: country.subregion,
  languages: {},
  translations: {},
  latlng: [],
  landlocked: false,
  borders: [],
  area: 0,
  demonyms: {},
  flag: "",
  maps: {},
  population: 0,
  gini: {},
  fifa: "",
  car: {},
  timezones: [],
  continents: [],
  flags: {},
  coatOfArms: {},
  startOfWeek: "monday",
  capitalInfo: {},
  postalCode: {}
}));

// Write to countries.json
fs.writeFileSync(
  path.join(__dirname, 'countries.json'),
  JSON.stringify(transformedCountries, null, 2)
);

console.log('Updated countries.json with data from countries1.json');
