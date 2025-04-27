/**
 * 動畫管理器模組
 * 負責管理遊戲中的所有動畫效果，包括屏幕轉場、卡牌動畫、戰鬥效果等
 */

import { Logger } from './Logger.js';

export class AnimationManager {
  constructor(gameController) {
    this.gameController = gameController;
    this.logger = new Logger('AnimationManager');
    this.logger.info('初始化動畫管理器');
    
    // 動畫設置
    this.settings = {
      duration: {
        fast: 200,    // 快速動畫 (毫秒)
        normal: 300,  // 普通動畫 (毫秒)
        slow: 500     // 慢速動畫 (毫秒)
      },
      easing: {
        linear: 'linear',
        easeIn: 'ease-in',
        easeOut: 'ease-out',
        easeInOut: 'ease-in-out'
      }
    };
    
    // 當前活躍的動畫
    this.activeAnimations = new Set();
    
    // 動畫元素緩存
    this.animationElements = {};
  }
  
  /**
   * 播放屏幕轉場動畫
   * @param {string} [transitionType='fade'] - 轉場類型 ('fade', 'slide', 'zoom')
   * @param {number} [duration=300] - 動畫持續時間 (毫秒)
   */
  playScreenTransition(transitionType = 'fade', duration = this.settings.duration.normal) {
    try {
      const container = document.getElementById('game-container');
      if (!container) {
        this.logger.warn('找不到遊戲容器元素');
        return;
      }
      
      // 創建轉場覆蓋層
      const overlay = document.createElement('div');
      overlay.className = 'screen-transition-overlay';
      overlay.style.position = 'absolute';
      overlay.style.top = '0';
      overlay.style.left = '0';
      overlay.style.width = '100%';
      overlay.style.height = '100%';
      overlay.style.zIndex = '9999';
      overlay.style.pointerEvents = 'none';
      
      // 根據轉場類型設置動畫
      switch (transitionType) {
        case 'fade':
          overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
          overlay.style.opacity = '0';
          overlay.style.transition = `opacity ${duration}ms ease-in-out`;
          
          // 添加到 DOM
          container.appendChild(overlay);
          
          // 強制重繪
          overlay.offsetHeight;
          
          // 播放淡入動畫
          overlay.style.opacity = '1';
          
          // 淡入完成後淡出
          setTimeout(() => {
            overlay.style.opacity = '0';
            setTimeout(() => {
              container.removeChild(overlay);
            }, duration);
          }, duration);
          break;
          
        case 'slide':
          overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
          overlay.style.transform = 'translateX(-100%)';
          overlay.style.transition = `transform ${duration}ms ease-in-out`;
          
          // 添加到 DOM
          container.appendChild(overlay);
          
          // 強制重繪
          overlay.offsetHeight;
          
          // 播放滑入動畫
          overlay.style.transform = 'translateX(0)';
          
          // 滑入完成後滑出
          setTimeout(() => {
            overlay.style.transform = 'translateX(100%)';
            setTimeout(() => {
              container.removeChild(overlay);
            }, duration);
          }, duration);
          break;
          
        case 'zoom':
          overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
          overlay.style.transform = 'scale(0)';
          overlay.style.opacity = '0';
          overlay.style.transition = `transform ${duration}ms ease-in-out, opacity ${duration}ms ease-in-out`;
          
          // 添加到 DOM
          container.appendChild(overlay);
          
          // 強制重繪
          overlay.offsetHeight;
          
          // 播放縮放動畫
          overlay.style.transform = 'scale(1)';
          overlay.style.opacity = '1';
          
          // 縮放完成後縮小
          setTimeout(() => {
            overlay.style.transform = 'scale(2)';
            overlay.style.opacity = '0';
            setTimeout(() => {
              container.removeChild(overlay);
            }, duration);
          }, duration);
          break;
          
        default:
          this.logger.warn(`未知的轉場類型: ${transitionType}`);
          return;
      }
      
      this.logger.debug(`播放屏幕轉場動畫: ${transitionType}`);
    } catch (error) {
      this.logger.error(`播放屏幕轉場動畫失敗: ${error.message}`, error);
    }
  }
  
