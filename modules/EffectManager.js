/**
 * 效果管理器模組
 * 負責管理遊戲中的所有效果，包括卡牌效果、狀態效果等
 */

import { Logger } from './Logger.js';

export class EffectManager {
  constructor(gameController) {
    this.gameController = gameController;
    this.logger = new Logger('EffectManager');
    this.logger.info('初始化效果管理器');
    
    // 效果類型
    this.effectTypes = {
      DAMAGE: 'damage',         // 傷害
      SHIELD: 'shield',         // 護盾
      HEALING: 'healing',       // 治療
      DRAW: 'draw',             // 抽牌
      ENERGY: 'energy',         // 能量/魔力
      STRENGTH: 'strength',     // 力量
      DEXTERITY: 'dexterity',   // 敏捷
      WEAKNESS: 'weakness',     // 虛弱
      POISON: 'poison',         // 中毒
      BURN: 'burn',             // 燃燒
      STUN: 'stun',             // 眩暈
      THORNS: 'thorns',         // 荊棘
      REGENERATION: 'regeneration', // 再生
      DISCARD: 'discard'        // 棄牌
    };
    
    // 效果持續類型
    this.durationType = {
      INSTANT: 'instant',       // 即時效果
      TURN_START: 'turnStart',  // 回合開始時觸發
      TURN_END: 'turnEnd',      // 回合結束時觸發
      PERMANENT: 'permanent'    // 永久效果
    };
    
    // 效果目標類型
    this.targetType = {
      PLAYER: 'player',         // 玩家
      ENEMY: 'enemy',           // 敵人
      ALL_ENEMIES: 'allEnemies', // 所有敵人
      ALL: 'all'                // 所有角色
    };
  }
  
  /**
   * 應用效果
   * @param {Object} effect - 效果對象
   * @param {string} targetType - 目標類型
   * @param {Object} source - 效果來源
   * @returns {Object} - 效果應用結果
   */
  applyEffect(effect, targetType, source = null) {
    try {
      if (!effect || !effect.type) {
        this.logger.warn('嘗試應用無效的效果');
        return { success: false, message: '無效的效果' };
      }
      
      this.logger.info(`應用效果: ${effect.type}, 目標: ${targetType}`);
      
      // 根據效果類型處理
      switch (effect.type) {
        case this.effectTypes.DAMAGE:
          return this._applyDamageEffect(effect, targetType, source);
          
        case this.effectTypes.SHIELD:
          return this._applyShieldEffect(effect, targetType);
          
        case this.effectTypes.HEALING:
          return this._applyHealingEffect(effect, targetType);
          
        case this.effectTypes.DRAW:
          return this._applyDrawEffect(effect);
          
        case this.effectTypes.ENERGY:
          return this._applyEnergyEffect(effect);
          
        case this.effectTypes.STRENGTH:
          return this._applyStrengthEffect(effect, targetType);
          
        case this.effectTypes.DEXTERITY:
          return this._applyDexterityEffect(effect, targetType);
          
        case this.effectTypes.WEAKNESS:
          return this._applyWeaknessEffect(effect, targetType);
          
        case this.effectTypes.POISON:
          return this._applyPoisonEffect(effect, targetType);
          
        case this.effectTypes.BURN:
          return this._applyBurnEffect(effect, targetType);
          
        case this.effectTypes.STUN:
          return this._applyStunEffect(effect, targetType);
          
        case this.effectTypes.THORNS:
          return this._applyThornsEffect(effect, targetType);
          
        case this.effectTypes.REGENERATION:
          return this._applyRegenerationEffect(effect, targetType);
          
        case this.effectTypes.DISCARD:
          return this._applyDiscardEffect(effect);
          
        default:
          this.logger.warn(`未知的效果類型: ${effect.type}`);
          return { success: false, message: '未知的效果類型' };
      }
    } catch (error) {
      this.logger.error(`應用效果失敗: ${error.message}`, error);
      return { success: false, message: '應用效果失敗', error: error.message };
    }
  }
  
