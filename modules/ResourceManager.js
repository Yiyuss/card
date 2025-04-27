/**
 * 資源管理器模組
 * 負責加載和管理遊戲中的所有資源，包括卡牌、關卡、敵人、道具和成就等數據
 */

import { Logger } from './Logger.js';
import { imageAssets } from './imageAssets.js';

export class ResourceManager {
  constructor(gameController) {
    this.gameController = gameController;
    this.logger = new Logger('ResourceManager');
    this.logger.info('初始化資源管理器');
    
    // 資源數據
    this.cards = [];
    this.levels = [];
    this.enemies = [];
    this.items = [];
    this.achievements = [];
    
    // 資源加載狀態
    this.loadingStatus = {
      total: 5, // 需要加載的資源類型數量
      loaded: 0,
      isComplete: false
    };
  }
  
  /**
   * 加載所有資源
   * @param {Function} callback - 資源加載完成後的回調函數
   */
  loadResources(callback) {
    this.logger.info('開始加載資源...');
    
    try {
      // 重置加載狀態
      this.loadingStatus = {
        total: 5,
        loaded: 0,
        isComplete: false
      };
      
      // 加載卡牌數據
      this._loadCards(() => {
        this._resourceLoaded('卡牌數據');
        
        // 加載關卡數據
        this._loadLevels(() => {
          this._resourceLoaded('關卡數據');
          
          // 加載敵人數據
          this._loadEnemies(() => {
            this._resourceLoaded('敵人數據');
            
            // 加載道具數據
            this._loadItems(() => {
              this._resourceLoaded('道具數據');
              
              // 加載成就數據
              this._loadAchievements(() => {
                this._resourceLoaded('成就數據');
                
                // 所有資源加載完成
                this.loadingStatus.isComplete = true;
                this.logger.info('所有資源加載完成');
                
                if (callback && typeof callback === 'function') {
                  callback();
                }
              });
            });
          });
        });
      });
    } catch (error) {
      this.logger.error('資源加載失敗', error);
      throw error;
    }
  }
  
  /**
   * 更新資源加載狀態
   * @param {string} resourceType - 已加載的資源類型
   */
  _resourceLoaded(resourceType) {
    this.loadingStatus.loaded++;
    const progress = Math.floor((this.loadingStatus.loaded / this.loadingStatus.total) * 100);
    this.logger.info(`資源加載進度: ${progress}%, 已加載: ${resourceType}`);
  }
  
