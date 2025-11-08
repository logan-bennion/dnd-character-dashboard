// NPC Generator - Clean Implementation
// Follows the flow: User inputs -> Generate missing data -> Generate description

interface NPCOptions {
  gender?: string;
  race?: string;
  occupation?: string;
  nameCulture?: string;
}

interface NPCData {
  name: string;
  race: string;
  gender: string;
  occupation: string;
  description: string;
}

// Real world cultures for name generation
const NAME_CULTURES = [
  'Nordic', 'Celtic', 'Arabic', 'Japanese', 'Latin', 'Greek', 
  'Germanic', 'Slavic', 'Hebrew', 'Sanskrit', 'Chinese', 'Korean'
];

// Race-specific name lists by gender
const RACE_NAMES = {
  human: {
    male: ['Aiden', 'Brennan', 'Cael', 'Dara', 'Eamon', 'Fiona', 'Gareth', 'Hilda', 'Ivan', 'Jenna', 'Kael', 'Luna', 'Marek', 'Nora', 'Owen', 'Pia', 'Quinn', 'Rhea', 'Soren', 'Tara', 'Ulrich', 'Vera', 'Wren', 'Xara', 'Yara', 'Zara'],
    female: ['Aria', 'Brenna', 'Cara', 'Dara', 'Elena', 'Fiona', 'Gwen', 'Hilda', 'Iris', 'Jenna', 'Kira', 'Luna', 'Maya', 'Nora', 'Owen', 'Pia', 'Quinn', 'Rhea', 'Sage', 'Tara', 'Uma', 'Vera', 'Wren', 'Xara', 'Yara', 'Zara'],
    'non-binary': ['Aiden', 'Brenna', 'Cael', 'Dara', 'Eamon', 'Fiona', 'Gareth', 'Hilda', 'Ivan', 'Jenna', 'Kael', 'Luna', 'Marek', 'Nora', 'Owen', 'Pia', 'Quinn', 'Rhea', 'Soren', 'Tara', 'Ulrich', 'Vera', 'Wren', 'Xara', 'Yara', 'Zara']
  },
  dwarf: {
    male: ['Thorin', 'Balin', 'Dwalin', 'Fili', 'Kili', 'Dain', 'Gimli', 'Balin', 'Thrain', 'Thror', 'Nain', 'Dain', 'Gloin', 'Oin', 'Bifur', 'Bofur', 'Bombur', 'Ori', 'Nori', 'Dori', 'Balin', 'Dwalin', 'Fili', 'Kili', 'Thorin', 'Gimli'],
    female: ['Disa', 'Fili', 'Kili', 'Disa', 'Balin', 'Dwalin', 'Thorin', 'Gimli', 'Thrain', 'Thror', 'Nain', 'Dain', 'Gloin', 'Oin', 'Bifur', 'Bofur', 'Bombur', 'Ori', 'Nori', 'Dori', 'Balin', 'Dwalin', 'Fili', 'Kili', 'Thorin', 'Gimli'],
    'non-binary': ['Thorin', 'Disa', 'Balin', 'Dwalin', 'Fili', 'Kili', 'Gimli', 'Dain', 'Thrain', 'Thror', 'Nain', 'Gloin', 'Oin', 'Bifur', 'Bofur', 'Bombur', 'Ori', 'Nori', 'Dori', 'Balin', 'Dwalin', 'Fili', 'Kili', 'Thorin', 'Gimli', 'Dain']
  },
  elf: {
    male: ['Legolas', 'Elrond', 'Thranduil', 'Celeborn', 'Glorfindel', 'Erestor', 'Lindir', 'Haldir', 'Aragorn', 'Arwen', 'Galadriel', 'Tauriel', 'Celebrian', 'Nimrodel', 'Luthien', 'Idril', 'Aredhel', 'Ecthelion', 'Glorfindel', 'Erestor', 'Lindir', 'Haldir', 'Legolas', 'Elrond', 'Thranduil', 'Celeborn'],
    female: ['Arwen', 'Galadriel', 'Tauriel', 'Celebrian', 'Nimrodel', 'Luthien', 'Idril', 'Aredhel', 'Legolas', 'Elrond', 'Thranduil', 'Celeborn', 'Glorfindel', 'Erestor', 'Lindir', 'Haldir', 'Aragorn', 'Ecthelion', 'Glorfindel', 'Erestor', 'Lindir', 'Haldir', 'Legolas', 'Elrond', 'Thranduil', 'Celeborn'],
    'non-binary': ['Legolas', 'Arwen', 'Elrond', 'Galadriel', 'Thranduil', 'Tauriel', 'Celeborn', 'Celebrian', 'Glorfindel', 'Erestor', 'Lindir', 'Haldir', 'Aragorn', 'Nimrodel', 'Luthien', 'Idril', 'Aredhel', 'Ecthelion', 'Glorfindel', 'Erestor', 'Lindir', 'Haldir', 'Legolas', 'Elrond', 'Thranduil', 'Celeborn']
  },
  halfling: {
    male: ['Bilbo', 'Frodo', 'Samwise', 'Pippin', 'Merry', 'Bilbo', 'Frodo', 'Samwise', 'Rosie', 'Lobelia', 'Belladonna', 'Primula', 'Eglantine', 'Poppy', 'Lily', 'Daisy', 'Bilbo', 'Frodo', 'Samwise', 'Pippin', 'Merry', 'Rosie', 'Lobelia', 'Belladonna', 'Primula', 'Eglantine'],
    female: ['Rosie', 'Lobelia', 'Belladonna', 'Primula', 'Eglantine', 'Poppy', 'Lily', 'Daisy', 'Bilbo', 'Frodo', 'Samwise', 'Pippin', 'Merry', 'Rosie', 'Lobelia', 'Belladonna', 'Primula', 'Eglantine', 'Poppy', 'Lily', 'Daisy', 'Bilbo', 'Frodo', 'Samwise', 'Pippin', 'Merry'],
    'non-binary': ['Bilbo', 'Rosie', 'Frodo', 'Lobelia', 'Samwise', 'Belladonna', 'Pippin', 'Primula', 'Merry', 'Eglantine', 'Poppy', 'Lily', 'Daisy', 'Bilbo', 'Frodo', 'Samwise', 'Pippin', 'Merry', 'Rosie', 'Lobelia', 'Belladonna', 'Primula', 'Eglantine', 'Poppy', 'Lily', 'Daisy']
  },
  gnome: {
    male: ['Gimble', 'Fiddle', 'Tinker', 'Gadget', 'Cog', 'Spring', 'Coil', 'Widget', 'Gimble', 'Fiddle', 'Tinker', 'Gadget', 'Cog', 'Spring', 'Coil', 'Widget', 'Gimble', 'Fiddle', 'Tinker', 'Gadget', 'Cog', 'Spring', 'Coil', 'Widget', 'Gimble', 'Fiddle'],
    female: ['Tinker', 'Gadget', 'Cog', 'Spring', 'Coil', 'Widget', 'Gimble', 'Fiddle', 'Tinker', 'Gadget', 'Cog', 'Spring', 'Coil', 'Widget', 'Gimble', 'Fiddle', 'Tinker', 'Gadget', 'Cog', 'Spring', 'Coil', 'Widget', 'Gimble', 'Fiddle', 'Tinker', 'Gadget'],
    'non-binary': ['Gimble', 'Tinker', 'Fiddle', 'Gadget', 'Cog', 'Spring', 'Coil', 'Widget', 'Gimble', 'Fiddle', 'Tinker', 'Gadget', 'Cog', 'Spring', 'Coil', 'Widget', 'Gimble', 'Fiddle', 'Tinker', 'Gadget', 'Cog', 'Spring', 'Coil', 'Widget', 'Gimble', 'Fiddle']
  },
  tiefling: {
    male: ['Zariel', 'Asmodeus', 'Mephistopheles', 'Belial', 'Geryon', 'Mammon', 'Beelzebub', 'Lucifer', 'Lilith', 'Asmodeus', 'Mephistopheles', 'Belial', 'Geryon', 'Mammon', 'Beelzebub', 'Lucifer', 'Zariel', 'Lilith', 'Asmodeus', 'Mephistopheles', 'Belial', 'Geryon', 'Mammon', 'Beelzebub', 'Lucifer', 'Zariel'],
    female: ['Lilith', 'Asmodeus', 'Mephistopheles', 'Belial', 'Geryon', 'Mammon', 'Beelzebub', 'Lucifer', 'Zariel', 'Asmodeus', 'Mephistopheles', 'Belial', 'Geryon', 'Mammon', 'Beelzebub', 'Lucifer', 'Lilith', 'Zariel', 'Asmodeus', 'Mephistopheles', 'Belial', 'Geryon', 'Mammon', 'Beelzebub', 'Lucifer', 'Lilith'],
    'non-binary': ['Zariel', 'Lilith', 'Asmodeus', 'Mephistopheles', 'Belial', 'Geryon', 'Mammon', 'Beelzebub', 'Lucifer', 'Zariel', 'Lilith', 'Asmodeus', 'Mephistopheles', 'Belial', 'Geryon', 'Mammon', 'Beelzebub', 'Lucifer', 'Zariel', 'Lilith', 'Asmodeus', 'Mephistopheles', 'Belial', 'Geryon', 'Mammon', 'Beelzebub']
  },
  'half-elf': {
    male: ['Aragorn', 'Elrond', 'Celeborn', 'Thranduil', 'Legolas', 'Haldir', 'Erestor', 'Lindir', 'Arwen', 'Galadriel', 'Tauriel', 'Celebrian', 'Nimrodel', 'Luthien', 'Idril', 'Aredhel', 'Aragorn', 'Elrond', 'Celeborn', 'Thranduil', 'Legolas', 'Haldir', 'Erestor', 'Lindir', 'Arwen', 'Galadriel'],
    female: ['Arwen', 'Galadriel', 'Tauriel', 'Celebrian', 'Nimrodel', 'Luthien', 'Idril', 'Aredhel', 'Aragorn', 'Elrond', 'Celeborn', 'Thranduil', 'Legolas', 'Haldir', 'Erestor', 'Lindir', 'Arwen', 'Galadriel', 'Tauriel', 'Celebrian', 'Nimrodel', 'Luthien', 'Idril', 'Aredhel', 'Aragorn', 'Elrond'],
    'non-binary': ['Aragorn', 'Arwen', 'Elrond', 'Galadriel', 'Celeborn', 'Tauriel', 'Thranduil', 'Celebrian', 'Legolas', 'Haldir', 'Erestor', 'Lindir', 'Nimrodel', 'Luthien', 'Idril', 'Aredhel', 'Aragorn', 'Elrond', 'Celeborn', 'Thranduil', 'Legolas', 'Haldir', 'Erestor', 'Lindir', 'Arwen', 'Galadriel']
  },
  'half-orc': {
    male: ['Grom', 'Thrall', 'Garrosh', 'Durotan', 'Orgrim', 'Gul\'dan', 'Ner\'zhul', 'Kil\'jaeden', 'Grom', 'Thrall', 'Garrosh', 'Durotan', 'Orgrim', 'Gul\'dan', 'Ner\'zhul', 'Kil\'jaeden', 'Grom', 'Thrall', 'Garrosh', 'Durotan', 'Orgrim', 'Gul\'dan', 'Ner\'zhul', 'Kil\'jaeden', 'Grom', 'Thrall'],
    female: ['Grom', 'Thrall', 'Garrosh', 'Durotan', 'Orgrim', 'Gul\'dan', 'Ner\'zhul', 'Kil\'jaeden', 'Grom', 'Thrall', 'Garrosh', 'Durotan', 'Orgrim', 'Gul\'dan', 'Ner\'zhul', 'Kil\'jaeden', 'Grom', 'Thrall', 'Garrosh', 'Durotan', 'Orgrim', 'Gul\'dan', 'Ner\'zhul', 'Kil\'jaeden', 'Grom', 'Thrall'],
    'non-binary': ['Grom', 'Thrall', 'Garrosh', 'Durotan', 'Orgrim', 'Gul\'dan', 'Ner\'zhul', 'Kil\'jaeden', 'Grom', 'Thrall', 'Garrosh', 'Durotan', 'Orgrim', 'Gul\'dan', 'Ner\'zhul', 'Kil\'jaeden', 'Grom', 'Thrall', 'Garrosh', 'Durotan', 'Orgrim', 'Gul\'dan', 'Ner\'zhul', 'Kil\'jaeden', 'Grom', 'Thrall']
  },
  dragonborn: {
    male: ['Bahamut', 'Tiamat', 'Chromatic', 'Metallic', 'Gem', 'Crystal', 'Shadow', 'Light', 'Bahamut', 'Tiamat', 'Chromatic', 'Metallic', 'Gem', 'Crystal', 'Shadow', 'Light', 'Bahamut', 'Tiamat', 'Chromatic', 'Metallic', 'Gem', 'Crystal', 'Shadow', 'Light', 'Bahamut', 'Tiamat'],
    female: ['Bahamut', 'Tiamat', 'Chromatic', 'Metallic', 'Gem', 'Crystal', 'Shadow', 'Light', 'Bahamut', 'Tiamat', 'Chromatic', 'Metallic', 'Gem', 'Crystal', 'Shadow', 'Light', 'Bahamut', 'Tiamat', 'Chromatic', 'Metallic', 'Gem', 'Crystal', 'Shadow', 'Light', 'Bahamut', 'Tiamat'],
    'non-binary': ['Bahamut', 'Tiamat', 'Chromatic', 'Metallic', 'Gem', 'Crystal', 'Shadow', 'Light', 'Bahamut', 'Tiamat', 'Chromatic', 'Metallic', 'Gem', 'Crystal', 'Shadow', 'Light', 'Bahamut', 'Tiamat', 'Chromatic', 'Metallic', 'Gem', 'Crystal', 'Shadow', 'Light', 'Bahamut', 'Tiamat']
  },
  goblin: {
    male: ['Gob', 'Snaggle', 'Grimble', 'Squiggle', 'Nibble', 'Grabble', 'Snatch', 'Grab', 'Gob', 'Snaggle', 'Grimble', 'Squiggle', 'Nibble', 'Grabble', 'Snatch', 'Grab', 'Gob', 'Snaggle', 'Grimble', 'Squiggle', 'Nibble', 'Grabble', 'Snatch', 'Grab', 'Gob', 'Snaggle'],
    female: ['Gob', 'Snaggle', 'Grimble', 'Squiggle', 'Nibble', 'Grabble', 'Snatch', 'Grab', 'Gob', 'Snaggle', 'Grimble', 'Squiggle', 'Nibble', 'Grabble', 'Snatch', 'Grab', 'Gob', 'Snaggle', 'Grimble', 'Squiggle', 'Nibble', 'Grabble', 'Snatch', 'Grab', 'Gob', 'Snaggle'],
    'non-binary': ['Gob', 'Snaggle', 'Grimble', 'Squiggle', 'Nibble', 'Grabble', 'Snatch', 'Grab', 'Gob', 'Snaggle', 'Grimble', 'Squiggle', 'Nibble', 'Grabble', 'Snatch', 'Grab', 'Gob', 'Snaggle', 'Grimble', 'Squiggle', 'Nibble', 'Grabble', 'Snatch', 'Grab', 'Gob', 'Snaggle']
  },
  orc: {
    male: ['Grom', 'Thrall', 'Garrosh', 'Durotan', 'Orgrim', 'Gul\'dan', 'Ner\'zhul', 'Kil\'jaeden', 'Grom', 'Thrall', 'Garrosh', 'Durotan', 'Orgrim', 'Gul\'dan', 'Ner\'zhul', 'Kil\'jaeden', 'Grom', 'Thrall', 'Garrosh', 'Durotan', 'Orgrim', 'Gul\'dan', 'Ner\'zhul', 'Kil\'jaeden', 'Grom', 'Thrall'],
    female: ['Grom', 'Thrall', 'Garrosh', 'Durotan', 'Orgrim', 'Gul\'dan', 'Ner\'zhul', 'Kil\'jaeden', 'Grom', 'Thrall', 'Garrosh', 'Durotan', 'Orgrim', 'Gul\'dan', 'Ner\'zhul', 'Kil\'jaeden', 'Grom', 'Thrall', 'Garrosh', 'Durotan', 'Orgrim', 'Gul\'dan', 'Ner\'zhul', 'Kil\'jaeden', 'Grom', 'Thrall'],
    'non-binary': ['Grom', 'Thrall', 'Garrosh', 'Durotan', 'Orgrim', 'Gul\'dan', 'Ner\'zhul', 'Kil\'jaeden', 'Grom', 'Thrall', 'Garrosh', 'Durotan', 'Orgrim', 'Gul\'dan', 'Ner\'zhul', 'Kil\'jaeden', 'Grom', 'Thrall', 'Garrosh', 'Durotan', 'Orgrim', 'Gul\'dan', 'Ner\'zhul', 'Kil\'jaeden', 'Grom', 'Thrall']
  }
};

