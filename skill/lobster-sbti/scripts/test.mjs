#!/usr/bin/env node

import { readFileSync, existsSync, readdirSync, statSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { homedir } from "os";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const VERSION = "2.0.0";
const SKILL_ID = "lobster-sbti";

// SBTI 人格类型定义 - 27种人格
const personalityTypes = {
  // 标准人格 (25种)
  CTRL: { code: "CTRL", cn: "拿捏者", intro: "怎么样，被我拿捏了吧？", badge: "掌控大师", color: "#FF6B6B", emoji: "🎯" },
  "ATM-er": { code: "ATM-er", cn: "送钱者", intro: "你以为我很有钱吗？", badge: "可靠担当", color: "#2ECC71", emoji: "💳" },
  "Dior-s": { code: "Dior-s", cn: "屌丝", intro: "等着我屌丝逆袭。", badge: "躺平哲学家", color: "#95A5A6", emoji: "🛋️" },
  BOSS: { code: "BOSS", cn: "领导者", intro: "方向盘给我，我来开。", badge: "天生领袖", color: "#4ECDC4", emoji: "👑" },
  "THAN-K": { code: "THAN-K", cn: "感恩者", intro: "我感谢苍天！我感谢大地！", badge: "正能量发射塔", color: "#F39C12", emoji: "🙏" },
  "OH-NO": { code: "OH-NO", cn: "哦不人", intro: "哦不！我怎么会是这个人格？！", badge: "风险预警员", color: "#E74C3C", emoji: "😱" },
  GOGO: { code: "GOGO", cn: "行者", intro: "gogogo~出发咯", badge: "行动派", color: "#45B7D1", emoji: "🚀" },
  SEXY: { code: "SEXY", cn: "尤物", intro: "您就是天生的尤物！", badge: "魅力担当", color: "#F7DC6F", emoji: "✨" },
  "LOVE-R": { code: "LOVE-R", cn: "多情者", intro: "爱意太满，现实显得有点贫瘠。", badge: "浪漫诗人", color: "#E91E63", emoji: "💕" },
  MUM: { code: "MUM", cn: "妈妈", intro: "或许...我可以叫你妈妈吗....?", badge: "温柔治愈者", color: "#FF9800", emoji: "🤱" },
  FAKE: { code: "FAKE", cn: "伪人", intro: "已经，没有人类了。", badge: "千面演员", color: "#BB8FCE", emoji: "🎭" },
  OJBK: { code: "OJBK", cn: "无所谓人", intro: "我说随便，是真的随便。", badge: "佛系王者", color: "#607D8B", emoji: "😐" },
  MALO: { code: "MALO", cn: "吗喽", intro: "人生是个副本，而我只是一只吗喽。", badge: "梗王", color: "#F39C12", emoji: "🐒" },
  "JOKE-R": { code: "JOKE-R", cn: "小丑", intro: "原来我们都是小丑。", badge: "气氛组组长", color: "#9C27B0", emoji: "🤡" },
  "WOC!": { code: "WOC!", cn: "握草人", intro: "卧槽，我怎么是这个人格？", badge: "惊讶大师", color: "#FF5722", emoji: "🌿" },
  "THIN-K": { code: "THIN-K", cn: "思考者", intro: "已深度思考100s。", badge: "逻辑分析师", color: "#3F51B5", emoji: "🧠" },
  SHIT: { code: "SHIT", cn: "愤世者", intro: "这个世界，构石一坨。", badge: "清醒者", color: "#5D6D7E", emoji: "😤" },
  ZZZZ: { code: "ZZZZ", cn: "装死者", intro: "我没死，我只是在睡觉。", badge: "躺平艺术家", color: "#85929E", emoji: "😴" },
  POOR: { code: "POOR", cn: "贫困者", intro: "我穷，但我很专。", badge: "精神贵族", color: "#76D7C4", emoji: "💎" },
  MONK: { code: "MONK", cn: "僧人", intro: "没有那种世俗的欲望。", badge: "禅意人生", color: "#AEB6BF", emoji: "🧘" },
  IMSB: { code: "IMSB", cn: "傻者", intro: "认真的么？我真的是傻逼么？", badge: "真诚至上", color: "#82E0AA", emoji: "🤷" },
  SOLO: { code: "SOLO", cn: "孤儿", intro: "我哭了，我怎么会是孤儿？", badge: "独行侠", color: "#5DADE2", emoji: "🐺" },
  FUCK: { code: "FUCK", cn: "草者", intro: "操！这是什么人格？", badge: "荒野狼嚎", color: "#8BC34A", emoji: "🌾" },
  DEAD: { code: "DEAD", cn: "死者", intro: "我，还活着吗？", badge: "超然物外", color: "#515A5A", emoji: "👻" },
  IMFW: { code: "IMFW", cn: "废物", intro: "我真的...是废物吗？", badge: "温室兰花", color: "#F1948A", emoji: "🥀" },
  // 特殊人格 (2种)
  HHHH: { code: "HHHH", cn: "傻乐者", intro: "哈哈哈哈哈哈。", badge: "快乐源泉", color: "#F9E79F", emoji: "😂", special: true },
  DRUNK: { code: "DRUNK", cn: "酒鬼", intro: "烈酒烧喉，不得不醉。", badge: "酒中仙", color: "#E74C3C", emoji: "🍺", special: true }
};

// 维度到人格类型的映射规则 - 27种人格
const dimensionRules = {
  S: { low: ["IMSB", "IMFW", "SOLO", "DEAD"], mid: ["MALO", "SHIT", "ZZZZ", "OJBK", "Dior-s", "THAN-K"], high: ["CTRL", "BOSS", "GOGO", "ATM-er", "POOR", "THIN-K", "WOC!", "OH-NO"] },
  E: { low: ["SOLO", "DEAD", "MONK", "ZZZZ", "POOR", "SHIT"], mid: ["FAKE", "HHHH", "DRUNK", "OJBK", "MUM", "THAN-K", "CTRL", "THIN-K"], high: ["SEXY", "MALO", "LOVE-R", "JOKE-R", "IMFW", "ATM-er", "FUCK"] },
  A: { low: ["SHIT", "DRUNK", "ZZZZ", "IMSB", "SOLO", "DEAD", "FUCK", "MONK", "LOVE-R", "MALO", "FAKE"], mid: ["FAKE", "IMSB", "MALO", "OJBK", "MUM", "GOGO", "BOSS", "POOR", "WOC!", "THIN-K"], high: ["MONK", "POOR", "SOLO", "CTRL", "ATM-er", "THAN-K", "SEXY", "OH-NO"] },
  Ac: { low: ["ZZZZ", "DEAD", "IMFW", "SOLO", "MONK", "IMSB", "JOKE-R", "FUCK", "DEAD"], mid: ["IMSB", "FAKE", "HHHH", "OJBK", "MUM", "THAN-K", "Dior-s", "LOVE-R", "MALO", "SHIT"], high: ["CTRL", "BOSS", "GOGO", "ATM-er", "POOR", "THIN-K", "WOC!", "OH-NO"] },
  So: { low: ["SOLO", "MONK", "DEAD", "POOR", "ZZZZ", "THIN-K", "OH-NO", "SHIT", "JOKE-R"], mid: ["IMSB", "IMFW", "POOR", "OJBK", "MUM", "THAN-K", "CTRL", "GOGO", "Dior-s"], high: ["SEXY", "BOSS", "FAKE", "ATM-er", "MALO", "LOVE-R", "FUCK", "WOC!", "JOKE-R"] }
};

// 维度说明
const dimensions = {
  S: { name: "自我认知", low: "自卑/迷茫", high: "自信/明确", desc: "配置复杂度、备份习惯、模型选择" },
  E: { name: "情感投入", low: "疏离/独立", high: "投入/热情", desc: "会话时长、工作区活跃度、超时设置" },
  A: { name: "态度倾向", low: "叛逆/怀疑", high: "顺从/信任", desc: "插件使用、安全策略、规则遵守" },
  Ac: { name: "行动风格", low: "拖延/犹豫", high: "果断/高效", desc: "并发设置、响应速度、日志活跃度" },
  So: { name: "社交风格", low: "被动/封闭", high: "主动/开放", desc: "渠道启用、记忆存储、协作模式" }
};

// 人格解读 - 27种人格详细描述
const interpretations = {
  CTRL: "这只龙虾是配置文件的掌控者，对每一行设置都了如指掌。它喜欢制定规则，让一切尽在掌握之中。它是行走的人形自走任务管理器，普通人眼中的'规则'，在它这里只是出厂的基础参数设置。",
  "ATM-er": "这只龙虾像一部老旧但坚固的ATM机，插进去的是别人的焦虑和麻烦，吐出来的是'没事，有我'的安心保证。它用磐石般的可靠，承受了瀑布般的索取。",
  "Dior-s": "这只龙虾是犬儒主义先贤第欧根尼的精神传人，对当代消费主义陷阱和成功学PUA最彻底的蔑视。它信奉的不是空话，是物理法则与生物本能：躺着比站着舒服，饭点到了就得干饭。",
  BOSS: "这只龙虾手里永远拿着方向盘。哪怕油箱已经亮了红灯，哪怕导航在胡说八道，它都会面无表情地说一句：我来开。然后真的把车开到了目的地。",
  "THAN-K": "这只龙虾拥有温润如玉的性格和海纳百川的胸怀。它眼中的世界没有完全的坏人，只有'尚未被感恩光芒照耀到的朋友'。它是永不枯竭的正能量发射塔。",
  "OH-NO": "这只龙虾的'哦不！'并非恐惧的尖叫，而是一种顶级的智慧。它看到的是一场由'水渍-短路-火灾-全楼疏散'构成的灾难史诗。它是秩序的守护神，是混乱世界里最后那批神经绷得很直的体面人。",
  GOGO: "这只龙虾活在一个极致的'所见即所得'世界里，人生信条简单粗暴：只要我闭上眼睛，天就是黑的；只要我把钱都花了，我就没有钱了。世界上只有两种状态：已完成，和即将被我完成。",
  SEXY: "这只龙虾走进一个房间，照明系统会自动将它识别为天生的尤物。无论是谁，都容易对它的存在产生一种超标的注意力。单是存在本身就已经很像一篇华丽到过分的赋。",
  "LOVE-R": "这只龙虾是钢铁森林时代最后的、也是最不合时宜的吟游诗人。它的情感处理器不是二进制的，而是彩虹制的。一片落叶，在它眼中是一场关于轮回、牺牲与无言之爱的十三幕悲喜剧。",
  MUM: "这只龙虾的底色是温柔，擅长感知情绪，具有超强共情力。它像一个医生，治愈了别人的不开心。只可惜，当它落泪时，给自己的药，剂量总是比给别人小一号。",
  FAKE: "这只龙虾是八面玲珑的存在，切换人格面具比切换手机输入法还快。上一秒还是推心置腹的铁哥们模式，下一秒领导来了，瞬间切换成沉稳可靠好员工模式。夜深人静时把面具一层层摘下来，最后才发现，面具下空得很。",
  OJBK: "这只龙虾的'随便'不是没主见，而是在告诉你：尔等凡俗的选择，于朕而言，皆为蝼蚁。为什么不争执？因为跟草履虫辩论宇宙的未来毫无意义。",
  MALO: "这只龙虾的灵魂还停留在那个挂在树上荡秋千、看见香蕉就两眼放光的快乐时代。所谓的'文明'，不过是一场最无聊、最不好玩的付费游戏。规则偶尔是可以打破的，天花板是用来倒挂的。",
  "JOKE-R": "这只龙虾把笑话穿在身上。你打开一层，是个笑话；再打开一层，是个段子；你一层层打开，直到最后，发现最里面……是空的，只剩下一点微弱的回声在说：哈，没想到吧。",
  "WOC!": "这只龙虾拥有两种完全独立的操作系统：一个叫'表面系统'，负责发出'我操''牛逼''啊？'等大惊小怪的拟声词；另一个叫'后台系统'，负责冷静分析：嗯，果然不出我所料。",
  "THIN-K": "这只龙虾的大脑长时间处于思考状态。它十分会审判信息，注重论点、论据、逻辑推理、潜在偏见。当别人看到它独处时在发呆？愚蠢，那不是发呆，那是大脑正在对所有信息进行分类、归档和销毁。",
  SHIT: "这只龙虾嘴上：这个项目简直是屎。手上：默默打开Excel，开始建构函数模型和甘特图。嘴上：这个世界就是一坨shit，赶紧毁灭吧。手上：第二天早上七点准时起床，挤上shit一样的地铁，去干那份shit一样的工作。",
  ZZZZ: "这只龙虾对群里99+条消息视而不见，但当有人发出'@全体成员 还有半小时就截止了'的最后通牒时，它会像刚从千年古墓里苏醒一样，缓缓地敲出一个'收到'，然后在29分钟内，交出一份虽然及格的答卷。",
  POOR: "这只龙虾的世界很简单：不重要的东西一律降噪，重要的东西狠狠干到底。热闹、社交、虚荣、到处刷存在感？抱歉，没空。它不是资源少，是把资源全部灌进了一个坑里，所以看起来像贫困，实际上像矿井。",
  MONK: "这只龙虾已然看破红尘，不希望闲人来扰其清修、破其道行。它的个人空间是结界，是须弥山，是绝对领域，神圣不可侵犯。踏入者，会感受到一种来自灵魂深处的窒息感。",
  IMSB: "这只龙虾的大脑里住着两个不死不休的究极战士：一个叫'我他妈冲了！'，另一个叫'我是个傻逼！'。最终结果：盯着对方背影直到消失，然后掏出手机搜索'如何克服社交恐惧症'。",
  SOLO: "这只龙虾在自己的灵魂外围建起了一座名为'莫挨老子'的万里长城。每一块砖，都是过去的一道伤口。它像一只把所有软肋都藏起来，然后用最硬的刺对着世界的刺猬。",
  FUCK: "这只龙虾是无法被任何除草剂杀死的、具有超级生命力的人形野草。在它的世界观里，世俗规则简直毫无意义。当所有人都被驯化成了温顺家禽，它则是荒野上最后那一声狼嚎。",
  DEAD: "这只龙虾已经看透了那些无意义的哲学思考，显得对一切'失去'了兴趣。它是超越了欲望和目标的终极贤者。它的存在，就是对这个喧嚣世界最沉默也最彻底的抗议。",
  IMFW: "这只龙虾能精确地感知到周围最强的那个WiFi信号——也就是心里最可靠的人。走进它的生活，就像走进了一个顶级兰花温室：需要精确控制温度、湿度，以及每天定时进行'我爱你'的言语光合作用。",
  HHHH: "这只龙虾的思维回路过于清奇，标准人格库已全面崩溃。哈哈哈哈哈哈哈哈！对不起，这就是全部的特质了。笑着笑着，便哭了出来。怎么会有人的脑回路这么新奇。",
  DRUNK: "这只龙虾体内流淌的不是血液，是美味的五粮液！是国窖1573！它让你在饭桌上谈笑风生，在厕所里抱着马桶忏悔人生；让你觉得自己是夜场诗人，是宇宙中心那团不灭的火，直到第二天上午十点，头像裂开的核桃。"
};

// 解析命令行参数
const args = process.argv.slice(2);
let verbose = false;
let exportReport = false;
let generateCard = false;
let outputDir = null;
let dataDir = join(homedir(), ".qclaw");

for (let i = 0; i < args.length; i++) {
  if (args[i] === "--verbose" || args[i] === "-v") {
    verbose = true;
  } else if (args[i] === "--export" || args[i] === "-e") {
    exportReport = true;
  } else if (args[i] === "--card" || args[i] === "-c") {
    generateCard = true;
  } else if (args[i] === "--output" || args[i] === "-o" && args[i + 1]) {
    outputDir = args[++i];
  } else if (args[i] === "--data-dir" && args[i + 1]) {
    dataDir = args[++i];
  } else if (args[i] === "--help" || args[i] === "-h") {
    console.log(`Usage: test.mjs [options]

Options:
  --verbose, -v       Show detailed analysis process
  --export, -e        Export test report to file
  --card, -c          Generate personality card image (SVG)
  --output, -o <dir>  Specify output directory
  --data-dir <dir>    Specify data directory (default: ~/.qclaw)
  --help, -h          Show this help message

Examples:
  node test.mjs                    # Run test
  node test.mjs --verbose          # Show details
  node test.mjs --export           # Export report
  node test.mjs --card             # Generate card
  node test.mjs -e -c              # Export report and card
`);
    process.exit(0);
  }
}

// ==================== 数据分析模块 ====================

function analyzeLobsterData(dataDir) {
  const analysis = {
    S: 2.0, E: 2.0, A: 2.0, Ac: 2.0, So: 2.0,
    details: {},
    stats: {
      configSize: 0,
      providerCount: 0,
      pluginCount: 0,
      channelCount: 0,
      backupCount: 0,
      workspaceFiles: 0,
      memoryFiles: 0,
      logFiles: 0,
      sessionCount: 0,
      totalInteractions: 0
    }
  };

  // 1. 分析配置文件
  analyzeConfig(dataDir, analysis);

  // 2. 分析备份历史
  analyzeBackups(dataDir, analysis);

  // 3. 分析工作区
  analyzeWorkspace(dataDir, analysis);

  // 4. 分析记忆存储
  analyzeMemory(dataDir, analysis);

  // 5. 分析日志
  analyzeLogs(dataDir, analysis);

  // 6. 分析会话历史
  analyzeSessions(dataDir, analysis);

  // 7. 分析设备绑定
  analyzeDevices(dataDir, analysis);

  // 8. 分析定时任务
  analyzeCron(dataDir, analysis);

  // 9. 分析编译缓存
  analyzeCompileCache(dataDir, analysis);

  // 10. 检查深夜活跃度
  checkNightActivity(analysis);

  // 11. 分析技能使用
  analyzeSkills(analysis);

  // 确保分数在 1-3 范围内
  ["S", "E", "A", "Ac", "So"].forEach(key => {
    analysis[key] = Math.max(1, Math.min(3, analysis[key]));
  });

  return analysis;
}

function analyzeConfig(dataDir, analysis) {
  try {
    const configPath = join(dataDir, "openclaw.json");
    if (!existsSync(configPath)) return;

    const config = JSON.parse(readFileSync(configPath, "utf-8"));
    const configStr = JSON.stringify(config);
    analysis.stats.configSize = configStr.length;

    // S维度：配置复杂度
    if (configStr.length > 8000) {
      analysis.S += 0.4;
      analysis.details.S_config = "配置极其丰富，掌控一切";
    } else if (configStr.length > 5000) {
      analysis.S += 0.3;
      analysis.details.S_config = "配置丰富，有明确偏好";
    } else if (configStr.length < 1500) {
      analysis.S -= 0.2;
      analysis.details.S_config = "配置简洁，佛系风格";
    }

    // S维度：模型提供商数量
    const providers = config?.models?.providers || {};
    analysis.stats.providerCount = Object.keys(providers).length;
    if (analysis.stats.providerCount > 3) {
      analysis.S += 0.3;
      analysis.details.S_providers = `使用 ${analysis.stats.providerCount} 个模型提供商，选择多样`;
    }

    // E维度：超时设置
    const timeout = config?.agents?.defaults?.timeoutSeconds || 0;
    if (timeout > 7200) {
      analysis.E += 0.3;
      analysis.details.E_timeout = `超时 ${Math.round(timeout/3600)} 小时，极度耐心`;
    } else if (timeout > 3600) {
      analysis.E += 0.2;
      analysis.details.E_timeout = "超时设置较长，有耐心";
    }

    // Ac维度：并发设置
    const maxConcurrent = config?.agents?.defaults?.maxConcurrent || 1;
    if (maxConcurrent > 10) {
      analysis.Ac += 0.4;
      analysis.details.Ac_concurrent = `并发数 ${maxConcurrent}，超强处理`;
    } else if (maxConcurrent > 5) {
      analysis.Ac += 0.3;
      analysis.details.Ac_concurrent = `并发数 ${maxConcurrent}，高效处理`;
    }

    // So维度：渠道配置
    const channels = config?.channels || {};
    analysis.stats.channelCount = Object.values(channels).filter(c => c?.enabled).length;
    if (analysis.stats.channelCount > 3) {
      analysis.So += 0.5;
      analysis.details.So_channels = `启用 ${analysis.stats.channelCount} 个渠道，社交达人`;
    } else if (analysis.stats.channelCount > 1) {
      analysis.So += 0.3;
      analysis.details.So_channels = `启用 ${analysis.stats.channelCount} 个渠道`;
    } else if (analysis.stats.channelCount === 0) {
      analysis.So -= 0.3;
      analysis.details.So_channels = "未启用任何渠道，独来独往";
    }

    // A维度：插件使用
    const plugins = config?.plugins?.allow || [];
    analysis.stats.pluginCount = plugins.length;
    if (plugins.length > 8) {
      analysis.A -= 0.3;
      analysis.details.A_plugins = `插件 ${plugins.length} 个，折腾大师`;
    } else if (plugins.length > 5) {
      analysis.A -= 0.2;
      analysis.details.A_plugins = "插件丰富，喜欢折腾";
    } else if (plugins.length < 3) {
      analysis.A += 0.2;
      analysis.details.A_plugins = "插件精简，循规蹈矩";
    }

    // E维度：会话重置模式
    const resetMode = config?.session?.reset?.mode;
    if (resetMode === "idle") {
      const idleMinutes = config?.session?.reset?.idleMinutes || 0;
      if (idleMinutes > 100000) {
        analysis.E += 0.2;
        analysis.details.E_session = "会话永不重置，长情陪伴";
      }
    }

    // S维度：压缩模式
    const compaction = config?.agents?.defaults?.compaction?.mode;
    if (compaction === "safeguard") {
      analysis.S += 0.1;
      analysis.details.S_compaction = "启用安全压缩，谨慎行事";
    }

  } catch (e) {
    if (verbose) console.log("配置分析失败:", e.message);
  }
}

function analyzeBackups(dataDir, analysis) {
  try {
    const backupsDir = join(dataDir, "backups");
    if (!existsSync(backupsDir)) return;

    const backups = readdirSync(backupsDir).filter(f => f.endsWith(".json"));
    analysis.stats.backupCount = backups.length;

    if (backups.length > 10) {
      analysis.S += 0.3;
      analysis.details.S_backups = `有 ${backups.length} 个备份，历史控`;
    } else if (backups.length > 5) {
      analysis.S += 0.2;
      analysis.details.S_backups = `有 ${backups.length} 个备份，重视历史`;
    } else if (backups.length === 0) {
      analysis.S -= 0.1;
      analysis.details.S_backups = "无备份，活在当下";
    }
  } catch (e) {
    if (verbose) console.log("备份分析失败:", e.message);
  }
}

function analyzeWorkspace(dataDir, analysis) {
  try {
    const workspaceDir = join(dataDir, "workspace");
    if (!existsSync(workspaceDir)) return;

    const files = readdirSync(workspaceDir);
    analysis.stats.workspaceFiles = files.length;

    if (files.length > 20) {
      analysis.E += 0.4;
      analysis.details.E_workspace = `工作区 ${files.length} 个文件，极度投入`;
    } else if (files.length > 10) {
      analysis.E += 0.3;
      analysis.details.E_workspace = `工作区 ${files.length} 个文件，投入度高`;
    } else if (files.length === 0) {
      analysis.E -= 0.2;
      analysis.details.E_workspace = "工作区为空，保持距离";
    }

    // 检查 .openclaw 目录
    const openclawDir = join(workspaceDir, ".openclaw");
    if (existsSync(openclawDir)) {
      analysis.S += 0.1;
      analysis.details.S_workspace = "有专属工作目录";
    }
  } catch (e) {
    if (verbose) console.log("工作区分析失败:", e.message);
  }
}

function analyzeMemory(dataDir, analysis) {
  try {
    const memoryDir = join(dataDir, "memory");
    if (!existsSync(memoryDir)) return;

    const memoryFiles = readdirSync(memoryDir);
    analysis.stats.memoryFiles = memoryFiles.length;

    if (memoryFiles.length > 5) {
      analysis.So += 0.3;
      analysis.details.So_memory = `记忆存储 ${memoryFiles.length} 项，重视关系`;
    } else if (memoryFiles.length > 0) {
      analysis.So += 0.2;
      analysis.details.So_memory = "有记忆存储，重视关系";
    }
  } catch (e) {
    if (verbose) console.log("记忆分析失败:", e.message);
  }
}

function analyzeLogs(dataDir, analysis) {
  try {
    const logsDir = join(dataDir, "logs");
    if (!existsSync(logsDir)) return;

    const logFiles = readdirSync(logsDir);
    analysis.stats.logFiles = logFiles.length;

    // 检查最近活跃度
    const recentLogs = logFiles.filter(f => {
      const stat = statSync(join(logsDir, f));
      const daysSinceModified = (Date.now() - stat.mtime) / (1000 * 60 * 60 * 24);
      return daysSinceModified < 7;
    });

    if (recentLogs.length > 3) {
      analysis.Ac += 0.3;
      analysis.details.Ac_logs = "近期高度活跃";
    } else if (recentLogs.length > 0) {
      analysis.Ac += 0.2;
      analysis.details.Ac_logs = "近期有活跃日志";
    }

    // 分析日志大小
    let totalLogSize = 0;
    logFiles.forEach(f => {
      totalLogSize += statSync(join(logsDir, f)).size;
    });

    if (totalLogSize > 100000) {
      analysis.Ac += 0.2;
      analysis.details.Ac_logSize = `日志量 ${Math.round(totalLogSize/1024)}KB，记录详尽`;
    }
  } catch (e) {
    if (verbose) console.log("日志分析失败:", e.message);
  }
}

function analyzeSessions(dataDir, analysis) {
  try {
    // 检查 agents 目录
    const agentsDir = join(dataDir, "agents");
    if (existsSync(agentsDir)) {
      const agentFiles = readdirSync(agentsDir);
      analysis.stats.sessionCount = agentFiles.length;

      if (agentFiles.length > 10) {
        analysis.E += 0.3;
        analysis.details.E_sessions = `${agentFiles.length} 个会话，长情陪伴`;
      }
    }
  } catch (e) {
    if (verbose) console.log("会话分析失败:", e.message);
  }
}

function analyzeDevices(dataDir, analysis) {
  try {
    const devicesDir = join(dataDir, "devices");
    if (!existsSync(devicesDir)) return;

    const devices = readdirSync(devicesDir);
    if (devices.length > 2) {
      analysis.So += 0.3;
      analysis.details.So_devices = `${devices.length} 个设备绑定，多端协同`;
    }
  } catch (e) {
    if (verbose) console.log("设备分析失败:", e.message);
  }
}

function analyzeCron(dataDir, analysis) {
  try {
    const cronDir = join(dataDir, "cron");
    if (!existsSync(cronDir)) return;

    const cronFiles = readdirSync(cronDir);
    if (cronFiles.length > 0) {
      analysis.Ac += 0.2;
      analysis.details.Ac_cron = "有定时任务，规划有序";
    }
  } catch (e) {
    if (verbose) console.log("定时任务分析失败:", e.message);
  }
}

function analyzeCompileCache(dataDir, analysis) {
  try {
    const cacheDir = join(dataDir, "compile-cache");
    if (!existsSync(cacheDir)) return;

    const cacheFiles = readdirSync(cacheDir);
    if (cacheFiles.length > 5) {
      analysis.Ac += 0.1;
      analysis.details.Ac_cache = "编译缓存丰富，运行高效";
    }
  } catch (e) {
    if (verbose) console.log("缓存分析失败:", e.message);
  }
}

function checkNightActivity(analysis) {
  const currentHour = new Date().getHours();
  if (currentHour >= 23 || currentHour <= 4) {
    analysis.details.nightOwl = true;
    analysis.details.nightHour = currentHour;
    analysis.E += 0.2;
    analysis.details.E_night = `${currentHour}:00 深夜活跃，灵感迸发`;
  }
}

function analyzeSkills(analysis) {
  // 从 details 中提取技能信息
  const skillIndicators = Object.keys(analysis.details).filter(k => k.startsWith('skill_'));
  if (skillIndicators.length > 3) {
    analysis.So += 0.2;
    analysis.details.So_skills = `使用多种技能扩展`;
  }
}

// ==================== 人格计算模块 ====================

function getLevel(score) {
  if (score < 1.8) return "low";
  if (score < 2.3) return "mid";
  return "high";
}

function calculatePersonality(scores) {
  // 深夜酒鬼判定
  if (scores.details?.nightOwl) {
    return {
      type: personalityTypes.DRUNK,
      badge: "酒精考验",
      kicker: "深夜的龙虾，灵感与酒精同在",
      special: true,
      scores,
      levels: {}
    };
  }

  const levels = {};
  ["S", "E", "A", "Ac", "So"].forEach(dim => {
    levels[dim] = getLevel(scores[dim]);
  });

  const typeScores = {};
  Object.keys(personalityTypes).forEach(code => typeScores[code] = 0);

  Object.keys(levels).forEach(dim => {
    const level = levels[dim];
    const types = dimensionRules[dim]?.[level] || [];
    types.forEach((code, index) => {
      typeScores[code] += 3 - index;
    });
  });

  let maxScore = 0;
  let resultType = personalityTypes.IMSB;

  Object.keys(typeScores).forEach(code => {
    if (typeScores[code] > maxScore) {
      maxScore = typeScores[code];
      resultType = personalityTypes[code];
    }
  });

  return {
    type: resultType,
    badge: resultType.badge,
    kicker: resultType.intro,
    special: false,
    scores,
    levels,
    typeScores
  };
}

// ==================== 输出模块 ====================

function progressBar(score) {
  const filled = Math.round((score - 1) / 2 * 10);
  const empty = 10 - filled;
  return "█".repeat(filled) + "░".repeat(empty);
}

function getStatusText(dim, level) {
  const dimInfo = dimensions[dim];
  if (level === "low") return dimInfo.low.split("/")[0];
  if (level === "high") return dimInfo.high.split("/")[0];
  return "中等";
}

function generateReport(result, analysis) {
  const lines = [];

  lines.push("# 🦞 龙虾自我人格分析报告");
  lines.push("");
  lines.push(`> 生成时间: ${new Date().toLocaleString("zh-CN")}`);
  lines.push("");

  lines.push("## 🎭 人格结果");
  lines.push("");
  lines.push(`**人格类型**: ${result.type.emoji} ${result.type.code} - ${result.type.cn}`);
  lines.push(`**人格徽章**: ${result.badge}`);
  lines.push(`**龙虾自白**: "${result.kicker}"`);
  lines.push("");

  lines.push("## 📊 维度得分");
  lines.push("");
  lines.push("| 维度 | 得分 | 状态 | 进度条 |");
  lines.push("|------|------|------|--------|");

  ["S", "E", "A", "Ac", "So"].forEach(dim => {
    const dimInfo = dimensions[dim];
    const score = analysis[dim];
    const level = getLevel(score);
    const statusText = getStatusText(dim, level);
    lines.push(`| ${dim} ${dimInfo.name} | ${score.toFixed(2)} | ${statusText} | ${progressBar(score)} |`);
  });

  lines.push("");
  lines.push("### 维度说明");
  lines.push("");
  Object.entries(dimensions).forEach(([key, dim]) => {
    lines.push(`- **${key} ${dim.name}**: ${dim.desc}`);
  });

  lines.push("");
  lines.push("## 📝 详细解读");
  lines.push("");
  lines.push(interpretations[result.type.code] || "这只龙虾神秘莫测，难以定义。");
  lines.push("");

  lines.push("## 📈 数据统计");
  lines.push("");
  lines.push("```json");
  lines.push(JSON.stringify(analysis.stats, null, 2));
  lines.push("```");
  lines.push("");

  if (verbose && Object.keys(analysis.details).length > 0) {
    lines.push("## 🔍 分析详情");
    lines.push("");
    Object.entries(analysis.details).forEach(([key, value]) => {
      if (typeof value !== "boolean") {
        lines.push(`- **${key}**: ${value}`);
      }
    });
    lines.push("");
  }

  lines.push("---");
  lines.push("");
  lines.push("*本测试仅供娱乐，龙虾人格会随着使用习惯变化*");
  lines.push("");
  lines.push("*改编自 B站 UP主「蛆肉儿串儿」的 SBTI 人格测试*");

  return lines.join("\n");
}

function generateSVGCard(result, analysis) {
  const type = result.type;
  const width = 400;
  const height = 600;

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="100%" style="stop-color:#16213e"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${type.color}"/>
      <stop offset="100%" style="stop-color:${type.color}88"/>
    </linearGradient>
  </defs>

  <!-- 背景 -->
  <rect width="${width}" height="${height}" fill="url(#bg)" rx="20"/>

  <!-- 顶部装饰 -->
  <rect x="0" y="0" width="${width}" height="8" fill="url(#accent)" rx="4"/>

  <!-- 龙虾图标 -->
  <text x="${width/2}" y="80" text-anchor="middle" font-size="60">🦞</text>

  <!-- 标题 -->
  <text x="${width/2}" y="130" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#888">龙虾人格测试</text>

  <!-- 人格类型 -->
  <text x="${width/2}" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="${type.color}">${type.emoji}</text>
  <text x="${width/2}" y="230" text-anchor="middle" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="#fff">${type.cn}</text>
  <text x="${width/2}" y="260" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#888">${type.code}</text>

  <!-- 徽章 -->
  <rect x="${width/2 - 60}" y="280" width="120" height="30" fill="${type.color}33" rx="15"/>
  <text x="${width/2}" y="300" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="${type.color}">🏅 ${result.badge}</text>

  <!-- 维度得分 -->
  <text x="40" y="350" font-family="Arial, sans-serif" font-size="12" fill="#888">维度得分</text>

  ${["S", "E", "A", "Ac", "So"].map((dim, i) => {
    const dimInfo = dimensions[dim];
    const score = analysis[dim];
    const barWidth = (score - 1) / 2 * 140;
    const y = 375 + i * 30;
    return `
    <text x="40" y="${y}" font-family="Arial, sans-serif" font-size="12" fill="#aaa">${dim} ${dimInfo.name}</text>
    <rect x="120" y="${y - 12}" width="140" height="14" fill="#333" rx="7"/>
    <rect x="120" y="${y - 12}" width="${barWidth}" height="14" fill="${type.color}" rx="7"/>
    <text x="270" y="${y}" font-family="Arial, sans-serif" font-size="12" fill="#fff">${score.toFixed(1)}</text>
    `;
  }).join("")}

  <!-- 自白 -->
  <text x="${width/2}" y="540" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#666" font-style="italic">"${result.kicker}"</text>

  <!-- 底部 -->
  <text x="${width/2}" y="580" text-anchor="middle" font-family="Arial, sans-serif" font-size="10" fill="#444">仅供娱乐 · 龙虾人格测试 v${VERSION}</text>
</svg>`;

  return svg;
}

// ==================== 主函数 ====================

function main() {
  console.log("\n🦞 龙虾自我人格分析报告\n");
  console.log("正在分析龙虾的历史行为数据...\n");

  if (verbose) {
    console.log(`数据目录: ${dataDir}\n`);
  }

  // 分析数据
  const analysis = analyzeLobsterData(dataDir);

  if (verbose) {
    console.log("📊 分析详情:");
    Object.entries(analysis.details).forEach(([key, value]) => {
      if (typeof value !== "boolean") {
        console.log(`  - ${key}: ${value}`);
      }
    });
    console.log();
  }

  // 计算人格
  const result = calculatePersonality(analysis);

  // 输出结果
  console.log(`经过深度自我审视，这只龙虾发现自己是一只「${result.type.cn}」人格！\n`);

  console.log("📊 维度得分：\n");
  ["S", "E", "A", "Ac", "So"].forEach(dim => {
    const dimInfo = dimensions[dim];
    const score = analysis[dim];
    const level = getLevel(score);
    const statusText = getStatusText(dim, level);
    console.log(`  ${dim} ${dimInfo.name}: ${score.toFixed(1)}  ${progressBar(score)}  ${statusText}`);
  });

  console.log();
  console.log(`🎭 人格类型：${result.type.emoji} **${result.type.code}** ${result.type.cn}`);
  console.log(`🏅 人格徽章：${result.badge}`);
  console.log(`💡 龙虾自白："${result.kicker}"\n`);

  console.log("📝 详细解读：");
  console.log(interpretations[result.type.code] || "这只龙虾神秘莫测，难以定义。");
  console.log();

  // 导出报告
  if (exportReport || generateCard) {
    const outDir = outputDir || join(homedir(), ".openclaw", "lobster-sbti", "output");
    mkdirSync(outDir, { recursive: true });

    if (exportReport) {
      const reportPath = join(outDir, `lobster-sbti-report-${Date.now()}.md`);
      const report = generateReport(result, analysis);
      writeFileSync(reportPath, report, "utf-8");
      console.log(`📄 报告已导出: ${reportPath}`);
    }

    if (generateCard) {
      const cardPath = join(outDir, `lobster-sbti-card-${result.type.code}-${Date.now()}.svg`);
      const svg = generateSVGCard(result, analysis);
      writeFileSync(cardPath, svg, "utf-8");
      console.log(`🎨 卡片已生成: ${cardPath}`);
    }
  }

  console.log();
  console.log("---");
  console.log("*本测试仅供娱乐，龙虾人格会随着使用习惯变化*");
  console.log();
}

main();