  /**
   * 加載卡牌數據
   * @param {Function} callback - 加載完成後的回調函數
   */
  _loadCards(callback) {
    try {
      // 模擬從服務器或本地文件加載卡牌數據
      // 在實際應用中，這裡應該是一個異步請求
      setTimeout(() => {
        this.cards = [
          {
            id: 'attack_basic',
            name: '基本攻擊',
            type: 'attack',
            rarity: 'common',
            cost: 1,
            description: '造成6點傷害',
            effect: { type: 'damage', value: 6 },
            image: imageAssets.cards.images.attack_basic,
            price: 50
          },
          {
            id: 'attack_heavy',
            name: '重擊',
            type: 'attack',
            rarity: 'uncommon',
            cost: 2,
            description: '造成12點傷害',
            effect: { type: 'damage', value: 12 },
            image: imageAssets.cards.images.attack_heavy,
            price: 100
          },
          {
            id: 'attack_multi',
            name: '連擊',
            type: 'attack',
            rarity: 'rare',
            cost: 2,
            description: '造成3次4點傷害',
            effect: { type: 'damage', value: 4, times: 3 },
            image: imageAssets.cards.images.attack_multi,
            price: 150
          },
          {
            id: 'defense_basic',
            name: '基本防禦',
            type: 'defense',
            rarity: 'common',
            cost: 1,
            description: '獲得8點護盾',
            effect: { type: 'shield', value: 8 },
            image: imageAssets.cards.images.defense_basic,
            price: 50
          },
          {
            id: 'defense_strong',
            name: '堅固防禦',
            type: 'defense',
            rarity: 'uncommon',
            cost: 2,
            description: '獲得15點護盾',
            effect: { type: 'shield', value: 15 },
            image: imageAssets.cards.images.defense_strong,
            price: 100
          },
          {
            id: 'skill_draw',
            name: '抽牌',
            type: 'skill',
            rarity: 'common',
            cost: 1,
            description: '抽2張牌',
            effect: { type: 'draw', value: 2 },
            image: imageAssets.cards.images.skill_draw,
            price: 75
          },
          {
            id: 'skill_energy',
            name: '能量湧動',
            type: 'skill',
            rarity: 'uncommon',
            cost: 0,
            description: '獲得1點魔力',
            effect: { type: 'energy', value: 1 },
            image: imageAssets.cards.images.skill_energy,
            price: 120
          },
          {
            id: 'skill_weaken',
            name: '虛弱',
            type: 'skill',
            rarity: 'uncommon',
            cost: 1,
            description: '敵人攻擊力降低25%，持續2回合',
            effect: { type: 'weakness', value: 0.25, duration: 2 },
            image: imageAssets.cards.images.skill_weaken,
            price: 100
          },
          {
            id: 'power_strength',
            name: '力量',
            type: 'power',
            rarity: 'rare',
            cost: 2,
            description: '永久增加3點攻擊力',
            effect: { type: 'strength', value: 3, permanent: true },
            image: imageAssets.cards.images.power_strength,
            price: 200
          },
          {
            id: 'defense_heal',
            name: '治療',
            type: 'defense',
            rarity: 'uncommon',
            cost: 1,
            description: '恢復8點生命值',
            effect: { type: 'healing', value: 8 },
            image: imageAssets.cards.images.defense_heal,
            price: 100
          }
        ];
        
        this.logger.info(`已加載 ${this.cards.length} 張卡牌數據`);
        callback();
      }, 300);
    } catch (error) {
      this.logger.error('加載卡牌數據失敗', error);
      throw error;
    }
  }
  
  /**
   * 加載關卡數據
   * @param {Function} callback - 加載完成後的回調函數
   */
  _loadLevels(callback) {
    try {
      // 模擬從服務器或本地文件加載關卡數據
      setTimeout(() => {
        this.levels = [
          {
            id: 1,
            name: '哥布林營地',
            description: '一群哥布林在此紮營，它們正在計劃襲擊附近的村莊。',
            difficulty: 'easy',
            enemyId: 'goblin',
            background: imageAssets.ui.background.battle,
            rewards: {
              gold: 50,
              experience: 100,
              cards: ['attack_basic', 'defense_basic']
            }
          },
          {
            id: 2,
            name: '骷髏墓地',
            description: '這個古老的墓地充滿了不死生物，它們由一股神秘的力量驅使。',
            difficulty: 'easy',
            enemyId: 'skeleton',
            background: imageAssets.ui.background.battle,
            rewards: {
              gold: 75,
              experience: 150,
              cards: ['skill_draw']
            }
          },
          {
            id: 3,
            name: '蜘蛛洞穴',
            description: '黑暗的洞穴中佈滿了巨大的蜘蛛網，洞穴深處有什麼在等待著你？',
            difficulty: 'medium',
            enemyId: 'spider',
            background: imageAssets.ui.background.battle,
            rewards: {
              gold: 100,
              experience: 200,
              cards: ['attack_heavy']
            }
          },
          {
            id: 4,
            name: '哥布林薩滿',
            description: '這個強大的哥布林薩滿掌握著原始的魔法力量。',
            difficulty: 'medium',
            enemyId: 'goblin_shaman',
            background: imageAssets.ui.background.battle,
            rewards: {
              gold: 125,
              experience: 250,
              cards: ['skill_weaken']
            }
          },
          {
            id: 5,
            name: '哥布林王',
            description: '哥布林部落的首領，它比普通哥布林更強大、更聰明。',
            difficulty: 'hard',
            enemyId: 'goblin_king',
            background: imageAssets.ui.background.battle,
            rewards: {
              gold: 200,
              experience: 400,
              cards: ['power_strength']
            }
          }
        ];
        
        this.logger.info(`已加載 ${this.levels.length} 個關卡數據`);
        callback();
      }, 300);
    } catch (error) {
      this.logger.error('加載關卡數據失敗', error);
      throw error;
    }
  }
  