// Race options
const RACES = [
  'human', 'dwarf', 'elf', 'halfling', 'gnome', 'tiefling', 
  'half-elf', 'half-orc', 'dragonborn', 'goblin', 'orc'
];

// Gender options
const GENDERS = ['male', 'female', 'non-binary'];

// Occupation options
const OCCUPATIONS = [
  'warrior', 'guard', 'merchant', 'farmer', 'blacksmith', 'healer', 
  'scholar', 'noble', 'thief', 'hunter', 'sailor', 'hermit'
];

// Generate a random name based on race and gender
function generateName(race: string, gender: string, nameCulture?: string): string {
  const raceNames = RACE_NAMES[race as keyof typeof RACE_NAMES];
  if (!raceNames) return 'Unknown';
  
  const genderNames = raceNames[gender as keyof typeof raceNames];
  if (!genderNames) return 'Unknown';
  
  return genderNames[Math.floor(Math.random() * genderNames.length)];
}

// Generate a random race
function generateRace(): string {
  return RACES[Math.floor(Math.random() * RACES.length)];
}

// Generate a random gender
function generateGender(): string {
  return GENDERS[Math.floor(Math.random() * GENDERS.length)];
}

// Generate a random occupation
function generateOccupation(): string {
  return OCCUPATIONS[Math.floor(Math.random() * OCCUPATIONS.length)];
}

