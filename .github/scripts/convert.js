const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const xmlbuilder = require('xmlbuilder');

try {
  // Read YAML file
  const yamlPath = 'res/template.yaml';
  const yamlData = fs.readFileSync(yamlPath, 'utf8');
  const data = yaml.load(yamlData);

  if (!data.title || !data.verseOrder || !data.author) {
    throw new Error('Invalid or missing required data in YAML file.');
  }

  // Create XML structure
  const xml = xmlbuilder.create('song', { encoding: 'UTF-8' })
    .att('xmlns', 'http://openlyrics.info/namespace/2009/song')
    .att('version', '0.8')
    .att('createdIn', 'OpenLP 2.4')
    .att('modifiedIn', 'OpenLP 2.4')
    .att('modifiedDate', new Date().toISOString());

  xml.ele('properties')
    .ele('titles')
    .ele('title', data.title);

  xml.ele('verseOrder', {}, data.verseOrder);

  xml.ele('authors')
    .ele('author', data.author);

  const lyrics = xml.ele('lyrics');

  data.verseOrder.split(' ').forEach((verseName, index) => {
    const verseData = data[`v${index + 1}`];
    
    if (verseData) {
      lyrics.ele('verse', { name: verseName })
        .ele('lines', {}, verseData.replace(/\n/g, '<br/>'));
    } else {
      console.warn(`Verse v${index + 1} data is missing or undefined.`);
    }
  });

  // Convert to string
  const xmlString = xml.end({ pretty: true });

  // Generate XML file name based on the song title
  const xmlFileName = `${data.title}.xml`;

  // Write to XML file
  const xmlPath = path.join('.res/songs/', xmlFileName); // Update with your desired path
  fs.writeFileSync(xmlPath, xmlString, 'utf8');
  console.log(`Conversion successful. XML file saved at: ${xmlPath}`);
} catch (error) {
  console.error(`Error during conversion: ${error.message}`);
}