  /**
   * 添加持續效果
   * @param {Object} effect - 效果對象
   * @param {string} targetType - 目標類型
   * @param {number} duration - 持續回合數
   * @returns {boolean} - 是否成功添加
   */
  addActiveEffect(effect, targetType, duration) {
    try {
      if (!effect || !effect.type || !targetType || !duration) {
        this.logger.warn('嘗試添加無效的持續效果');
        return false;
      }
      
      // 創建持續效果對象
      const activeEffect = {
        id: `effect_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        type: effect.type,
        value: effect.value || 0,
        duration: duration,
        targetType: targetType,
        source: effect.source || null,
        permanent: effect.permanent || false,
        triggerTiming: effect.triggerTiming || this.durationType.TURN_END // 默認為回合結束時觸發
      };
      
      // 添加到活躍效果列表
      this.gameController.state.battle.activeEffects.push(activeEffect);
      
      // 播放效果音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx[effect.type] || this.gameController.imageAssets.audio.sfx.effect);
      
      // 播放效果動畫
      this._playEffectAnimation(effect.type, targetType);
      
      this.logger.info(`添加持續效果: ${effect.type}, 目標: ${targetType}, 持續: ${duration}回合`);
      return true;
    } catch (error) {
      this.logger.error(`添加持續效果失敗: ${error.message}`, error);
      return false;
    }
  }
  
  /**
   * 處理回合開始時的效果
   */
  processTurnStartEffects() {
    try {
      const activeEffects = this.gameController.state.battle.activeEffects;
      const isPlayerTurn = this.gameController.state.battle.isPlayerTurn;
      
      // 過濾出當前回合角色的回合開始效果
      const turnStartEffects = activeEffects.filter(effect => 
        effect.triggerTiming === this.durationType.TURN_START && 
        ((isPlayerTurn && effect.targetType === this.targetType.PLAYER) || 
         (!isPlayerTurn && effect.targetType === this.targetType.ENEMY))
      );
      
      // 應用這些效果
      for (const effect of turnStartEffects) {
        this.applyEffect(effect, effect.targetType);
      }
      
      this.logger.debug(`處理回合開始效果: ${turnStartEffects.length}個`);
    } catch (error) {
      this.logger.error(`處理回合開始效果失敗: ${error.message}`, error);
    }
  }
  
  /**
   * 處理回合結束時的效果
   */
  processTurnEndEffects() {
    try {
      const activeEffects = this.gameController.state.battle.activeEffects;
      const isPlayerTurn = this.gameController.state.battle.isPlayerTurn;
      
      // 過濾出當前回合角色的回合結束效果
      const turnEndEffects = activeEffects.filter(effect => 
        effect.triggerTiming === this.durationType.TURN_END && 
        ((isPlayerTurn && effect.targetType === this.targetType.PLAYER) || 
         (!isPlayerTurn && effect.targetType === this.targetType.ENEMY))
      );
      
      // 應用這些效果
      for (const effect of turnEndEffects) {
        this.applyEffect(effect, effect.targetType);
      }
      
      // 減少持續效果的持續時間
      this._decreaseEffectsDuration();
      
      this.logger.debug(`處理回合結束效果: ${turnEndEffects.length}個`);
    } catch (error) {
      this.logger.error(`處理回合結束效果失敗: ${error.message}`, error);
    }
  }
  
  /**
   * 減少持續效果的持續時間
   * @private
   */
  _decreaseEffectsDuration() {
    try {
      const activeEffects = this.gameController.state.battle.activeEffects;
      const isPlayerTurn = this.gameController.state.battle.isPlayerTurn;
      
      // 遍歷所有活躍效果
      for (let i = activeEffects.length - 1; i >= 0; i--) {
        const effect = activeEffects[i];
        
        // 只處理當前回合角色的效果
        if ((isPlayerTurn && effect.targetType === this.targetType.PLAYER) || 
            (!isPlayerTurn && effect.targetType === this.targetType.ENEMY)) {
          
          // 永久效果不減少持續時間
          if (effect.permanent) continue;
          
          // 減少持續時間
          effect.duration--;
          
          // 如果持續時間為0，移除效果
          if (effect.duration <= 0) {
            activeEffects.splice(i, 1);
            this.logger.debug(`效果已過期: ${effect.type}`);
            
            // 顯示效果過期提示
            this.gameController.uiManager.showToast(this.gameController.uiTexts.battle.effectExpired);
          }
        }
      }
    } catch (error) {
      this.logger.error(`減少效果持續時間失敗: ${error.message}`, error);
    }
  }
  
  /**
   * 清除所有效果
   */
  clearAllEffects() {
    try {
      this.gameController.state.battle.activeEffects = [];
      this.logger.info('清除所有效果');
    } catch (error) {
      this.logger.error(`清除所有效果失敗: ${error.message}`, error);
    }
  }
  
  /**
   * 獲取目標的所有活躍效果
   * @param {string} targetType - 目標類型
   * @returns {Array} - 效果列表
   */
  getActiveEffects(targetType) {
    try {
      return this.gameController.state.battle.activeEffects.filter(effect => effect.targetType === targetType);
    } catch (error) {
      this.logger.error(`獲取活躍效果失敗: ${error.message}`, error);
      return [];
    }
  }
  
  /**
   * 播放效果動畫
   * @param {string} effectType - 效果類型
   * @param {string} targetType - 目標類型
   * @private
   */
  _playEffectAnimation(effectType, targetType) {
    try {
      // 獲取效果圖片
      const effectImage = this.gameController.imageAssets.effects[effectType];
      if (!effectImage) return;
      
      // 根據目標類型決定動畫位置
      const targetElement = targetType === this.targetType.PLAYER ? 'player-effects' : 'enemy-effects';
      
      // 播放動畫
      this.gameController.animationManager.playEffectAnimation(effectType, targetElement);
    } catch (error) {
      this.logger.error(`播放效果動畫失敗: ${error.message}`, error);
    }
  }
  
  /**
   * 應用傷害效果
   * @param {Object} effect - 效果對象
   * @param {string} targetType - 目標類型
   * @param {Object} source - 效果來源
   * @returns {Object} - 效果應用結果
   * @private
   */
  _applyDamageEffect(effect, targetType, source) {
    try {
      let damage = effect.value || 0;
      const times = effect.times || 1;
      let totalDamage = 0;
      
      // 處理多次傷害
      for (let i = 0; i < times; i++) {
        // 計算實際傷害
        let actualDamage = damage;
        
        // 應用力量加成
        if (source === this.targetType.PLAYER) {
          // 玩家的力量加成
          const strengthEffects = this.getActiveEffects(this.targetType.PLAYER).filter(e => e.type === this.effectTypes.STRENGTH);
          for (const strengthEffect of strengthEffects) {
            actualDamage += strengthEffect.value;
          }
        } else if (source === this.targetType.ENEMY) {
          // 敵人的力量加成
          const strengthEffects = this.getActiveEffects(this.targetType.ENEMY).filter(e => e.type === this.effectTypes.STRENGTH);
          for (const strengthEffect of strengthEffects) {
            actualDamage += strengthEffect.value;
          }
        }
        
        // 應用虛弱效果
        if (source === this.targetType.PLAYER) {
          // 玩家的虛弱效果
          const weaknessEffects = this.getActiveEffects(this.targetType.PLAYER).filter(e => e.type === this.effectTypes.WEAKNESS);
          for (const weaknessEffect of weaknessEffects) {
            actualDamage = Math.floor(actualDamage * (1 - weaknessEffect.value));
          }
        } else if (source === this.targetType.ENEMY) {
          // 敵人的虛弱效果
          const weaknessEffects = this.getActiveEffects(this.targetType.ENEMY).filter(e => e.type === this.effectTypes.WEAKNESS);
          for (const weaknessEffect of weaknessEffects) {
            actualDamage = Math.floor(actualDamage * (1 - weaknessEffect.value));
          }
        }
        
        // 確保傷害至少為1
        actualDamage = Math.max(1, actualDamage);
        
        // 應用傷害
        if (targetType === this.targetType.PLAYER) {
          // 玩家受到傷害
          this.gameController.state.player.health -= actualDamage;
          this.gameController.state.progress.stats.totalDamageTaken += actualDamage;
          
          // 檢查玩家是否死亡
          if (this.gameController.state.player.health <= 0) {
            this.gameController.state.player.health = 0;
            this.gameController.state.battle.isGameOver = true;
            this.gameController.state.battle.isVictory = false;
          }
        } else if (targetType === this.targetType.ENEMY) {
          // 敵人受到傷害
          this.gameController.state.enemy.health -= actualDamage;
          this.gameController.state.progress.stats.totalDamageDealt += actualDamage;
          
          // 檢查敵人是否死亡
          if (this.gameController.state.enemy.health <= 0) {
            this.gameController.state.enemy.health = 0;
            this.gameController.state.battle.isGameOver = true;
            this.gameController.state.battle.isVictory = true;
          }
        }
        
        totalDamage += actualDamage;
      }
      
      // 播放傷害音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.attack);
      
      // 播放傷害動畫
      this._playEffectAnimation(this.effectTypes.DAMAGE, targetType);
      
      // 顯示傷害提示
      this.gameController.uiManager.showToast(
        this.gameController.uiTexts.battle.damageDealt.replace('{value}', totalDamage)
      );
      
      // 更新UI
      this.gameController.uiManager.updateBattleUI();
      
      return { 
        success: true, 
        damage: totalDamage, 
        message: `造成${totalDamage}點傷害` 
      };
    } catch (error) {
      this.logger.error(`應用傷害效果失敗: ${error.message}`, error);
      return { success: false, message: '應用傷害效果失敗', error: error.message };
    }
  }
  
  /**
   * 應用護盾效果
   * @param {Object} effect - 效果對象
   * @param {string} targetType - 目標類型
   * @returns {Object} - 效果應用結果
   * @private
   */
  _applyShieldEffect(effect, targetType) {
    try {
      let shield = effect.value || 0;
      
      // 應用敏捷加成
      if (targetType === this.targetType.PLAYER) {
        // 玩家的敏捷加成
        const dexterityEffects = this.getActiveEffects(this.targetType.PLAYER).filter(e => e.type === this.effectTypes.DEXTERITY);
        for (const dexterityEffect of dexterityEffects) {
          shield += dexterityEffect.value;
        }
      } else if (targetType === this.targetType.ENEMY) {
        // 敵人的敏捷加成
        const dexterityEffects = this.getActiveEffects(this.targetType.ENEMY).filter(e => e.type === this.effectTypes.DEXTERITY);
        for (const dexterityEffect of dexterityEffects) {
          shield += dexterityEffect.value;
        }
      }
      
      // 添加護盾
      if (targetType === this.targetType.PLAYER) {
        // 添加護盾效果
        this.addActiveEffect({
          type: this.effectTypes.SHIELD,
          value: shield
        }, targetType, 1); // 護盾持續1回合
      } else if (targetType === this.targetType.ENEMY) {
        // 添加護盾效果
        this.addActiveEffect({
          type: this.effectTypes.SHIELD,
          value: shield
        }, targetType, 1); // 護盾持續1回合
      }
      
      // 播放護盾音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.defend);
      
      // 播放護盾動畫
      this._playEffectAnimation(this.effectTypes.SHIELD, targetType);
      
      // 顯示護盾提示
      this.gameController.uiManager.showToast(
        this.gameController.uiTexts.battle.shieldGained.replace('{value}', shield)
      );
      
      // 更新UI
      this.gameController.uiManager.updateBattleUI();
      
      return { 
        success: true, 
        shield: shield, 
        message: `獲得${shield}點護盾` 
      };
    } catch (error) {
      this.logger.error(`應用護盾效果失敗: ${error.message}`, error);
      return { success: false, message: '應用護盾效果失敗', error: error.message };
    }
  }
  
  /**
   * 應用治療效果
   * @param {Object} effect - 效果對象
   * @param {string} targetType - 目標類型
   * @returns {Object} - 效果應用結果
   * @private
   */
  _applyHealingEffect(effect, targetType) {
    try {
      const healing = effect.value || 0;
      
      // 應用治療
      if (targetType === this.targetType.PLAYER) {
        // 計算實際治療量
        const maxHeal = this.gameController.state.player.maxHealth - this.gameController.state.player.health;
        const actualHeal = Math.min(healing, maxHeal);
        
        // 玩家恢復生命
        this.gameController.state.player.health += actualHeal;
        this.gameController.state.progress.stats.totalHealing += actualHeal;
      } else if (targetType === this.targetType.ENEMY) {
        // 計算實際治療量
        const maxHeal = this.gameController.state.enemy.maxHealth - this.gameController.state.enemy.health;
        const actualHeal = Math.min(healing, maxHeal);
        
        // 敵人恢復生命
        this.gameController.state.enemy.health += actualHeal;
      }
      
      // 播放治療音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.heal);
      
      // 播放治療動畫
      this._playEffectAnimation(this.effectTypes.HEALING, targetType);
      
      // 顯示治療提示
      this.gameController.uiManager.showToast(
        this.gameController.uiTexts.battle.healingReceived.replace('{value}', healing)
      );
      
      // 更新UI
      this.gameController.uiManager.updateBattleUI();
      
      return { 
        success: true, 
        healing: healing, 
        message: `恢復${healing}點生命` 
      };
    } catch (error) {
      this.logger.error(`應用治療效果失敗: ${error.message}`, error);
      return { success: false, message: '應用治療效果失敗', error: error.message };
    }
  }
  
  /**
   * 應用抽牌效果
   * @param {Object} effect - 效果對象
   * @returns {Object} - 效果應用結果
   * @private
   */
  _applyDrawEffect(effect) {
    try {
      const drawCount = effect.value || 1;
      
      // 抽牌
      const drawnCards = this.gameController.cardManager.drawCards(drawCount);
      
      // 播放抽牌音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.cardDraw);
      
      // 更新UI
      this.gameController.uiManager.updateBattleUI();
      
      return { 
        success: true, 
        drawnCards: drawnCards, 
        message: `抽了${drawnCards.length}張牌` 
      };
    } catch (error) {
      this.logger.error(`應用抽牌效果失敗: ${error.message}`, error);
      return { success: false, message: '應用抽牌效果失敗', error: error.message };
    }
  }
  
  /**
   * 應用能量效果
   * @param {Object} effect - 效果對象
   * @returns {Object} - 效果應用結果
   * @private
   */
  _applyEnergyEffect(effect) {
    try {
      const energy = effect.value || 1;
      
      // 增加魔力
      this.gameController.state.player.mana = Math.min(
        this.gameController.state.player.maxMana,
        this.gameController.state.player.mana + energy
      );
      
      // 播放能量音效
      this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.energy);
      
      // 播放能量動畫
      this._playEffectAnimation(this.effectTypes.ENERGY, this.targetType.PLAYER);
      
      // 更新UI
      this.gameController.uiManager.updateBattleUI();
      
      return { 
        success: true, 
        energy: energy, 
        message: `獲得${energy}點魔力` 
      };
    } catch (error) {
      this.logger.error(`應用能量效果失敗: ${error.message}`, error);
      return { success: false, message: '應用能量效果失敗', error: error.message };
    }
  }
  
    /**
   * 應用中毒效果
   * @param {Object} effect - 效果對象
   * @param {string} targetType - 目標類型
   * @returns {Object} - 效果應用結果
   * @private
   */
    _applyPoisonEffect(effect, targetType) {
        try {
          const poisonValue = effect.value || 1;
          const duration = effect.duration || 3;
          
          // 添加中毒效果
          this.addActiveEffect({
            type: this.effectTypes.POISON,
            value: poisonValue,
            triggerTiming: this.durationType.TURN_START
          }, targetType, duration);
          
          // 播放中毒音效
          this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.poison);
          
          // 播放中毒動畫
          this._playEffectAnimation(this.effectTypes.POISON, targetType);
          
          // 顯示中毒提示
          this.gameController.uiManager.showToast(
            this.gameController.uiTexts.battle.poisonApplied
          );
          
          // 更新UI
          this.gameController.uiManager.updateBattleUI();
          
          return { 
            success: true, 
            poison: poisonValue, 
            duration: duration,
            message: `施加${poisonValue}點中毒，持續${duration}回合` 
          };
        } catch (error) {
          this.logger.error(`應用中毒效果失敗: ${error.message}`, error);
          return { success: false, message: '應用中毒效果失敗', error: error.message };
        }
      }
      
      /**
       * 應用燃燒效果
       * @param {Object} effect - 效果對象
       * @param {string} targetType - 目標類型
       * @returns {Object} - 效果應用結果
       * @private
       */
      _applyBurnEffect(effect, targetType) {
        try {
          const burnValue = effect.value || 2;
          const duration = effect.duration || 2;
          
          // 添加燃燒效果
          this.addActiveEffect({
            type: this.effectTypes.BURN,
            value: burnValue,
            triggerTiming: this.durationType.TURN_START
          }, targetType, duration);
          
          // 播放燃燒音效
          this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.burn);
          
          // 播放燃燒動畫
          this._playEffectAnimation(this.effectTypes.BURN, targetType);
          
          // 顯示燃燒提示
          this.gameController.uiManager.showToast(
            this.gameController.uiTexts.cards.effectType.burn
          );
          
          // 更新UI
          this.gameController.uiManager.updateBattleUI();
          
          return { 
            success: true, 
            burn: burnValue, 
            duration: duration,
            message: `施加${burnValue}點燃燒，持續${duration}回合` 
          };
        } catch (error) {
          this.logger.error(`應用燃燒效果失敗: ${error.message}`, error);
          return { success: false, message: '應用燃燒效果失敗', error: error.message };
        }
      }
      
      /**
       * 應用眩暈效果
       * @param {Object} effect - 效果對象
       * @param {string} targetType - 目標類型
       * @returns {Object} - 效果應用結果
       * @private
       */
      _applyStunEffect(effect, targetType) {
        try {
          const duration = effect.duration || 1;
          
          // 添加眩暈效果
          this.addActiveEffect({
            type: this.effectTypes.STUN,
            value: 1,
            triggerTiming: this.durationType.TURN_START
          }, targetType, duration);
          
          // 播放眩暈音效
          this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.stun);
          
          // 播放眩暈動畫
          this._playEffectAnimation(this.effectTypes.STUN, targetType);
          
          // 顯示眩暈提示
          this.gameController.uiManager.showToast(
            this.gameController.uiTexts.battle.stunApplied
          );
          
          // 更新UI
          this.gameController.uiManager.updateBattleUI();
          
          return { 
            success: true, 
            duration: duration,
            message: `施加眩暈，持續${duration}回合` 
          };
        } catch (error) {
          this.logger.error(`應用眩暈效果失敗: ${error.message}`, error);
          return { success: false, message: '應用眩暈效果失敗', error: error.message };
        }
      }
      
      /**
       * 應用荊棘效果
       * @param {Object} effect - 效果對象
       * @param {string} targetType - 目標類型
       * @returns {Object} - 效果應用結果
       * @private
       */
      _applyThornsEffect(effect, targetType) {
        try {
          const thornsValue = effect.value || 1;
          const duration = effect.duration || 3;
          
          // 添加荊棘效果
          this.addActiveEffect({
            type: this.effectTypes.THORNS,
            value: thornsValue,
            triggerTiming: this.durationType.INSTANT
          }, targetType, duration);
          
          // 播放荊棘音效
          this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.thorns);
          
          // 播放荊棘動畫
          this._playEffectAnimation(this.effectTypes.THORNS, targetType);
          
          // 顯示荊棘提示
          this.gameController.uiManager.showToast(
            this.gameController.uiTexts.cards.effectType.thorns || '獲得荊棘效果'
          );
          
          // 更新UI
          this.gameController.uiManager.updateBattleUI();
          
          return { 
            success: true, 
            thorns: thornsValue, 
            duration: duration,
            message: `獲得${thornsValue}點荊棘，持續${duration}回合` 
          };
        } catch (error) {
          this.logger.error(`應用荊棘效果失敗: ${error.message}`, error);
          return { success: false, message: '應用荊棘效果失敗', error: error.message };
        }
      }
      
      /**
       * 應用再生效果
       * @param {Object} effect - 效果對象
       * @param {string} targetType - 目標類型
       * @returns {Object} - 效果應用結果
       * @private
       */
      _applyRegenerationEffect(effect, targetType) {
        try {
          const regenValue = effect.value || 2;
          const duration = effect.duration || 3;
          
          // 添加再生效果
          this.addActiveEffect({
            type: this.effectTypes.REGENERATION,
            value: regenValue,
            triggerTiming: this.durationType.TURN_START
          }, targetType, duration);
          
          // 播放再生音效
          this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.heal);
          
          // 播放再生動畫
          this._playEffectAnimation(this.effectTypes.REGENERATION, targetType);
          
          // 顯示再生提示
          this.gameController.uiManager.showToast(
            this.gameController.uiTexts.cards.effectType.regeneration || '獲得再生效果'
          );
          
          // 更新UI
          this.gameController.uiManager.updateBattleUI();
          
          return { 
            success: true, 
            regeneration: regenValue, 
            duration: duration,
            message: `獲得每回合恢復${regenValue}點生命，持續${duration}回合` 
          };
        } catch (error) {
          this.logger.error(`應用再生效果失敗: ${error.message}`, error);
          return { success: false, message: '應用再生效果失敗', error: error.message };
        }
      }
      
      /**
       * 應用棄牌效果
       * @param {Object} effect - 效果對象
       * @returns {Object} - 效果應用結果
       * @private
       */
      _applyDiscardEffect(effect) {
        try {
          const discardCount = effect.value || 1;
          
          // 棄牌
          const discardedCards = this.gameController.cardManager.discardRandomCards(discardCount);
          
          // 播放棄牌音效
          this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.cardDiscard);
          
          // 更新UI
          this.gameController.uiManager.updateBattleUI();
          
          return { 
            success: true, 
            discardedCards: discardedCards, 
            message: `棄掉了${discardedCards.length}張牌` 
          };
        } catch (error) {
          this.logger.error(`應用棄牌效果失敗: ${error.message}`, error);
          return { success: false, message: '應用棄牌效果失敗', error: error.message };
        }
      }
      
      /**
       * 應用力量效果
       * @param {Object} effect - 效果對象
       * @param {string} targetType - 目標類型
       * @returns {Object} - 效果應用結果
       * @private
       */
      _applyStrengthEffect(effect, targetType) {
        try {
          const strengthValue = effect.value || 1;
          const duration = effect.permanent ? -1 : (effect.duration || 3);
          
          // 添加力量效果
          this.addActiveEffect({
            type: this.effectTypes.STRENGTH,
            value: strengthValue,
            permanent: effect.permanent || false
          }, targetType, duration);
          
          // 播放力量音效
          this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.buff);
          
          // 播放力量動畫
          this._playEffectAnimation(this.effectTypes.STRENGTH, targetType);
          
          // 顯示力量提示
          this.gameController.uiManager.showToast(
            this.gameController.uiTexts.cards.effectType.strength
          );
          
          // 更新UI
          this.gameController.uiManager.updateBattleUI();
          
          return { 
            success: true, 
            strength: strengthValue, 
            duration: duration,
            message: effect.permanent ? 
              `永久增加${strengthValue}點力量` : 
              `增加${strengthValue}點力量，持續${duration}回合` 
          };
        } catch (error) {
          this.logger.error(`應用力量效果失敗: ${error.message}`, error);
          return { success: false, message: '應用力量效果失敗', error: error.message };
        }
      }
      
      /**
       * 應用敏捷效果
       * @param {Object} effect - 效果對象
       * @param {string} targetType - 目標類型
       * @returns {Object} - 效果應用結果
       * @private
       */
      _applyDexterityEffect(effect, targetType) {
        try {
          const dexterityValue = effect.value || 1;
          const duration = effect.permanent ? -1 : (effect.duration || 3);
          
          // 添加敏捷效果
          this.addActiveEffect({
            type: this.effectTypes.DEXTERITY,
            value: dexterityValue,
            permanent: effect.permanent || false
          }, targetType, duration);
          
          // 播放敏捷音效
          this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.buff);
          
          // 播放敏捷動畫
          this._playEffectAnimation(this.effectTypes.DEXTERITY, targetType);
          
          // 顯示敏捷提示
          this.gameController.uiManager.showToast(
            this.gameController.uiTexts.cards.effectType.dexterity
          );
          
          // 更新UI
          this.gameController.uiManager.updateBattleUI();
          
          return { 
            success: true, 
            dexterity: dexterityValue, 
            duration: duration,
            message: effect.permanent ? 
              `永久增加${dexterityValue}點敏捷` : 
              `增加${dexterityValue}點敏捷，持續${duration}回合` 
          };
        } catch (error) {
          this.logger.error(`應用敏捷效果失敗: ${error.message}`, error);
          return { success: false, message: '應用敏捷效果失敗', error: error.message };
        }
      }
      
      /**
       * 應用虛弱效果
       * @param {Object} effect - 效果對象
       * @param {string} targetType - 目標類型
       * @returns {Object} - 效果應用結果
       * @private
       */
      _applyWeaknessEffect(effect, targetType) {
        try {
          const weaknessValue = effect.value || 0.25; // 默認減少25%攻擊力
          const duration = effect.duration || 2;
          
          // 添加虛弱效果
          this.addActiveEffect({
            type: this.effectTypes.WEAKNESS,
            value: weaknessValue
          }, targetType, duration);
          
          // 播放虛弱音效
          this.gameController.soundManager.play(this.gameController.imageAssets.audio.sfx.debuff);
          
          // 播放虛弱動畫
          this._playEffectAnimation(this.effectTypes.WEAKNESS, targetType);
          
          // 顯示虛弱提示
          this.gameController.uiManager.showToast(
            this.gameController.uiTexts.battle.weaknessApplied
          );
          
          // 更新UI
          this.gameController.uiManager.updateBattleUI();
          
          return { 
            success: true, 
            weakness: weaknessValue, 
            duration: duration,
            message: `施加虛弱效果，攻擊力降低${weaknessValue * 100}%，持續${duration}回合` 
          };
        } catch (error) {
          this.logger.error(`應用虛弱效果失敗: ${error.message}`, error);
          return { success: false, message: '應用虛弱效果失敗', error: error.message };
        }
      }
    }
    
    