// Rich content data for descriptions
const PHYSICAL_DESCRIPTIONS = {
  human: {
    male: ['tall and broad-shouldered', 'lean and athletic', 'stocky and muscular', 'tall and wiry', 'average height with a strong build'],
    female: ['graceful and elegant', 'tall and statuesque', 'petite and agile', 'curvy and strong', 'athletic and toned'],
    'non-binary': ['tall and androgynous', 'lean and graceful', 'strong and fluid', 'athletic and balanced', 'tall and elegant']
  },
  dwarf: {
    male: ['broad and barrel-chested', 'sturdy and muscular', 'thick-bearded and strong', 'compact and powerful', 'stocky with a warrior\'s build'],
    female: ['sturdy and well-built', 'strong and practical', 'compact and muscular', 'broad-shouldered and capable', 'sturdy with a craftsman\'s hands'],
    'non-binary': ['sturdy and balanced', 'strong and practical', 'compact and capable', 'well-built and skilled', 'sturdy with a craftsman\'s touch']
  },
  elf: {
    male: ['tall and graceful', 'slender and elegant', 'lithe and agile', 'tall and ethereal', 'slender with an otherworldly beauty'],
    female: ['tall and ethereal', 'graceful and otherworldly', 'slender and elegant', 'tall and beautiful', 'graceful with an otherworldly presence'],
    'non-binary': ['tall and androgynous', 'graceful and ethereal', 'slender and otherworldly', 'tall and elegant', 'graceful with an otherworldly beauty']
  },
  halfling: {
    male: ['cheerful and round-faced', 'jolly and well-fed', 'compact and nimble', 'round and friendly', 'small and agile'],
    female: ['cheerful and rosy-cheeked', 'jolly and well-fed', 'compact and nimble', 'round and friendly', 'small and graceful'],
    'non-binary': ['cheerful and round-faced', 'jolly and well-fed', 'compact and nimble', 'round and friendly', 'small and agile']
  },
  gnome: {
    male: ['small and wiry', 'compact and energetic', 'small and clever', 'nimble and quick', 'small with bright, intelligent eyes'],
    female: ['small and graceful', 'compact and energetic', 'small and clever', 'nimble and quick', 'small with bright, intelligent eyes'],
    'non-binary': ['small and androgynous', 'compact and energetic', 'small and clever', 'nimble and quick', 'small with bright, intelligent eyes']
  },
  tiefling: {
    male: ['tall and imposing', 'muscular with infernal features', 'tall and charismatic', 'strong with devilish charm', 'imposing with an otherworldly presence'],
    female: ['tall and striking', 'graceful with infernal features', 'tall and charismatic', 'elegant with devilish charm', 'striking with an otherworldly presence'],
    'non-binary': ['tall and androgynous', 'graceful with infernal features', 'tall and charismatic', 'elegant with devilish charm', 'striking with an otherworldly presence']
  },
  'half-elf': {
    male: ['tall and graceful', 'slender with human warmth', 'tall and charismatic', 'elegant with a human touch', 'graceful with an otherworldly beauty'],
    female: ['tall and ethereal', 'graceful with human warmth', 'tall and charismatic', 'elegant with a human touch', 'graceful with an otherworldly presence'],
    'non-binary': ['tall and androgynous', 'graceful with human warmth', 'tall and charismatic', 'elegant with a human touch', 'graceful with an otherworldly beauty']
  },
  'half-orc': {
    male: ['tall and muscular', 'broad and intimidating', 'strong and imposing', 'muscular with orcish features', 'tall with a warrior\'s build'],
    female: ['tall and strong', 'broad and capable', 'strong and imposing', 'muscular with orcish features', 'tall with a warrior\'s build'],
    'non-binary': ['tall and strong', 'broad and capable', 'strong and imposing', 'muscular with orcish features', 'tall with a warrior\'s build']
  },
  dragonborn: {
    male: ['tall and draconic', 'muscular with scales', 'imposing and reptilian', 'strong with draconic features', 'tall with a dragon\'s presence'],
    female: ['tall and draconic', 'graceful with scales', 'imposing and reptilian', 'elegant with draconic features', 'tall with a dragon\'s presence'],
    'non-binary': ['tall and draconic', 'graceful with scales', 'imposing and reptilian', 'elegant with draconic features', 'tall with a dragon\'s presence']
  },
  goblin: {
    male: ['small and wiry', 'compact and cunning', 'small and agile', 'nimble and quick', 'small with sharp, intelligent eyes'],
    female: ['small and wiry', 'compact and cunning', 'small and agile', 'nimble and quick', 'small with sharp, intelligent eyes'],
    'non-binary': ['small and wiry', 'compact and cunning', 'small and agile', 'nimble and quick', 'small with sharp, intelligent eyes']
  },
  orc: {
    male: ['tall and muscular', 'broad and intimidating', 'strong and imposing', 'muscular with orcish features', 'tall with a warrior\'s build'],
    female: ['tall and strong', 'broad and capable', 'strong and imposing', 'muscular with orcish features', 'tall with a warrior\'s build'],
    'non-binary': ['tall and strong', 'broad and capable', 'strong and imposing', 'muscular with orcish features', 'tall with a warrior\'s build']
  }
};

