/**
 * 卡牌遊戲控制中心
 * 負責協調所有模組的運作和通信
 */

// 導入模組
import { UIManager } from './modules/UIManager.js';
import { CardManager } from './modules/CardManager.js';
import { BattleManager } from './modules/BattleManager.js';
import { PlayerManager } from './modules/PlayerManager.js';
import { EnemyManager } from './modules/EnemyManager.js';
import { EffectManager } from './modules/EffectManager.js';
import { SoundManager } from './modules/SoundManager.js';
import { AnimationManager } from './modules/AnimationManager.js';
import { SaveManager } from './modules/SaveManager.js';
import { AchievementManager } from './modules/AchievementManager.js';
import { ResourceManager } from './modules/ResourceManager.js';
import { Logger } from './modules/Logger.js';
import { uiTexts } from './modules/uiTexts.js';
import { imageAssets } from './modules/imageAssets.js';

// 遊戲狀態
const GameState = {
  // 當前屏幕
  currentScreen: 'mainMenu', // 'mainMenu', 'battle', 'gameOver'
  
  // 玩家狀態
  player: {
    health: 100,
    maxHealth: 100,
    mana: 3,
    maxMana: 3,
    gold: 0,
    level: 1,
    experience: 0
  },
  
  // 敵人狀態
  enemy: {
    id: '',
    name: '',
    health: 0,
    maxHealth: 0,
    attack: 0,
    image: ''
  },
  
  // 卡牌狀態
  cards: {
    deck: [],
    hand: [],
    discardPile: []
  },
  
  // 戰鬥狀態
  battle: {
    isPlayerTurn: true,
    activeEffects: [],
    isGameOver: false,
    isVictory: false
  },
  
  // 遊戲進度
  progress: {
    unlockedLevels: [1],
    ownedCards: [],
    equippedCards: [],
    achievements: [],
    stats: {
      totalDamageDealt: 0,
      totalHealing: 0,
      totalGoldEarned: 0,
      totalBattlesWon: 0,
      totalCardsPlayed: 0,
      totalDamageTaken: 0
    }
  },
  
  // 設置
  settings: {
    musicVolume: 0.5,
    soundVolume: 0.5,
    difficulty: 'normal'
  }
};

/**
 * 遊戲控制器
 */
class GameController {
  constructor() {
    // 初始化日誌管理器
    this.logger = new Logger('GameController');
    this.logger.info('初始化遊戲控制器');
    
    // 初始化所有管理器
    this.uiManager = new UIManager(this);
    this.cardManager = new CardManager(this);
    this.battleManager = new BattleManager(this);
    this.playerManager = new PlayerManager(this);
    this.enemyManager = new EnemyManager(this);
    this.effectManager = new EffectManager(this);
    this.soundManager = new SoundManager(this);
    this.animationManager = new AnimationManager(this);
    this.saveManager = new SaveManager(this);
    this.achievementManager = new AchievementManager(this);
    this.resourceManager = new ResourceManager(this);
    
    // 遊戲狀態
    this.state = { ...GameState };
    
    // 事件監聽器
    this.eventListeners = {};
    
    // UI文字和圖片資源
    this.uiTexts = uiTexts;
    this.imageAssets = imageAssets;
  }
  
  /**
   * 初始化遊戲
   */
  init() {
    this.logger.info('初始化遊戲...');
    
    try {
      // 加載資源
      this.resourceManager.loadResources(() => {
        try {
          // 初始化UI
          this.uiManager.init();
          
          // 初始化音效
          this.soundManager.init();
          
          // 加載存檔
          const savedGame = this.saveManager.loadGame();
          if (savedGame) {
            this.state.progress = savedGame;
          }
          
          // 顯示主菜單
          this.showScreen('mainMenu');
          
          // 播放背景音樂
          this.soundManager.playBGM(this.imageAssets.audio.bgm.menu);
          
          this.logger.info('遊戲初始化完成');
        } catch (error) {
          this.logger.error('遊戲初始化失敗', error);
          this.uiManager.showToast(this.uiTexts.errors.initFailed);
        }
      });
      
      // 設置全局事件監聽
      this._setupEventListeners();
    } catch (error) {
      this.logger.error('資源加載失敗', error);
      this.uiManager.showToast(this.uiTexts.errors.resourceLoadFailed);
    }
  }
  
