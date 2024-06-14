export interface Landmark {
  id: string;
  title: string;
  description: string;
  coordinate: {
    latitude: number;
    longitude: number;
  };
  image: any;
}

export const landmarks: Landmark[] = [
  {
    id: '1',
    title: 'Sneinton Market',
    description: 'Sneinton Market is a historic market square in the heart of Nottingham, known for its vibrant atmosphere and eclectic mix of independent shops, cafes, and stalls. It has been a focal point for the community since the 19th century.',
    coordinate: {
      latitude: 52.95470503005084,
      longitude: -1.137858308814747,
    },
    image: require('@/assets/images/sneinton-market.png'),
  },
  {
    id: '2',
    title: 'William Booth Statue/Museum',
    description: 'This statue commemorates William Booth, the founder of the Salvation Army. The adjacent museum offers a deep dive into his life, work, and the impact of the Salvation Army on society.',
    coordinate: {
      latitude: 52.95218228920473,
      longitude: -1.1317076062214408,
    },
    image: require('@/assets/images/william-booth.png'),
  },
  {
    id: '3',
    title: 'Saint Stephen’s Church',
    description: 'Saint Stephen’s Church is a beautiful example of Gothic Revival architecture. It has been serving the community since the 19th century and is known for its stunning stained glass windows and tranquil atmosphere.',
    coordinate: {
      latitude: 52.95110314765308,
      longitude: -1.1315913678468925,
    },
    image: require('@/assets/images/saint-stephens-church.png'),
  },
  {
    id: '4',
    title: 'Green’s Windmill',
    description: 'Green’s Windmill is a restored 19th-century tower mill. It was once owned by the mathematical physicist George Green, and it now serves as a museum dedicated to his work and the history of milling.',
    coordinate: {
      latitude: 52.95206805461328,
      longitude: -1.129385057166798,
    },
    image: require('@/assets/images/greens-windmill.jpg'),
  },
  {
    id: '5',
    title: 'Sultania Mosque',
    description: 'Sultania Mosque is a significant place of worship for the local Muslim community. It is known for its beautiful architecture and welcoming environment, offering insight into the Islamic faith and culture.',
    coordinate: {
      latitude: 52.952021424623865,
      longitude: -1.1260245544918952,
    },
    image: require('@/assets/images/sultania-mosque.jpg'),
  },
  {
    id: '6',
    title: 'Dales Centre Library',
    description: 'Dales Centre Library is a modern community hub offering a wide range of books, digital resources, and community events. It is a popular spot for learning and social gatherings.',
    coordinate: {
      latitude: 52.95473759877742,
      longitude: -1.1208745350120322,
    },
    image: require('@/assets/images/dales-centre-library.png'),
  },
  {
    id: '7',
    title: 'Sneinton Boulevard',
    description: 'Sneinton Boulevard is a lively street known for its diverse community and vibrant local culture. It is lined with shops, eateries, and community spaces, reflecting the area’s rich cultural heritage.',
    coordinate: {
      latitude: 52.95179914043994,
      longitude: -1.122674937843758,
    },
    image: require('@/assets/images/sneinton-boulevard.png'),
  },
  {
    id: '8',
    title: 'Community Hub Sneinton',
    description: 'The Community Hub in Sneinton is a central spot for local residents to gather, engage in activities, and access various services. It plays a vital role in fostering community spirit and support.',
    coordinate: {
      latitude: 52.95047755859033,
      longitude: -1.1262303721032474,
    },
    image: require('@/assets/images/community-hub.png'),
  },
  {
    id: '9',
    title: 'St. Christopher’s Church',
    description: 'St. Christopher’s Church is a charming historic church known for its active congregation and community events. It features traditional architecture and a peaceful setting.',
    coordinate: {
      latitude: 52.9501175853853,
      longitude: -1.1241563810338335,
    },
    image: require('@/assets/images/stchristophers-church.png'),
  },
  {
    id: '10',
    title: 'Former Bendigo/Wrestlers Arms Public House',
    description: 'This former public house is named after William “Bendigo” Thompson, a famous 19th-century boxer. It’s a historical site that offers a glimpse into the local history and culture.',
    coordinate: {
      latitude: 52.95031467368414,
      longitude: -1.129093558640146,
    },
    image: require('@/assets/images/former-bendigo.jpg'),
  },
  {
    id: '11',
    title: 'Sneinton Hermitage Caves',
    description: 'The Sneinton Hermitage Caves are a series of man-made caves with a rich history. They were used for various purposes over the centuries and are now an intriguing historical site.',
    coordinate: {
      latitude: 52.94879513918782,
      longitude: -1.1311020059251706,
    },
    image: require('@/assets/images/caves.png'),
  },
  {
    id: '12',
    title: 'The Sneinton Dragon',
    description: 'The Sneinton Dragon is a striking sculpture and a local landmark. It symbolizes the area’s cultural diversity and creative spirit, making it a popular spot for both locals and visitors.',
    coordinate: {
      latitude: 52.949043287596595,
      longitude: -1.1330527703839708,
    },
    image: require('@/assets/images/sneinton-dragon.png'),
  },
];
