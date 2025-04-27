/**
 * 戰鬥管理器模組
 * 負責管理遊戲中的戰鬥流程，包括回合控制、戰鬥開始和結束等功能
 */

import { Logger } from './Logger.js';

export class BattleManager {
  constructor(gameController) {
    this.gameController = gameController;
    this.logger = new Logger('BattleManager');
    this.logger.info('初始化戰鬥管理器');
    
    // 戰鬥狀態
    this.turnCount = 0;
    this.battleStats = {
      damageDealt: 0,
      damageTaken: 0,
      cardsPlayed: 0,
      healing: 0
    };
    
    // 戰鬥UI元素
    this.uiElements = {
      endTurnButton: null,
      battleInfo: null,
      battleLog: null
    };
  }
  
  /**
   * 初始化戰鬥管理器
   */
  init() {
    try {
      this.logger.info('初始化戰鬥管理器');
      
      // 初始化UI元素引用
      this._initUIElements();
      
      this.logger.info('戰鬥管理器初始化完成');
    } catch (error) {
      this.logger.error('初始化戰鬥管理器失敗', error);
    }
  }
  
  /**
   * 初始化UI元素引用
   * @private
   */
  _initUIElements() {
    try {
      // 在戰鬥開始時才獲取UI元素
      if (this.gameController.state.currentScreen === 'battle') {
        this.uiElements.endTurnButton = document.getElementById('end-turn-btn');
        this.uiElements.battleInfo = document.getElementById('battle-info');
        this.uiElements.battleLog = document.getElementById('battle-log');
        
        // 設置結束回合按鈕事件
        if (this.uiElements.endTurnButton) {
          this.uiElements.endTurnButton.addEventListener('click', () => {
            this.gameController.triggerEvent('endTurnClicked');
          });
        }
      }
    } catch (error) {
      this.logger.error('初始化戰鬥UI元素失敗', error);
    }
  }
  
  /**
   * 開始戰鬥
   * @param {string} levelId - 關卡ID
   * @returns {boolean} - 是否成功開始戰鬥
   */
  startBattle(levelId) {
    try {
      this.logger.info(`開始戰鬥，關卡ID: ${levelId}`);
      
      // 獲取關卡數據
      const level = this.gameController.resourceManager.getLevelById(levelId);
      if (!level) {
        this.logger.error(`找不到關卡數據: ${levelId}`);
        return false;
      }
      
      // 重置戰鬥狀態
      this._resetBattleState();
      
      // 初始化敵人
      const enemyInitialized = this.gameController.enemyManager.init(level.enemyId);
      if (!enemyInitialized) {
        this.logger.error(`初始化敵人失敗: ${level.enemyId}`);
        return false;
      }
      
      // 重置玩家狀態
      this.gameController.playerManager.resetForBattle();
      
      // 創建牌組
      this.gameController.cardManager.createDeck();
      
      // 切換到戰鬥屏幕
      this.gameController.showScreen('battle');
      
      // 初始化UI元素
      this._initUIElements();
      
      // 開始第一回合
      this.startTurn(true); // 玩家先手
      
      // 播放戰鬥開始音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.battleStart);
      
      this.logger.info('戰鬥開始');
      return true;
    } catch (error) {
      this.logger.error('開始戰鬥失敗', error);
      return false;
    }
  }
  
  /**
   * 重置戰鬥狀態
   * @private
   */
  _resetBattleState() {
    try {
      // 重置回合計數
      this.turnCount = 0;
      
      // 重置戰鬥統計
      this.battleStats = {
        damageDealt: 0,
        damageTaken: 0,
        cardsPlayed: 0,
        healing: 0
      };
      
      // 重置遊戲狀態中的戰鬥狀態
      this.gameController.state.battle = {
        isPlayerTurn: true,
        activeEffects: [],
        isGameOver: false,
        isVictory: false
      };
      
      this.logger.debug('戰鬥狀態已重置');
    } catch (error) {
      this.logger.error('重置戰鬥狀態失敗', error);
    }
  }
  