  /**
   * 設置事件監聽器
   */
  _setupEventListeners() {
    try {
      // 卡牌點擊事件
      this.addEventListener('cardClicked', (cardIndex) => {
        this.playCard(cardIndex);
      });
      
      // 結束回合按鈕事件
      this.addEventListener('endTurnClicked', () => {
        this.endTurn();
      });
      
      // 開始新遊戲事件
      this.addEventListener('newGameClicked', () => {
        this.startNewGame();
      });
      
      // 載入遊戲事件
      this.addEventListener('loadGameClicked', () => {
        this.loadGame();
      });
      
      // 選擇關卡事件
      this.addEventListener('levelSelected', (levelId) => {
        this.startBattle(levelId);
      });
      
      // 返回主菜單事件
      this.addEventListener('backToMenuClicked', () => {
        this.showScreen('mainMenu');
      });
      
      // 繼續遊戲事件
      this.addEventListener('continueClicked', () => {
        this.showScreen('levelSelect');
      });
      
      // 設置事件
      this.addEventListener('settingsChanged', (settings) => {
        this.updateSettings(settings);
      });
      
      this.logger.info('事件監聽器設置完成');
    } catch (error) {
      this.logger.error('設置事件監聽器失敗', error);
    }
  }
  
  /**
   * 添加事件監聽器
   */
  addEventListener(event, callback) {
    try {
      if (!this.eventListeners[event]) {
        this.eventListeners[event] = [];
      }
      this.eventListeners[event].push(callback);
      this.logger.debug(`添加事件監聽器: ${event}`);
    } catch (error) {
      this.logger.error(`添加事件監聽器失敗: ${event}`, error);
    }
  }
  
  /**
   * 觸發事件
   */
  triggerEvent(event, data) {
    try {
      if (this.eventListeners[event]) {
        this.logger.debug(`觸發事件: ${event}`);
        this.eventListeners[event].forEach(callback => callback(data));
      }
    } catch (error) {
      this.logger.error(`觸發事件失敗: ${event}`, error);
    }
  }
  
  /**
   * 更新遊戲設置
   */
  updateSettings(settings) {
    try {
      this.state.settings = { ...this.state.settings, ...settings };
      this.soundManager.updateVolume();
      this.saveManager.saveSettings(this.state.settings);
      this.logger.info('遊戲設置已更新');
    } catch (error) {
      this.logger.error('更新設置失敗', error);
    }
  }
  
  /**
   * 顯示指定屏幕
   */
  showScreen(screenName) {
    try {
      this.state.currentScreen = screenName;
      this.uiManager.showScreen(screenName);
      
      // 根據屏幕播放不同的背景音樂
      switch (screenName) {
        case 'mainMenu':
          this.soundManager.playBGM(this.imageAssets.audio.bgm.menu);
          break;
        case 'battle':
          this.soundManager.playBGM('battle');
          break;
        case 'gameOver':
          if (this.state.battle.isVictory) {
            this.soundManager.playBGM('victory');
          } else {
            this.soundManager.playBGM('defeat');
          }
          break;
      }
      
      // 播放屏幕切換動畫
      this.animationManager.playScreenTransition();
      this.logger.info(`切換到屏幕: ${screenName}`);
    } catch (error) {
      this.logger.error(`切換屏幕失敗: ${screenName}`, error);
    }
  }
  
  /**
   * 開始新遊戲
   */
  startNewGame() {
    try {
      this.logger.info('開始新遊戲');
      
      // 重置玩家狀態
      this.state.player = {
        health: 100,
        maxHealth: 100,
        mana: 3,
        maxMana: 3,
        gold: 0,
        level: 1,
        experience: 0
      };
      
      // 重置卡牌狀態
      this.state.cards = {
        deck: [],
        hand: [],
        discardPile: []
      };
      
      // 重置戰鬥狀態
      this.state.battle = {
        isPlayerTurn: true,
        activeEffects: [],
        isGameOver: false,
        isVictory: false
      };
      
      // 保留遊戲進度和設置
      this.saveManager.saveGame(this.state.progress);
      
      // 顯示關卡選擇屏幕
      this.showScreen('levelSelect');
    } catch (error) {
      this.logger.error('開始新遊戲失敗', error);
      this.uiManager.showToast(this.uiTexts.errors.newGameFailed);
    }
  }

