// 计算人格类型
import { personalityTypes } from './personalities.js'

// 维度到人格类型的映射规则
const dimensionRules = {
  // S维度：自我
  S: {
    low: ['IMSB', 'IMFW', 'POOR'],  // 低自我认知 -> 傻者/废物/贫困者
    mid: ['MALO', 'SHIT', 'ZZZZ'],  // 中等 -> 吗喽/愤世者/装死者
    high: ['CTRL', 'BOSS', 'GOGO']  // 高自我认知 -> 拿捏者/领导者/行人
  },
  // E维度：情感
  E: {
    low: ['SOLO', 'DEAD', 'MONK'],  // 低情感投入 -> 孤儿/死者/僧人
    mid: ['FAKE', 'HHHH', 'RUNK'],  // 中等 -> 伪人/傻乐者/酒鬼
    high: ['SEXY', 'MALO', 'SHIT']  // 高情感投入 -> 尤物/吗喽/愤世者
  },
  // A维度：态度
  A: {
    low: ['SHIT', 'RUNK', 'ZZZZ'],  // 低顺从 -> 愤世者/酒鬼/装死者
    mid: ['FAKE', 'IMSB', 'MALO'],  // 中等 -> 伪人/傻者/吗喽
    high: ['MONK', 'POOR', 'SOLO']  // 高顺从 -> 僧人/贫困者/孤儿
  },
  // Ac维度：行动
  Ac: {
    low: ['ZZZZ', 'DEAD', 'IMFW'],  // 低行动力 -> 装死者/死者/废物
    mid: ['IMSB', 'FAKE', 'HHHH'],  // 中等 -> 傻者/伪人/傻乐者
    high: ['CTRL', 'BOSS', 'GOGO']  // 高行动力 -> 拿捏者/领导者/行人
  },
  // So维度：社交
  So: {
    low: ['SOLO', 'MONK', 'DEAD'],  // 低社交 -> 孤儿/僧人/死者
    mid: ['IMSB', 'IMFW', 'POOR'],  // 中等 -> 傻者/废物/贫困者
    high: ['SEXY', 'BOSS', 'FAKE']  // 高社交 -> 尤物/领导者/伪人
  }
}

// 计算各维度得分
export function calculateDimensionScores(answers, questions) {
  const scores = {}
  const counts = {}

  questions.forEach(q => {
    if (answers[q.id] !== undefined && q.dim) {
      const dim = q.dim.replace(/[0-9]/g, '')  // 移除数字，获取维度字母
      if (!scores[dim]) {
        scores[dim] = 0
        counts[dim] = 0
      }
      scores[dim] += answers[q.id]
      counts[dim]++
    }
  })

  // 计算平均分（1-3分范围）
  const avgScores = {}
  Object.keys(scores).forEach(dim => {
    avgScores[dim] = scores[dim] / counts[dim]
  })

  return avgScores
}

// 根据维度得分判断高低
function getLevel(score) {
  if (score < 1.8) return 'low'
  if (score < 2.3) return 'mid'
  return 'high'
}

// 计算最终人格类型
export function calculatePersonality(answers, questions) {
  const scores = calculateDimensionScores(answers, questions)

  // 检查是否有饮酒爱好
  if (answers['drink_gate_q1'] === 3 && answers['drink_gate_q2'] === 2) {
    return {
      type: personalityTypes.RUNK,
      scores,
      badge: '酒精考验',
      modeKicker: '您的血液酒精浓度已超标',
      special: true
    }
  }

  // 计算各维度等级
  const levels = {}
  Object.keys(scores).forEach(dim => {
    levels[dim] = getLevel(scores[dim])
  })

  // 统计各人格类型的得分
  const typeScores = {}
  Object.keys(personalityTypes).forEach(code => {
    typeScores[code] = 0
  })

  // 根据维度规则累加得分
  Object.keys(levels).forEach(dim => {
    const level = levels[dim]
    const types = dimensionRules[dim]?.[level] || []
    types.forEach((code, index) => {
      typeScores[code] += (3 - index)  // 排名越靠前得分越高
    })
  })

  // 找出得分最高的人格类型
  let maxScore = 0
  let resultType = personalityTypes.IMSB

  Object.keys(typeScores).forEach(code => {
    if (typeScores[code] > maxScore) {
      maxScore = typeScores[code]
      resultType = personalityTypes[code]
    }
  })

  // 生成徽章和提示语
  const badge = generateBadge(resultType.code, scores)
  const modeKicker = generateModeKicker(resultType.code)

  return {
    type: resultType,
    scores,
    badge,
    modeKicker,
    special: false
  }
}

// 生成徽章
function generateBadge(code, scores) {
  const badges = {
    CTRL: '掌控大师',
    BOSS: '天生领袖',
    GOGO: '行动派',
    SEXY: '魅力担当',
    FAKE: '社交达人',
    MALO: '梗王',
    SHIT: '清醒者',
    ZZZZ: '躺平艺术家',
    POOR: '精神贵族',
    MONK: '禅意人生',
    IMSB: '真诚至上',
    SOLO: '独行侠',
    DEAD: '超然物外',
    IMFW: '自嘲大师',
    HHHH: '快乐源泉',
    RUNK: '酒中仙'
  }
  return badges[code] || '神秘人格'
}

// 生成提示语
function generateModeKicker(code) {
  const kickers = {
    CTRL: '您的人生，您做主',
    BOSS: '天生的领导者',
    GOGO: '永远在路上',
    SEXY: '魅力无法挡',
    FAKE: '千面人生',
    MALO: '互联网原住民',
    SHIT: '看透不说透',
    ZZZZ: '躺平是一种艺术',
    POOR: '穷且益坚',
    MONK: '心静自然凉',
    IMSB: '大智若愚',
    SOLO: '独处是一种能力',
    DEAD: '活得太通透',
    IMFW: '废物利用专家',
    HHHH: '快乐是一种选择',
    RUNK: '酒逢知己千杯少'
  }
  return kickers[code] || '神秘人格'
}