const CLOTHING_DESCRIPTIONS = {
  warrior: ['wear practical leather armor', 'are dressed in well-worn battle gear', 'are clad in sturdy combat attire', 'wear functional armor', 'are dressed for battle'],
  guard: ['wear a uniform and badge', 'are dressed in official guard attire', 'are clad in a standard uniform', 'wear a guard\'s uniform', 'are dressed in official gear'],
  merchant: ['wear fine merchant\'s clothes', 'are dressed in expensive fabrics', 'are clad in well-tailored garments', 'wear merchant\'s finery', 'are dressed in business attire'],
  farmer: ['wear simple work clothes', 'are dressed in practical farming attire', 'are clad in worn work garments', 'wear simple, sturdy clothes', 'are dressed for hard work'],
  blacksmith: ['wear a leather apron', 'are dressed in soot-stained work clothes', 'are clad in protective smithing gear', 'wear a blacksmith\'s apron', 'are dressed for the forge'],
  healer: ['wear clean, white robes', 'are dressed in healer\'s garments', 'are clad in medical attire', 'wear healer\'s robes', 'are dressed in clean, white clothes'],
  scholar: ['wear scholarly robes', 'are dressed in academic attire', 'are clad in learned garments', 'wear scholar\'s robes', 'are dressed in academic clothes'],
  noble: ['wear expensive, fine clothes', 'are dressed in noble finery', 'are clad in luxurious garments', 'wear noble attire', 'are dressed in expensive fabrics'],
  thief: ['wear dark, practical clothes', 'are dressed in stealthy attire', 'are clad in dark, flexible garments', 'wear thief\'s gear', 'are dressed for stealth'],
  hunter: ['wear practical hunting gear', 'are dressed in outdoor attire', 'are clad in hunter\'s clothes', 'wear hunting gear', 'are dressed for the wilderness'],
  sailor: ['wear practical seafaring clothes', 'are dressed in sailor\'s attire', 'are clad in maritime gear', 'wear sailor\'s clothes', 'are dressed for the sea'],
  hermit: ['wear simple, worn clothes', 'are dressed in humble garments', 'are clad in simple attire', 'wear hermit\'s robes', 'are dressed in simple, worn clothes']
};