  /**
   * 播放卡牌動畫
   * @param {HTMLElement} cardElement - 卡牌元素
   * @param {string} animationType - 動畫類型 ('draw', 'play', 'discard', 'shuffle')
   */
  playCardAnimation(cardElement, animationType) {
    try {
      if (!cardElement) {
        this.logger.warn('卡牌元素不存在');
        return;
      }
      
      // 生成唯一動畫ID
      const animationId = `card_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // 保存原始樣式
      const originalTransform = cardElement.style.transform;
      const originalTransition = cardElement.style.transition;
      const originalZIndex = cardElement.style.zIndex;
      
      // 設置動畫樣式
      cardElement.style.transition = `transform ${this.settings.duration.normal}ms ${this.settings.easing.easeInOut}`;
      cardElement.style.zIndex = '100';
      
      // 根據動畫類型設置不同的動畫
      switch (animationType) {
        case 'draw':
          // 抽牌動畫：從牌庫位置移動到手牌位置
          cardElement.style.transform = 'scale(0.1) translateY(-200px)';
          
          // 強制重繪
          cardElement.offsetHeight;
          
          // 播放動畫
          cardElement.style.transform = 'scale(1) translateY(0)';
          break;
          
        case 'play':
          // 打出卡牌動畫：放大並移動到場地中央
          cardElement.style.transform = 'scale(1.2) translateY(-50px)';
          
          // 強制重繪
          cardElement.offsetHeight;
          
          // 播放動畫
          setTimeout(() => {
            cardElement.style.transform = 'scale(0.1) translateY(-200px)';
            cardElement.style.opacity = '0';
          }, this.settings.duration.normal);
          break;
          
        case 'discard':
          // 棄牌動畫：移動到棄牌堆位置
          cardElement.style.transform = 'scale(0.1) translateX(200px) translateY(100px)';
          cardElement.style.opacity = '0';
          break;
          
        case 'shuffle':
          // 洗牌動畫：旋轉並縮小
          cardElement.style.transform = 'rotate(360deg) scale(0.1)';
          cardElement.style.opacity = '0';
          break;
          
        default:
          this.logger.warn(`未知的卡牌動畫類型: ${animationType}`);
          return;
      }
      
      // 將動畫添加到活躍動畫集合
      this.activeAnimations.add(animationId);
      
      // 動畫結束後恢復原始樣式
      setTimeout(() => {
        if (animationType !== 'play' && animationType !== 'discard' && animationType !== 'shuffle') {
          cardElement.style.transform = originalTransform;
        }
        cardElement.style.transition = originalTransition;
        cardElement.style.zIndex = originalZIndex;
        
        // 從活躍動畫集合中移除
        this.activeAnimations.delete(animationId);
      }, this.settings.duration.normal);
      
      this.logger.debug(`播放卡牌動畫: ${animationType}`);
    } catch (error) {
      this.logger.error(`播放卡牌動畫失敗: ${error.message}`, error);
    }
  }
  
  /**
   * 播放戰鬥效果動畫
   * @param {string} effectType - 效果類型 ('attack', 'heal', 'shield', 'poison', 等)
   * @param {HTMLElement} targetElement - 目標元素
   */
  playEffectAnimation(effectType, targetElement) {
    try {
      if (!targetElement) {
        this.logger.warn('目標元素不存在');
        return;
      }
      
      // 生成唯一動畫ID
      const animationId = `effect_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
      
      // 創建效果元素
      const effectElement = document.createElement('div');
      effectElement.className = `effect-animation effect-${effectType}`;
      effectElement.style.position = 'absolute';
      effectElement.style.pointerEvents = 'none';
      
      // 獲取目標元素的位置和尺寸
      const targetRect = targetElement.getBoundingClientRect();
      const containerRect = document.getElementById('game-container').getBoundingClientRect();
      
      // 設置效果元素的位置
      effectElement.style.left = `${targetRect.left - containerRect.left + targetRect.width / 2 - 50}px`;
      effectElement.style.top = `${targetRect.top - containerRect.top + targetRect.height / 2 - 50}px`;
      effectElement.style.width = '100px';
      effectElement.style.height = '100px';
      
      // 根據效果類型設置背景圖片和動畫
      switch (effectType) {
        case 'attack':
          effectElement.style.backgroundImage = `url(${this.gameController.imageAssets.effects.attack})`;
          effectElement.style.animation = 'attack-effect 0.5s forwards';
          break;
          
        case 'heal':
          effectElement.style.backgroundImage = `url(${this.gameController.imageAssets.effects.heal})`;
          effectElement.style.animation = 'heal-effect 1s forwards';
          break;
          
        case 'shield':
          effectElement.style.backgroundImage = `url(${this.gameController.imageAssets.effects.shield})`;
          effectElement.style.animation = 'shield-effect 0.8s forwards';
          break;
          
        case 'poison':
          effectElement.style.backgroundImage = `url(${this.gameController.imageAssets.effects.poison})`;
          effectElement.style.animation = 'poison-effect 0.8s forwards';
          break;
          
        case 'fire':
          effectElement.style.backgroundImage = `url(${this.gameController.imageAssets.effects.fire})`;
          effectElement.style.animation = 'fire-effect 0.8s forwards';
          break;
          
        case 'ice':
          effectElement.style.backgroundImage = `url(${this.gameController.imageAssets.effects.ice})`;
          effectElement.style.animation = 'ice-effect 0.8s forwards';
          break;
          
        case 'lightning':
          effectElement.style.backgroundImage = `url(${this.gameController.imageAssets.effects.lightning})`;
          effectElement.style.animation = 'lightning-effect 0.5s forwards';
          break;
          
        default:
          this.logger.warn(`未知的效果動畫類型: ${effectType}`);
          return;
      }
      
      // 添加到 DOM
      document.getElementById('game-container').appendChild(effectElement);
      
      // 將動畫添加到活躍動畫集合
      this.activeAnimations.add(animationId);
      
      // 動畫結束後移除元素
      setTimeout(() => {
        if (effectElement.parentNode) {
          effectElement.parentNode.removeChild(effectElement);
        }
        
        // 從活躍動畫集合中移除
        this.activeAnimations.delete(animationId);
      }, 1000);
      
      this.logger.debug(`播放效果動畫: ${effectType}`);
    } catch (error) {
      this.logger.error(`播放效果動畫失敗: ${error.message}`, error);
    }
  }
  