  /**
   * 載入遊戲
   */
  loadGame() {
    try {
      this.logger.info('載入遊戲');
      
      const savedGame = this.saveManager.loadGame();
      if (savedGame) {
        this.state.progress = savedGame;
        
        // 重置戰鬥狀態
        this.state.player = {
          health: 100,
          maxHealth: 100,
          mana: 3,
          maxMana: 3,
          gold: savedGame.stats.totalGoldEarned || 0,
          level: savedGame.stats.level || 1,
          experience: savedGame.stats.experience || 0
        };
        
        // 顯示關卡選擇屏幕
        this.showScreen('levelSelect');
      } else {
        this.uiManager.showToast(this.uiTexts.errors.noSaveFound);
      }
    } catch (error) {
      this.logger.error('載入遊戲失敗', error);
      this.uiManager.showToast(this.uiTexts.errors.loadGameFailed);
    }
  }

      /**
     * 給予獎勵
     */
      giveRewards(level) {
        try {
          const goldReward = level.rewards.gold;
          const expReward = level.rewards.experience;
          
          // 獲得金幣
          this.state.player.gold += goldReward;
          this.state.progress.stats.totalGoldEarned += goldReward;
          
          // 獲得經驗值
          this.state.player.experience += expReward;
          
          // 檢查是否升級
          const expNeeded = this.state.player.level * 100;
          if (this.state.player.experience >= expNeeded) {
            this.state.player.level += 1;
            this.state.player.experience -= expNeeded;
            this.state.player.maxHealth += 10;
            this.state.player.maxMana += 1;
            
            // 播放升級音效
            this.soundManager.play(this.imageAssets.audio.sfx.levelUp);
            
            this.uiManager.showToast(this.uiTexts.battle.levelUp);
          }
          
          // 解鎖下一關
          if (level.id < this.resourceManager.getLevelsCount() && !this.state.progress.unlockedLevels.includes(level.id + 1)) {
            this.state.progress.unlockedLevels.push(level.id + 1);
            
            const nextLevel = this.resourceManager.getLevelById(level.id + 1);
            if (nextLevel) {
              this.uiManager.showToast(this.uiTexts.battle.newLevelUnlocked.replace('{levelName}', nextLevel.name));
            }
          }
          
          // 獲得卡牌獎勵
          if (level.rewards.cards && level.rewards.cards.length > 0) {
            for (const cardId of level.rewards.cards) {
              if (!this.state.progress.ownedCards.includes(cardId)) {
                this.state.progress.ownedCards.push(cardId);
                
                const card = this.resourceManager.getCardById(cardId);
                if (card) {
                  this.uiManager.showToast(this.uiTexts.battle.newCardUnlocked.replace('{cardName}', card.name));
                }
              }
            }
          }
          
          this.logger.info(`獎勵發放完成，金幣: ${goldReward}, 經驗: ${expReward}`);
        } catch (error) {
          this.logger.error('獎勵發放失敗', error);
          this.uiManager.showToast(this.uiTexts.errors.rewardsFailed);
        }
      }
      
