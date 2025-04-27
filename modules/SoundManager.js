/**
 * 音效管理器模組
 * 負責管理遊戲中的所有音效和背景音樂，使用 Howler.js 庫來處理音頻播放
 */

import { Logger } from './Logger.js';

export class SoundManager {
  constructor(gameController) {
    this.gameController = gameController;
    this.logger = new Logger('SoundManager');
    this.logger.info('初始化音效管理器');
    
    // 音頻對象
    this.sounds = {};
    this.bgm = {};
    this.currentBGM = null;
    
    // 音量設置
    this.musicVolume = 0.5;
    this.soundVolume = 0.5;
    
    // 音頻狀態
    this.isMuted = false;
    this.isInitialized = false;
  }
  
  /**
   * 初始化音效系統
   */
  init() {
    try {
      this.logger.info('初始化音效系統...');
      
      // 載入設置
      const settings = this.gameController.state.settings;
      this.musicVolume = settings.musicVolume;
      this.soundVolume = settings.soundVolume;
      
      // 預加載背景音樂
      this._loadBGM();
      
      // 預加載音效
      this._loadSFX();
      
      this.isInitialized = true;
      this.logger.info('音效系統初始化完成');
    } catch (error) {
      this.logger.error('初始化音效系統失敗', error);
      throw error;
    }
  }
  
  /**
   * 加載背景音樂
   * @private
   */
  _loadBGM() {
    try {
      const bgmPaths = this.gameController.imageAssets.audio.bgm;
      
      // 遍歷所有背景音樂路徑
      for (const [key, path] of Object.entries(bgmPaths)) {
        this.bgm[key] = new Howl({
          src: [path],
          loop: true,
          volume: this.musicVolume,
          preload: true,
          html5: true
        });
        
        this.logger.debug(`加載背景音樂: ${key}`);
      }
    } catch (error) {
      this.logger.error('加載背景音樂失敗', error);
    }
  }
  
  /**
   * 加載音效
   * @private
   */
  _loadSFX() {
    try {
      const sfxPaths = this.gameController.imageAssets.audio.sfx;
      
      // 遍歷所有音效路徑
      for (const [key, path] of Object.entries(sfxPaths)) {
        this.sounds[key] = new Howl({
          src: [path],
          loop: false,
          volume: this.soundVolume,
          preload: true
        });
        
        this.logger.debug(`加載音效: ${key}`);
      }
    } catch (error) {
      this.logger.error('加載音效失敗', error);
    }
  }
  
  /**
   * 播放背景音樂
   * @param {string} bgmKey - 背景音樂的鍵名或路徑
   */
  playBGM(bgmKey) {
    try {
      if (!this.isInitialized) {
        this.logger.warn('音效系統尚未初始化');
        return;
      }
      
      // 停止當前播放的背景音樂
      this.stopBGM();
      
      // 檢查是否是路徑還是鍵名
      let bgm;
      if (typeof bgmKey === 'string' && bgmKey.includes('/')) {
        // 如果是路徑，創建新的 Howl 對象
        bgm = new Howl({
          src: [bgmKey],
          loop: true,
          volume: this.musicVolume,
          html5: true
        });
      } else {
        // 如果是鍵名，使用預加載的背景音樂
        bgm = this.bgm[bgmKey];
      }
      
      if (!bgm) {
        this.logger.warn(`找不到背景音樂: ${bgmKey}`);
        return;
      }
      
      // 播放背景音樂
      bgm.volume(this.musicVolume);
      bgm.play();
      this.currentBGM = bgm;
      
      this.logger.info(`播放背景音樂: ${bgmKey}`);
    } catch (error) {
      this.logger.error(`播放背景音樂失敗: ${bgmKey}`, error);
    }
  }
  
  /**
   * 停止背景音樂
   */
  stopBGM() {
    try {
      if (this.currentBGM) {
        this.currentBGM.stop();
        this.currentBGM = null;
        this.logger.debug('停止背景音樂');
      }
    } catch (error) {
      this.logger.error('停止背景音樂失敗', error);
    }
  }
  
  /**
   * 暫停背景音樂
   */
  pauseBGM() {
    try {
      if (this.currentBGM) {
        this.currentBGM.pause();
        this.logger.debug('暫停背景音樂');
      }
    } catch (error) {
      this.logger.error('暫停背景音樂失敗', error);
    }
  }
  
  /**
   * 恢復背景音樂
   */
  resumeBGM() {
    try {
      if (this.currentBGM) {
        this.currentBGM.play();
        this.logger.debug('恢復背景音樂');
      }
    } catch (error) {
      this.logger.error('恢復背景音樂失敗', error);
    }
  }
  
  /**
   * 播放音效
   * @param {string} soundKey - 音效的鍵名或路徑
   */
  play(soundKey) {
    try {
      if (!this.isInitialized) {
        this.logger.warn('音效系統尚未初始化');
        return;
      }
      
      // 檢查是否是路徑還是鍵名
      let sound;
      if (typeof soundKey === 'string' && soundKey.includes('/')) {
        // 如果是路徑，創建新的 Howl 對象
        sound = new Howl({
          src: [soundKey],
          loop: false,
          volume: this.soundVolume
        });
      } else {
        // 如果是鍵名，使用預加載的音效
        sound = this.sounds[soundKey];
      }
      
      if (!sound) {
        this.logger.warn(`找不到音效: ${soundKey}`);
        return;
      }
      
      // 播放音效
      sound.volume(this.soundVolume);
      sound.play();
      
      this.logger.debug(`播放音效: ${soundKey}`);
    } catch (error) {
      this.logger.error(`播放音效失敗: ${soundKey}`, error);
    }
  }
  
  /**
   * 更新音量設置
   */
  updateVolume() {
    try {
      const settings = this.gameController.state.settings;
      this.musicVolume = settings.musicVolume;
      this.soundVolume = settings.soundVolume;
      
      // 更新當前播放的背景音樂音量
      if (this.currentBGM) {
        this.currentBGM.volume(this.musicVolume);
      }
      
      // 更新所有預加載的背景音樂音量
      for (const bgm of Object.values(this.bgm)) {
        bgm.volume(this.musicVolume);
      }
      
      // 更新所有預加載的音效音量
      for (const sound of Object.values(this.sounds)) {
        sound.volume(this.soundVolume);
      }
      
      this.logger.info(`更新音量設置: 音樂=${this.musicVolume}, 音效=${this.soundVolume}`);
    } catch (error) {
      this.logger.error('更新音量設置失敗', error);
    }
  }
  
  /**
   * 靜音所有音頻
   * @param {boolean} muted - 是否靜音
   */
  setMuted(muted) {
    try {
      this.isMuted = muted;
      
      // 設置 Howler 全局靜音
      Howler.mute(muted);
      
      this.logger.info(`${muted ? '靜音' : '取消靜音'}所有音頻`);
    } catch (error) {
      this.logger.error(`${muted ? '靜音' : '取消靜音'}所有音頻失敗`, error);
    }
  }
  
  /**
   * 釋放資源
   */
  dispose() {
    try {
      // 停止所有音頻
      this.stopBGM();
      Howler.stop();
      
      // 清空音頻對象
      this.sounds = {};
      this.bgm = {};
      this.currentBGM = null;
      
      this.isInitialized = false;
      this.logger.info('釋放音效系統資源');
    } catch (error) {
      this.logger.error('釋放音效系統資源失敗', error);
    }
  }
}