  /**
   * 開始回合
   * @param {boolean} isPlayerTurn - 是否為玩家回合
   */
  startTurn(isPlayerTurn) {
    try {
      this.gameController.state.battle.isPlayerTurn = isPlayerTurn;
      this.turnCount++;
      
      this.logger.info(`開始第${this.turnCount}回合，${isPlayerTurn ? '玩家' : '敵人'}回合`);
      
      // 更新UI
      this._updateBattleUI();
      
      // 處理回合開始效果
      this.gameController.effectManager.processTurnStartEffects();
      
      if (isPlayerTurn) {
        // 玩家回合開始
        this.gameController.playerManager.onTurnStart();
        
        // 抽牌
        this.gameController.cardManager.onTurnStart();
        
        // 恢復魔力
        this.gameController.state.player.mana = this.gameController.state.player.maxMana;
        this.gameController.playerManager.updateUI();
        
        // 顯示提示
        this.gameController.uiManager.showToast(this.gameController.uiTexts.battle.playerTurn);
        
        // 播放玩家回合開始音效
        this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.turnStart);
      } else {
        // 敵人回合開始
        
        // 顯示提示
        this.gameController.uiManager.showToast(this.gameController.uiTexts.battle.enemyTurn);
        
        // 播放敵人回合開始音效
        this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.enemyTurn);
        
        // 延遲執行敵人行動，以便玩家看清楚
        setTimeout(() => {
          this.executeEnemyAction();
        }, 1000);
      }
    } catch (error) {
      this.logger.error('開始回合失敗', error);
    }
  }
  
  /**
   * 結束回合
   */
  endTurn() {
    try {
      const isPlayerTurn = this.gameController.state.battle.isPlayerTurn;
      
      this.logger.info(`結束${isPlayerTurn ? '玩家' : '敵人'}回合`);
      
      // 處理回合結束效果
      this.gameController.effectManager.processTurnEndEffects();
      
      if (isPlayerTurn) {
        // 玩家回合結束
        this.gameController.playerManager.onTurnEnd();
        
        // 棄掉所有手牌
        this.gameController.cardManager.onTurnEnd();
        
        // 開始敵人回合
        this.startTurn(false);
      } else {
        // 敵人回合結束
        
        // 開始玩家回合
        this.startTurn(true);
      }
    } catch (error) {
      this.logger.error('結束回合失敗', error);
    }
  }
  
  /**
   * 執行敵人行動
   */
  executeEnemyAction() {
    try {
      // 檢查遊戲是否已結束
      if (this.gameController.state.battle.isGameOver) {
        return;
      }
      
      // 獲取敵人意圖
      const enemyIntent = this.gameController.enemyManager.currentIntent;
      if (!enemyIntent) {
        this.logger.warn('敵人沒有意圖');
        this.endTurn();
        return;
      }
      
      // 執行敵人意圖
      switch (enemyIntent.type) {
        case 'attack':
          // 敵人攻擊
          this._executeEnemyAttack(enemyIntent);
          break;
          
        case 'attack_multi':
          // 敵人多次攻擊
          this._executeEnemyMultiAttack(enemyIntent);
          break;
          
        case 'defend':
          // 敵人防禦
          this._executeEnemyDefend(enemyIntent);
          break;
          
        case 'buff':
          // 敵人增益
          this._executeEnemyBuff(enemyIntent);
          break;
          
        case 'debuff':
          // 敵人減益
          this._executeEnemyDebuff(enemyIntent);
          break;
          
        default:
          this.logger.warn(`未知的敵人意圖類型: ${enemyIntent.type}`);
          break;
      }
      
      // 決定下一個行動
      this.gameController.enemyManager.decideNextAction();
      
      // 延遲結束回合，以便玩家看清楚
      setTimeout(() => {
        this.endTurn();
      }, 1000);
    } catch (error) {
      this.logger.error('執行敵人行動失敗', error);
      this.endTurn();
    }
  }
  
  /**
   * 執行敵人攻擊
   * @param {Object} intent - 敵人意圖
   * @private
   */
  _executeEnemyAttack(intent) {
    try {
      const damage = intent.value;
      
      // 播放敵人攻擊動畫
      this.gameController.animationManager.playEnemyAnimation('attack');
      
      // 播放攻擊音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.enemyAttack);
      
      // 玩家受到傷害
      const actualDamage = this.gameController.playerManager.takeDamage(damage, { source: 'enemy' });
      
      // 更新戰鬥統計
      this.battleStats.damageTaken += actualDamage;
      
      this.logger.info(`敵人攻擊造成${actualDamage}點傷害`);
    } catch (error) {
      this.logger.error('執行敵人攻擊失敗', error);
    }
  }
  
  /**
   * 執行敵人多次攻擊
   * @param {Object} intent - 敵人意圖
   * @private
   */
  _executeEnemyMultiAttack(intent) {
    try {
      const damage = intent.value;
      const times = intent.times || 1;
      
      // 播放敵人攻擊動畫
      this.gameController.animationManager.playEnemyAnimation('attack_multi');
      
      let totalDamage = 0;
      
      // 執行多次攻擊
      for (let i = 0; i < times; i++) {
        // 延遲每次攻擊，使動畫更流暢
        setTimeout(() => {
          // 播放攻擊音效
          this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.enemyAttack);
          
          // 玩家受到傷害
          const actualDamage = this.gameController.playerManager.takeDamage(damage, { source: 'enemy' });
          totalDamage += actualDamage;
          
          // 更新戰鬥統計
          this.battleStats.damageTaken += actualDamage;
        }, i * 300);
      }
      
      this.logger.info(`敵人多次攻擊造成${totalDamage}點傷害`);
    } catch (error) {
      this.logger.error('執行敵人多次攻擊失敗', error);
    }
  }
  
  /**
   * 執行敵人防禦
   * @param {Object} intent - 敵人意圖
   * @private
   */
  _executeEnemyDefend(intent) {
    try {
      const shieldValue = intent.value;
      
      // 播放敵人防禦動畫
      this.gameController.animationManager.playEnemyAnimation('defend');
      
      // 播放防禦音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.shield);
      
      // 添加護盾效果
      this.gameController.effectManager.applyEffect(
        { type: 'shield', value: shieldValue },
        'enemy',
        { source: 'enemy' }
      );
      
      this.logger.info(`敵人獲得${shieldValue}點護盾`);
    } catch (error) {
      this.logger.error('執行敵人防禦失敗', error);
    }
  }
  
  /**
   * 執行敵人增益
   * @param {Object} intent - 敵人意圖
   * @private
   */
  _executeEnemyBuff(intent) {
    try {
      // 播放敵人增益動畫
      this.gameController.animationManager.playEnemyAnimation('buff');
      
      // 播放增益音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.buff);
      
      // 添加增益效果
      this.gameController.effectManager.applyEffect(
        { type: intent.effect, value: intent.value, duration: intent.duration },
        'enemy',
        { source: 'enemy' }
      );
      
      this.logger.info(`敵人獲得增益: ${intent.effect}, 值: ${intent.value}, 持續: ${intent.duration || '永久'}`);
    } catch (error) {
      this.logger.error('執行敵人增益失敗', error);
    }
  }
  
  /**
   * 執行敵人減益
   * @param {Object} intent - 敵人意圖
   * @private
   */
  _executeEnemyDebuff(intent) {
    try {
      // 播放敵人減益動畫
      this.gameController.animationManager.playEnemyAnimation('debuff');
      
      // 播放減益音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.debuff);
      
      // 添加減益效果
      this.gameController.effectManager.applyEffect(
        { type: intent.effect, value: intent.value, duration: intent.duration },
        'player',
        { source: 'enemy' }
      );
      
      this.logger.info(`敵人對玩家施加減益: ${intent.effect}, 值: ${intent.value}, 持續: ${intent.duration || '永久'}`);
    } catch (error) {
      this.logger.error('執行敵人減益失敗', error);
    }
  }
  
  /**
   * 使用卡牌
   * @param {number} cardIndex - 手牌索引
   * @returns {boolean} - 是否成功使用卡牌
   */
  playCard(cardIndex) {
    try {
      // 檢查是否為玩家回合
      if (!this.gameController.state.battle.isPlayerTurn) {
        this.logger.warn('不是玩家回合，無法使用卡牌');
        this.gameController.uiManager.showToast(this.gameController.uiTexts.battle.notPlayerTurn);
        return false;
      }
      
      // 使用卡牌
      const success = this.gameController.cardManager.playCard(cardIndex);
      
      if (success) {
        // 更新戰鬥統計
        this.battleStats.cardsPlayed++;
        
        // 檢查戰鬥是否結束
        this._checkBattleEnd();
      }
      
      return success;
    } catch (error) {
      this.logger.error('使用卡牌失敗', error);
      return false;
    }
  }
  
  /**
   * 更新戰鬥UI
   * @private
   */
  _updateBattleUI() {
    try {
      // 更新回合信息
      if (this.uiElements.battleInfo) {
        this.uiElements.battleInfo.innerHTML = `
          <div class="turn-info">回合: ${this.turnCount}</div>
          <div class="turn-player">${this.gameController.state.battle.isPlayerTurn ? '玩家回合' : '敵人回合'}</div>
        `;
      }
      
      // 更新結束回合按鈕狀態
      if (this.uiElements.endTurnButton) {
        if (this.gameController.state.battle.isPlayerTurn) {
          this.uiElements.endTurnButton.disabled = false;
          this.uiElements.endTurnButton.textContent = this.gameController.uiTexts.battle.endTurn;
        } else {
          this.uiElements.endTurnButton.disabled = true;
          this.uiElements.endTurnButton.textContent = this.gameController.uiTexts.battle.enemyTurn;
        }
      }
      
      // 更新玩家和敵人UI
      this.gameController.playerManager.updateUI();
      this.gameController.enemyManager.updateUI();
      
      this.logger.debug('戰鬥UI已更新');
    } catch (error) {
      this.logger.error('更新戰鬥UI失敗', error);
    }
  }
  
  /**
   * 檢查戰鬥是否結束
   * @private
   */
  _checkBattleEnd() {
    try {
      // 檢查玩家是否死亡
      if (this.gameController.state.player.health <= 0) {
        this._endBattle(false);
        return;
      }
      
      // 檢查敵人是否死亡
      if (this.gameController.state.enemy.health <= 0) {
        this._endBattle(true);
        return;
      }
    } catch (error) {
      this.logger.error('檢查戰鬥結束失敗', error);
    }
  }
  
  /**
   * 結束戰鬥
   * @param {boolean} isVictory - 是否勝利
   * @private
   */
  _endBattle(isVictory) {
    try {
      // 設置戰鬥結束狀態
      this.gameController.state.battle.isGameOver = true;
      this.gameController.state.battle.isVictory = isVictory;
      
      this.logger.info(`戰鬥結束，${isVictory ? '玩家勝利' : '玩家失敗'}`);
      
      if (isVictory) {
        // 播放勝利音效
        this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.victory);
        
        // 更新統計數據
        this.gameController.state.progress.stats.totalBattlesWon++;
        this.gameController.state.progress.stats.totalDamageDealt += this.battleStats.damageDealt;
        this.gameController.state.progress.stats.totalHealing += this.battleStats.healing;
        this.gameController.state.progress.stats.totalCardsPlayed += this.battleStats.cardsPlayed;
        this.gameController.state.progress.stats.totalDamageTaken += this.battleStats.damageTaken;
        
        // 獲取當前關卡
        const currentLevel = this.gameController.resourceManager.getLevelById(this.gameController.state.enemy.id);
        if (currentLevel) {
          // 給予獎勵
          this.gameController.giveRewards(currentLevel);
        }
        
        // 檢查成就
        this._checkAchievements();
        
        // 保存遊戲
        this.gameController.saveManager.saveGame(this.gameController.state.progress);
      } else {
        // 播放失敗音效
        this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.defeat);
      }
      
      // 延遲顯示遊戲結束屏幕
      setTimeout(() => {
        this.gameController.showScreen('gameOver');
      }, 1500);
    } catch (error) {
      this.logger.error('結束戰鬥失敗', error);
      
      // 確保即使出錯也會顯示遊戲結束屏幕
      setTimeout(() => {
        this.gameController.showScreen('gameOver');
      }, 1500);
    }
  }
  
  /**
   * 檢查成就
   * @private
   */
  _checkAchievements() {
    try {
      // 檢查首勝成就
      if (this.gameController.state.progress.stats.totalBattlesWon === 1) {
        this.gameController.achievementManager.unlockAchievement('first_victory');
      }
      
      // 檢查完美戰鬥成就（沒有受到傷害）
      if (this.battleStats.damageTaken === 0) {
        this.gameController.achievementManager.unlockAchievement('perfect_battle');
      }
      
      // 檢查Boss擊殺成就
      const enemy = this.gameController.state.enemy;
      if (enemy && enemy.type === 'boss') {
        this.gameController.achievementManager.unlockAchievement('boss_slayer');
      }
    } catch (error) {
      this.logger.error('檢查成就失敗', error);
    }
  }
  
  /**
   * 獲取戰鬥統計數據
   * @returns {Object} - 戰鬥統計數據
   */
  getBattleStats() {
    return { ...this.battleStats, turnCount: this.turnCount };
  }
  
  /**
   * 記錄傷害統計
   * @param {number} amount - 傷害量
   * @param {string} target - 目標 ('player' 或 'enemy')
   */
  recordDamage(amount, target) {
    try {
      if (target === 'enemy') {
        this.battleStats.damageDealt += amount;
      } else if (target === 'player') {
        this.battleStats.damageTaken += amount;
      }
    } catch (error) {
      this.logger.error('記錄傷害統計失敗', error);
    }
  }
  
  /**
   * 記錄治療統計
   * @param {number} amount - 治療量
   */
  recordHealing(amount) {
    try {
      this.battleStats.healing += amount;
    } catch (error) {
      this.logger.error('記錄治療統計失敗', error);
    }
  }
}