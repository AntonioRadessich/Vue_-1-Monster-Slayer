function getRandomValue(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}
function entitySpawn(percentage) {
  const spawnData = Math.floor(Math.random() * 100);
  var entity;
  if (spawnData < percentage) {
    entity = "monster";
  } else if (spawnData > 100 - percentage / 2) {
    entity = "chest";
  } else {
    entity = "grass";
  }
  return entity;
}

const app = Vue.createApp({
  created() {
    this.initGrid();
    while (this.enemyRemaining == 0 || this.enemyRemaining > 2) {
      this.enemyRemaining = 0;
      this.unopenedChest = 0;
      this.initGrid();
    }
  },
  data() {
    return {
      isMapShown: true,
      isInventoryShown: false,
      isLogShown: false,
      monsterHealth: 100,
      isFighting: false,
      playerHealth: 100,
      round: 0,
      winner: null,
      logMessages: [],
      xGridSize: 3,
      yGridSize: 3,
      mapGrid: [],
      enemyRemaining: 0,
      unopenedChest: 0,
      xPosition: 1,
      yPosition: 1,
      level: 1,
      inventory: [
        {
          potion: 0,
          medkit: 0,
          bandages: 0,
        },
        { venom: 0, dagger: 0, traps: 0 },
      ],
    };
  },
  computed: {
    monsterHealthBar() {
      if (this.monsterHealth < 0) {
        return { width: "0%" };
      }
      return { width: this.monsterHealth + "%" };
    },
    playerHealthBar() {
      if (this.playerHealth < 0) {
        return { width: "0%" };
      }
      return { width: this.playerHealth + "%" };
    },
    enableSpecialAttack() {
      return this.round % 3 !== 0;
    },
    enableMoveUp() {
      return this.xPosition <= 0;
    },
    enableMoveDown() {
      return this.xPosition >= this.xGridSize - 1;
    },
    enableMoveLeft() {
      return this.yPosition <= 0;
    },
    enableMoveRight() {
      return this.yPosition >= this.yGridSize - 1;
    },
    enableHeal() {
      return this.inventory[0].potion <= 0;
    },
  },
  watch: {
    xPosition(value, old) {
      if (this.mapGrid[value][this.yPosition] == "monster") {
        this.mapGrid[value][this.yPosition] = "fighting";
        this.mapGrid[old][this.yPosition] = "grass";
        this.isFighting = true;
      } else if (this.mapGrid[value][this.yPosition] == "chest") {
        this.mapGrid[value][this.yPosition] = "player";
        this.mapGrid[old][this.yPosition] = "grass";
        this.inventory[0].potion++;
        this.isFighting = false;
      } else {
        this.mapGrid[value][this.yPosition] = "player";
        this.mapGrid[old][this.yPosition] = "grass";
        this.isFighting = false;
      }
    },
    yPosition(value, old) {
      if (this.mapGrid[this.xPosition][value] == "monster") {
        this.mapGrid[this.xPosition][value] = "fighting";
        this.mapGrid[this.xPosition][old] = "grass";
        this.isFighting = true;
      } else if (this.mapGrid[this.xPosition][value] == "chest") {
        this.mapGrid[this.xPosition][value] = "player";
        this.mapGrid[this.xPosition][old] = "grass";
        this.inventory[0].potion++;
        this.isFighting = false;
      } else {
        this.mapGrid[this.xPosition][value] = "player";
        this.mapGrid[this.xPosition][old] = "grass";
        this.isFighting = false;
      }
    },
    playerHealth(value) {
      if (value <= 0) {
        this.winner = "monster";
      }
    },
    monsterHealth(value) {
      if (value <= 0) {
        this.enemyRemaining--;
        this.mapGrid[this.xPosition][this.yPosition] = "player";
        this.isFighting = false;
      }
    },
    enemyRemaining(value) {
      if (value == 0) {
        this.newGame();
        this.level++;
      } else {
        this.monsterHealth = 100;
      }
    },
    level(value) {
      if (value % 2 == 0) {
        this.xGridSize++;
        this.yGridSize++;
      }
    },
  },
  methods: {
    initGrid() {
      for (let i = 0; i < this.xGridSize; i++) {
        this.mapGrid[i] = [];
        for (let j = 0; j < this.yGridSize; j++) {
          const entitySpawned = entitySpawn(10 * (this.level / 2));
          if (i == this.xPosition && j == this.yPosition) {
            this.mapGrid[i][j] = "player";
          } else {
            if (entitySpawned == "monster") {
              this.enemyRemaining++;
              this.mapGrid[i][j] = "monster";
            } else if (entitySpawned == "chest") {
              this.unopenedChest++;
              this.mapGrid[i][j] = "chest";
            } else {
              this.mapGrid[i][j] = "grass";
            }
          }
        }
      }
    },
    newGame() {
      this.playerHealth = 100;
      this.monsterHealth = 100;
      this.winner = null;
      this.round = 0;
      this.logMessages = [];
      this.isFighting = false;
      this.enemyRemaining = 0;
      this.unopenedChest = 0;
      this.xPosition = 1;
      this.yPosition = 1;
      this.inventory = [
        {
          potion: 0,
          medkit: 0,
          bandages: 0,
        },
        { venom: 0, dagger: 0, traps: 0 },
      ];
      while (this.enemyRemaining == 0 || this.enemyRemaining > this.level * 2) {
        this.enemyRemaining = 0;
        this.unopenedChest = 0;
        this.initGrid();
      }
    },
    showMap() {
      this.isMapShown = !this.isMapShown;
      this.isInventoryShown = false;
      this.isLogShown = false;
    },
    showLogs() {
      this.isLogShown = !this.isLogShown;
      this.isInventoryShown = false;
      this.isMapShown = false;
    },
    showInventory() {
      this.isInventoryShown = !this.isInventoryShown;
      this.isLogShown = false;
      this.isMapShown = false;
    },
    moveUp() {
      this.xPosition--;
      this.round++;
    },
    moveDown() {
      this.xPosition++;
      this.round++;
    },
    moveLeft() {
      this.yPosition--;
      this.round++;
    },
    moveRight() {
      this.yPosition++;
      this.round++;
    },
    attackMonster() {
      this.round++;
      const damage = getRandomValue(5, 12);
      this.monsterHealth -= damage;
      this.addLogMessage("player", "attack", damage);
      this.attackPlayer();
    },
    attackPlayer() {
      const damage = getRandomValue(8, 15);
      this.playerHealth -= damage;
      this.addLogMessage("monster", "attack", damage);
    },
    specialAttack() {
      this.round++;
      const damage = getRandomValue(10, 25);
      this.monsterHealth -= damage;
      this.addLogMessage("player", "attack", damage);
      this.attackPlayer();
    },
    healPlayer() {
      this.round++;
      if (this.inventory[0].potion > 0) {
        this.inventory[0].potion--;
        const healValue = getRandomValue(2, 20);
        if (this.playerHealth + healValue <= 100) {
          this.playerHealth += healValue;
        } else {
          this.playerHealth = 100;
        }
        this.addLogMessage("player", "heal", healValue);
      }
    },
    surrender() {
      this.winner = "monster";
      this.level = 1;
    },
    addLogMessage(who, what, value) {
      this.logMessages.unshift({
        actionBy: who,
        actionType: what,
        actionValue: value,
      });
    },
  },
});

app.mount("#game");