  /**
   * 播放數值變化動畫
   * @param {HTMLElement} targetElement - 目標元素
   * @param {number} value - 變化值
   * @param {string} type - 變化類型 ('damage', 'heal', 'mana', 'gold')
   */
  playValueChangeAnimation(targetElement, value, type) {
    try {
      if (!targetElement) {
        this.logger.warn('目標元素不存在');
        return;
      }
      
      // 創建數值顯示元素
      const valueElement = document.createElement('div');
      valueElement.className = `value-animation value-${type}`;
      valueElement.style.position = 'absolute';
      valueElement.style.pointerEvents = 'none';
      valueElement.style.fontWeight = 'bold';
      valueElement.style.fontSize = '24px';
      valueElement.style.textShadow = '0 0 3px #000';
      valueElement.style.zIndex = '1000';
      
      // 獲取目標元素的位置和尺寸
      const targetRect = targetElement.getBoundingClientRect();
      const containerRect = document.getElementById('game-container').getBoundingClientRect();
      
      // 設置數值元素的位置
      valueElement.style.left = `${targetRect.left - containerRect.left + targetRect.width / 2}px`;
      valueElement.style.top = `${targetRect.top - containerRect.top + targetRect.height / 2}px`;
      
      // 根據類型設置顏色和前綴
      let prefix = '';
      switch (type) {
        case 'damage':
          valueElement.style.color = '#ff4444';
          prefix = '-';
          break;
          
        case 'heal':
          valueElement.style.color = '#44ff44';
          prefix = '+';
          break;
          
        case 'mana':
          valueElement.style.color = '#4444ff';
          prefix = value >= 0 ? '+' : '';
          break;
          
        case 'gold':
          valueElement.style.color = '#ffcc00';
          prefix = value >= 0 ? '+' : '';
          break;
          
        default:
          valueElement.style.color = '#ffffff';
          prefix = value >= 0 ? '+' : '';
      }
      
      // 設置文本內容
      valueElement.textContent = `${prefix}${value}`;
      
      // 設置動畫
      valueElement.style.transition = `transform ${this.settings.duration.normal}ms ease-out, opacity ${this.settings.duration.normal}ms ease-out`;
      valueElement.style.opacity = '0';
      valueElement.style.transform = 'translateY(0)';
      
      // 添加到 DOM
      document.getElementById('game-container').appendChild(valueElement);
      
      // 強制重繪
      valueElement.offsetHeight;
      
      // 播放動畫
      valueElement.style.opacity = '1';
      valueElement.style.transform = 'translateY(-30px)';
      
      // 動畫結束後移除元素
      setTimeout(() => {
        valueElement.style.opacity = '0';
        setTimeout(() => {
          if (valueElement.parentNode) {
            valueElement.parentNode.removeChild(valueElement);
          }
        }, this.settings.duration.normal);
      }, this.settings.duration.normal);
      
      this.logger.debug(`播放數值變化動畫: ${type} ${value}`);
    } catch (error) {
      this.logger.error(`播放數值變化動畫失敗: ${error.message}`, error);
    }
  }
  