const PERSONALITY_TRAITS = [
  'cheerful and optimistic', 'serious and focused', 'mysterious and enigmatic', 'friendly and outgoing', 'quiet and contemplative',
  'bold and adventurous', 'cautious and careful', 'wise and thoughtful', 'energetic and enthusiastic', 'calm and collected',
  'passionate and intense', 'gentle and kind', 'fierce and determined', 'curious and inquisitive', 'loyal and trustworthy'
];

const QUIRKS = [
  'have a habit of collecting small trinkets', 'always hum while working', 'tap their fingers when thinking', 'have a nervous laugh', 'always check their reflection',
  'have a collection of interesting rocks', 'always carry a lucky charm', 'have a habit of organizing things', 'always smell of their favorite flower', 'have a distinctive way of speaking'
];

const HABITS = [
  'start each day with a specific ritual', 'always carry a particular tool', 'have a favorite spot to think', 'always greet people the same way', 'have a unique way of preparing for tasks',
  'always wear a particular piece of jewelry', 'have a habit of checking the weather', 'always carry a specific book', 'have a unique way of walking', 'always have a particular expression'
];

const FEATS = [
  'are legendary for their unmatched skill', 'are famous for a great achievement', 'are known for their wisdom', 'are respected for their knowledge', 'are admired for their courage',
  'are renowned for their craftsmanship', 'are celebrated for their heroism', 'are honored for their service', 'are praised for their innovation', 'are respected for their leadership'
];

