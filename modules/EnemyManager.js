/**
 * 敵人管理器模組
 * 負責管理敵人的狀態、行為和UI顯示
 */

import { Logger } from './Logger.js';

export class EnemyManager {
  constructor(gameController) {
    this.gameController = gameController;
    this.logger = new Logger('EnemyManager');
    this.logger.info('初始化敵人管理器');
    
    // 敵人狀態效果
    this.statusEffects = [];
    
    // 敵人意圖
    this.currentIntent = null;
    
    // 敵人UI元素
    this.uiElements = {
      enemyContainer: null,
      enemyImage: null,
      enemyHealthBar: null,
      enemyInfo: null,
      enemyIntent: null
    };
  }
  
  /**
   * 初始化敵人
   * @param {string} enemyId - 敵人ID
   */
  init(enemyId) {
    try {
      this.logger.info(`初始化敵人: ${enemyId}`);
      
      // 獲取敵人數據
      const enemyData = this.gameController.resourceManager.getEnemyById(enemyId);
      if (!enemyData) {
        this.logger.error(`找不到敵人數據: ${enemyId}`);
        return false;
      }
      
      // 設置敵人狀態
      this.gameController.state.enemy = {
        id: enemyData.id,
        name: enemyData.name,
        health: enemyData.health,
        maxHealth: enemyData.health,
        attack: enemyData.attack,
        image: enemyData.image,
        type: enemyData.type,
        actions: enemyData.actions
      };
      
      // 清空狀態效果
      this.statusEffects = [];
      
      // 初始化UI元素引用
      this._initUIElements();
      
      // 決定初始意圖
      this.decideNextAction();
      
      // 更新UI
      this.updateUI();
      
      this.logger.info(`敵人初始化完成: ${enemyData.name}`);
      return true;
    } catch (error) {
      this.logger.error('初始化敵人失敗', error);
      return false;
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
        this.uiElements.enemyContainer = document.getElementById('enemy-container');
        this.uiElements.enemyImage = document.getElementById('enemy-image');
        this.uiElements.enemyHealthBar = document.getElementById('enemy-health-bar');
        this.uiElements.enemyInfo = document.getElementById('enemy-info');
        this.uiElements.enemyIntent = document.getElementById('enemy-intent');
      }
    } catch (error) {
      this.logger.error('初始化敵人UI元素失敗', error);
    }
  }
  
  /**
   * 更新敵人UI
   */
  updateUI() {
    try {
      if (!this.uiElements.enemyHealthBar || !this.uiElements.enemyInfo) {
        this._initUIElements();
        if (!this.uiElements.enemyHealthBar || !this.uiElements.enemyInfo) {
          return;
        }
      }
      
      const enemy = this.gameController.state.enemy;
      
      // 更新敵人圖片
      if (this.uiElements.enemyImage) {
        this.uiElements.enemyImage.src = enemy.image;
        this.uiElements.enemyImage.alt = enemy.name;
      }
      
      // 更新生命值條
      const healthPercent = (enemy.health / enemy.maxHealth) * 100;
      this.uiElements.enemyHealthBar.style.width = `${healthPercent}%`;
      
      // 更新敵人信息文本
      if (this.uiElements.enemyInfo) {
        this.uiElements.enemyInfo.innerHTML = `
          <div class="enemy-name">${enemy.name}</div>
          <div>HP: ${enemy.health}/${enemy.maxHealth}</div>
          <div class="enemy-type">${this.gameController.uiTexts.enemies.type[enemy.type]}</div>
        `;
      }
      
      // 更新敵人意圖
      this._updateIntentUI();
      
      this.logger.debug('敵人UI已更新');
    } catch (error) {
      this.logger.error('更新敵人UI失敗', error);
    }
  }
  
  /**
   * 更新敵人意圖UI
   * @private
   */
  _updateIntentUI() {
    try {
      if (!this.uiElements.enemyIntent) {
        return;
      }
      
      if (!this.currentIntent) {
        this.uiElements.enemyIntent.innerHTML = '';
        return;
      }
      
      let intentText = '';
      let intentIcon = '';
      
      // 根據意圖類型設置文本和圖標
      switch (this.currentIntent.type) {
        case 'attack':
          intentText = `${this.gameController.uiTexts.enemies.intent.attack} (${this.currentIntent.value})`;
          intentIcon = this.gameController.imageAssets.ui.icons.attack;
          break;
        case 'attack_multi':
          intentText = `${this.gameController.uiTexts.enemies.intent.attack} (${this.currentIntent.value}x${this.currentIntent.times})`;
          intentIcon = this.gameController.imageAssets.ui.icons.attack;
          break;
        case 'defend':
          intentText = this.gameController.uiTexts.enemies.intent.defend;
          intentIcon = this.gameController.imageAssets.ui.icons.defense;
          break;
        case 'buff':
          intentText = this.gameController.uiTexts.enemies.intent.buff;
          intentIcon = this.gameController.imageAssets.effects.strength;
          break;
        case 'debuff':
          intentText = this.gameController.uiTexts.enemies.intent.debuff;
          intentIcon = this.gameController.imageAssets.effects[this.currentIntent.effect] || this.gameController.imageAssets.effects.weakness;
          break;
        default:
          intentText = this.gameController.uiTexts.enemies.intent.unknown;
          break;
      }
      
      this.uiElements.enemyIntent.innerHTML = `
        <img src="${intentIcon}" alt="${intentText}" class="intent-icon">
        <span>${intentText}</span>
      `;
    } catch (error) {
      this.logger.error('更新敵人意圖UI失敗', error);
    }
  }
  
  /**
   * 決定下一個行動
   */
  decideNextAction() {
    try {
      const enemy = this.gameController.state.enemy;
      
      if (!enemy || !enemy.actions || enemy.actions.length === 0) {
        this.logger.warn('敵人沒有可用的行動');
        this.currentIntent = null;
        return;
      }
      
      // 計算權重總和
      const totalWeight = enemy.actions.reduce((sum, action) => sum + action.weight, 0);
      
      // 隨機選擇一個行動
      let randomValue = Math.random() * totalWeight;
      let selectedAction = null;
      
      for (const action of enemy.actions) {
        randomValue -= action.weight;
        if (randomValue <= 0) {
          selectedAction = action;
          break;
        }
      }
      
      // 如果沒有選中任何行動，選擇第一個
      if (!selectedAction) {
        selectedAction = enemy.actions[0];
      }
      
      // 設置當前意圖
      this.currentIntent = { ...selectedAction };
      
      // 應用狀態效果對意圖的影響
      this._applyStatusEffectsToIntent();
      
      this.logger.info(`敵人決定下一個行動: ${this.currentIntent.type}`);
      
      // 更新意圖UI
      this._updateIntentUI();
    } catch (error) {
      this.logger.error('決定敵人行動失敗', error);
      this.currentIntent = null;
    }
  }
  
  /**
   * 應用狀態效果對意圖的影響
   * @private
   */
  _applyStatusEffectsToIntent() {
    try {
      if (!this.currentIntent) {
        return;
      }
      
      // 處理虛弱效果
      const weaknessEffects = this.statusEffects.filter(effect => effect.type === 'weakness');
      if (weaknessEffects.length > 0 && (this.currentIntent.type === 'attack' || this.currentIntent.type === 'attack_multi')) {
        // 計算總虛弱效果
        const totalWeakness = weaknessEffects.reduce((total, effect) => {
          return total + effect.value;
        }, 0);
        
        // 應用虛弱效果，最多減少75%傷害
        const weaknessMultiplier = Math.max(0.25, 1 - totalWeakness);
        this.currentIntent.value = Math.floor(this.currentIntent.value * weaknessMultiplier);
      }
      
      // 處理眩暈效果
      const stunEffects = this.statusEffects.filter(effect => effect.type === 'stun');
      if (stunEffects.length > 0) {
        // 被眩暈時，敵人無法行動
        this.currentIntent = {
          type: 'stunned',
          value: 0
        };
      }
    } catch (error) {
      this.logger.error('應用狀態效果到敵人意圖失敗', error);
    }
  }
  
  /**
   * 執行當前行動
   */
  executeAction() {
    try {
      if (!this.currentIntent) {
        this.logger.warn('敵人沒有當前意圖');
        return;
      }
      
      const intent = this.currentIntent;
      
      // 根據意圖類型執行不同的行動
      switch (intent.type) {
        case 'attack':
          this._executeAttack(intent.value);
          break;
        case 'attack_multi':
          this._executeMultiAttack(intent.value, intent.times);
          break;
        case 'defend':
          this._executeDefend(intent.value);
          break;
        case 'buff':
          this._executeBuff(intent.effect, intent.value, intent.duration);
          break;
        case 'debuff':
          this._executeDebuff(intent.effect, intent.value, intent.duration);
          break;
        case 'stunned':
          // 被眩暈時不執行任何行動
          this.logger.info('敵人被眩暈，無法行動');
          break;
        default:
          this.logger.warn(`未知的敵人行動類型: ${intent.type}`);
          break;
      }
      
      // 決定下一個行動
      this.decideNextAction();
    } catch (error) {
      this.logger.error('執行敵人行動失敗', error);
    }
  }
  
  /**
   * 執行攻擊行動
   * @param {number} damage - 傷害值
   * @private
   */
  _executeAttack(damage) {
    try {
      // 播放攻擊動畫
      if (this.uiElements.enemyImage) {
        this.gameController.animationManager.playEnemyAnimation(this.uiElements.enemyImage, 'attack');
      }
      
      // 播放攻擊音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.enemyAttack);
      
      // 對玩家造成傷害
      const actualDamage = this.gameController.playerManager.takeDamage(damage, { type: 'enemy', id: this.gameController.state.enemy.id });
      
      this.logger.info(`敵人攻擊造成${actualDamage}點傷害`);
    } catch (error) {
      this.logger.error('執行敵人攻擊失敗', error);
    }
  }
  
  /**
   * 執行多重攻擊行動
   * @param {number} damage - 每次攻擊的傷害值
   * @param {number} times - 攻擊次數
   * @private
   */
  _executeMultiAttack(damage, times) {
    try {
      let totalDamage = 0;
      
      // 執行多次攻擊
      const attackInterval = 300; // 每次攻擊間隔時間(毫秒)
      
      for (let i = 0; i < times; i++) {
        setTimeout(() => {
          // 播放攻擊動畫
          if (this.uiElements.enemyImage) {
            this.gameController.animationManager.playEnemyAnimation(this.uiElements.enemyImage, 'attack');
          }
          
          // 播放攻擊音效
          this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.enemyAttack);
          
          // 對玩家造成傷害
          const actualDamage = this.gameController.playerManager.takeDamage(damage, { type: 'enemy', id: this.gameController.state.enemy.id });
          totalDamage += actualDamage;
          
          if (i === times - 1) {
            this.logger.info(`敵人多重攻擊造成總計${totalDamage}點傷害`);
          }
        }, i * attackInterval);
      }
    } catch (error) {
      this.logger.error('執行敵人多重攻擊失敗', error);
    }
  }
  
  /**
   * 執行防禦行動
   * @param {number} defense - 護盾值
   * @private
   */
  _executeDefend(defense) {
    try {
      // 添加護盾效果
      this.addStatusEffect({
        type: 'defense',
        value: defense
      }, 1);
      
      // 播放防禦音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.defend);
      
      // 播放防禦動畫
      if (this.uiElements.enemyImage) {
        // 創建護盾效果元素
        const shieldEffect = document.createElement('div');
        shieldEffect.className = 'shield-effect';
        shieldEffect.style.backgroundImage = `url(${this.gameController.imageAssets.effects.shield})`;
        this.uiElements.enemyContainer.appendChild(shieldEffect);
        
        // 移除效果元素
        setTimeout(() => {
          this.uiElements.enemyContainer.removeChild(shieldEffect);
        }, 1000);
      }
      
      this.logger.info(`敵人獲得${defense}點護盾`);
    } catch (error) {
      this.logger.error('執行敵人防禦失敗', error);
    }
  }
  
  /**
   * 執行增益行動
   * @param {string} effect - 效果類型
   * @param {number} value - 效果值
   * @param {number} duration - 持續回合數
   * @private
   */
  _executeBuff(effect, value, duration) {
    try {
      // 添加增益效果
      this.addStatusEffect({
        type: effect,
        value: value
      }, duration);
      
      // 播放增益音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.buff);
      
      // 播放增益動畫
      if (this.uiElements.enemyImage) {
        // 創建增益效果元素
        const buffEffect = document.createElement('div');
        buffEffect.className = 'buff-effect';
        buffEffect.style.backgroundImage = `url(${this.gameController.imageAssets.effects[effect] || this.gameController.imageAssets.effects.strength})`;
        this.uiElements.enemyContainer.appendChild(buffEffect);
        
        // 移除效果元素
        setTimeout(() => {
          this.uiElements.enemyContainer.removeChild(buffEffect);
        }, 1000);
      }
      
      this.logger.info(`敵人獲得${effect}增益，值: ${value}，持續: ${duration}回合`);
    } catch (error) {
      this.logger.error('執行敵人增益失敗', error);
    }
  }
  
  /**
   * 執行減益行動
   * @param {string} effect - 效果類型
   * @param {number} value - 效果值
   * @param {number} duration - 持續回合數
   * @private
   */
  _executeDebuff(effect, value, duration) {
    try {
      // 對玩家施加減益效果
      this.gameController.playerManager.addStatusEffect({
        type: effect,
        value: value,
        source: { type: 'enemy', id: this.gameController.state.enemy.id }
      }, duration);
      
      // 播放減益音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.debuff);
      
      // 播放減益動畫
      const playerImage = document.getElementById('player-image');
      if (playerImage) {
        // 創建減益效果元素
        const debuffEffect = document.createElement('div');
        debuffEffect.className = 'debuff-effect';
        debuffEffect.style.backgroundImage = `url(${this.gameController.imageAssets.effects[effect] || this.gameController.imageAssets.effects.weakness})`;
        playerImage.parentNode.appendChild(debuffEffect);
        
        // 移除效果元素
        setTimeout(() => {
          playerImage.parentNode.removeChild(debuffEffect);
        }, 1000);
      }
      
      this.logger.info(`敵人對玩家施加${effect}減益，值: ${value}，持續: ${duration}回合`);
    } catch (error) {
      this.logger.error('執行敵人減益失敗', error);
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
      
      // 更新敵人生命值
      this.gameController.state.enemy.health = Math.max(0, this.gameController.state.enemy.health - actualDamage);
      
      // 更新統計數據
      this.gameController.state.progress.stats.totalDamageDealt += actualDamage;
      
      // 播放受傷音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.enemyHurt);
      
      // 播放受傷動畫
      if (this.uiElements.enemyImage) {
        this.gameController.animationManager.playEnemyAnimation(this.uiElements.enemyImage, 'hurt');
      }
      
      // 更新UI
      this.updateUI();
      
      // 檢查是否死亡
      if (this.gameController.state.enemy.health <= 0) {
        this.die();
      }
      
      this.logger.info(`敵人受到${actualDamage}點傷害，剩餘生命值: ${this.gameController.state.enemy.health}`);
      return actualDamage;
    } catch (error) {
      this.logger.error('敵人受傷處理失敗', error);
      return 0;
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
      
      this.logger.info(`敵人添加狀態效果: ${effect.type}, 持續: ${duration}回合`);
      return true;
    } catch (error) {
      this.logger.error('添加敵人狀態效果失敗', error);
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
          // 增加攻擊力
          this.gameController.state.enemy.attack += effect.value;
          break;
        // 其他效果類型...
      }
    } catch (error) {
      this.logger.error('應用敵人狀態效果失敗', error);
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
      
      this.logger.info(`移除敵人狀態效果: ${effect.type}`);
      return true;
    } catch (error) {
      this.logger.error('移除敵人狀態效果失敗', error);
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
          // 減少攻擊力
          this.gameController.state.enemy.attack -= effect.value;
          break;
        // 其他效果類型...
      }
    } catch (error) {
      this.logger.error('撤銷敵人狀態效果影響失敗', error);
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
      
      this.logger.debug('敵人回合開始處理完成');
    } catch (error) {
      this.logger.error('處理敵人回合開始失敗', error);
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
      
      this.logger.debug('敵人回合結束處理完成');
    } catch (error) {
      this.logger.error('處理敵人回合結束失敗', error);
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
      this.logger.error('觸發敵人狀態效果失敗', error);
    }
  }
  
  /**
   * 敵人死亡處理
   */
  die() {
    try {
      // 設置遊戲結束狀態
      this.gameController.state.battle.isGameOver = true;
      this.gameController.state.battle.isVictory = true;
      
      // 播放死亡音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.enemyDeath);
      
      // 播放死亡動畫
      if (this.uiElements.enemyImage) {
        this.gameController.animationManager.playEnemyAnimation(this.uiElements.enemyImage, 'death');
      }
      
      // 更新統計數據
      this.gameController.state.progress.stats.totalBattlesWon += 1;
      
      // 獲取當前關卡
      const currentLevel = this.gameController.resourceManager.getLevelById(this.gameController.state.currentLevel);
      
      // 給予獎勵
      if (currentLevel) {
        setTimeout(() => {
          this.gameController.giveRewards(currentLevel);
          
          // 顯示遊戲結束畫面
          this.gameController.showScreen('gameOver');
        }, 1500);
      } else {
        // 顯示遊戲結束畫面
        setTimeout(() => {
          this.gameController.showScreen('gameOver');
        }, 1500);
      }
      
      this.logger.info('敵人死亡');
    } catch (error) {
      this.logger.error('處理敵人死亡失敗', error);
    }
  }
  
  /**
   * 獲取隨機敵人
   * @param {string} type - 敵人類型 ('normal', 'elite', 'boss')
   * @returns {Object} - 敵人數據
   */
  getRandomEnemy(type = 'normal') {
    try {
      // 獲取指定類型的敵人列表
      const enemies = this.gameController.resourceManager.getEnemiesByType(type);
      
      if (!enemies || enemies.length === 0) {
        this.logger.warn(`找不到類型為 ${type} 的敵人`);
        return null;
      }
      
      // 隨機選擇一個敵人
      const randomIndex = Math.floor(Math.random() * enemies.length);
      return enemies[randomIndex];
    } catch (error) {
      this.logger.error(`獲取隨機敵人失敗: ${error.message}`, error);
      return null;
    }
  }
  
  /**
   * 重置敵人狀態（開始新戰鬥時）
   */
  resetForBattle() {
    try {
      // 清空狀態效果
      this.statusEffects = [];
      
      // 清空當前意圖
      this.currentIntent = null;
      
      this.logger.info('敵人狀態已重置，準備戰鬥');
    } catch (error) {
      this.logger.error('重置敵人戰鬥狀態失敗', error);
    }
  }
}