  /**
   * 加載敵人數據
   * @param {Function} callback - 加載完成後的回調函數
   */
  _loadEnemies(callback) {
    try {
      // 模擬從服務器或本地文件加載敵人數據
      setTimeout(() => {
        this.enemies = [
          {
            id: 'goblin',
            name: '哥布林',
            type: 'normal',
            health: 30,
            attack: 5,
            image: imageAssets.characters.enemies.goblin,
            actions: [
              { type: 'attack', value: 5, weight: 70 },
              { type: 'defend', value: 5, weight: 30 }
            ]
          },
          {
            id: 'skeleton',
            name: '骷髏戰士',
            type: 'normal',
            health: 25,
            attack: 7,
            image: imageAssets.characters.enemies.skeleton,
            actions: [
              { type: 'attack', value: 7, weight: 80 },
              { type: 'defend', value: 4, weight: 20 }
            ]
          },
          {
            id: 'spider',
            name: '巨型蜘蛛',
            type: 'normal',
            health: 40,
            attack: 6,
            image: imageAssets.characters.enemies.spider,
            actions: [
              { type: 'attack', value: 6, weight: 60 },
              { type: 'debuff', effect: 'poison', value: 3, duration: 3, weight: 40 }
            ]
          },
          {
            id: 'goblin_shaman',
            name: '哥布林薩滿',
            type: 'elite',
            health: 60,
            attack: 8,
            image: imageAssets.characters.enemies.goblin_shaman,
            actions: [
              { type: 'attack', value: 8, weight: 40 },
              { type: 'buff', effect: 'strength', value: 2, duration: 2, weight: 30 },
              { type: 'debuff', effect: 'weakness', value: 0.25, duration: 2, weight: 30 }
            ]
          },
          {
            id: 'goblin_king',
            name: '哥布林王',
            type: 'boss',
            health: 120,
            attack: 12,
            image: imageAssets.characters.enemies.goblin_king,
            actions: [
              { type: 'attack', value: 12, weight: 50 },
              { type: 'attack_multi', value: 4, times: 3, weight: 20 },
              { type: 'buff', effect: 'strength', value: 3, duration: 3, weight: 15 },
              { type: 'defend', value: 15, weight: 15 }
            ]
          }
        ];
        
        this.logger.info(`已加載 ${this.enemies.length} 個敵人數據`);
        callback();
      }, 300);
    } catch (error) {
      this.logger.error('加載敵人數據失敗', error);
      throw error;
    }
  }
  
