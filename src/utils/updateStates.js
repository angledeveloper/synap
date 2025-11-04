const fs = require('fs');
const path = require('path');

// Read the source file
const countriesData = require('./countries1.json');

// Transform the data to match the format of states.json
const transformedStates = [];

countriesData.forEach(country => {
  if (country.states && country.states.length > 0) {
    country.states.forEach(state => {
      transformedStates.push({
        name: state.name,
        country_iso2: country.code2,
        state_code: state.code
      });
    });
  }
});

// Write to states.json
fs.writeFileSync(
  path.join(__dirname, 'states.json'),
  JSON.stringify(transformedStates, null, 2)
);

console.log('Updated states.json with data from countries1.json');