  /**
   * 播放敵人動畫
   * @param {HTMLElement} enemyElement - 敵人元素
   * @param {string} animationType - 動畫類型 ('attack', 'hurt', 'death')
   */
  playEnemyAnimation(enemyElement, animationType) {
    try {
      if (!enemyElement) {
        this.logger.warn('敵人元素不存在');
        return;
      }
      
      // 保存原始樣式
      const originalTransform = enemyElement.style.transform;
      const originalTransition = enemyElement.style.transition;
      const originalFilter = enemyElement.style.filter;
      
      // 設置動畫樣式
      enemyElement.style.transition = `transform ${this.settings.duration.fast}ms ${this.settings.easing.easeInOut}, filter ${this.settings.duration.fast}ms ${this.settings.easing.easeInOut}`;
      
      // 根據動畫類型設置不同的動畫
      switch (animationType) {
        case 'attack':
          // 攻擊動畫：向前移動然後返回
          enemyElement.style.transform = 'translateX(-20px)';
          
          setTimeout(() => {
            enemyElement.style.transform = 'translateX(0)';
          }, this.settings.duration.fast);
          break;
          
        case 'hurt':
          // 受傷動畫：閃爍紅色
          enemyElement.style.filter = 'brightness(2) saturate(2) hue-rotate(-30deg)';
          
          setTimeout(() => {
            enemyElement.style.filter = originalFilter;
          }, this.settings.duration.fast);
          break;
          
        case 'death':
          // 死亡動畫：淡出並旋轉
          enemyElement.style.transition = `transform ${this.settings.duration.slow}ms ${this.settings.easing.easeInOut}, opacity ${this.settings.duration.slow}ms ${this.settings.easing.easeInOut}`;
          enemyElement.style.transform = 'rotate(20deg) scale(0.8)';
          enemyElement.style.opacity = '0';
          break;
          
        default:
          this.logger.warn(`未知的敵人動畫類型: ${animationType}`);
          return;
      }
      
      // 動畫結束後恢復原始樣式
      setTimeout(() => {
        if (animationType !== 'death') {
          enemyElement.style.transform = originalTransform;
          enemyElement.style.filter = originalFilter;
        }
        enemyElement.style.transition = originalTransition;
      }, animationType === 'death' ? this.settings.duration.slow : this.settings.duration.fast);
      
      this.logger.debug(`播放敵人動畫: ${animationType}`);
    } catch (error) {
      this.logger.error(`播放敵人動畫失敗: ${error.message}`, error);
    }
  }
  