      /**
       * 購買卡牌
       */
      buyCard(cardId) {
        try {
          const card = this.resourceManager.getCardById(cardId);
          if (!card) {
            this.logger.error(`找不到卡牌: ${cardId}`);
            this.uiManager.showToast(this.uiTexts.errors.cardNotFound);
            return false;
          }
          
          if (this.state.progress.ownedCards.includes(cardId)) {
            this.logger.warn(`已擁有卡牌: ${cardId}`);
            this.uiManager.showToast(this.uiTexts.shop.alreadyOwned);
            return false;
          }
          
          if (this.state.player.gold < card.price) {
            this.logger.warn(`金幣不足，需要: ${card.price}, 擁有: ${this.state.player.gold}`);
            this.uiManager.showToast(this.uiTexts.shop.notEnoughGold);
            return false;
          }
          
          // 扣除金幣
          this.state.player.gold -= card.price;
          
          // 添加到擁有的卡牌
          this.state.progress.ownedCards.push(cardId);
          
          // 播放購買音效
          this.soundManager.play(this.imageAssets.audio.sfx.purchase);
          
          // 保存遊戲
          this.saveManager.saveGame(this.state.progress);
          
          this.logger.info(`購買卡牌成功: ${card.name}`);
          this.uiManager.showToast(this.uiTexts.shop.purchaseSuccess.replace('{cardName}', card.name));
          
          return true;
        } catch (error) {
          this.logger.error('購買卡牌失敗', error);
          this.uiManager.showToast(this.uiTexts.errors.purchaseFailed);
          return false;
        }
      }
      
      /**
       * 裝備卡牌
       */
      equipCard(cardId) {
        try {
          if (!this.state.progress.ownedCards.includes(cardId)) {
            this.logger.warn(`未擁有卡牌: ${cardId}`);
            this.uiManager.showToast(this.uiTexts.errors.cardNotOwned);
            return false;
          }
          
          if (this.state.progress.equippedCards.includes(cardId)) {
            this.logger.warn(`卡牌已裝備: ${cardId}`);
            return false;
          }
          
          // 檢查牌組上限
          const maxDeckSize = 20;
          if (this.state.progress.equippedCards.length >= maxDeckSize) {
            this.logger.warn(`牌組已滿，上限: ${maxDeckSize}`);
            this.uiManager.showToast(this.uiTexts.deck.deckFull);
            return false;
          }
          
          // 添加到裝備的卡牌
          this.state.progress.equippedCards.push(cardId);
          
          // 播放裝備音效
          this.soundManager.play(this.imageAssets.audio.sfx.equip);
          
          // 保存遊戲
          this.saveManager.saveGame(this.state.progress);
          
          const card = this.resourceManager.getCardById(cardId);
          this.logger.info(`裝備卡牌成功: ${card ? card.name : cardId}`);
          
          return true;
        } catch (error) {
          this.logger.error('裝備卡牌失敗', error);
          this.uiManager.showToast(this.uiTexts.errors.equipFailed);
          return false;
        }
      }
      
      /**
       * 卸下卡牌
       */
      unequipCard(cardId) {
        try {
          const cardIndex = this.state.progress.equippedCards.indexOf(cardId);
          if (cardIndex === -1) {
            this.logger.warn(`卡牌未裝備: ${cardId}`);
            return false;
          }
          
          // 從裝備的卡牌中移除
          this.state.progress.equippedCards.splice(cardIndex, 1);
          
          // 播放卸下音效
          this.soundManager.play(this.imageAssets.audio.sfx.unequip);
          
          // 保存遊戲
          this.saveManager.saveGame(this.state.progress);
          
          const card = this.resourceManager.getCardById(cardId);
          this.logger.info(`卸下卡牌成功: ${card ? card.name : cardId}`);
          
          return true;
        } catch (error) {
          this.logger.error('卸下卡牌失敗', error);
          this.uiManager.showToast(this.uiTexts.errors.unequipFailed);
          return false;
        }
      }
      