// Generate description based on race, gender, and occupation
function generateDescription(race: string, gender: string, occupation: string): string {
  // Get physical description
  const racePhysical = PHYSICAL_DESCRIPTIONS[race as keyof typeof PHYSICAL_DESCRIPTIONS];
  const physicalDesc = racePhysical?.[gender as keyof typeof racePhysical] || ['tall and strong'];
  const physical = physicalDesc[Math.floor(Math.random() * physicalDesc.length)];
  
  // Get clothing description
  const clothingOptions = CLOTHING_DESCRIPTIONS[occupation as keyof typeof CLOTHING_DESCRIPTIONS] || ['wears practical clothes'];
  const clothingDesc = clothingOptions[Math.floor(Math.random() * clothingOptions.length)];
  
  // Get personality traits
  const personality = PERSONALITY_TRAITS[Math.floor(Math.random() * PERSONALITY_TRAITS.length)];
  
  // Get random quirks and habits
  const quirk = QUIRKS[Math.floor(Math.random() * QUIRKS.length)];
  const habit = HABITS[Math.floor(Math.random() * HABITS.length)];
  const feat = FEATS[Math.floor(Math.random() * FEATS.length)];
  
  // Build the description with proper grammar
  const description = `A ${gender} ${race} ${occupation} who is ${physical}. They ${clothingDesc} and are known for being ${personality}. They ${quirk} and ${habit}. They ${feat}.`;
  
  return description;
}

// Main NPC generation function
export function generateNPC(options: NPCOptions = {}): NPCData {
  // Step 1: Handle user inputs or generate missing data
  const race = options.race || generateRace();
  const gender = options.gender || generateGender();
  const occupation = options.occupation || generateOccupation();
  
  // Step 2: Generate name based on race and gender
  const name = generateName(race, gender, options.nameCulture);
  
  // Step 3: Generate description based on race, gender, and occupation
  const description = generateDescription(race, gender, occupation);
  
  return {
    name,
    race,
    gender,
    occupation,
    description
  };
}

// Generate multiple NPCs
export function generateMultipleNPCs(count: number, options: NPCOptions = {}): NPCData[] {
  const npcs: NPCData[] = [];
  for (let i = 0; i < count; i++) {
    npcs.push(generateNPC(options));
  }
  return npcs;
}

// Generate NPC with constraints
export function generateNPCWithConstraints(constraints: {
  race?: string;
  occupation?: string;
  gender?: string;
  nameCulture?: string;
}): NPCData {
  return generateNPC(constraints);
}