  /**
   * 播放玩家動畫
   * @param {HTMLElement} playerElement - 玩家元素
   * @param {string} animationType - 動畫類型 ('attack', 'hurt', 'victory', 'defeat')
   */
  playPlayerAnimation(playerElement, animationType) {
    try {
      if (!playerElement) {
        this.logger.warn('玩家元素不存在');
        return;
      }
      
      // 保存原始樣式
      const originalTransform = playerElement.style.transform;
      const originalTransition = playerElement.style.transition;
      const originalFilter = playerElement.style.filter;
      
      // 設置動畫樣式
      playerElement.style.transition = `transform ${this.settings.duration.fast}ms ${this.settings.easing.easeInOut}, filter ${this.settings.duration.fast}ms ${this.settings.easing.easeInOut}`;
      
      // 根據動畫類型設置不同的動畫
      switch (animationType) {
        case 'attack':
          // 攻擊動畫：向前移動然後返回
          playerElement.style.transform = 'translateX(20px)';
          
          setTimeout(() => {
            playerElement.style.transform = 'translateX(0)';
          }, this.settings.duration.fast);
          break;
          
        case 'hurt':
          // 受傷動畫：閃爍紅色
          playerElement.style.filter = 'brightness(2) saturate(2) hue-rotate(-30deg)';
          
          setTimeout(() => {
            playerElement.style.filter = originalFilter;
          }, this.settings.duration.fast);
          break;
          
        case 'victory':
          // 勝利動畫：上下跳動
          playerElement.style.animation = 'victory-bounce 0.5s ease-in-out infinite alternate';
          playerElement.style.filter = 'brightness(1.2)';
          break;
          
        case 'defeat':
          // 失敗動畫：向下倒
          playerElement.style.transition = `transform ${this.settings.duration.slow}ms ${this.settings.easing.easeInOut}, opacity ${this.settings.duration.slow}ms ${this.settings.easing.easeInOut}`;
          playerElement.style.transform = 'rotate(-20deg) scale(0.8) translateY(20px)';
          playerElement.style.filter = 'grayscale(0.7) brightness(0.7)';
          break;
          
        default:
          this.logger.warn(`未知的玩家動畫類型: ${animationType}`);
          return;
      }
      
      // 動畫結束後恢復原始樣式
      if (animationType !== 'victory' && animationType !== 'defeat') {
        setTimeout(() => {
          playerElement.style.transform = originalTransform;
          playerElement.style.filter = originalFilter;
          playerElement.style.transition = originalTransition;
        }, this.settings.duration.fast);
      }
      
      this.logger.debug(`播放玩家動畫: ${animationType}`);
    } catch (error) {
      this.logger.error(`播放玩家動畫失敗: ${error.message}`, error);
    }
  }
  