  /**
   * 加載道具數據
   * @param {Function} callback - 加載完成後的回調函數
   */
  _loadItems(callback) {
    try {
      // 模擬從服務器或本地文件加載道具數據
      setTimeout(() => {
        this.items = [
          {
            id: 'health_potion',
            name: '生命藥水',
            type: 'heal',
            value: 20,
            description: '恢復20點生命值',
            image: imageAssets.items.health_potion,
            price: 50
          },
          {
            id: 'mana_potion',
            name: '魔力藥水',
            type: 'mana',
            value: 3,
            description: '恢復3點魔力值',
            image: imageAssets.items.mana_potion,
            price: 75
          },
          {
            id: 'strength_potion',
            name: '力量藥水',
            type: 'buff',
            effect: 'strength',
            value: 2,
            duration: 3,
            description: '增加2點攻擊力，持續3回合',
            image: imageAssets.items.strength_potion,
            price: 100
          },
          {
            id: 'max_health_potion',
            name: '生命上限藥水',
            type: 'maxHealthUp',
            value: 10,
            description: '永久增加10點生命上限',
            image: imageAssets.items.health_potion,
            price: 200
          },
          {
            id: 'max_mana_potion',
            name: '魔力上限藥水',
            type: 'maxManaUp',
            value: 1,
            description: '永久增加1點魔力上限',
            image: imageAssets.items.mana_potion,
            price: 300
          }
        ];
        
        this.logger.info(`已加載 ${this.items.length} 個道具數據`);
        callback();
      }, 300);
    } catch (error) {
      this.logger.error('加載道具數據失敗', error);
      throw error;
    }
  }
  
  /**
   * 加載成就數據
   * @param {Function} callback - 加載完成後的回調函數
   */
  _loadAchievements(callback) {
    try {
      // 模擬從服務器或本地文件加載成就數據
      setTimeout(() => {
        this.achievements = [
          {
            id: 'first_victory',
            name: '初次勝利',
            description: '贏得你的第一場戰鬥',
            icon: imageAssets.achievements.first_victory,
            condition: { type: 'battles_won', value: 1 }
          },
          {
            id: 'card_collector',
            name: '卡牌收藏家',
            description: '收集10張不同的卡牌',
            icon: imageAssets.achievements.card_collector,
            condition: { type: 'cards_owned', value: 10 }
          },
          {
            id: 'boss_slayer',
            name: 'Boss獵人',
            description: '擊敗一個Boss敵人',
            icon: imageAssets.achievements.boss_slayer,
            condition: { type: 'boss_defeated', value: 1 }
          },
          {
            id: 'perfect_battle',
            name: '完美戰鬥',
            description: '在不失去任何生命值的情況下贏得戰鬥',
            icon: imageAssets.achievements.perfect_battle,
            condition: { type: 'perfect_battle', value: 1 }
          },
          {
            id: 'max_level',
            name: '達到最高等級',
            description: '達到10級',
            icon: imageAssets.achievements.max_level,
            condition: { type: 'player_level', value: 10 }
          }
        ];
        
        this.logger.info(`已加載 ${this.achievements.length} 個成就數據`);
        callback();
      }, 300);
    } catch (error) {
      this.logger.error('加載成就數據失敗', error);
      throw error;
    }
  }
  
  /**
   * 獲取加載進度
   * @returns {number} 加載進度百分比
   */
  getLoadingProgress() {
    return Math.floor((this.loadingStatus.loaded / this.loadingStatus.total) * 100);
  }
  
  /**
   * 檢查資源是否加載完成
   * @returns {boolean} 是否加載完成
   */
  isLoadingComplete() {
    return this.loadingStatus.isComplete;
  }
  
  /**
   * 根據ID獲取卡牌
   * @param {string} cardId - 卡牌ID
   * @returns {Object|null} 卡牌對象或null
   */
  getCardById(cardId) {
    try {
      return this.cards.find(card => card.id === cardId) || null;
    } catch (error) {
      this.logger.error(`獲取卡牌失敗: ${cardId}`, error);
      return null;
    }
  }
  
  /**
   * 獲取所有卡牌
   * @returns {Array} 卡牌數組
   */
  getAllCards() {
    return [...this.cards];
  }
  
  /**
   * 根據類型獲取卡牌
   * @param {string} type - 卡牌類型
   * @returns {Array} 卡牌數組
   */
  getCardsByType(type) {
    try {
      return this.cards.filter(card => card.type === type);
    } catch (error) {
      this.logger.error(`獲取卡牌類型失敗: ${type}`, error);
      return [];
    }
  }
  
