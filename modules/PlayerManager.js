/**
 * 玩家管理器模組
 * 負責管理玩家的狀態、屬性和行為
 */

import { Logger } from './Logger.js';

export class PlayerManager {
  constructor(gameController) {
    this.gameController = gameController;
    this.logger = new Logger('PlayerManager');
    this.logger.info('初始化玩家管理器');
    
    // 玩家屬性
    this.attributes = {
      strength: 0,      // 力量，增加攻擊傷害
      dexterity: 0,     // 敏捷，增加護盾效果
      intelligence: 0,  // 智力，增加魔力恢復
      vitality: 0       // 體力，增加生命上限
    };
    
    // 玩家狀態效果
    this.statusEffects = [];
    
    // 玩家裝備
    this.equipment = {
      weapon: null,
      armor: null,
      accessory: null
    };
    
    // 玩家技能
    this.skills = [];
    
    // 玩家UI元素
    this.uiElements = {
      healthBar: null,
      manaBar: null,
      playerImage: null,
      playerInfo: null
    };
  }
  
  /**
   * 初始化玩家
   */
  init() {
    try {
      this.logger.info('初始化玩家數據');
      
      // 重置玩家屬性
      this.resetAttributes();
      
      // 清空狀態效果
      this.statusEffects = [];
      
      // 初始化UI元素引用
      this._initUIElements();
      
      this.logger.info('玩家初始化完成');
    } catch (error) {
      this.logger.error('初始化玩家失敗', error);
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
        this.uiElements.healthBar = document.getElementById('player-health-bar');
        this.uiElements.manaBar = document.getElementById('player-mana-bar');
        this.uiElements.playerImage = document.getElementById('player-image');
        this.uiElements.playerInfo = document.getElementById('player-info');
      }
    } catch (error) {
      this.logger.error('初始化玩家UI元素失敗', error);
    }
  }
  
  /**
   * 重置玩家屬性
   */
  resetAttributes() {
    try {
      this.attributes = {
        strength: 0,
        dexterity: 0,
        intelligence: 0,
        vitality: 0
      };
      this.logger.debug('玩家屬性已重置');
    } catch (error) {
      this.logger.error('重置玩家屬性失敗', error);
    }
  }
  
  /**
   * 更新玩家UI
   */
  updateUI() {
    try {
      if (!this.uiElements.healthBar || !this.uiElements.manaBar) {
        this._initUIElements();
        if (!this.uiElements.healthBar || !this.uiElements.manaBar) {
          return;
        }
      }
      
      const player = this.gameController.state.player;
      
      // 更新生命值條
      const healthPercent = (player.health / player.maxHealth) * 100;
      this.uiElements.healthBar.style.width = `${healthPercent}%`;
      
      // 更新魔力值條
      const manaPercent = (player.mana / player.maxMana) * 100;
      this.uiElements.manaBar.style.width = `${manaPercent}%`;
      
      // 更新玩家信息文本
      if (this.uiElements.playerInfo) {
        this.uiElements.playerInfo.innerHTML = `
          <div>HP: ${player.health}/${player.maxHealth}</div>
          <div>MP: ${player.mana}/${player.maxMana}</div>
          <div class="player-stats">
            <span class="player-level">Lv.${player.level}</span>
            <span class="player-gold">${player.gold}G</span>
          </div>
        `;
      }
      
      this.logger.debug('玩家UI已更新');
    } catch (error) {
      this.logger.error('更新玩家UI失敗', error);
    }
  }
  
  /**
   * 受到傷害
   * @param {number} amount - 傷害量
   * @param {Object} source - 傷害來源
   * @returns {number} - 實際受到的傷害
   */
  takeDamage(amount, source = null) {
    try {
      if (amount <= 0) {
        return 0;
      }
      
      let actualDamage = amount;
      
      // 應用防禦效果
      const defenseEffects = this.statusEffects.filter(effect => effect.type === 'defense');
      for (const effect of defenseEffects) {
        actualDamage = Math.max(0, actualDamage - effect.value);
      }
      
      // 更新玩家生命值
      this.gameController.state.player.health = Math.max(0, this.gameController.state.player.health - actualDamage);
      
      // 更新統計數據
      this.gameController.state.progress.stats.totalDamageTaken += actualDamage;
      
      // 播放受傷音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.playerHurt);
      
      // 播放受傷動畫
      if (this.uiElements.playerImage) {
        this.gameController.animationManager.playPlayerAnimation(this.uiElements.playerImage, 'hurt');
      }
      
      // 更新UI
      this.updateUI();
      
      // 檢查是否死亡
      if (this.gameController.state.player.health <= 0) {
        this.die();
      }
      
      this.logger.info(`玩家受到${actualDamage}點傷害，剩餘生命值: ${this.gameController.state.player.health}`);
      return actualDamage;
    } catch (error) {
      this.logger.error('玩家受傷處理失敗', error);
      return 0;
    }
  }
  
  /**
   * 恢復生命值
   * @param {number} amount - 恢復量
   * @returns {number} - 實際恢復的生命值
   */
  heal(amount) {
    try {
      if (amount <= 0) {
        return 0;
      }
      
      const player = this.gameController.state.player;
      const oldHealth = player.health;
      
      // 更新玩家生命值，不超過最大值
      player.health = Math.min(player.maxHealth, player.health + amount);
      
      // 計算實際恢復量
      const actualHeal = player.health - oldHealth;
      
      // 更新統計數據
      this.gameController.state.progress.stats.totalHealing += actualHeal;
      
      // 播放治療音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.heal);
      
      // 更新UI
      this.updateUI();
      
      this.logger.info(`玩家恢復${actualHeal}點生命值，當前生命值: ${player.health}`);
      return actualHeal;
    } catch (error) {
      this.logger.error('玩家治療處理失敗', error);
      return 0;
    }
  }
  
  /**
   * 消耗魔力
   * @param {number} amount - 消耗量
   * @returns {boolean} - 是否成功消耗
   */
  useMana(amount) {
    try {
      const player = this.gameController.state.player;
      
      // 檢查魔力是否足夠
      if (player.mana < amount) {
        this.logger.warn(`魔力不足，需要${amount}點，當前只有${player.mana}點`);
        return false;
      }
      
      // 更新玩家魔力值
      player.mana -= amount;
      
      // 更新UI
      this.updateUI();
      
      this.logger.info(`玩家消耗${amount}點魔力，剩餘魔力: ${player.mana}`);
      return true;
    } catch (error) {
      this.logger.error('玩家消耗魔力處理失敗', error);
      return false;
    }
  }
  
  /**
   * 恢復魔力
   * @param {number} amount - 恢復量
   * @returns {number} - 實際恢復的魔力
   */
  restoreMana(amount) {
    try {
      if (amount <= 0) {
        return 0;
      }
      
      const player = this.gameController.state.player;
      const oldMana = player.mana;
      
      // 更新玩家魔力值，不超過最大值
      player.mana = Math.min(player.maxMana, player.mana + amount);
      
      // 計算實際恢復量
      const actualRestore = player.mana - oldMana;
      
      // 播放魔力恢復音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.mana);
      
      // 更新UI
      this.updateUI();
      
      this.logger.info(`玩家恢復${actualRestore}點魔力，當前魔力: ${player.mana}`);
      return actualRestore;
    } catch (error) {
      this.logger.error('玩家恢復魔力處理失敗', error);
      return 0;
    }
  }
  
  /**
   * 增加經驗值
   * @param {number} amount - 經驗值量
   * @returns {boolean} - 是否升級
   */
  gainExperience(amount) {
    try {
      if (amount <= 0) {
        return false;
      }
      
      const player = this.gameController.state.player;
      
      // 增加經驗值
      player.experience += amount;
      
      // 檢查是否升級
      const expNeeded = player.level * 100;
      if (player.experience >= expNeeded) {
        // 升級
        player.level += 1;
        player.experience -= expNeeded;
        player.maxHealth += 10;
        player.health += 10;
        player.maxMana += 1;
        player.mana += 1;
        
        // 播放升級音效
        this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.levelUp);
        
        // 顯示升級提示
        this.gameController.uiManager.showToast(this.gameController.uiTexts.battle.levelUp);
        
        this.logger.info(`玩家升級！當前等級: ${player.level}`);
        return true;
      }
      
      this.logger.info(`玩家獲得${amount}點經驗值，當前經驗: ${player.experience}/${expNeeded}`);
      return false;
    } catch (error) {
      this.logger.error('玩家獲得經驗值處理失敗', error);
      return false;
    }
  }
  
  /**
   * 增加金幣
   * @param {number} amount - 金幣量
   */
  gainGold(amount) {
    try {
      if (amount <= 0) {
        return;
      }
      
      const player = this.gameController.state.player;
      
      // 增加金幣
      player.gold += amount;
      
      // 更新統計數據
      this.gameController.state.progress.stats.totalGoldEarned += amount;
      
      // 播放獲得金幣音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.gold);
      
      this.logger.info(`玩家獲得${amount}金幣，當前金幣: ${player.gold}`);
    } catch (error) {
      this.logger.error('玩家獲得金幣處理失敗', error);
    }
  }
  
  /**
   * 添加狀態效果
   * @param {Object} effect - 效果對象
   * @param {number} duration - 持續回合數
   * @returns {boolean} - 是否成功添加
   */
  addStatusEffect(effect, duration) {
    try {
      if (!effect || !effect.type) {
        this.logger.warn('嘗試添加無效的狀態效果');
        return false;
      }
      
      // 創建狀態效果對象
      const statusEffect = {
        id: `effect_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        type: effect.type,
        value: effect.value || 0,
        duration: duration,
        source: effect.source || null
      };
      
      // 添加到狀態效果列表
      this.statusEffects.push(statusEffect);
      
      // 應用效果
      this._applyStatusEffect(statusEffect);
      
      this.logger.info(`玩家添加狀態效果: ${effect.type}, 持續: ${duration}回合`);
      return true;
    } catch (error) {
      this.logger.error('添加玩家狀態效果失敗', error);
      return false;
    }
  }
  
  /**
   * 應用狀態效果
   * @param {Object} effect - 效果對象
   * @private
   */
  _applyStatusEffect(effect) {
    try {
      switch (effect.type) {
        case 'strength':
          this.attributes.strength += effect.value;
          break;
        case 'dexterity':
          this.attributes.dexterity += effect.value;
          break;
        case 'intelligence':
          this.attributes.intelligence += effect.value;
          break;
        case 'vitality':
          this.attributes.vitality += effect.value;
          // 增加最大生命值
          this.gameController.state.player.maxHealth += effect.value;
          this.gameController.state.player.health += effect.value;
          break;
        // 其他效果類型...
      }
      
      // 更新UI
      this.updateUI();
    } catch (error) {
      this.logger.error('應用玩家狀態效果失敗', error);
    }
  }
  
  /**
   * 移除狀態效果
   * @param {string} effectId - 效果ID
   * @returns {boolean} - 是否成功移除
   */
  removeStatusEffect(effectId) {
    try {
      const effectIndex = this.statusEffects.findIndex(effect => effect.id === effectId);
      if (effectIndex === -1) {
        this.logger.warn(`找不到狀態效果: ${effectId}`);
        return false;
      }
      
      const effect = this.statusEffects[effectIndex];
      
      // 移除效果
      this.statusEffects.splice(effectIndex, 1);
      
      // 撤銷效果
      this._removeStatusEffectImpact(effect);
      
      this.logger.info(`移除玩家狀態效果: ${effect.type}`);
      return true;
    } catch (error) {
      this.logger.error('移除玩家狀態效果失敗', error);
      return false;
    }
  }
  
  /**
   * 撤銷狀態效果影響
   * @param {Object} effect - 效果對象
   * @private
   */
  _removeStatusEffectImpact(effect) {
    try {
      switch (effect.type) {
        case 'strength':
          this.attributes.strength -= effect.value;
          break;
        case 'dexterity':
          this.attributes.dexterity -= effect.value;
          break;
        case 'intelligence':
          this.attributes.intelligence -= effect.value;
          break;
        case 'vitality':
          this.attributes.vitality -= effect.value;
          // 減少最大生命值，但不減少當前生命值低於新的最大值
          this.gameController.state.player.maxHealth -= effect.value;
          if (this.gameController.state.player.health > this.gameController.state.player.maxHealth) {
            this.gameController.state.player.health = this.gameController.state.player.maxHealth;
          }
          break;
        // 其他效果類型...
      }
      
      // 更新UI
      this.updateUI();
    } catch (error) {
      this.logger.error('撤銷玩家狀態效果影響失敗', error);
    }
  }
  
  /**
   * 處理回合開始
   */
  onTurnStart() {
    try {
      // 處理回合開始時的效果
      const turnStartEffects = this.statusEffects.filter(effect => effect.triggerTiming === 'turnStart');
      for (const effect of turnStartEffects) {
        this._triggerStatusEffect(effect);
      }
      
      this.logger.debug('玩家回合開始處理完成');
    } catch (error) {
      this.logger.error('處理玩家回合開始失敗', error);
    }
  }
  
  /**
   * 處理回合結束
   */
  onTurnEnd() {
    try {
      // 處理回合結束時的效果
      const turnEndEffects = this.statusEffects.filter(effect => effect.triggerTiming === 'turnEnd');
      for (const effect of turnEndEffects) {
        this._triggerStatusEffect(effect);
      }
      
      // 減少所有效果的持續時間
      for (let i = this.statusEffects.length - 1; i >= 0; i--) {
        const effect = this.statusEffects[i];
        if (effect.duration > 0) {
          effect.duration--;
          if (effect.duration <= 0 && !effect.permanent) {
            // 移除已過期的效果
            this.removeStatusEffect(effect.id);
          }
        }
      }
      
      this.logger.debug('玩家回合結束處理完成');
    } catch (error) {
      this.logger.error('處理玩家回合結束失敗', error);
    }
  }
  
  /**
   * 觸發狀態效果
   * @param {Object} effect - 效果對象
   * @private
   */
  _triggerStatusEffect(effect) {
    try {
      switch (effect.type) {
        case 'regeneration':
          // 回復生命值
          this.heal(effect.value);
          break;
        case 'poison':
          // 受到毒傷害
          this.takeDamage(effect.value, { type: 'poison' });
          break;
        case 'burn':
          // 受到燃燒傷害
          this.takeDamage(effect.value, { type: 'burn' });
          break;
        // 其他效果類型...
      }
    } catch (error) {
      this.logger.error('觸發玩家狀態效果失敗', error);
    }
  }
  
  /**
   * 玩家死亡處理
   */
  die() {
    try {
      // 設置遊戲結束狀態
      this.gameController.state.battle.isGameOver = true;
      this.gameController.state.battle.isVictory = false;
      
      // 播放死亡音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.playerDeath);
      
      // 播放死亡動畫
      if (this.uiElements.playerImage) {
        this.gameController.animationManager.playPlayerAnimation(this.uiElements.playerImage, 'defeat');
      }
      
      // 顯示遊戲結束畫面
      setTimeout(() => {
        this.gameController.showScreen('gameOver');
      }, 1500);
      
      this.logger.info('玩家死亡');
    } catch (error) {
      this.logger.error('處理玩家死亡失敗', error);
    }
  }
  
  /**
   * 重置玩家狀態（開始新戰鬥時）
   */
  resetForBattle() {
    try {
      const player = this.gameController.state.player;
      
      // 重置生命值和魔力值
      player.health = player.maxHealth;
      player.mana = player.maxMana;
      
      // 清空狀態效果
      this.statusEffects = [];
      
      // 重置屬性
      this.resetAttributes();
      
      // 更新UI
      this.updateUI();
      
      this.logger.info('玩家狀態已重置，準備戰鬥');
    } catch (error) {
      this.logger.error('重置玩家戰鬥狀態失敗', error);
    }
  }
  
  /**
   * 獲取玩家攻擊力
   * @returns {number} - 玩家當前攻擊力
   */
  getAttackPower() {
    try {
      // 基礎攻擊力 + 力量屬性加成
      const baseAttack = 5 + Math.floor(this.gameController.state.player.level / 2);
      const strengthBonus = this.attributes.strength;
      
      return baseAttack + strengthBonus;
    } catch (error) {
      this.logger.error('獲取玩家攻擊力失敗', error);
      return 5; // 返回默認值
    }
  }
  
  /**
   * 獲取玩家防禦力
   * @returns {number} - 玩家當前防禦力
   */
  getDefensePower() {
    try {
      // 基礎防禦力 + 敏捷屬性加成
      const baseDefense = 2 + Math.floor(this.gameController.state.player.level / 3);
      const dexterityBonus = this.attributes.dexterity;
      
      return baseDefense + dexterityBonus;
    } catch (error) {
      this.logger.error('獲取玩家防禦力失敗', error);
      return 2; // 返回默認值
    }
  }
}