      /**
       * 使用道具
       */
      useItem(itemId) {
        try {
          const item = this.resourceManager.getItemById(itemId);
          if (!item) {
            this.logger.error(`找不到道具: ${itemId}`);
            this.uiManager.showToast(this.uiTexts.errors.itemNotFound);
            return false;
          }
          
          if (!this.state.progress.items || !this.state.progress.items[itemId] || this.state.progress.items[itemId] <= 0) {
            this.logger.warn(`未擁有道具: ${itemId}`);
            this.uiManager.showToast(this.uiTexts.errors.itemNotOwned);
            return false;
          }
          
          // 應用道具效果
          switch (item.type) {
            case 'heal':
              this.state.player.health = Math.min(this.state.player.maxHealth, this.state.player.health + item.value);
              this.uiManager.showToast(this.uiTexts.items.healed.replace('{value}', item.value));
              break;
            case 'maxHealthUp':
              this.state.player.maxHealth += item.value;
              this.state.player.health += item.value;
              this.uiManager.showToast(this.uiTexts.items.maxHealthIncreased.replace('{value}', item.value));
              break;
            case 'maxManaUp':
              this.state.player.maxMana += item.value;
              this.state.player.mana += item.value;
              this.uiManager.showToast(this.uiTexts.items.maxManaIncreased.replace('{value}', item.value));
              break;
            default:
              this.logger.warn(`未知的道具類型: ${item.type}`);
              return false;
          }
          
          // 減少道具數量
          this.state.progress.items[itemId] -= 1;
          
          // 播放使用道具音效
          this.soundManager.play(this.imageAssets.audio.sfx.useItem);
          
          // 保存遊戲
          this.saveManager.saveGame(this.state.progress);
          
          this.logger.info(`使用道具成功: ${item.name}`);
          
          return true;
        } catch (error) {
          this.logger.error('使用道具失敗', error);
          this.uiManager.showToast(this.uiTexts.errors.useItemFailed);
          return false;
        }
      }
      
      /**
       * 購買道具
       */
      buyItem(itemId) {
        try {
          const item = this.resourceManager.getItemById(itemId);
          if (!item) {
            this.logger.error(`找不到道具: ${itemId}`);
            this.uiManager.showToast(this.uiTexts.errors.itemNotFound);
            return false;
          }
          
          if (this.state.player.gold < item.price) {
            this.logger.warn(`金幣不足，需要: ${item.price}, 擁有: ${this.state.player.gold}`);
            this.uiManager.showToast(this.uiTexts.shop.notEnoughGold);
            return false;
          }
          
          // 扣除金幣
          this.state.player.gold -= item.price;
          
          // 添加道具
          if (!this.state.progress.items) {
            this.state.progress.items = {};
          }
          
          if (!this.state.progress.items[itemId]) {
            this.state.progress.items[itemId] = 0;
          }
          
          this.state.progress.items[itemId] += 1;
          
          // 播放購買音效
          this.soundManager.play(this.imageAssets.audio.sfx.purchase);
          
          // 保存遊戲
          this.saveManager.saveGame(this.state.progress);
          
          this.logger.info(`購買道具成功: ${item.name}`);
          this.uiManager.showToast(this.uiTexts.shop.purchaseSuccess.replace('{itemName}', item.name));
          
          return true;
        } catch (error) {
          this.logger.error('購買道具失敗', error);
          this.uiManager.showToast(this.uiTexts.errors.purchaseFailed);
          return false;
        }
      }
      
      /**
       * 解鎖成就
       */
      unlockAchievement(achievementId) {
        try {
          if (this.state.progress.achievements.includes(achievementId)) {
            return false;
          }
          
          const achievement = this.resourceManager.getAchievementById(achievementId);
          if (!achievement) {
            this.logger.error(`找不到成就: ${achievementId}`);
            return false;
          }
          
          // 添加到已解鎖成就
          this.state.progress.achievements.push(achievementId);
          
          // 播放成就解鎖音效
          this.soundManager.play(this.imageAssets.audio.sfx.achievement);
          
          // 顯示成就解鎖提示
          this.uiManager.showAchievementUnlocked(achievement);
          
          // 保存遊戲
          this.saveManager.saveGame(this.state.progress);
          
          this.logger.info(`解鎖成就: ${achievement.name}`);
          
          return true;
        } catch (error) {
          this.logger.error('解鎖成就失敗', error);
          return false;
        }
      }
      
      /**
       * 重置遊戲
       */
      resetGame() {
        try {
          this.logger.info('重置遊戲');
          
          // 重置遊戲狀態
          this.state = { ...GameState };
          
          // 清除存檔
          this.saveManager.clearSave();
          
          // 顯示主菜單
          this.showScreen('mainMenu');
          
          this.uiManager.showToast(this.uiTexts.settings.gameReset);
        } catch (error) {
          this.logger.error('重置遊戲失敗', error);
          this.uiManager.showToast(this.uiTexts.errors.resetGameFailed);
        }
      }
  }
  
  // 導出遊戲控制器
  export default GameController;