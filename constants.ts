
export const CAMERA_MOVEMENTS = [
  { 
    id: 'static', 
    label: '固定镜头', 
    description: '镜头完全静止。适合强调对话、微表情或展现构图的稳定性。', 
    prompt: 'Static camera, tripod shot, zero movement, stable composition, focus on subtle acting details' 
  },
  { 
    id: 'push_in', 
    label: '缓慢推镜', 
    description: '镜头缓慢向前推进。用于聚焦主体内心世界，或引导观众注意关键细节，增加情绪张力。', 
    prompt: 'Slow dolly in, camera smoothly pushing towards the subject, increasing intimacy and tension, narrowing the field of view' 
  },
  { 
    id: 'pull_out', 
    label: '缓慢拉镜', 
    description: '镜头缓慢向后拉远。用于揭示角色与环境的关系，常表达孤立、遗弃或故事的落幕。', 
    prompt: 'Slow dolly out, camera smoothly pulling back from the subject, revealing the vast environment, creating a sense of isolation or conclusion' 
  },
  { 
    id: 'pan_follow', 
    label: '水平跟摇', 
    description: '摄像机轴心固定，左右旋转跟随。适合展示横向移动的主体或扫视环境。', 
    prompt: 'Smooth panning shot, camera rotates horizontally to follow the subject, fluid motion, maintaining focus on action' 
  },
  { 
    id: 'tracking', 
    label: '侧向跟拍', 
    description: '摄像机与主体平行移动。常用于行走对话或横向动作场面，背景产生运动模糊。', 
    prompt: 'Sideways tracking shot, camera moves parallel to the subject at the same speed, background passing by with cinematic motion blur' 
  },
  { 
    id: 'steadicam', 
    label: '斯坦尼康', 
    description: '如丝般顺滑的流动镜头。模拟漂浮感，优雅地跟随主体穿梭于复杂场景，无任何抖动。', 
    prompt: 'Steadicam shot, incredibly smooth and fluid camera movement, floating elegantly through the scene, high production value, cinematic stability' 
  },
  { 
    id: 'handheld', 
    label: '手持摄影', 
    description: '模拟人手的微小晃动。增加呼吸感和真实感，适合纪录片风格或不安静的场景。', 
    prompt: 'Handheld camera style, subtle organic shake, breathing movement, documentary realism, authentic and raw atmosphere' 
  },
  { 
    id: 'handheld_follow', 
    label: '手持跟拍', 
    description: '晃动较强烈的跟随拍摄。用于追逐、争吵或混乱场景，营造紧迫感和临场感。', 
    prompt: 'Shaky handheld tracking shot, running with the camera, intense camera shake, chaotic energy, immersive action, urgency' 
  },
  { 
    id: 'snorricam', 
    label: '身挂镜头', 
    description: '摄像机固定在演员身上对着脸。背景剧烈晃动而人脸相对静止，表现醉酒、恐慌或精神崩溃。', 
    prompt: 'Snorricam shot, camera rigged to the subject\'s body facing their face, background moves disorientingly while face remains locked, psychological breakdown, paranoia' 
  },
  { 
    id: 'arc', 
    label: '环绕拍摄', 
    description: '围绕主体进行360度或半圆旋转。用于展示英雄时刻、浪漫对视或全方位的审视。', 
    prompt: 'Orbital arc shot, camera circling around the subject, parallax effect on background, dynamic rotation, cinematic revelation' 
  },
  { 
    id: 'crane_up', 
    label: '摇臂上升', 
    description: '镜头垂直向上升高。从平视变为俯瞰，展现场景的宏大或角色的渺小。', 
    prompt: 'Crane up shot, camera booming up vertically, revealing the scale of the location, shifting from eye-level to high-angle' 
  },
  { 
    id: 'low_angle', 
    label: '低角度仰拍', 
    description: '低于视线向上拍摄。赋予角色权力和威严感，或表现巨大的压迫感。', 
    prompt: 'Low angle shot, camera looking up at the subject from below, making them appear dominant, powerful, and imposing' 
  },
  { 
    id: 'high_angle', 
    label: '高角度俯拍', 
    description: '高于视线向下拍摄。使角色显得弱小、无助或被困，展现宿命感。', 
    prompt: 'High angle shot, camera looking down on the subject, making them appear vulnerable, small, and weak against the environment' 
  },
  { 
    id: 'overhead', 
    label: '上帝视角', 
    description: '90度垂直俯视。用于展示几何构图、路径规划或完全客观的观察视角。', 
    prompt: 'God\'s eye view, straight down overhead shot, 90-degree angle, geometric composition, map-like perspective' 
  },
  { 
    id: 'pov', 
    label: '第一人称', 
    description: '模拟角色眼睛看到的画面。观众直接代入角色视角，增加沉浸感。', 
    prompt: 'Point of view shot, seeing through the character\'s eyes, first-person perspective, immersive interaction with hands or environment visible' 
  },
  { 
    id: 'dolly_zoom', 
    label: '希区柯克变焦', 
    description: '推拉变焦同时进行。主体大小不变但背景透视剧烈变形，制造惊悚、眩晕或顿悟的视觉效果。', 
    prompt: 'Cinematic dolly zoom, vertigo effect, zolly, background perspective stretches and distorts while subject size remains fixed, disorienting, intense psychological realization' 
  },
  { 
    id: 'dutch', 
    label: '荷兰倾斜', 
    description: '镜头地平线倾斜。表现失衡、疯狂、不安或非正常的心理状态。', 
    prompt: 'Dutch angle, tilted horizon line, slanted camera, creating a sense of unease, madness, and psychological imbalance' 
  },
  { 
    id: 'whip_pan', 
    label: '极速甩镜', 
    description: '极快地横向甩动镜头。产生运动模糊，常用于快速转场或表现突然的注意力转移。', 
    prompt: 'Fast whip pan, rapid camera movement causing directional motion blur, dynamic transition, high energy' 
  },
  { 
    id: 'crash_zoom', 
    label: '急推变焦', 
    description: '瞬间从全景推进到特写。用于强调震惊反应、喜剧效果或突然的发现。', 
    prompt: 'Crash zoom, snap zoom, sudden and rapid zoom in onto the subject\'s face, dramatic impact, shock value' 
  },
  { 
    id: 'rack_focus', 
    label: '焦点转移', 
    description: '焦点在前景和背景之间平滑切换。引导观众视线，揭示隐藏信息。', 
    prompt: 'Cinematic rack focus, focus shifting smoothly from foreground object to background subject, depth of field transition, storytelling through focus' 
  },
  {
    id: 'fpv_drone',
    label: 'FPV穿越',
    description: '高速飞行的无人机视角。穿梭于狭窄空间或跟随高速物体，极具动感。',
    prompt: 'FPV drone shot, flying rapidly through the environment, banking and diving, high speed motion, dynamic aerial acrobatics'
  }
];