  /**
   * 停止所有動畫
   */
  stopAllAnimations() {
    try {
      // 移除所有效果元素
      const effectElements = document.querySelectorAll('.effect-animation, .value-animation');
      effectElements.forEach(element => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      });
      
      // 清空活躍動畫集合
      this.activeAnimations.clear();
      
      this.logger.debug('停止所有動畫');
    } catch (error) {
      this.logger.error(`停止所有動畫失敗: ${error.message}`, error);
    }
  }
  
  /**
   * 播放成就解鎖動畫
   * @param {Object} achievement - 成就對象
   */
  playAchievementUnlockAnimation(achievement) {
    try {
      if (!achievement) {
        this.logger.warn('成就對象不存在');
        return;
      }
      
      // 創建成就通知元素
      const achievementElement = document.createElement('div');
      achievementElement.className = 'achievement-notification';
      achievementElement.style.position = 'absolute';
      achievementElement.style.top = '20px';
      achievementElement.style.right = '-300px';
      achievementElement.style.width = '280px';
      achievementElement.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
      achievementElement.style.borderRadius = '5px';
      achievementElement.style.padding = '10px';
      achievementElement.style.boxShadow = '0 0 10px rgba(255, 204, 0, 0.5)';
      achievementElement.style.color = '#fff';
      achievementElement.style.zIndex = '1000';
      achievementElement.style.transition = 'right 0.5s ease-out';
      
      // 創建成就內容
      achievementElement.innerHTML = `
        <div style="display: flex; align-items: center;">
          <img src="${achievement.icon || this.gameController.imageAssets.achievements[achievement.id]}" style="width: 40px; height: 40px; margin-right: 10px;">
          <div>
            <div style="font-weight: bold; color: #ffcc00;">成就解鎖！</div>
            <div>${achievement.name}</div>
          </div>
        </div>
        <div style="margin-top: 5px; font-size: 12px;">${achievement.description}</div>
      `;
      
      // 添加到 DOM
      document.getElementById('game-container').appendChild(achievementElement);
      
      // 強制重繪
      achievementElement.offsetHeight;
      
      // 播放滑入動畫
      achievementElement.style.right = '20px';
      
      // 顯示一段時間後滑出
      setTimeout(() => {
        achievementElement.style.right = '-300px';
        
        // 滑出後移除元素
        setTimeout(() => {
          if (achievementElement.parentNode) {
            achievementElement.parentNode.removeChild(achievementElement);
          }
        }, 500);
      }, 3000);
      
      this.logger.debug(`播放成就解鎖動畫: ${achievement.name}`);
    } catch (error) {
      this.logger.error(`播放成就解鎖動畫失敗: ${error.message}`, error);
    }
  }
  
  /**
   * 播放升級動畫
   * @param {HTMLElement} targetElement - 目標元素
   */
  playLevelUpAnimation(targetElement) {
    try {
      if (!targetElement) {
        this.logger.warn('目標元素不存在');
        return;
      }
      
      // 創建升級效果元素
      const levelUpElement = document.createElement('div');
      levelUpElement.className = 'level-up-animation';
      levelUpElement.style.position = 'absolute';
      levelUpElement.style.pointerEvents = 'none';
      levelUpElement.style.width = '100%';
      levelUpElement.style.height = '100%';
      levelUpElement.style.backgroundImage = 'radial-gradient(circle, rgba(255,204,0,0) 0%, rgba(255,204,0,0.3) 50%, rgba(255,204,0,0) 100%)';
      levelUpElement.style.backgroundSize = '200% 200%';
      levelUpElement.style.backgroundPosition = 'center';
      levelUpElement.style.animation = 'level-up-pulse 1s ease-in-out 3';
      levelUpElement.style.opacity = '0';
      
      // 獲取目標元素的位置和尺寸
      const targetRect = targetElement.getBoundingClientRect();
      const containerRect = document.getElementById('game-container').getBoundingClientRect();
      
      // 設置升級效果元素的位置
      levelUpElement.style.left = `${targetRect.left - containerRect.left}px`;
      levelUpElement.style.top = `${targetRect.top - containerRect.top}px`;
      levelUpElement.style.width = `${targetRect.width}px`;
      levelUpElement.style.height = `${targetRect.height}px`;
      
      // 創建文字元素
      const textElement = document.createElement('div');
      textElement.textContent = '升級！';
      textElement.style.position = 'absolute';
      textElement.style.top = '50%';
      textElement.style.left = '50%';
      textElement.style.transform = 'translate(-50%, -50%)';
      textElement.style.color = '#ffcc00';
      textElement.style.fontWeight = 'bold';
      textElement.style.fontSize = '24px';
      textElement.style.textShadow = '0 0 10px #ffcc00';
      textElement.style.animation = 'level-up-text 1s ease-in-out infinite alternate';
      
      // 添加文字元素到升級效果元素
      levelUpElement.appendChild(textElement);
      
      // 添加到 DOM
      document.getElementById('game-container').appendChild(levelUpElement);
      
      // 強制重繪
      levelUpElement.offsetHeight;
      
      // 播放動畫
      levelUpElement.style.opacity = '1';
      
      // 動畫結束後移除元素
      setTimeout(() => {
        levelUpElement.style.opacity = '0';
        setTimeout(() => {
          if (levelUpElement.parentNode) {
            levelUpElement.parentNode.removeChild(levelUpElement);
          }
        }, 500);
      }, 3000);
      
      this.logger.debug('播放升級動畫');
    } catch (error) {
      this.logger.error(`播放升級動畫失敗: ${error.message}`, error);
    }
  }
}