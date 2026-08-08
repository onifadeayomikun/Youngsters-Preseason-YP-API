export const clubs = [
  {
    id: 1,
    name: "Arsenal",
    slang: "Gunners",
    country: "England",
    city: "London",
    seasonsAvailable: 3,
    preseason: [
      {
        season: "2022-23",
        youngsters: [
          { player: "Ethan Nwaneri", playerId: 1001, age: 17, appearances: 0 },
          { player: "Lewis Skelly", playerId: 1002, age: 19, appearances: 24 }
        ]
      },
      {
        season: "2023-24",
        youngsters: [
          { player: "Ethan Nwaneri", playerId: 1001, age: 18, appearances: 12 },
          { player: "Butler Oyedeji", playerId: 1003, age: 19, appearances: 31 }
        ]
      },
      {
        season: "2024-25",
        youngsters: [
          { player: "Ethan Nwaneri", playerId: 1001, age: 19, appearances: 35 },
          { player: "Max Dowman", playerId: 1004, age: 18, appearances: 8 }
        ]
      }
    ]
  },

  {
    id: 2,
    name: "Chelsea",
    slang: "Blues",
    country: "England",
    city: "London",
    seasonsAvailable: 2,
    preseason: [
      {
        season: "2023-24",
        youngsters: [
          { player: "Lewis Hall", playerId: 1005, age: 18, appearances: 15 },
          { player: "Levi Colwill", playerId: 1006, age: 20, appearances: 47 }
        ]
      },
      {
        season: "2024-25",
        youngsters: [
          { player: "Lewis Hall", playerId: 1005, age: 19, appearances: 28 },
          { player: "Alfie Gilchrist", playerId: 1007, age: 18, appearances: 3 }
        ]
      }
    ]
  },

  {
    id: 3,
    name: "Liverpool",
    slang: "The Reds",
    country: "England",
    city: "Liverpool",
    seasonsAvailable: 2,
    preseason: [
      {
        season: "2023-24",
        youngsters: [
          { player: "Trey Nyoni", playerId: 1008, age: 18, appearances: 5 },
          { player: "Jarell Quansah", playerId: 1009, age: 20, appearances: 62 }
        ]
      },
      {
        season: "2024-25",
        youngsters: [
          { player: "Trey Nyoni", playerId: 1008, age: 19, appearances: 22 },
          { player: "Coalim Keheller", playerId: 1010, age: 18, appearances: 0 }
        ]
      }
    ]
  }
];


export const players = [
  {
    id: 1001,
    player: "Ethan Nwaneri",
    nationality: "England",
    position: "Midfielder",
    club: "Arsenal"
  },

  {
    id: 1002,
    player: "Lewis Skelly",
    nationality: "England",
    position: "Midfielder",
    club: "Arsenal"
  },

  {
    id: 1003,
    player: "Butler Oyedeji",
    nationality: "England",
    position: "Forward",
    club: "Arsenal"
  },

  {
    id: 1004,
    player: "Max Dowman",
    nationality: "England",
    position: "Forward",
    club: "Arsenal"
  },

  {
    id: 1005,
    player: "Lewis Hall",
    nationality: "England",
    position: "Defender",
    club: "Chelsea"
  },

  {
    id: 1006,
    player: "Levi Colwill",
    nationality: "England",
    position: "Defender",
    club: "Chelsea"
  },

  {
    id: 1007,
    player: "Alfie Gilchrist",
    nationality: "England",
    position: "Defender",
    club: "Chelsea"
  },

  {
    id: 1008,
    player: "Trey Nyoni",
    nationality: "England",
    position: "Forward",
    club: "Liverpool"
  },

  {
    id: 1009,
    player: "Jarell Quansah",
    nationality: "England",
    position: "Defender",
    club: "Liverpool"
  },

  {
    id: 1010,
    player: "Coalim Keheller",
    nationality: "England",
    position: "Goalkeeper",
    club: "Liverpool"
  }
];