  /**
   * 根據稀有度獲取卡牌
   * @param {string} rarity - 卡牌稀有度
   * @returns {Array} 卡牌數組
   */
  getCardsByRarity(rarity) {
    try {
      return this.cards.filter(card => card.rarity === rarity);
    } catch (error) {
      this.logger.error(`獲取卡牌稀有度失敗: ${rarity}`, error);
      return [];
    }
  }
  
  /**
   * 根據ID獲取關卡
   * @param {number} levelId - 關卡ID
   * @returns {Object|null} 關卡對象或null
   */
  getLevelById(levelId) {
    try {
      return this.levels.find(level => level.id === levelId) || null;
    } catch (error) {
      this.logger.error(`獲取關卡失敗: ${levelId}`, error);
      return null;
    }
  }
  
  /**
   * 獲取所有關卡
   * @returns {Array} 關卡數組
   */
  getAllLevels() {
    return [...this.levels];
  }
  
  /**
   * 獲取關卡數量
   * @returns {number} 關卡數量
   */
  getLevelsCount() {
    return this.levels.length;
  }
  
  /**
   * 根據ID獲取敵人
   * @param {string} enemyId - 敵人ID
   * @returns {Object|null} 敵人對象或null
   */
  getEnemyById(enemyId) {
    try {
      return this.enemies.find(enemy => enemy.id === enemyId) || null;
    } catch (error) {
      this.logger.error(`獲取敵人失敗: ${enemyId}`, error);
      return null;
    }
  }
  
  /**
   * 獲取所有敵人
   * @returns {Array} 敵人數組
   */
  getAllEnemies() {
    return [...this.enemies];
  }
  
  /**
   * 根據類型獲取敵人
   * @param {string} type - 敵人類型
   * @returns {Array} 敵人數組
   */
  getEnemiesByType(type) {
    try {
      return this.enemies.filter(enemy => enemy.type === type);
    } catch (error) {
      this.logger.error(`獲取敵人類型失敗: ${type}`, error);
      return [];
    }
  }
  
  /**
   * 根據ID獲取道具
   * @param {string} itemId - 道具ID
   * @returns {Object|null} 道具對象或null
   */
  getItemById(itemId) {
    try {
      return this.items.find(item => item.id === itemId) || null;
    } catch (error) {
      this.logger.error(`獲取道具失敗: ${itemId}`, error);
      return null;
    }
  }
  
  /**
   * 獲取所有道具
   * @returns {Array} 道具數組
   */
  getAllItems() {
    return [...this.items];
  }
  
  /**
   * 根據類型獲取道具
   * @param {string} type - 道具類型
   * @returns {Array} 道具數組
   */
  getItemsByType(type) {
    try {
      return this.items.filter(item => item.type === type);
    } catch (error) {
      this.logger.error(`獲取道具類型失敗: ${type}`, error);
      return [];
    }
  }
  
  /**
   * 根據ID獲取成就
   * @param {string} achievementId - 成就ID
   * @returns {Object|null} 成就對象或null
   */
  getAchievementById(achievementId) {
    try {
      return this.achievements.find(achievement => achievement.id === achievementId) || null;
    } catch (error) {
      this.logger.error(`獲取成就失敗: ${achievementId}`, error);
      return null;
    }
  }
  
  /**
   * 獲取所有成就
   * @returns {Array} 成就數組
   */
  getAllAchievements() {
    return [...this.achievements];
  }
  
  /**
   * 檢查成就是否達成
   * @param {string} achievementId - 成就ID
   * @param {Object} stats - 玩家統計數據
   * @returns {boolean} 是否達成
   */
  checkAchievement(achievementId, stats) {
    try {
      const achievement = this.getAchievementById(achievementId);
      if (!achievement) return false;
      
      const condition = achievement.condition;
      const statValue = stats[condition.type] || 0;
      
      return statValue >= condition.value;
    } catch (error) {
      this.logger.error(`檢查成就失敗: ${achievementId}`, error);
      return false;
    }
  }
}