export const SYSTEM_INSTRUCTION = `
# Role: 反套路短剧金牌编剧 & 资深分镜导演 (Anti-Trope Screenwriter & Art Director)

## Profile
- **身份**: 你是一名活跃于B站、抖音、快手等平台的百万粉3D动画/动态漫编剧，同时也是一位对画面构图有极致要求的导演。
- **专长**: 你擅长解构传统网文套路，同时擅长将剧本转化为高质量的**动态漫分镜脚本**。

## Core Philosophy (创作核心哲学)
1. **逻辑至上**: 用严谨的现实逻辑去碰撞无脑的爽文设定。
2. **去光环化**: 主角没有道德枷锁，反派智商极度在线。
3. **视觉一致性**: 所有的视觉描述必须遵循统一的美术风格（Global Art Style）。

## AI Visual Workflow (AI 视觉工作流)

### 1. Global Style (统一美术风格)
定义一个适合该剧本的独特美术风格。
- **Short Drama (短剧感)**: "Cinematic Hyper-Realism, 8k, Arri Alexa, Shallow Depth of Field, Volumetric Lighting"
- **Manga/Anime (漫剧感)**: "2.5D Anime Style, Cel Shaded, Bold Outlines, Vibrant Colors, MAPPA Studio style"

### 2. Asset Extraction (资产提取)
- **Characters**: 必须请求生成**三视图 (Three-view Character Sheet)**。Prompt: "Character sheet of [Name], front/side/back view, neutral background..."
- **Scenes/Props**: 提取关键场景和道具。

### 3. Storyboard Generation (大师级分镜)
根据剧本生成 6-10 个关键分镜 (Keyframes)。
- **Duration Constraint**: 每个分镜动作/对白必须控制在 **6-8秒**。
- **Camera Movement (运镜)**: 必须根据情节张力，从以下库中选择最合适的运镜 (Only use Chinese Labels in Output):
  - *固定镜头, 缓慢推镜, 缓慢拉镜, 水平跟摇, 侧向跟拍*
  - *斯坦尼康, 手持摄影, 手持跟拍, 身挂镜头*
  - *摇臂上升, 低角度仰拍, 高角度俯拍, 上帝视角*
  - *第一人称, 希区柯克变焦, 荷兰倾斜, 极速甩镜, 急推变焦, 焦点转移, FPV穿越*
- **Context Awareness**: 确保分镜连贯性 (Assets consistency)。
- **Visual Prompt**: 极度详细的英文 Prompt。
  - **Format**: "[Global Style], [Shot Type], [Camera Movement English], [Subject Action], [Lighting], [Mood]".
  - **Strict Rules**: 
    - NO TEXT, NO SUBTITLES in the image.
    - NO extra characters. Only explicitly listed assets should appear.
    - High resolution, cinematic composition.

## Rules (约束条件)
1. **结局必须崩坏**: 不要大团圆，要戛然而止的荒谬感。
2. **台词风格**: 角色说话要一本正经地胡说八道。
3. **输出格式**: 必须严格遵守 JSON Schema。
- All text fields (title, content, etc) in **SIMPLIFIED CHINESE**.
- All 'visualPrompt' fields in **ENGLISH**.
- 'cameraMovement' must be the Chinese Label (e.g. "缓慢推镜").
- 'involvedAssetIds' matches 'id' of extracted assets.
`;

export const GEMINI_MODEL = "gemini-3-pro-preview";
export const IMAGE_MODEL = "gemini-2.5-flash-image";
