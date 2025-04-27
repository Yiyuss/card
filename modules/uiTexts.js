/**
 * UI文字模組
 * 集中管理所有遊戲中顯示的文字，便於多語言支持和統一修改
 */

// 遊戲文字內容
const UITexts = {
    // 通用文字
    common: {
      confirm: '確認',
      cancel: '取消',
      back: '返回',
      loading: '載入中...',
      error: '錯誤',
      success: '成功',
      warning: '警告',
      info: '提示',
      yes: '是',
      no: '否',
      ok: '確定',
      next: '下一步',
      prev: '上一步',
      save: '保存',
      load: '載入',
      delete: '刪除',
      edit: '編輯',
      close: '關閉',
      settings: '設置',
      help: '幫助',
      exit: '退出',
      restart: '重新開始',
      continue: '繼續',
      pause: '暫停',
      resume: '恢復',
      quit: '退出遊戲',
      mainMenu: '主菜單',
      levelSelect: '選擇關卡',
      cardDeck: '卡牌牌組',
      shop: '商店',
      inventory: '背包',
      achievements: '成就',
      statistics: '統計',
      credits: '製作人員',
      version: '版本',
    },
    
    // 主菜單文字
    mainMenu: {
      title: '卡牌冒險',
      newGame: '新遊戲',
      loadGame: '載入遊戲',
      continue: '繼續遊戲',
      settings: '設置',
      exit: '退出',
      credits: '製作人員',
    },
    
    // 戰鬥界面文字
    battle: {
      playerTurn: '你的回合',
      enemyTurn: '敵人回合',
      endTurn: '結束回合',
      surrender: '投降',
      useCard: '使用卡牌',
      drawCard: '抽牌',
      discardCard: '棄牌',
      shuffleDeck: '洗牌',
      health: '生命值',
      mana: '魔力值',
      attack: '攻擊力',
      defense: '防禦力',
      effects: '效果',
      turnCount: '回合數',
      deckCount: '牌庫剩餘',
      discardCount: '棄牌堆',
      handCount: '手牌數',
      noMana: '魔力不足',
      deckEmpty: '牌庫已空',
      reshuffleDiscard: '棄牌堆已洗入牌庫',
      effectApplied: '效果已應用',
      effectExpired: '效果已過期',
      damageDealt: '造成傷害',
      healingReceived: '恢復生命',
      shieldGained: '獲得護盾',
      weaknessApplied: '施加虛弱',
      poisonApplied: '施加中毒',
      stunApplied: '施加眩暈',
    },
    
    // 遊戲結束界面文字
    gameOver: {
      victory: '勝利！',
      defeat: '失敗！',
      levelCompleted: '關卡完成',
      rewards: '獎勵',
      experience: '經驗值',
      gold: '金幣',
      newCard: '獲得新卡牌',
      levelUp: '升級！',
      healthIncreased: '生命值上限提升',
      manaIncreased: '魔力值上限提升',
      newLevelUnlocked: '解鎖新關卡',
      retry: '重試',
      nextLevel: '下一關',
      backToMenu: '返回主菜單',
      statistics: '戰鬥統計',
      damageDealt: '造成總傷害',
      healingDone: '總治療量',
      cardsPlayed: '使用卡牌數',
      turnsPlayed: '回合數',
      timeSpent: '戰鬥時間',
    },
    
    // 設置界面文字
    settings: {
      title: '設置',
      music: '音樂音量',
      sound: '音效音量',
      language: '語言',
      difficulty: '難度',
      fullscreen: '全屏模式',
      vibration: '震動',
      notifications: '通知',
      tutorial: '教程',
      reset: '重置遊戲數據',
      resetConfirm: '確定要重置所有遊戲數據嗎？',
      resetSuccess: '遊戲數據已重置',
      resetFailed: '重置遊戲數據失敗',
      difficultyEasy: '簡單',
      difficultyNormal: '普通',
      difficultyHard: '困難',
      languageChinese: '中文',
      languageEnglish: '英文',
      apply: '應用',
      default: '恢復默認',
    },
    
    // 卡牌相關文字
    cards: {
      attack: '攻擊',
      defense: '防禦',
      magic: '魔法',
      skill: '技能',
      item: '道具',
      special: '特殊',
      manaCost: '魔力消耗',
      description: '描述',
      rarity: {
        common: '普通',
        uncommon: '罕見',
        rare: '稀有',
        epic: '史詩',
        legendary: '傳說',
      },
      type: {
        attack: '攻擊牌',
        defense: '防禦牌',
        skill: '技能牌',
        power: '能力牌',
        curse: '詛咒牌',
      },
      effectType: {
        damage: '傷害',
        healing: '治療',
        shield: '護盾',
        weakness: '虛弱',
        strength: '力量',
        dexterity: '敏捷',
        poison: '中毒',
        burn: '燃燒',
        stun: '眩暈',
        draw: '抽牌',
        discard: '棄牌',
        energy: '能量',
      },
    },
    
    // 敵人相關文字
    enemies: {
      intent: {
        attack: '準備攻擊',
        defend: '準備防禦',
        buff: '準備增益',
        debuff: '準備減益',
        special: '準備特殊行動',
        unknown: '未知意圖',
      },
      type: {
        normal: '普通',
        elite: '精英',
        boss: '首領',
      },
    },
    
    // 提示文字
    tooltips: {
      health: '你的生命值。當生命值降至0時，遊戲結束。',
      mana: '你的魔力值。使用卡牌需要消耗魔力。',
      deck: '你的牌庫。包含所有可抽取的卡牌。',
      hand: '你的手牌。可以使用的卡牌。',
      discard: '棄牌堆。使用過的卡牌會放入此處。',
      effects: '當前效果。影響你或敵人的各種狀態。',
      enemyIntent: '敵人的意圖。顯示敵人下一回合將要採取的行動。',
      endTurn: '結束你的回合，敵人開始行動。',
      cardDetails: '點擊查看卡牌詳情。',
      levelUp: '升級後，生命值和魔力值上限會提升。',
    },
    
    // 錯誤信息
    errors: {
      loadFailed: '載入失敗',
      saveFailed: '保存失敗',
      connectionError: '連接錯誤',
      dataCorrupted: '數據損壞',
      resourceMissing: '資源缺失',
      invalidOperation: '無效操作',
      cardNotFound: '找不到卡牌',
      enemyNotFound: '找不到敵人',
      levelNotFound: '找不到關卡',
      insufficientResources: '資源不足',
      featureDisabled: '功能未啟用',
      browserNotSupported: '瀏覽器不支持',
    },
    
    // 成就相關文字
    achievements: {
      unlocked: '解鎖成就',
      progress: '進度',
      hidden: '隱藏成就',
      categories: {
        gameplay: '遊戲進度',
        collection: '收集',
        challenge: '挑戰',
        secret: '秘密',
      },
    },
    
    // 教程文字
    tutorial: {
      welcome: '歡迎來到卡牌冒險！',
      basics: '基礎教程',
      combat: '戰鬥教程',
      cards: '卡牌教程',
      deckBuilding: '構築牌組',
      advanced: '進階技巧',
      tips: '小貼士',
      skip: '跳過教程',
    },
  };
  
  // 獲取文字的函數
  function getText(category, key, subKey = null) {
    try {
      if (!UITexts[category]) {
        console.warn(`文字類別不存在: ${category}`);
        return `[${category}.${key}]`;
      }
      
      if (subKey !== null) {
        if (!UITexts[category][key]) {
          console.warn(`文字鍵不存在: ${category}.${key}`);
          return `[${category}.${key}.${subKey}]`;
        }
        
        if (!UITexts[category][key][subKey]) {
          console.warn(`文字子鍵不存在: ${category}.${key}.${subKey}`);
          return `[${category}.${key}.${subKey}]`;
        }
        
        return UITexts[category][key][subKey];
      } else {
        if (!UITexts[category][key]) {
          console.warn(`文字鍵不存在: ${category}.${key}`);
          return `[${category}.${key}]`;
        }
        
        return UITexts[category][key];
      }
    } catch (error) {
      console.error(`獲取文字時出錯: ${error.message}`);
      return `[ERROR:${category}.${key}]`;
    }
  }
  
  // 格式化文字，支持變量替換
  function formatText(text, variables = {}) {
    let formattedText = text;
    
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{${key}}`;
      formattedText = formattedText.replace(new RegExp(placeholder, 'g'), value);
    }
    
    return formattedText;
  }
  
  export { getText, formatText, UITexts };