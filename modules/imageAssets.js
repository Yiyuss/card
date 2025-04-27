/**
 * 圖片資源模組
 * 集中管理所有遊戲中使用的圖片資源路徑
 */

// 圖片資源路徑
export const imageAssets = {
    // UI 圖片
    ui: {
      logo: './assets/images/ui/logo.png',
      background: {
        main: './assets/images/ui/main-bg.jpg',
        battle: './assets/images/ui/battle-bg.jpg',
        levelSelect: './assets/images/ui/level-select-bg.jpg',
        gameOver: './assets/images/ui/game-over-bg.jpg',
        shop: './assets/images/ui/shop-bg.jpg',
        deck: './assets/images/ui/deck-bg.jpg',
        settings: './assets/images/ui/settings-bg.jpg',
        credits: './assets/images/ui/credits-bg.jpg'
      },
      button: {
        normal: './assets/images/ui/button.png',
        hover: './assets/images/ui/button-hover.png',
        disabled: './assets/images/ui/button-disabled.png'
      },
      icons: {
        health: './assets/images/ui/health-icon.png',
        mana: './assets/images/ui/mana-icon.png',
        gold: './assets/images/ui/gold-icon.png',
        experience: './assets/images/ui/exp-icon.png',
        attack: './assets/images/ui/attack-icon.png',
        defense: './assets/images/ui/defense-icon.png',
        settings: './assets/images/ui/settings-icon.png',
        back: './assets/images/ui/back-icon.png',
        deck: './assets/images/ui/deck-icon.png',
        discard: './assets/images/ui/discard-icon.png'
      },
      bars: {
        health: './assets/images/ui/health-bar.png',
        mana: './assets/images/ui/mana-bar.png',
        experience: './assets/images/ui/exp-bar.png',
        loading: './assets/images/ui/loading-bar.png'
      },
      toast: {
        success: './assets/images/ui/toast-success.png',
        error: './assets/images/ui/toast-error.png',
        warning: './assets/images/ui/toast-warning.png',
        info: './assets/images/ui/toast-info.png'
      }
    },
    
    // 卡牌圖片
    cards: {
      back: './assets/images/cards/card-back.png',
      frame: {
        common: './assets/images/cards/frame-common.png',
        uncommon: './assets/images/cards/frame-uncommon.png',
        rare: './assets/images/cards/frame-rare.png',
        epic: './assets/images/cards/frame-epic.png',
        legendary: './assets/images/cards/frame-legendary.png'
      },
      types: {
        attack: './assets/images/cards/type-attack.png',
        defense: './assets/images/cards/type-defense.png',
        skill: './assets/images/cards/type-skill.png',
        power: './assets/images/cards/type-power.png',
        curse: './assets/images/cards/type-curse.png'
      },
      // 卡牌具體圖片，按照ID組織
      images: {
        // 攻擊卡
        'attack_basic': './assets/images/cards/attack_basic.png',
        'attack_heavy': './assets/images/cards/attack_heavy.png',
        'attack_multi': './assets/images/cards/attack_multi.png',
        'attack_pierce': './assets/images/cards/attack_pierce.png',
        'attack_fire': './assets/images/cards/attack_fire.png',
        'attack_ice': './assets/images/cards/attack_ice.png',
        'attack_lightning': './assets/images/cards/attack_lightning.png',
        
        // 防禦卡
        'defense_basic': './assets/images/cards/defense_basic.png',
        'defense_strong': './assets/images/cards/defense_strong.png',
        'defense_reflect': './assets/images/cards/defense_reflect.png',
        'defense_heal': './assets/images/cards/defense_heal.png',
        
        // 技能卡
        'skill_draw': './assets/images/cards/skill_draw.png',
        'skill_energy': './assets/images/cards/skill_energy.png',
        'skill_weaken': './assets/images/cards/skill_weaken.png',
        'skill_strengthen': './assets/images/cards/skill_strengthen.png',
        'skill_poison': './assets/images/cards/skill_poison.png',
        'skill_stun': './assets/images/cards/skill_stun.png',
        
        // 能力卡
        'power_strength': './assets/images/cards/power_strength.png',
        'power_dexterity': './assets/images/cards/power_dexterity.png',
        'power_regeneration': './assets/images/cards/power_regeneration.png',
        'power_thorns': './assets/images/cards/power_thorns.png',
        
        // 詛咒卡
        'curse_wound': './assets/images/cards/curse_wound.png',
        'curse_doubt': './assets/images/cards/curse_doubt.png',
        'curse_decay': './assets/images/cards/curse_decay.png'
      }
    },
    
    // 角色圖片
    characters: {
      player: {
        avatar: './assets/images/characters/player/avatar.png',
        battle: './assets/images/characters/player/battle.png',
        victory: './assets/images/characters/player/victory.png',
        defeat: './assets/images/characters/player/defeat.png'
      },
      enemies: {
        // 普通敵人
        'slime': './assets/images/characters/enemies/slime.png',
        'goblin': './assets/images/characters/enemies/goblin.png',
        'skeleton': './assets/images/characters/enemies/skeleton.png',
        'bat': './assets/images/characters/enemies/bat.png',
        'spider': './assets/images/characters/enemies/spider.png',
        
        // 精英敵人
        'goblin_shaman': './assets/images/characters/enemies/goblin_shaman.png',
        'skeleton_knight': './assets/images/characters/enemies/skeleton_knight.png',
        'dark_mage': './assets/images/characters/enemies/dark_mage.png',
        'giant_rat': './assets/images/characters/enemies/giant_rat.png',
        
        // Boss敵人
        'goblin_king': './assets/images/characters/enemies/goblin_king.png',
        'necromancer': './assets/images/characters/enemies/necromancer.png',
        'dragon': './assets/images/characters/enemies/dragon.png',
        'demon': './assets/images/characters/enemies/demon.png'
      }
    },
    
    // 效果圖片
    effects: {
      attack: './assets/images/effects/attack.png',
      fire: './assets/images/effects/fire.png',
      ice: './assets/images/effects/ice.png',
      lightning: './assets/images/effects/lightning.png',
      heal: './assets/images/effects/heal.png',
      shield: './assets/images/effects/shield.png',
      poison: './assets/images/effects/poison.png',
      stun: './assets/images/effects/stun.png',
      weakness: './assets/images/effects/weakness.png',
      strength: './assets/images/effects/strength.png',
      dexterity: './assets/images/effects/dexterity.png',
      energy: './assets/images/effects/energy.png',
      draw: './assets/images/effects/draw.png',
      discard: './assets/images/effects/discard.png'
    },
    
    // 道具圖片
    items: {
      'health_potion': './assets/images/items/health_potion.png',
      'mana_potion': './assets/images/items/mana_potion.png',
      'strength_potion': './assets/images/items/strength_potion.png',
      'dexterity_potion': './assets/images/items/dexterity_potion.png',
      'antidote': './assets/images/items/antidote.png',
      'scroll_of_wisdom': './assets/images/items/scroll_of_wisdom.png'
    },
    
    // 成就圖標
    achievements: {
      'first_victory': './assets/images/achievements/first_victory.png',
      'card_collector': './assets/images/achievements/card_collector.png',
      'boss_slayer': './assets/images/achievements/boss_slayer.png',
      'perfect_battle': './assets/images/achievements/perfect_battle.png',
      'max_level': './assets/images/achievements/max_level.png'
    },
    
    // 音頻資源
    audio: {
      bgm: {
        menu: './assets/audio/bgm/menu.mp3',
        battle: './assets/audio/bgm/battle.mp3',
        boss: './assets/audio/bgm/boss.mp3',
        victory: './assets/audio/bgm/victory.mp3',
        defeat: './assets/audio/bgm/defeat.mp3',
        shop: './assets/audio/bgm/shop.mp3'
      },
      sfx: {
        // UI音效
        click: './assets/audio/sfx/click.mp3',
        hover: './assets/audio/sfx/hover.mp3',
        error: './assets/audio/sfx/error.mp3',
        success: './assets/audio/sfx/success.mp3',
        
        // 卡牌音效
        cardDraw: './assets/audio/sfx/card_draw.mp3',
        cardPlay: './assets/audio/sfx/card_play.mp3',
        cardShuffle: './assets/audio/sfx/card_shuffle.mp3',
        cardDiscard: './assets/audio/sfx/card_discard.mp3',
        
        // 戰鬥音效
        attack: './assets/audio/sfx/attack.mp3',
        defend: './assets/audio/sfx/defend.mp3',
        heal: './assets/audio/sfx/heal.mp3',
        damage: './assets/audio/sfx/damage.mp3',
        enemyDeath: './assets/audio/sfx/enemy_death.mp3',
        
        // 效果音效
        fire: './assets/audio/sfx/fire.mp3',
        ice: './assets/audio/sfx/ice.mp3',
        lightning: './assets/audio/sfx/lightning.mp3',
        poison: './assets/audio/sfx/poison.mp3',
        stun: './assets/audio/sfx/stun.mp3',
        
        // 其他音效
        levelUp: './assets/audio/sfx/level_up.mp3',
        achievement: './assets/audio/sfx/achievement.mp3',
        purchase: './assets/audio/sfx/purchase.mp3',
        equip: './assets/audio/sfx/equip.mp3',
        unequip: './assets/audio/sfx/unequip.mp3',
        useItem: './assets/audio/sfx/use_item.mp3'
      }
    }
  };
  
  /**
   * 獲取CSS變量設置字符串
   * 用於將圖片路徑設置為CSS變量
   */
  export function getCSSImageVariables() {
    return `
      --img-main-bg: url('${imageAssets.ui.background.main}');
      --img-logo: url('${imageAssets.ui.logo}');
      --img-button-bg: url('${imageAssets.ui.button.normal}');
      --img-card-back: url('${imageAssets.cards.back}');
      --img-health-bar: url('${imageAssets.ui.bars.health}');
      --img-mana-bar: url('${imageAssets.ui.bars.mana}');
      --img-game-over-bg: url('${imageAssets.ui.background.gameOver}');
      --img-player-avatar: url('${imageAssets.characters.player.avatar}');
      --img-enemy-default: url('${imageAssets.characters.enemies.slime}');
      --img-effect-fire: url('${imageAssets.effects.fire}');
      --img-effect-ice: url('${imageAssets.effects.ice}');
      --img-effect-lightning: url('${imageAssets.effects.lightning}');
      --img-effect-heal: url('${imageAssets.effects.heal}');
    `;
  }
  
  /**
   * 預加載圖片
   * @param {Array} imagePaths - 需要預加載的圖片路徑數組
   * @param {Function} callback - 加載完成後的回調函數
   */
  export function preloadImages(imagePaths, callback) {
    let loadedCount = 0;
    const totalImages = imagePaths.length;
    
    // 如果沒有圖片需要加載，直接調用回調
    if (totalImages === 0) {
      callback();
      return;
    }
    
    // 加載每一張圖片
    imagePaths.forEach(path => {
      const img = new Image();
      img.onload = img.onerror = () => {
        loadedCount++;
        // 當所有圖片加載完成時，調用回調
        if (loadedCount === totalImages) {
          callback();
        }
      };
      img.src = path;
    });
  }