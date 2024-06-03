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
    description: 'Start',
    coordinate: {
      latitude: 52.95470503005084,
      longitude: -1.137858308814747,
    },
    image: require('@/assets/images/sneinton-market.png'),
  },
  {
    id: '2',
    title: 'William Booth statue/Museum',
    description: 'A famous landmark',
    coordinate: {
      latitude: 52.95218228920473,
      longitude: -1.1317076062214408,
    },
    image: require('@/assets/images/william-booth.png'),
  },
  {
    id: '3',
    title: 'Saint Stephen’s Church',
    description: 'A famous landmark',
    coordinate: {
      latitude: 52.95110314765308,
      longitude: -1.1315913678468925,
    },
    image: require('@/assets/images/saint-stephens-church.png'),
  },
  {
    id: '4',
    title: 'Green’s Windmill',
    description: 'A famous landmark',
    coordinate: {
      latitude: 52.95206805461328,
      longitude: -1.129385057166798,
    },
    image: require('@/assets/images/greens-windmill.png'),
  },
  {
    id: '5',
    title: 'Sultania Mosque',
    description: 'A famous landmark',
    coordinate: {
      latitude: 52.952021424623865,
      longitude: -1.1260245544918952,
    },
    image: require('@/assets/images/sultania-mosque.png'),
  },
  {
    id: '6',
    title: 'Dales Centre Library',
    description: 'A famous landmark',
    coordinate: {
      latitude: 52.95473759877742,
      longitude: -1.1208745350120322,
    },
    image: require('@/assets/images/dales-centre-library.png'),
  },
  {
    id: '7',
    title: 'Sneinton Boulevard',
    description: 'A famous landmark',
    coordinate: {
      latitude: 52.95179914043994,
      longitude: -1.122674937843758,
    },
    image: require('@/assets/images/sneinton-boulevard.png'),
  },
  {
    id: '8',
    title: 'Community Hub Sneinton',
    description: 'A famous landmark',
    coordinate: {
      latitude: 52.95047755859033,
      longitude: -1.1262303721032474,
    },
    image: require('@/assets/images/community-hub.png'),
  },
  {
    id: '9',
    title: 'St. Christopher’s Church',
    description: 'A famous landmark',
    coordinate: {
      latitude: 52.9501175853853,
      longitude: -1.1241563810338335,
    },
    image: require('@/assets/images/stchristophers-church.png'),
  },
  {
    id: '10',
    title: 'Former Bendigo/wrestlers arms public house',
    description: 'A famous landmark',
    coordinate: {
      latitude: 52.95031467368414,
      longitude: -1.129093558640146,
    },
    image: require('@/assets/images/former-bendigo.png'),
  },
  {
    id: '11',
    title: 'Sneinton Hermitage Caves',
    description: 'A famous landmark',
    coordinate: {
      latitude: 52.94879513918782,
      longitude: -1.1311020059251706,
    },
    image: require('@/assets/images/caves.png'),
  },
  {
    id: '12',
    title: 'The Sneinton Dragon',
    description: 'End',
    coordinate: {
      latitude: 52.949043287596595,
      longitude: -1.1330527703839708,
    },
    image: require('@/assets/images/sneinton-dragon.png'),
  },
];
