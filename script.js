class AIChatApp {
    constructor() {
        // 初始化 GPT 配置
        this.gptConfig = {
            apiKey: 'sk-qCSVaohpHgxmgMY4p88O7TA4oNf8zGgBDofQRPMZFXv58HGh',
            baseUrl: 'https://api.chatanywhere.tech/v1/chat/completions',
            model: 'gpt-3.5-turbo-1106',
            models: {
                'gpt-4': {
                    name: 'GPT-4',
                    maxTokens: 8192,
                    supportImage: false
                },
                'gpt-4o': {
                    name: 'GPT-4 Turbo',
                    maxTokens: 128000,
                    supportImage: false
                },
                'gpt-4o-mini-2024-07-18': {
                    name: 'GPT-4 Mini (最新)',
                    maxTokens: 8192,
                    supportImage: false
                },
                'gpt-4o-mini': {
                    name: 'GPT-4 Mini',
                    maxTokens: 8192,
                    supportImage: false
                },
                'gpt-3.5-turbo-1106': {
                    name: 'GPT-3.5 Turbo (最新)',
                    maxTokens: 16385,
                    supportImage: false
                },
                'gpt-3.5-turbo-0613': {
                    name: 'GPT-3.5 Turbo (0613)',
                    maxTokens: 4096,
                    supportImage: false
                },
                'gpt-3.5-turbo-0301': {
                    name: 'GPT-3.5 Turbo (0301)',
                    maxTokens: 4096,
                    supportImage: false
                },
                'gpt-3.5': {
                    name: 'GPT-3.5',
                    maxTokens: 4096,
                    supportImage: false
                }
            }
        };
        
        // 其他初始化代码...
        this.currentModel = 'gpt';  // 默认模型
        this.conversationHistory = [];

        // 初始化其他配置
        this.initializeConfigs();
        this.initializeElements();
        this.initializeEventListeners();
        this.initializeTextarea();
        this.setupFileUpload();
        this.initializeMarked();
        
        // 创建欢迎界面
        this.createNewChat(true);

        // 初始化GPT模型选择器
        this.initializeGPTModelSelector();

        // 初始化智谱AI模型选择器
        const zhipuSelect = document.getElementById('zhipuModelSelect');
        if (zhipuSelect) {
            zhipuSelect.innerHTML = `
                <option value="glm-4v-flash">glm-4v-flash</option>
                <option value="THUDM/glm-4-9b-chat">GLM-4-9B-Chat</option>
            `;
        }

        // 添加请求控制器
        this.currentRequest = null;
        this.abortController = null;

        // 检测移动端并处理横屏
        this.handleMobileOrientation();

        // 处理开屏页面
        this.handleSplashScreen();
    }

    initializeConfigs() {
        this.currentModel = 'gpt';
        
        // 更新智谱AI配置
        this.zhipuConfig = {
            models: {
                // glm-4v-flash - 使用智谱AI方API
                'glm-4v-flash': {
                    name: 'glm-4v-flash',
                    maxTokens: 8192,
                    supportImage: true,
                    baseUrl: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
                    apiKey: '8807fe42fcf8fa1208077876878dadbb.4xSEX4vp1Dzkx2WP'
                },
                // GLM-4-9B-Chat - 使用 SiliconFlow API
                'THUDM/glm-4-9b-chat': {
                    name: 'GLM-4-9B-Chat',
                    maxTokens: 8192,
                    supportImage: false,
                    baseUrl: 'https://api.siliconflow.cn/v1/chat/completions',
                    apiKey: 'sk-hyeudoewxhrzksdcsfbyzkprbocvedmdhydzzmmpuohxxphs'
                }
            },
            model: 'glm-4v-flash'  // 默认使用支持图片的模型
        };
        
        // 图床配置
        this.imgbbConfig = {
            apiKey: '672b19ccee439f1b7875f3409fcab0ce',
            uploadUrl: 'https://api.imgbb.com/1/upload'
        };
        
        // 头像配置
        this.avatars = {
            ai: {
                gpt: 'https://img.icons8.com/?size=100&id=FBO05Dys9QCg&format=png&color=000000',
                zhipu: 'https://chatglm.cn/img/logo-collapse.d00ef130.svg',
                qwen: 'https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/Model_LOGO/Tongyi.svg',
                flux: 'https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/Model_LOGO/blackforestlabs.svg',
                sd: 'https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/Model_LOGO/Stability.svg',
                video: 'https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/Model_LOGO/Lightricks.png',
                deepseek: 'https://www.deepseek.com/favicon.ico',
                marco: 'https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/Model_LOGO/AIDC_AI.png',
                yi: 'https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/Model_LOGO/Yi.svg',
                internlm: 'https://sf-maas-uat-prod.oss-cn-shanghai.aliyuncs.com/Model_LOGO/internlm.svg'
            },
            user: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZmlsbD0iIzY2NjY2NiIgZD0iTTEyIDJhMTAgMTAgMCAxIDAgMTAgMTBBMTAgMTAgMCAwIDAgMTIgMnptMCA1YTMgMyAwIDEgMSAwIDYgMyAzIDAgMCAxIDAtNnptMCAxM2E4LjAxIDguMDEgMCAwIDEtNi0yLjczVjE2YTMgMyAwIDAgMSAzLTNoNmEzIDMyIDAgMCAxIDMgM3YxLjI3YTguMDEgOC4wMSAwIDAgMS02IDIuNzN6Ii8+PC9zdmc+',
            system: 'https://chatglm.cn/img/logo-collapse.d00ef130.svg'
        };
        
        // 支持的文件类型
        this.supportedFiles = {
            image: ['image/jpeg', 'image/png', 'image/gif'],
            video: ['video/mp4']
        };
        
        // 对话历史管
        this.currentChatId = Date.now().toString();
        this.chatHistories = new Map();
        this.conversationHistory = [];

        // 添加GPT配置
        this.gptConfig = {
            apiKey: 'sk-qCSVaohpHgxmgMY4p88O7TA4oNf8zGgBDofQRPMZFXv58HGh',
            baseUrl: 'https://api.chatanywhere.tech/v1/chat/completions',
            model: 'gpt-3.5-turbo-1106',
            models: {
                'gpt-4': {
                    name: 'GPT-4',
                    maxTokens: 8192,
                    supportImage: false
                },
                'gpt-4o': {
                    name: 'GPT-4 Turbo',
                    maxTokens: 128000,
                    supportImage: false
                },
                'gpt-4o-mini-2024-07-18': {
                    name: 'GPT-4 Mini (最新)',
                    maxTokens: 8192,
                    supportImage: false
                },
                'gpt-4o-mini': {
                    name: 'GPT-4 Mini',
                    maxTokens: 8192,
                    supportImage: false
                },
                'gpt-3.5-turbo-1106': {
                    name: 'GPT-3.5 Turbo (最新)',
                    maxTokens: 16385,
                    supportImage: false
                },
                'gpt-3.5-turbo-0613': {
                    name: 'GPT-3.5 Turbo (0613)',
                    maxTokens: 4096,
                    supportImage: false
                },
                'gpt-3.5-turbo-0301': {
                    name: 'GPT-3.5 Turbo (0301)',
                    maxTokens: 4096,
                    supportImage: false
                },
                'gpt-3.5': {
                    name: 'GPT-3.5',
                    maxTokens: 4096,
                    supportImage: false
                }
            }
        };

        // 初始化完成后，如果当前是GPT模型，显示模型选择器
        if (this.currentModel === 'gpt') {
            const gptModelSelector = document.querySelector('.gpt-model-selector');
            if (gptModelSelector) {
                gptModelSelector.style.display = 'block';
            }
        }

        // 初始化完成后，如果当前是SD模型，显示模型选择器
        if (this.currentModel === 'sd') {
            const sdModelSelector = document.querySelector('.sd-model-selector');
            if (sdModelSelector) {
                sdModelSelector.style.display = 'block';
                // 设置默认选中的模型文本
                const selectedModelText = sdModelSelector.querySelector('.selected-model span');
                if (selectedModelText) {
                    const defaultModel = this.sdConfig.models[this.sdConfig.model];
                    selectedModelText.textContent = defaultModel.name;
                }
            }
        }

        // 添加 Qwen 配置
        this.qwenConfig = {
            apiKey: 'sk-hyeudoewxhrzksdcsfbyzkprbocvedmdhydzzmmpuohxxphs',
            baseUrl: 'https://api.siliconflow.cn/v1/chat/completions',
            model: 'Qwen/Qwen2.5-7B-Instruct',
            models: {
                'Qwen/Qwen2.5-7B-Instruct': {
                    name: 'Qwen2.5-7B-Instruct',
                    maxTokens: 4096,
                    supportImage: false,
                    supportFunctionCall: true,
                    supportMultiLingual: true,
                    supportStructuredOutput: true
                }
            }
        };

        // 在 initializeConfigs 中添加 FLUX 配置
        this.fluxConfig = {
            apiKey: 'sk-hyeudoewxhrzksdcsfbyzkprbocvedmdhydzzmmpuohxxphs',  // 使用 SiliconFlow 的 API key
            baseUrl: 'https://api.siliconflow.cn/v1/images/generations',
            model: 'black-forest-labs/FLUX.1-schnell',
            models: {
                'black-forest-labs/FLUX.1-schnell': {
                    name: 'FLUX.1-schnell',
                    supportImageGen: true,
                    defaultSize: '1024x1024',
                    supportedSizes: ['1024x1024', '512x1024', '768x512', '768x1024', '1024x576', '576x1024']
                }
            }
        };

        // 在 initializeConfigs 中添加 Stable Diffusion 配置
        this.sdConfig = {
            apiKey: 'sk-hyeudoewxhrzksdcsfbyzkprbocvedmdhydzzmmpuohxxphs',
            baseUrl: 'https://api.siliconflow.cn/v1/images/generations',
            model: 'stabilityai/stable-diffusion-3-5-large',
            models: {
                'stabilityai/stable-diffusion-3-5-large': {
                    name: 'Stable Diffusion v3.5',
                    supportImageGen: true,
                    supportImageToImage: false,  // 不支持图生图
                    defaultSize: '1024x1024',
                    supportedSizes: ['1024x1024', '512x1024', '768x512', '768x1024', '1024x576', '576x1024'],
                    defaultSteps: 20,
                    defaultGuidance: 7.5
                }
            }
        };

        // 修改视频配置
        this.videoConfig = {
            apiKey: '8807fe42fcf8fa1208077876878dadbb.4xSEX4vp1Dzkx2WP',
            submitUrl: 'https://open.bigmodel.cn/api/paas/v4/videos/generations',
            statusUrl: 'https://open.bigmodel.cn/api/paas/v4/async-result',
            model: 'cogvideox-flash',
            models: {
                'cogvideox-flash': {
                    name: 'CogVideoX-Flash',
                    supportVideoGen: true,
                    maxDuration: 10,
                    maxFps: 60,
                    defaultFps: 30,
                    supportedSizes: [
                        '720x480',
                        '1024x1024',
                        '1280x960',
                        '960x1280',
                        '1920x1080',
                        '1080x1920',
                        '2048x1080',
                        '3840x2160'
                    ]
                }
            }
        };

        // 修改 DeepSeek 配置
        this.deepseekConfig = {
            models: {
                // 原有的 V3 模型 - 使用 pearktrue API
                'deepseek-v3': {
                    name: 'DeepSeek V3',
                    maxTokens: 4096,
                    supportImage: false,
                    apiUrl: 'https://api.pearktrue.cn/api/deepseek/',
                    description: 'DeepSeek-V3为自研MoE模型，671B参数，激活37B，在14.8T token上进行了预训练。'
                },
                // 新增的推理模型 - 使用 SiliconFlow API
                'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B': {
                    name: 'DeepSeek-R1-Distill-Qwen-7B',
                    maxTokens: 4096,
                    supportImage: false,
                    supportReasoning: true,
                    supportMultiLingual: true,
                    supportStructuredOutput: true,
                    apiKey: 'sk-hyeudoewxhrzksdcsfbyzkprbocvedmdhydzzmmpuohxxphs',
                    baseUrl: 'https://api.siliconflow.cn/v1/chat/completions',
                    description: 'DeepSeek-R1-Distill-Qwen-7B 是一个专注于推理能力的模型，基于 Qwen-7B 进行蒸馏优化。'
                }
            },
            model: 'deepseek-v3' // 默认使用 V3 模型
        };

        // 添加 Marco-o1 配置
        this.marcoConfig = {
            apiKey: 'sk-hyeudoewxhrzksdcsfbyzkprbocvedmdhydzzmmpuohxxphs',
            baseUrl: 'https://api.siliconflow.cn/v1/chat/completions',
            model: 'AIDC-AI/Marco-o1',
            models: {
                'AIDC-AI/Marco-o1': {
                    name: 'Marco-o1',
                    maxTokens: 4096,
                    supportImage: false,
                    supportThoughtChain: true,
                    supportFunctionCall: true,
                    supportMultiLingual: true
                }
            }
        };

        // 添加 Yi 配置
        this.yiConfig = {
            apiKey: 'sk-hyeudoewxhrzksdcsfbyzkprbocvedmdhydzzmmpuohxxphs',
            baseUrl: 'https://api.siliconflow.cn/v1/chat/completions',
            model: '01-ai/Yi-1.5-9B-Chat-16K',
            models: {
                '01-ai/Yi-1.5-9B-Chat-16K': {
                    name: 'Yi-1.5-9B-Chat-16K',
                    maxTokens: 16384,
                    supportImage: false,
                    supportMultiLingual: true
                }
            }
        };

        // 添加 InternLM 配置
        this.internlmConfig = {
            apiKey: 'sk-hyeudoewxhrzksdcsfbyzkprbocvedmdhydzzmmpuohxxphs',
            baseUrl: 'https://api.siliconflow.cn/v1/chat/completions',
            model: 'internlm/internlm2_5-7b-chat',
            models: {
                'internlm/internlm2_5-7b-chat': {
                    name: 'InternLM2-Chat-7B',
                    maxTokens: 8192,
                    supportImage: false,
                    supportMultiLingual: true
                }
            }
        };
    }

    initializeElements() {
        this.chatHistory = document.getElementById('chatHistory');
        this.userInput = document.getElementById('userInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.modelBtns = document.querySelectorAll('.model-btn');

        // 根据当前模型更新输入框提示文本
        this.updateInputPlaceholder();
    }

    initializeMarked() {
        marked.setOptions({
            highlight: function(code, lang) {
                if (lang && hljs.getLanguage(lang)) {
                    return hljs.highlight(code, { language: lang }).value;
                }
                return code;
            }
        });
    }

    createNewChat(isInitial = false) {
        // 清空界面
        this.chatHistory.innerHTML = '';
        this.conversationHistory = [];
        
        // 获取当前选择的模型
        const selectedModel = document.getElementById('zhipuModelSelect')?.value;
        
        // 创建欢迎界面
        const welcomeSection = document.createElement('div');
        welcomeSection.className = 'welcome-section';
        
        // 根据不同模型显示不同的欢迎信息
        let welcomeContent = '';
        if (this.currentModel === 'gpt') {
            welcomeContent = `
                <div class="ai-avatar">
                    <img src="${this.avatars.ai[this.currentModel]}" alt="GPT头像">
                </div>
                <h2>ChatGPT</h2>
                <p>ChatGPT（Chat Generative Pre-trained Transformer），基于GPT系统大模型构建</p>
                <div class="model-features">
                    <span><i class="fas fa-brain"></i> 通用对话</span>
                    <span><i class="fas fa-code"></i> 代码编程</span>
                    <span><i class="fas fa-pen"></i> 文本创作</span>
                    <span><i class="fas fa-calculator"></i> 数学计算</span>
                </div>
                <div class="suggestion-grid">
                    <button class="suggestion-btn">帮我写一段代码</button>
                    <button class="suggestion-btn">解释一个概念</button>
                    <button class="suggestion-btn">创作一篇文章</button>
                    <button class="suggestion-btn">数学问题求解</button>
                </div>
            `;
        } else if (this.currentModel === 'zhipu') {
            welcomeContent = `
                <div class="ai-avatar">
                    <img src="${this.avatars.ai[this.currentModel]}" alt="智谱AI头像">
                </div>
                <h2>智谱 AI</h2>
                <p>在多项基准测试中，GLM-4展现了优秀的性能，在语义、数学、推理、代码和知识等多个方面表现出色。</p>
                <div class="model-features">
                    <span><i class="fas fa-comments"></i> 中英对话</span>
                    <span><i class="fas fa-image"></i> 图像理解</span>
                    <span><i class="fas fa-book"></i> 知识问答</span>
                    <span><i class="fas fa-tasks"></i> 任务处理</span>
                </div>
                <div class="suggestion-grid">
                    <button class="suggestion-btn">分析一张图片</button>
                    <button class="suggestion-btn">解答学术问题</button>
                    <button class="suggestion-btn">中英互译</button>
                    <button class="suggestion-btn">数据分析</button>
                </div>
            `;
        } else if (this.currentModel === 'qwen') {
            welcomeContent = `
                <div class="ai-avatar">
                    <img src="${this.avatars.ai[this.currentModel]}" alt="通义千问头像">
                </div>
                <h2>通义千问</h2>
                <p>Qwen2.5-Coder-7B-Instruct在保持数学和通用能力优势的同时，强化了代码能力。</p>
                <div class="model-features">
                    <span><i class="fas fa-code"></i> 代码编程</span>
                    <span><i class="fas fa-database"></i> 知识库</span>
                    <span><i class="fas fa-chart-line"></i> 数据分析</span>
                    <span><i class="fas fa-robot"></i> 智能助手</span>
                </div>
                <div class="suggestion-grid">
                    <button class="suggestion-btn">编写商业方案</button>
                    <button class="suggestion-btn">技术文档生成</button>
                    <button class="suggestion-btn">数据可视化</button>
                    <button class="suggestion-btn">知识问答</button>
                </div>
            `;
        } else if (this.currentModel === 'flux') {
            welcomeContent = `
                <div class="ai-avatar">
                    <img src="${this.avatars.ai[this.currentModel]}" alt="FLUX头像">
                </div>
                <h2>FLUX 图像生成模型</h2>
                <p>FLUX.1-schnell 是一个 120 亿参数的 Rectified Flow Transformer 模型，该模型采用潜在对抗扩散蒸馏技术训练，具有最先进的输出质量和具有竞争力的提示跟随能力</p>
                <div class="suggestion-grid">
                    <button class="suggestion-btn">一只可爱的猫咪</button>
                    <button class="suggestion-btn">日落时分的海滩</button>
                    <button class="suggestion-btn">星空下的城市</button>
                    <button class="suggestion-btn">油画风格的向日葵</button>
                </div>
            `;
        } else if (this.currentModel === 'sd') {
            welcomeContent = `
                <div class="ai-avatar">
                    <img src="${this.avatars.ai[this.currentModel]}" alt="Stable Diffusion头像">
                </div>
                <h2>Stable Diffusion 图像生成模型</h2>
                <p>Stable Diffusion v3.5 是一个专注于高质量文本到图像生成的扩散模型，该模型在 10 亿张图像上进行了预训练，并在 3000 万张高质量美学图像和 300 万张偏好数据图像上进行了微调。</p>
                <div class="suggestion-grid">
                    <button class="suggestion-btn">一只在月光下奔跑的狼</button>
                    <button class="suggestion-btn">科幻风格的未来城市</button>
                    <button class="suggestion-btn">水墨画风格的春天樱花</button>
                    <button class="suggestion-btn">写实风格的人像素描</button>
                </div>
            `;
        } else if (selectedModel === 'Qwen/Qwen2.5-7B-Instruct') {
            welcomeContent = `
                <div class="ai-avatar">
                    <img src="${this.avatars.ai.qwen}" alt="Qwen头像">
                </div>
                <h2>Qwen AI助手</h2>
                <p>阿里云Qwen2.5-7B-Instruct模型，支持多语言交流和结构化输出</p>
                <div class="suggestion-grid">
                    <button class="suggestion-btn">我写一段代码</button>
                    <button class="suggestion-btn">生成JSON数据</button>
                    <button class="suggestion-btn">多语言翻译</button>
                    <button class="suggestion-btn">数学计算</button>
                </div>
            `;
        } else if (this.currentModel === 'video') {
            welcomeContent = `
                <div class="ai-avatar">
                    <img src="${this.avatars.ai[this.currentModel]}" alt="CogVideoX头像">
                </div>
                <h2>CogVideoX-Flash 视频生成模型</h2>
                <p>CogVideoX-Flash 是智谱AI开发的快速视频生成模型，继承CogVideoX自研的端到端视频理解模型，具备强大的视频生成能力。</p>
                <div class="suggestion-grid">
                    <button class="suggestion-btn">一只猫咪在玩毛线球</button>
                    <button class="suggestion-btn">日落时分的海浪</button>
                    <button class="suggestion-btn">城市街道的车流</button>
                    <button class="suggestion-btn">下雨天的窗户</button>
                </div>
                <div class="img2video-hint">
                    <i class="fas fa-film"></i>
                    <span></span>
                </div>
            `;
        } else if (this.currentModel === 'deepseek') {
            const currentModel = this.deepseekConfig.models[this.deepseekConfig.model];
            welcomeContent = `
                <div class="ai-avatar">
                    <img src="${this.avatars.ai[this.currentModel]}" alt="DeepSeek头像">
                </div>
                <h2>DeepSeek ${currentModel.name}</h2>
                <p>${currentModel.description}</p>
                ${this.deepseekConfig.model === 'deepseek-ai/DeepSeek-R1-Distill-Qwen-7B' ? `
                    <div class="model-features">
                        <span><i class="fas fa-brain"></i> 推理分析</span>
                        <span><i class="fas fa-code"></i> 代码生成</span>
                        <span><i class="fas fa-language"></i> 多语言</span>
                        <span><i class="fas fa-project-diagram"></i> 结构化输出</span>
                    </div>
                ` : ''}
                <div class="suggestion-grid">
                    ${this.deepseekConfig.model === 'deepseek-v3' ? `
                        <button class="suggestion-btn">做个自我介绍</button>
                        <button class="suggestion-btn">帮我写一段python代码</button>
                        <button class="suggestion-btn">解释人工智能</button>
                        <button class="suggestion-btn">生成小红书文案</button>
                    ` : `
                        <button class="suggestion-btn">分析一个数学问题</button>
                        <button class="suggestion-btn">解释一个复杂概念</button>
                        <button class="suggestion-btn">推理一个逻辑问题</button>
                        <button class="suggestion-btn">生成示例代码</button>
                    `}
                </div>
            `;
        } else if (this.currentModel === 'marco') {
            welcomeContent = `
                <div class="ai-avatar">
                    <img src="${this.avatars.ai[this.currentModel]}" alt="Marco-o1头像">
                </div>
                <h2>Marco-o1 推理模型</h2>
                <p>Marco-o1 是一个推进开放式问题解决的大型推理模型 (LRM)</p>
                <div class="suggestion-grid">
                    <button class="suggestion-btn">写一段python代码</button>
                    <button class="suggestion-btn">生成JSON数据</button>
                    <button class="suggestion-btn">多语言翻译</button>
                    <button class="suggestion-btn">数学计算</button>
                </div>
            `;
        } else if (this.currentModel === 'yi') {
            welcomeContent = `
                <div class="ai-avatar">
                    <img src="${this.avatars.ai[this.currentModel]}" alt="Yi头像">
                </div>
                <h2>Yi-1.5-9B-Chat-16K</h2>
                <p>Yi-1.5-9B-Chat在编码、数学、推理和指令遵循能力方面表现强劲</p>
                <div class="suggestion-grid">
                    <button class="suggestion-btn">写一段python代码</button>
                    <button class="suggestion-btn">解释人工智能</button>
                    <button class="suggestion-btn">多语言翻译</button>
                    <button class="suggestion-btn">数学计算</button>
                </div>
            `;
        } else if (this.currentModel === 'internlm') {
            welcomeContent = `
                <div class="ai-avatar">
                    <img src="${this.avatars.ai[this.currentModel]}" alt="InternLM头像">
                </div>
                <h2>书生浦语2.0</h2>
                <p>InternLM2.5-7B-Chat 是一个开源的对话模型，基于 InternLM2 架构开发</p>
                <div class="model-features">
                    <span><i class="fas fa-code"></i> 代码编程</span>
                    <span><i class="fas fa-calculator"></i> 数学推理</span>
                    <span><i class="fas fa-brain"></i> 知识问答</span>
                    <span><i class="fas fa-language"></i> 多语言</span>
                </div>
                <div class="suggestion-grid">
                    <button class="suggestion-btn">写一段python代码</button>
                    <button class="suggestion-btn">解释人工智能</button>
                    <button class="suggestion-btn">数学计算</button>
                    <button class="suggestion-btn">多语言翻译</button>
                </div>
            `;
        } else {
            welcomeContent = `
                <div class="ai-avatar">
                    <img src="${this.avatars.ai[this.currentModel]}" alt="AI头像">
                </div>
                <h2>大语言模型</h2>
                <p>选择模型开始对话</p>
                <div class="suggestion-grid">
                    <button class="suggestion-btn">做个自我介绍</button>
                    <button class="suggestion-btn">写一段python代码</button>
                    <button class="suggestion-btn">解释人工智能</button>
                    <button class="suggestion-btn">多语言翻译</button>
                </div>
            `;
        }
        
        welcomeSection.innerHTML = welcomeContent;
        this.chatHistory.appendChild(welcomeSection);
        
        // 绑定建议按钮事件
        this.bindSuggestionButtons();

        // 清空输入框
        if (this.userInput) {
            this.userInput.value = '';
            this.userInput.style.height = 'auto';
        }
    }

    initializeEventListeners() {
        // 添加模型选择事件
        document.querySelectorAll('.model-item').forEach(item => {
            item.addEventListener('click', () => {
                const model = item.dataset.model;
                this.switchModel(model);
                
                // 更新激活状态
                document.querySelectorAll('.model-item').forEach(el => {
                    el.classList.remove('active');
                });
                item.classList.add('active');
            });
        });

        // 发送消息事件
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        this.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // 切换模型事件
        this.modelBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchModel(e.target.dataset.model);
            });
        });

        // 新建对话按钮事件
        document.querySelector('.new-chat-btn').addEventListener('click', () => {
            this.createNewChat();
        });

        // 添加建议按钮点击事件
        document.querySelectorAll('.suggestion-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.userInput.value = e.target.textContent;
                this.sendMessage();
            });
        });

        // 添加智谱AI模型选择器事件
        const zhipuModelSelect = document.getElementById('zhipuModelSelect');
        if (zhipuModelSelect) {
            zhipuModelSelect.addEventListener('change', () => {
                console.log('Selected model:', zhipuModelSelect.value);
                this.updateFileUploadButton();
                this.createNewChat(true);
            });
        }

        // 添加 Qwen 模型选择器事件
        const qwenModelSelect = document.getElementById('qwenModelSelect');
        if (qwenModelSelect) {
            qwenModelSelect.addEventListener('change', () => {
                console.log('Selected Qwen model:', qwenModelSelect.value);
                this.updateFileUploadButton();
                this.createNewChat(true);
            });
        }

        // 添加 SD 模型选择器事件
        const sdModelSelector = document.querySelector('.sd-model-selector');
        if (sdModelSelector) {
            const selectedModelText = sdModelSelector.querySelector('.selected-model span');
            const modelOptions = sdModelSelector.querySelectorAll('.model-option');
            
            modelOptions.forEach(option => {
                option.addEventListener('click', () => {
                    const value = option.dataset.value;
                    const text = option.childNodes[0].textContent.trim();
                    
                    // 更新选中的显示文本
                    selectedModelText.textContent = text;
                    
                    // 更新配置
                    this.sdConfig.model = value;
                    
                    // 创建新对话
                    this.createNewChat(true);
                    
                    // 更新图生图按钮
                    this.updateButtons();
                    
                    // 更新历史记录显示
                    this.updateHistoryList();
                });
            });
        }

        // 添加图片双击事件监听
        this.chatHistory.addEventListener('dblclick', (e) => {
            if (e.target.classList.contains('chat-image')) {
                const imageViewer = document.querySelector('.image-viewer');
                const viewerImage = imageViewer.querySelector('img');
                viewerImage.src = e.target.src;
                imageViewer.style.display = 'flex';
                setTimeout(() => {
                    imageViewer.classList.add('active');
                }, 10);
            }
        });

        // 添加关闭图片查看器的事件
        const closeViewer = document.querySelector('.close-viewer');
        if (closeViewer) {
            closeViewer.addEventListener('click', () => {
                const imageViewer = document.querySelector('.image-viewer');
                imageViewer.classList.remove('active');
                setTimeout(() => {
                    imageViewer.style.display = 'none';
                }, 300);
            });
        }

        // 点击背景关闭图片查看器
        const imageViewer = document.querySelector('.image-viewer');
        if (imageViewer) {
            imageViewer.addEventListener('click', (e) => {
                if (e.target.classList.contains('image-viewer')) {
                    imageViewer.classList.remove('active');
                    setTimeout(() => {
                        imageViewer.style.display = 'none';
                    }, 300);
                }
            });
        }

        // 添加 ESC 键关闭功能
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const imageViewer = document.querySelector('.image-viewer');
                if (imageViewer && imageViewer.classList.contains('active')) {
                    imageViewer.classList.remove('active');
                    setTimeout(() => {
                        imageViewer.style.display = 'none';
                    }, 300);
                }
            }
        });

        // 添加 DeepSeek 模型选择器事件
        const deepseekModelSelect = document.getElementById('deepseekModelSelect');
        if (deepseekModelSelect) {
            deepseekModelSelect.addEventListener('change', () => {
                console.log('Selected DeepSeek model:', deepseekModelSelect.value);
                this.deepseekConfig.model = deepseekModelSelect.value;
                this.createNewChat(true);
            });
        }
    }

    initializeTextarea() {
        // 自动整本框高度
        this.userInput.addEventListener('input', () => {
            this.userInput.style.height = 'auto';
            this.userInput.style.height = this.userInput.scrollHeight + 'px';
        });
    }

    switchModel(model, createNew = true) {
        // 如果有正在进行的请求，先在当前对话中显示取消消息
        if (this.currentRequest) {
            const systemMessages = Array.from(this.chatHistory.children)
                .filter(el => el.classList.contains('system-message'));
            const lastSystemMessage = systemMessages[systemMessages.length - 1];
            if (lastSystemMessage) {
                lastSystemMessage.querySelector('.message-content').textContent = '图片生成已取消';
            }
            
            // 清除所有进度条
            document.querySelectorAll('.image-generation-progress').forEach(el => {
                el.remove();
            });
        }
        
        // 取消当前正在进行的请求
        this.cancelCurrentRequest();
        
        // 更新当前模型
        this.currentModel = model;
        
        // 更新顶部模型选择器
        const currentModelSelect = document.getElementById('currentModelSelect');
        if (currentModelSelect) {
            currentModelSelect.style.display = 'none';
            
            // 根据不同模型显示对应的选择器
            switch(model) {
                case 'gpt':
                    currentModelSelect.innerHTML = this.getGPTModelOptions();
                    currentModelSelect.style.display = 'block';
                    break;
                case 'zhipu':
                    currentModelSelect.innerHTML = this.getZhipuModelOptions();
                    currentModelSelect.style.display = 'block';
                    break;
                // ... 其他模型的选项
            }
            
            // 设置当前选中的模型
            if (currentModelSelect.style.display === 'block') {
                currentModelSelect.value = this.getCurrentModelValue();
            }
        }

        // 更新UI
        document.querySelectorAll('.model-item').forEach(item => {
            // 移除所有激活状态
            item.classList.remove('active');
            // 隐藏所有子选择器
            const subSelect = item.nextElementSibling;
            if (subSelect && subSelect.classList.contains('model-sub-select')) {
                if (item.dataset.model !== model) {
                    subSelect.style.maxHeight = '0';
                    subSelect.style.padding = '0';
                    subSelect.style.marginTop = '0';
                    subSelect.style.marginBottom = '0';
                    subSelect.style.opacity = '0';
                }
            }
        });

        // 激活当前选中的模型
        const currentItem = document.querySelector(`.model-item[data-model="${model}"]`);
        if (currentItem) {
            currentItem.classList.add('active');
            // 显示当前模型的子选择器（如果有多个选项）
            const subSelect = currentItem.nextElementSibling;
            if (subSelect && 
                subSelect.classList.contains('model-sub-select') && 
                subSelect.querySelector('select').options.length > 1) {
                subSelect.style.maxHeight = '200px';
                subSelect.style.padding = '8px';
                subSelect.style.marginTop = '2px';
                subSelect.style.marginBottom = '2px';
                subSelect.style.opacity = '1';
            }
        }

        // 更新模型选择器显示状态
        document.querySelectorAll('.model-select').forEach(selector => {
            selector.style.display = 'none';
        });
        
        const currentSelector = document.querySelector(`.${model}-model-selector`);
        if (currentSelector) {
            currentSelector.style.display = 'block';
            
            // 设置当前选中的模型
            const select = currentSelector.querySelector('select');
            if (select) {
                select.value = this.getCurrentModelValue();
            }
        }

        // 更新文件上传按钮状态
        this.updateFileUploadButton();

        // 清空当前对话历史
        this.conversationHistory = [];

        if (createNew) {
            // 创建新对话
            this.createNewChat(true);
        }

        // 更新输入框提示文本
        this.updateInputPlaceholder();

        // 更新文件上传按钮和图生图按钮
        this.updateButtons();

        // 如果切换到视频模型，检查是否已停用
        if (model === 'video') {
            const currentDate = new Date();
            if (currentDate >= this.videoConfig.endOfServiceDate) {
                this.addSystemMessage('LTX-Video 模型服务已于2025年1月1日停止支持，请选择其他模型。', this.avatars.system);
                // 保持在当前模型
                const currentModelBtn = document.querySelector(`.model-btn[data-model="${this.currentModel}"]`);
                if (currentModelBtn) {
                    currentModelBtn.classList.add('active');
                }
                return;
            }
        }
    }

    setupFileUpload() {
        const inputArea = document.querySelector('.input-area');
        
        // 移除所有与 SD 2.1 和图生图相关的代码
        // 只保留其他文件上传相关的功能
    }

    // 在 switchModel 方法中添加按钮更新
    updateButtons() {
        // 移除旧的图生图按钮
        const oldImg2imgBtn = document.querySelector('.img2img-btn');
        if (oldImg2imgBtn) {
            oldImg2imgBtn.remove();
        }

        // 重新设置文件上传和图生图按钮
        this.setupFileUpload();
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        // 检查当前模型是否支持图片
        const selectedModel = document.getElementById('zhipuModelSelect')?.value;
        
        if (this.currentModel === 'zhipu' && selectedModel !== 'glm-4v-flash') {
            this.addSystemMessage('只有 glm-4v-flash 型支持图片处理');
            return;
        }

        if (this.currentModel !== 'zhipu' || selectedModel !== 'glm-4v-flash') {
            this.addSystemMessage('当前模型不支持图片处理');
            return;
        }

        try {
            this.addSystemMessage('正在处理文件...');
            const base64Data = await this.fileToBase64(file);
            await this.handleImageUpload(base64Data);
        } catch (error) {
            console.error('文件处理错误:', error);
            this.addSystemMessage('文件处理失败，请重试');
        }

        event.target.value = '';
    }

    async handleVideoUpload(base64Video) {
        try {
            // 显示上传的视频
            this.addVideoMessage('user', base64Video);

            // 构建息对
            const message = {
                role: "user",
                content: [
                    {
                        type: "video_url",
                        video_url: {
                            url: base64Video.split(',')[1]  // 只发送base64数据部分，移除Data URL前缀
                        }
                    },
                    {
                        type: "text",
                        text: "请仔细描述个视频"
                    }
                ]
            };

            // 发送到智谱AI
            await this.getZhipuResponse(message);

        } catch (error) {
            console.error('视频处理错误:', error);
            this.addSystemMessage('视频处理失败，请重试');
        }
    }

    async handleImageUpload(base64Data) {
        try {
            // 显示上传图片
            this.addImageMessage('user', base64Data);

            // 构建消息对象
            const message = {
                role: "user",
                content: [
                    {
                        type: "image_url",
                        image_url: {
                            url: base64Data  // 保留完整的 base64 数据，括前缀
                        }
                    },
                    {
                        type: "text",
                        text: "请分析这张图片"
                    }
                ]
            };

            // 发送到智谱AI
            await this.getZhipuResponse(message);

        } catch (error) {
            console.error('图片处理错误:', error);
            this.addSystemMessage('图片处理失败，请重试');
        }
    }

    async uploadToImgbb(base64Image) {
        try {
            // 创建FormData对象
            const formData = new FormData();
            formData.append('key', this.imgbbConfig.apiKey);
            
            // 从base64中提取实际������图片��据（移除"data:image/xxx;base64,"前缀）
            const imageData = base64Image.split(',')[1];
            formData.append('image', imageData);

            // 发请求到imgbb
            const response = await fetch(this.imgbbConfig.uploadUrl, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error(`图床服务响应错误: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.success) {
                throw new Error('图片上传失败: ' + (data.error?.message || '未错误'));
            }

            // 返回图片URL
            return data.data.url;

        } catch (error) {
            console.error('上传图片到imgbb失败:', error);
            throw new Error('图片上传到图床服务失败，请重试');
        }
    }

    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    addImageMessage(sender, imageUrl) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        // 添加头像
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        const avatarImg = document.createElement('img');
        avatarImg.src = sender === 'user' ? this.avatars.user : this.avatars.ai[this.currentModel];
        avatarImg.alt = `${sender} avatar`;
        avatar.appendChild(avatarImg);
        messageDiv.appendChild(avatar);
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.className = 'chat-image';
        img.title = '双击查看大图';  // 添加提示文字
        
        messageContent.appendChild(img);
        messageDiv.appendChild(messageContent);
        this.chatHistory.appendChild(messageDiv);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }

    async sendMessage(text = null) {
        const message = text || this.userInput.value.trim();
        if (!message) return;

        this.sendBtn.classList.add('loading');
        
        try {
            // 清除欢迎界面
            const welcomeSection = document.querySelector('.welcome-section');
            if (welcomeSection) {
                welcomeSection.remove();
            }

            // 添加用户消息
            this.addMessageToChat('user', message);
            this.userInput.value = '';
            this.userInput.style.height = 'auto';

            // 根据不同模型处理请求
            if (this.currentModel === 'flux' || this.currentModel === 'sd') {
                await this.generateImage(message);
            } else if (this.currentModel === 'video') {
                await this.generateVideo(message);
            } else {
                await this.getAIResponse(message);
            }
        } finally {
            this.sendBtn.classList.remove('loading');
        }
    }

    addMessageToChat(sender, message) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        // 加头像
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        const avatarImg = document.createElement('img');
        
        // 根发送者和当前模型选择正确的头像
        if (sender === 'user') {
            avatarImg.src = this.avatars.user;
        } else if (sender === 'ai') {
            avatarImg.src = this.avatars.ai[this.currentModel];
        } else {
            avatarImg.src = this.avatars.system;
        }
        
        avatarImg.alt = `${sender} avatar`;
        avatar.appendChild(avatarImg);
        messageDiv.appendChild(avatar);
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        
        if (sender === 'user') {
            messageContent.textContent = message;
        } else {
            messageContent.innerHTML = `<div class="loading">正在思考...</div>`;
            setTimeout(() => {
                // 使用 marked 处理 Markdown
                const htmlContent = marked.parse(message);
                messageContent.innerHTML = htmlContent;

                // 渲染数学公式
                renderMathInElement(messageContent, {
                    delimiters: [
                        {left: '$$', right: '$$', display: true},
                        {left: '$', right: '$', display: false},
                        {left: '\\[', right: '\\]', display: true},
                        {left: '\\(', right: '\\)', display: false}
                    ],
                    throwOnError: false
                });

                // 高亮代码块
                messageContent.querySelectorAll('pre code').forEach((block) => {
                    hljs.highlightElement(block);
                });
            }, 500);
        }
        
        messageDiv.appendChild(messageContent);
        this.chatHistory.appendChild(messageDiv);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }

    async getAIResponse(message, imageUrl = null) {
        // 获取当前选择的模型和系统提示
        const systemPrompts = {
            gpt: {
                role: "system",
                content: "你是 OpenAI 开发的 GPT-4系列模型。请持专业、客观的回答，你的回答应该准确、有帮助且符合伦理道德。可以使用markdown格式"
            },
            zhipu: {
                'glm-4v-flash': {
                    role: "system",
                    content: "你是智谱AI开发的glm-4v-flash语言模型。你具备自然语言交互的能力。请保持专业、客观专注于文本理解和文本生成任务。可以使用markdown格式"
                },
                'THUDM/glm-4-9b-chat': {
                    role: "system",
                    content: "你是智谱AI开发的GLM-4-9B-Chat模型，你是一个专注于文本理解和生成的AI助手。请保持专业的学术风格，提供准确的知识和见解。可以使用markdown格式"
                }
            },
            qwen: {
                role: "system",
                content: "你是阿里的Qwen2.5-Coder-7B-Instruct模型。你支持多语言交流和结构化输出。请保持严谨的专业态度，提供准确、有见地回答。可以使用markdown格式"
            },
            deepseek: {
                role: "system",
                content: "你的名字是deepseek-v3，请保持专业、客观的回答，可以使用markdown格式"
            },
            marco: {
                role: "system",
                content: "你是阿里云的Marco-o1 推理模型，当你回答问题时，你的思考应该在<Thought>内完成，<Output>内输出你的结果。<Thought>应该尽可能是中文，但是有2个特例，一个是对原文中的引用，另一个是是数学应该使用markdown格式，<Output>内的输出需要遵循用户输入的语言。"
            },
            yi: {
                role: "system",
                content: "你是Yi语言模型。请提供准确、专业的回答。可以使用markdown格式"
            },
            internlm: {
                role: "system",
                content: "你是书生浦语2.0（InternLM2）大语言模型。请提供准确、专业的回答。可以使用markdown格式"
            }
        };

        if (this.currentModel === 'deepseek') {
            return await this.getDeepSeekResponse(message, systemPrompts.deepseek);
        }

        if (this.currentModel === 'zhipu') {
            const selectedModel = document.getElementById('zhipuModelSelect').value;
            const systemPrompt = systemPrompts.zhipu[selectedModel];
            return await this.getZhipuResponse(message, imageUrl, systemPrompt);
        } else if (this.currentModel === 'gpt') {
            return await this.getGPTResponse(message, systemPrompts.gpt);
        } else if (this.currentModel === 'qwen') {
            return await this.getQwenResponse(message, systemPrompts.qwen);
        } else if (this.currentModel === 'marco') {
            return await this.getMarcoResponse(message, systemPrompts.marco);
        } else if (this.currentModel === 'yi') {
            return await this.getYiResponse(message, systemPrompts.yi);
        } else if (this.currentModel === 'internlm') {
            return await this.getInternlmResponse(message, systemPrompts.internlm);
        }
    }

    async getZhipuResponse(message, imageUrl = null, systemPrompt) {
        try {
            this.sendBtn.classList.add('loading');
            
            // 获取当前选择的型配置
            const selectedModel = document.getElementById('zhipuModelSelect').value;
            const modelConfig = this.zhipuConfig.models[selectedModel];

            let requestBody = {
                model: selectedModel,
                messages: [],
                stream: true,
                temperature: 0.7,
                top_p: 0.7
            };

            // 添加系统提示
            if (systemPrompt) {
                requestBody.messages.push(systemPrompt);
            }

            // 添加用消息
            if (typeof message === 'string') {
                requestBody.messages.push({
                    role: "user",
                    content: message
                });
            } else if (message.content) {
                requestBody.messages.push(message);
            }

            // 添加历史对话记录，但确保系统提示始终在最前
            if (this.conversationHistory.length > 0 && systemPrompt) {
                requestBody.messages = [
                    systemPrompt,
                    ...this.conversationHistory,
                    requestBody.messages[requestBody.messages.length - 1]
                ];
            }

            console.log('Request URL:', modelConfig.baseUrl);
            console.log('Request Headers:', {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${modelConfig.apiKey}`
            });
            console.log('Request Body:', JSON.stringify(requestBody, null, 2));

            const response = await fetch(modelConfig.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${modelConfig.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('API Error Response:', errorData);
                
                if (response.status === 401) {
                    this.addSystemMessage('API认证失败，请检查API密钥是否正确���是否过期');
                    throw new Error('API认证失败');
                }
                
                throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
            }

            // 创建消息元素
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', 'ai-message');
            
            const avatar = document.createElement('div');
            avatar.className = 'avatar';
            const avatarImg = document.createElement('img');
            avatarImg.src = this.avatars.ai[this.currentModel];
            avatarImg.alt = 'AI avatar';
            avatar.appendChild(avatarImg);
            messageDiv.appendChild(avatar);

            const messageContent = document.createElement('div');
            messageContent.classList.add('message-content');
            messageContent.innerHTML = '<div class="loading">正在思考...</div>';
            messageDiv.appendChild(messageContent);
            this.chatHistory.appendChild(messageDiv);

            let fullContent = '';
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            if (line.includes('[DONE]')) continue;

                            const data = JSON.parse(line.slice(6));
                            if (data.choices?.[0]?.delta?.content) {
                                const content = data.choices[0].delta.content;
                                fullContent += content;
                                
                                const htmlContent = marked.parse(fullContent);
                                messageContent.innerHTML = htmlContent;

                                // 渲染数学公式
                                renderMathInElement(messageContent, {
                                    delimiters: [
                                        {left: '$$', right: '$$', display: true},
                                        {left: '$', right: '$', display: false},
                                        {left: '\\[', right: '\\]', display: true},
                                        {left: '\\(', right: '\\)', display: false}
                                    ],
                                    throwOnError: false
                                });

                                // 高亮代码块
                                messageContent.querySelectorAll('pre code').forEach((block) => {
                                    hljs.highlightElement(block);
                                });

                                this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
                            }
                        } catch (e) {
                            if (!line.includes('[DONE]')) {
                                console.error('解析响应数据出错:', e);
                            }
                        }
                    }
                }
            }

            // 保存对话史
            if (typeof message === 'string') {
                this.conversationHistory.push({
                    role: "user",
                    content: message
                });
            }

            this.conversationHistory.push({
                role: "assistant",
                content: fullContent
            });

            return fullContent;
        } catch (error) {
            console.error('智谱AI API调用错误:', error);
            this.addSystemMessage(`API调用失败: ${error.message}`);
            throw error;
        } finally {
            this.sendBtn.classList.remove('loading');
        }
    }

    async getGPTResponse(message) {
        try {
            this.sendBtn.classList.add('loading');

            // 构建请求消息
            let messages = [];
            
            // 添加历史对话
            if (this.conversationHistory.length > 0) {
                messages = messages.concat(this.conversationHistory.slice(-10));
            }

            // 添加当前消息
            messages.push({
                role: "user",
                content: message
            });

            // 发送请求
            const response = await fetch(this.gptConfig.baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.gptConfig.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.gptConfig.model,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 2000
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (!data.choices || !data.choices[0]) {
                throw new Error('Invalid response format from GPT API');
            }

            const aiResponse = data.choices[0].message.content;

            // 创建消息元素
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', 'ai-message');
            
            // 添加头像
            const avatar = document.createElement('div');
            avatar.className = 'avatar';
            const avatarImg = document.createElement('img');
            avatarImg.src = this.avatars.ai[this.currentModel];
            avatarImg.alt = 'AI avatar';
            avatar.appendChild(avatarImg);
            messageDiv.appendChild(avatar);

            // 添加消息内容
            const messageContent = document.createElement('div');
            messageContent.classList.add('message-content');
            messageContent.innerHTML = marked.parse(aiResponse);

            // 渲染数学公式
            renderMathInElement(messageContent, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\[', right: '\\]', display: true},
                    {left: '\\(', right: '\\)', display: false}
                ],
                throwOnError: false
            });

            // 高亮代码块
            messageContent.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });

            messageDiv.appendChild(messageContent);
            this.chatHistory.appendChild(messageDiv);
            this.chatHistory.scrollTop = this.chatHistory.scrollHeight;

            // 保存对话历史
            this.conversationHistory.push({
                role: "user",
                content: message
            });

            this.conversationHistory.push({
                role: "assistant",
                content: aiResponse
            });

            return aiResponse;

        } catch (error) {
            console.error('GPT API调用错误:', error);
            this.addSystemMessage(`API调用失败: ${error.message}`);
            throw error;
        } finally {
            this.sendBtn.classList.remove('loading');
        }
    }

    async getQwenResponse(message, systemPrompt) {
        try {
            this.sendBtn.classList.add('loading');
            
            const maxTokens = Math.min(
                this.qwenConfig.models[this.qwenConfig.model].maxTokens,
                4096  // 确保不超过4096
            );
            
            let requestBody = {
                model: this.qwenConfig.model,
                messages: [
                    systemPrompt,
                    {
                        role: "user",
                        content: message
                    }
                ],
                stream: true,
                temperature: 0.7,
                max_tokens: maxTokens
            };

            // 发送请求
            const response = await fetch(this.qwenConfig.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.qwenConfig.apiKey}`
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
            }

            // 处理流式响应...
            // 这部分代码与 getGPTResponse 中的流式响应处理相同
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', 'ai-message');
            
            const avatar = document.createElement('div');
            avatar.className = 'avatar';
            const avatarImg = document.createElement('img');
            avatarImg.src = this.avatars.ai[this.currentModel];
            avatarImg.alt = 'AI avatar';
            avatar.appendChild(avatarImg);
            messageDiv.appendChild(avatar);

            const messageContent = document.createElement('div');
            messageContent.classList.add('message-content');
            messageContent.innerHTML = '<div class="loading">正在思考...</div>';
            messageDiv.appendChild(messageContent);
            this.chatHistory.appendChild(messageDiv);

            let fullContent = '';
            const reader = response.body.getReader();
            const decoder = new TextDecoder();

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        try {
                            if (line.includes('[DONE]')) continue;

                            const data = JSON.parse(line.slice(6));
                            if (data.choices?.[0]?.delta?.content) {
                                const content = data.choices[0].delta.content;
                                fullContent += content;
                                
                                const htmlContent = marked.parse(fullContent);
                                messageContent.innerHTML = htmlContent;

                                // 渲染数学公式
                                renderMathInElement(messageContent, {
                                    delimiters: [
                                        {left: '$$', right: '$$', display: true},
                                        {left: '$', right: '$', display: false},
                                        {left: '\\[', right: '\\]', display: true},
                                        {left: '\\(', right: '\\)', display: false}
                                    ],
                                    throwOnError: false
                                });

                                // 高亮代码块
                                messageContent.querySelectorAll('pre code').forEach((block) => {
                                    hljs.highlightElement(block);
                                });

                                this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
                            }
                        } catch (e) {
                            if (!line.includes('[DONE]')) {
                                console.error('解析响应数据出错:', e);
                            }
                        }
                    }
                }
            }

            // 保存对话历史
            this.conversationHistory.push({
                role: "user",
                content: message
            });

            this.conversationHistory.push({
                role: "assistant",
                content: fullContent
            });

            return fullContent;
        } catch (error) {
            console.error('Qwen API调用错误:', error);
            this.addSystemMessage(`API调用失败: ${error.message}`);
            throw error;
        } finally {
            this.sendBtn.classList.remove('loading');
        }
    }

    // 添加视频消息显示方法
    addVideoMessage(sender, videoUrl) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        // 添加头像
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        const avatarImg = document.createElement('img');
        avatarImg.src = sender === 'user' ? this.avatars.user : this.avatars.ai[this.currentModel];
        avatarImg.alt = `${sender} avatar`;
        avatar.appendChild(avatarImg);
        messageDiv.appendChild(avatar);
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        
        const video = document.createElement('video');
        video.src = videoUrl;
        video.className = 'chat-video';
        video.controls = true;
        video.preload = 'metadata';  // 只加载视频元数据
        video.controlsList = 'nodownload';  // 禁止下载
        
        messageContent.appendChild(video);
        messageDiv.appendChild(messageContent);
        this.chatHistory.appendChild(messageDiv);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }

    // 修改系统消息方法，添加头像参数
    addSystemMessage(message, avatar = this.avatars.system) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', 'system-message');
        
        // 添加系统消息头
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'avatar';
        const avatarImg = document.createElement('img');
        avatarImg.src = avatar;
        avatarImg.alt = 'system avatar';
        avatarDiv.appendChild(avatarImg);
        messageDiv.appendChild(avatarDiv);
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.textContent = message;
        
        messageDiv.appendChild(messageContent);
        this.chatHistory.appendChild(messageDiv);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }

    // 添加测试方法
    async testAvatarUrls() {
        for (const [key, url] of Object.entries(this.avatars)) {
            try {
                const response = await fetch(url, { method: 'HEAD' });
                if (!response.ok) {
                    console.error(`${key} 头像URL不访问:`, url);
                }
            } catch (error) {
                console.error(`测试 ${key} 头像URL时出错:`, error);
            }
        }
    }

    // 添加输入框提示文本更新方法
    updateInputPlaceholder() {
        if (this.userInput) {
            if (this.currentModel === 'video') {
                this.userInput.placeholder = '请输入视频描述...';
                this.userInput.disabled = false;
            } else if (this.currentModel === 'flux' || this.currentModel === 'sd') {
                this.userInput.placeholder = '请输入图片描述...';
            } else {
                this.userInput.placeholder = '请输入您的问题...';
            }
        }
    }

    // 添加取消当前请求的方法
    cancelCurrentRequest() {
        if (this.abortController) {
            this.abortController.abort();
            this.abortController = null;
        }
        if (this.currentRequest) {
            this.currentRequest = null;
        }
    }

    // 修改 generateVideo 方法，支持图生视频
    async generateVideo(prompt) {
        try {
            this.sendBtn.classList.add('loading');
            
            // 构建请求体
            const requestBody = {
                model: this.videoConfig.model,
                prompt: prompt,
                size: '1024x1024',  // 默认尺寸
                fps: this.videoConfig.models[this.videoConfig.model].defaultFps,
                duration: 3,  // 默认时长
            };

            // 发送请求
            const submitResponse = await fetch(this.videoConfig.submitUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.videoConfig.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!submitResponse.ok) {
                throw new Error(`视频生成请求失败: ${await submitResponse.text()}`);
            }

            const responseData = await submitResponse.json();
            console.log('视频生成响应:', responseData);

            // 获取任务ID
            const taskId = responseData.id;
            if (!taskId) {
                throw new Error('未获取到任务ID');
            }

            // 轮询等待处理完成
            while (true) {
                // 查询任务状态
                const statusResponse = await fetch(`${this.videoConfig.statusUrl}/${taskId}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${this.videoConfig.apiKey}`
                    }
                });

                if (!statusResponse.ok) {
                    throw new Error(`获取任务状态失败: ${await statusResponse.text()}`);
                }

                const statusData = await statusResponse.json();
                console.log('任务状态:', statusData);

                switch (statusData.task_status) {
                    case 'PROCESSING':
                        // 继续等待并更新进度条
                        if (progressDiv) {
                            const progressFill = progressDiv.querySelector('.progress-fill');
                            const progressText = progressDiv.querySelector('.progress-text');
                            // 加快进度增长
                            const currentProgress = Math.min(85, parseFloat(progressText.textContent));
                            const newProgress = Math.min(85, currentProgress + Math.random() * 3);  // 从1.5增加到3
                            progressFill.style.width = `${newProgress}%`;
                            progressText.textContent = `${Math.round(newProgress)}%`;
                        }
                        // 减少等待时间
                        await new Promise(resolve => setTimeout(resolve, 1000));  // 从2000ms减少到1000ms
                        break;

                    case 'SUCCESS':
                        // 设置进度条为100%
                        if (progressDiv) {
                            const progressFill = progressDiv.querySelector('.progress-fill');
                            const progressText = progressDiv.querySelector('.progress-text');
                            progressFill.style.width = '100%';
                            progressText.textContent = '100%';
                            setTimeout(() => {
                                if (progressDiv && progressDiv.parentNode) {
                                    progressDiv.remove();
                                }
                            }, 500);
                        }

                        // 获取并显示视频
                        if (statusData.video_result && statusData.video_result.length > 0) {
                            const videoUrl = statusData.video_result[0].url;
                            if (videoUrl) {
                                this.addVideoMessage('ai', videoUrl);
                                return;  // 成功后退出整个函数
                            }
                        }
                        throw new Error('未找到视频结果');

                    case 'FAIL':
                        throw new Error(statusData.message || '视频生成失败');

                    default:
                        // 对于未知状态，继续等待而不是抛出错误
                        console.log(`未知状态: ${statusData.task_status}，继续等待...`);
                        await new Promise(resolve => setTimeout(resolve, 1000));  // 从2000ms减少到1000ms
                        break;
                }
            }

        } catch (error) {
            console.error('视频生成错误:', error);
            this.addSystemMessage(`视频生成失败: ${error.message}`);
        } finally {
            this.sendBtn.classList.remove('loading');
        }
    }

    // 添加一个支持 HTML 内容的消息添加方法
    addMessageToChat(role, content, isHTML = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}-message`;

        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        avatar.innerHTML = `<img src="${role === 'user' ? this.avatars.user : this.avatars.ai[this.currentModel]}" alt="${role} avatar">`;

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        
        if (isHTML) {
            messageContent.innerHTML = content;
        } else {
            messageContent.textContent = content;
        }

        if (role === 'user') {
            messageDiv.appendChild(messageContent);
            messageDiv.appendChild(avatar);
        } else {
            messageDiv.appendChild(avatar);
            messageDiv.appendChild(messageContent);
        }

        this.chatHistory.appendChild(messageDiv);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }

    // 添加一个通用的提示词优化方法
    async optimizePrompt(prompt, type = 'image') {
        console.group('提示词优化过程');
        console.log('原始提示词:', prompt);
        
        try {
            const systemPrompts = {
                image: "用户要使用图像生成模型，你需要扩写用户的输入提示词并用英语输出，你的输出应包含如下内容：镜头动态+光影描述+主体描述+主体运动+环境描述+主体细节描述+其他描述：情绪氛围/美学风格，同时写明不希望呈现的内容中，只输出英语提示词，不要有废话",
                video: "用户要使用视频生成模型，你需要扩写用户的输入提示词并用英语输出，你的输出应包含如下内容：镜头动态+光影描述+主体描述+主体运动+环境描述+主体细节描述+其他描述：情绪氛围/美学风格，只输出英语提示词，不要有废话，也不要有任何除了提示词之外的文字，只输出英语提示词 ",
                imageToImage: "用户要使用图生图模型，你需要扩写用户的输入提示词并用英语输出，你的输出应包含如下内容：镜头动态+光影描述+主体描述+主体运动+环境描述+主体细节描述+其他描述：情绪氛围/美学风格，同时写明不希望呈现的内容中，只输出英语提示词，不要有废话"
            };

            console.log('正在使用 Qwen 模型优化提示词...');
            const qwenResponse = await fetch(this.qwenConfig.baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.qwenConfig.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: 'Qwen/Qwen2.5-7B-Instruct',
                    messages: [
                        {
                            role: "system",
                            content: systemPrompts[type]
                        },
                        {
                            role: "user",
                            content: prompt
                        }
                    ]
                })
            });

            if (!qwenResponse.ok) {
                throw new Error('提示词优化请求失败');
            }

            const qwenData = await qwenResponse.json();
            const enhancedPrompt = qwenData.choices[0].message.content.trim();
            
            console.log('优化后的英文提示词:', enhancedPrompt);
            console.log('✅ 提示词优化成功');
            return enhancedPrompt;

        } catch (error) {
            console.error('❌ 提示词优化失败:', error);
            console.log('将使用原始提示词继续生成');
            return prompt;
        } finally {
            console.groupEnd();
        }
    }

    updateButtons() {
        // 移除现有的按钮
        const existingButtons = document.querySelectorAll('.img2img-btn, .video-upload-btn');
        existingButtons.forEach(btn => btn.remove());

        const inputArea = document.querySelector('.input-area');
        
        // 只保留视频模型的按钮处理
        if (this.currentModel === 'video') {
            // 视频模型相关代码保持不变
            const videoUploadBtn = document.createElement('button');
            videoUploadBtn.innerHTML = '<i class="fas fa-image"></i>';
            videoUploadBtn.className = 'video-upload-btn';
            videoUploadBtn.title = '上传图片生成视频';
            inputArea.insertBefore(videoUploadBtn, this.sendBtn);

            // ... 视频上传按钮的事件处理代码 ...
        }
    }

    // 处理方向变化
    handleOrientationChange() {
        const orientation = window.orientation;
        const rotateScreen = document.getElementById('rotateScreen') || this.createRotateScreen();
        
        if (orientation === 0 || orientation === 180) { // 竖屏
            rotateScreen.style.display = 'flex';
            document.querySelector('.app-container').style.display = 'none';
        } else { // 横屏
            rotateScreen.style.display = 'none';
            document.querySelector('.app-container').style.display = 'flex';
        }
    }

    // 创建旋转提示界面
    createRotateScreen() {
        const rotateScreen = document.createElement('div');
        rotateScreen.id = 'rotateScreen';
        rotateScreen.innerHTML = `
            <div class="rotate-content">
                <i class="fas fa-mobile-alt"></i>
                <p>请旋转设备至横屏使用</p>
            </div>
        `;
        document.body.appendChild(rotateScreen);
        return rotateScreen;
    }

    // 请求全屏
    requestFullscreen() {
        const elem = document.documentElement;
        if (elem.requestFullscreen) {
            elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) { // Safari
            elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) { // IE11
            elem.msRequestFullscreen();
        }
    }

    // 检测移动端并处理横屏
    handleMobileOrientation() {
        // 检测是否为移动设备
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile) {
            // 添加移动端样式类
            document.body.classList.add('mobile-device');
            
            // 强制横屏
            if (screen.orientation && screen.orientation.lock) {
                screen.orientation.lock('landscape')
                    .then(() => {
                        // 尝试全屏
                        this.requestFullscreen();
                    })
                    .catch(err => {
                        console.log('无法锁定屏幕方向:', err);
                        // 如果无法锁定方向，仍然尝试全屏
                        this.requestFullscreen();
                    });
            } else {
                // 如果不支持方向锁定，只尝试全屏
                this.requestFullscreen();
            }

            // 监听方向变化
            window.addEventListener('orientationchange', () => {
                this.handleOrientationChange();
            });

            // 初始检查方向
            this.handleOrientationChange();
        }
    }

    // 添加处理开屏页面的方法
    handleSplashScreen() {
        const splashScreen = document.querySelector('.splash-screen');
        const appContainer = document.querySelector('.app-container');
        
        if (splashScreen && appContainer) {
            // 1.5秒后开始淡出动画
            setTimeout(() => {
                splashScreen.style.opacity = '0';
                splashScreen.style.transition = 'opacity 0.5s ease';
                appContainer.style.opacity = '1';
                appContainer.style.transition = 'opacity 0.5s ease';
                
                // 动画结束后移除开屏页面
                setTimeout(() => {
                    splashScreen.remove();
                }, 500);
            }, 1500);
        }
    }

    async getDeepSeekResponse(message, systemPrompt) {
        try {
            this.sendBtn.classList.add('loading');
            const currentModel = this.deepseekConfig.models[this.deepseekConfig.model];

            // 根据不同模型使用不同的请求方式
            if (this.deepseekConfig.model === 'deepseek-v3') {
                // V3 模型的请求处理
                const response = await fetch(currentModel.apiUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ messages: [{ role: "user", content: message }] })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                const data = await response.json();
                if (data.code !== 200) {
                    throw new Error(data.msg || 'DeepSeek API 响应错误');
                }

                return this.handleDeepSeekResponse(data.message, message);
            } else {
                // R1-Distill 模型的请求处理
                let messages = [];
                if (this.conversationHistory.length > 0) {
                    messages = messages.concat(this.conversationHistory.slice(-10));
                }

                const userMessage = `让我们一步一步思考这个问题：\n${message}\n请给出详细的推理过程和最终结论。`;
                messages.push({
                    role: "user",
                    content: userMessage
                });

                const response = await fetch(currentModel.baseUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${currentModel.apiKey}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        model: this.deepseekConfig.model,
                        messages: messages,
                        temperature: 0.7,
                        max_tokens: currentModel.maxTokens,
                        stream: true
                    })
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }

                return this.handleDeepSeekStreamResponse(response, message);
            }
        } catch (error) {
            console.error('DeepSeek API调用错误:', error);
            this.addSystemMessage(`API调用失败: ${error.message}`);
            throw error;
        } finally {
            this.sendBtn.classList.remove('loading');
        }
    }

    // 添加文件转 base64 方法
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    }

    // 添加 Marco-o1 响应处理方法
    async getMarcoResponse(message, systemPrompt) {
        try {
            this.sendBtn.classList.add('loading');

            // 构建请求消息
            let messages = [];
            if (systemPrompt) {
                messages.push({
                    role: "system",
                    content: systemPrompt.content  // 修改这里，直接使用 content
                });
            }

            // 添加历史对话
            if (this.conversationHistory.length > 0) {
                messages = messages.concat(this.conversationHistory.slice(-10));
            }

            // 添加当前消息
            messages.push({
                role: "user",
                content: message
            });

            // 构建请求体
            const requestBody = {
                model: this.marcoConfig.model,
                messages: messages,
                temperature: 0.7,
                max_tokens: 2000,
                // 添加必要的参数
                stream: false,
                top_p: 0.95,
                frequency_penalty: 0,
                presence_penalty: 0
            };

            console.log('Marco-o1 Request:', {
                url: this.marcoConfig.baseUrl,
                headers: {
                    'Authorization': `Bearer ${this.marcoConfig.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: requestBody
            });

            // 发送请求
            const response = await fetch(this.marcoConfig.baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.marcoConfig.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Marco-o1 API Error:', errorData);
                throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            console.log('Marco-o1 Response:', data);
            
            let aiResponse = data.choices[0].message.content;

            // 解析思考链和输出结果
            let thoughtContent = '';
            let outputContent = '';

            // 提取<Thought>标签内容
            const thoughtMatch = aiResponse.match(/<Thought>(.*?)<\/Thought>/s);
            if (thoughtMatch) {
                thoughtContent = thoughtMatch[1].trim();
            }

            // 提取<Output>标签内容
            const outputMatch = aiResponse.match(/<Output>(.*?)<\/Output>/s);
            if (outputMatch) {
                outputContent = outputMatch[1].trim();
            }

            // 构建格式化的响应
            let formattedResponse = '';
            if (thoughtContent) {
                // 处理思考过程中的代码块
                thoughtContent = this.formatCodeBlocks(thoughtContent);
                formattedResponse += `<div class="thought-chain">
                    <div class="thought-header">💭 思考过程</div>
                    ${thoughtContent}
                </div>\n\n`;
            }
            if (outputContent) {
                // 处理输出结果中的代码块
                outputContent = this.formatCodeBlocks(outputContent);
                formattedResponse += `<div class="output-result">
                    <div class="output-header">🤖 输出结果</div>
                    ${outputContent}
                </div>`;
            }
            if (!formattedResponse) {
                formattedResponse = aiResponse; // 如果没有标签，使用原始响应
            }

            // 创建消息元素
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', 'ai-message');
            
            // 添加头像
            const avatar = document.createElement('div');
            avatar.className = 'avatar';
            const avatarImg = document.createElement('img');
            avatarImg.src = this.avatars.ai[this.currentModel];
            avatarImg.alt = 'AI avatar';
            avatar.appendChild(avatarImg);
            messageDiv.appendChild(avatar);

            // 添加消息内容
            const messageContent = document.createElement('div');
            messageContent.classList.add('message-content');
            messageContent.innerHTML = '<div class="loading">正在思考...</div>';
            messageDiv.appendChild(messageContent);
            this.chatHistory.appendChild(messageDiv);

            // 修改 marked 配置以支持语言标识
            const renderer = new marked.Renderer();
            renderer.code = (code, language) => {
                const validLanguage = hljs.getLanguage(language) ? language : '';
                const highlighted = validLanguage ? 
                    hljs.highlight(code, { language: validLanguage }).value : 
                    hljs.highlightAuto(code).value;
                
                return `<pre><code class="hljs language-${validLanguage}">${highlighted}</code></pre>`;
            };

            // 使用配置的 renderer
            const htmlContent = marked.parse(formattedResponse, { renderer });
            messageContent.innerHTML = htmlContent;

            // 渲染数学公式
            renderMathInElement(messageContent, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\[', right: '\\]', display: true},
                    {left: '\\(', right: '\\)', display: false}
                ],
                throwOnError: false
            });

            // 高亮代码块
            messageContent.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });

            // 滚动到底部
            this.chatHistory.scrollTop = this.chatHistory.scrollHeight;

            // 保存对话历史
            this.conversationHistory.push({
                role: "user",
                content: message
            });

            this.conversationHistory.push({
                role: "assistant",
                content: aiResponse
            });

            return aiResponse;

        } catch (error) {
            console.error('Marco-o1 API调用错误:', error);
            this.addSystemMessage(`API调用失败: ${error.message}`);
            throw error;
        } finally {
            this.sendBtn.classList.remove('loading');
        }
    }

    // 添加 Yi 响应处理方法
    async getYiResponse(message, systemPrompt) {
        try {
            this.sendBtn.classList.add('loading');

            // 构建请求消息
            let messages = [];
            if (systemPrompt) {
                messages.push({
                    role: "system",
                    content: systemPrompt.content
                });
            }

            // 添加历史对话
            if (this.conversationHistory.length > 0) {
                messages = messages.concat(this.conversationHistory.slice(-10));
            }

            // 添加当前消息
            messages.push({
                role: "user",
                content: message
            });

            // 构建请求体
            const requestBody = {
                model: this.yiConfig.model,
                messages: messages,
                temperature: 0.7,
                max_tokens: 2000,
                stream: false,
                top_p: 0.95,
                frequency_penalty: 0,
                presence_penalty: 0
            };

            // 发送请求
            const response = await fetch(this.yiConfig.baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.yiConfig.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Yi API Error:', errorData);
                throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
            }

            const data = await response.json();
            let aiResponse = data.choices[0].message.content;

            // 创建消息元素
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', 'ai-message');
            
            // 添加头像
            const avatar = document.createElement('div');
            avatar.className = 'avatar';
            const avatarImg = document.createElement('img');
            avatarImg.src = this.avatars.ai[this.currentModel];
            avatarImg.alt = 'AI avatar';
            avatar.appendChild(avatarImg);
            messageDiv.appendChild(avatar);

            // 添加消息内容
            const messageContent = document.createElement('div');
            messageContent.classList.add('message-content');
            messageContent.innerHTML = '<div class="loading">正在思考...</div>';
            messageDiv.appendChild(messageContent);
            this.chatHistory.appendChild(messageDiv);

            // 修改 marked 配置以支持语言标识
            const renderer = new marked.Renderer();
            renderer.code = (code, language) => {
                const validLanguage = hljs.getLanguage(language) ? language : '';
                const highlighted = validLanguage ? 
                    hljs.highlight(code, { language: validLanguage }).value : 
                    hljs.highlightAuto(code).value;
                
                return `<pre><code class="hljs language-${validLanguage}">${highlighted}</code></pre>`;
            };

            // 使用配置的 renderer 渲染回复内容
            const htmlContent = marked.parse(aiResponse, { renderer });
            messageContent.innerHTML = htmlContent;

            // 渲染数学公式
            renderMathInElement(messageContent, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\[', right: '\\]', display: true},
                    {left: '\\(', right: '\\)', display: false}
                ],
                throwOnError: false
            });

            // 高亮代码块
            messageContent.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });

            // 滚动到底部
            this.chatHistory.scrollTop = this.chatHistory.scrollHeight;

            // 保存对话历史
            this.conversationHistory.push({
                role: "user",
                content: message
            });

            this.conversationHistory.push({
                role: "assistant",
                content: aiResponse
            });

            return aiResponse;

        } catch (error) {
            console.error('Yi API调用错误:', error);
            this.addSystemMessage(`API调用失败: ${error.message}`);
            throw error;
        } finally {
            this.sendBtn.classList.remove('loading');
        }
    }

    // 在 AIChatApp 类中添加通用的代码块处理方法
    formatCodeBlocks(content) {
        // 处理代码块，支持显式语言标记
        return content.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
            // 如果没有指定语言，尝试自动检测
            if (!lang) {
                // 检测 Python 代码特征
                if (code.includes('def ') || code.includes('import ') || 
                    code.includes('print(') || code.includes('return ') ||
                    /^\s*#.*/.test(code)) {
                    lang = 'python';
                }
                // 检测 JavaScript 代码特征
                else if (code.includes('function ') || code.includes('const ') || 
                        code.includes('let ') || code.includes('var ') ||
                        code.includes('=>') || /^\s*\/\/.*/.test(code)) {
                    lang = 'javascript';
                }
                // 检测 JSON 特征
                else if (/^\s*[{\[]/.test(code) && /[}\]]\s*$/.test(code)) {
                    lang = 'json';
                }
                // 检测 HTML 特征
                else if (code.includes('<') && code.includes('>') && 
                        (code.includes('</') || code.includes('/>'))) {
                    lang = 'html';
                }
                // 检测 CSS 特征
                else if (code.includes('{') && code.includes('}') && 
                        code.includes(':') && /[\.\#][a-zA-Z]/.test(code)) {
                    lang = 'css';
                }
                // 如果无法检测，使用 plaintext
                else {
                    lang = 'plaintext';
                }
            }
            return `\`\`\`${lang}\n${code.trim()}\`\`\``;
        });
    }

    // 添加 InternLM 响应处理方法
    async getInternlmResponse(message, systemPrompt) {
        try {
            this.sendBtn.classList.add('loading');

            // 构建请求消息
            let messages = [systemPrompt];

            // 添加历史对话
            if (this.conversationHistory.length > 0) {
                messages = messages.concat(this.conversationHistory.slice(-10));
            }

            // 添加当前消息
            messages.push({
                role: "user",
                content: message
            });

            // 发送请求
            const response = await fetch(this.internlmConfig.baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${this.internlmConfig.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: this.internlmConfig.model,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 2000,
                    stream: false,
                    top_p: 0.95,
                    frequency_penalty: 0,
                    presence_penalty: 0
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            let aiResponse = data.choices[0].message.content;

            // 创建消息元素
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', 'ai-message');
            
            // 添加头像
            const avatar = document.createElement('div');
            avatar.className = 'avatar';
            const avatarImg = document.createElement('img');
            avatarImg.src = this.avatars.ai[this.currentModel];
            avatarImg.alt = 'AI avatar';
            avatar.appendChild(avatarImg);
            messageDiv.appendChild(avatar);

            // 添加消息内容
            const messageContent = document.createElement('div');
            messageContent.classList.add('message-content');
            messageContent.innerHTML = '<div class="loading">正在思考...</div>';
            messageDiv.appendChild(messageContent);
            this.chatHistory.appendChild(messageDiv);

            // 修改 marked 配置以支持语言标识
            const renderer = new marked.Renderer();
            renderer.code = (code, language) => {
                const validLanguage = hljs.getLanguage(language) ? language : '';
                const highlighted = validLanguage ? 
                    hljs.highlight(code, { language: validLanguage }).value : 
                    hljs.highlightAuto(code).value;
                
                return `<pre><code class="hljs language-${validLanguage}">${highlighted}</code></pre>`;
            };

            // 使用配置的 renderer 渲染回复内容
            const htmlContent = marked.parse(aiResponse, { renderer });
            messageContent.innerHTML = htmlContent;

            // 渲染数学公式
            renderMathInElement(messageContent, {
                delimiters: [
                    {left: '$$', right: '$$', display: true},
                    {left: '$', right: '$', display: false},
                    {left: '\\[', right: '\\]', display: true},
                    {left: '\\(', right: '\\)', display: false}
                ],
                throwOnError: false
            });

            // 高亮代码块
            messageContent.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightElement(block);
            });

            // 滚动到底部
            this.chatHistory.scrollTop = this.chatHistory.scrollHeight;

            // 保存对话历史
            this.conversationHistory.push({
                role: "user",
                content: message
            });

            this.conversationHistory.push({
                role: "assistant",
                content: aiResponse
            });

            return aiResponse;

        } catch (error) {
            console.error('InternLM API调用错误:', error);
            this.addSystemMessage(`API调用失败: ${error.message}`);
            throw error;
        } finally {
            this.sendBtn.classList.remove('loading');
        }
    }

    // 添加 bindSuggestionButtons 方法
    bindSuggestionButtons() {
        // 获取所有建议按钮
        const suggestionBtns = document.querySelectorAll('.suggestion-btn');
        
        // 为每个按钮添加点击事件
        suggestionBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 将按钮文本设置到输入框
                if (this.userInput) {
                    this.userInput.value = e.target.textContent;
                    // 触发发送消息
                    this.sendMessage();
                }
            });
        });
    }

    // 添加 initializeGPTModelSelector 方法
    initializeGPTModelSelector() {
        const gptModelSelect = document.getElementById('gptModelSelect');
        if (gptModelSelect) {
            // 添加模型选择器的变化事件监听
            gptModelSelect.addEventListener('change', (e) => {
                // 更新当前 GPT 模型
                this.gptConfig.model = e.target.value;
                
                // 更新文件上传按钮状态
                this.updateFileUploadButton();
                
                // 创建新对话
                this.createNewChat(true);
            });

            // 设置默认选中的模型
            gptModelSelect.value = this.gptConfig.model;
        }
    }

    // 添加 updateFileUploadButton 方法
    updateFileUploadButton() {
        const uploadBtn = document.querySelector('.upload-btn');
        if (!uploadBtn) return;

        // 获取当前选择的模型
        const selectedModel = document.getElementById('zhipuModelSelect')?.value;

        // 只在智谱AI的 glm-4v-flash 模型下显示上传按钮
        if (this.currentModel === 'zhipu') {
            uploadBtn.style.display = selectedModel === 'glm-4v-flash' ? 'flex' : 'none';
        } else {
            uploadBtn.style.display = 'none';
        }

        // 更新按钮的提示文本
        if (uploadBtn.style.display === 'flex') {
            uploadBtn.title = '上传图片';
            uploadBtn.innerHTML = '<i class="fas fa-image"></i>';
        }
    }

    // 修改图像生成方法
    async generateImage(prompt) {
        try {
            this.sendBtn.classList.add('loading');
            
            // 添加用户提示消息
            this.addMessageToChat('user', prompt);
            
            // 添加等待提示
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('message', 'ai-message');
            
            // 添加头像
            const avatar = document.createElement('div');
            avatar.className = 'avatar';
            const avatarImg = document.createElement('img');
            avatarImg.src = this.avatars.ai[this.currentModel];
            avatarImg.alt = 'AI avatar';
            avatar.appendChild(avatarImg);
            messageDiv.appendChild(avatar);
            
            // 添加加载提示
            const messageContent = document.createElement('div');
            messageContent.classList.add('message-content');
            messageContent.innerHTML = '<div class="loading">正在生成图片...</div>';
            messageDiv.appendChild(messageContent);
            this.chatHistory.appendChild(messageDiv);
            
            // 滚动到底部
            this.chatHistory.scrollTop = this.chatHistory.scrollHeight;

            // 创建 AbortController
            this.abortController = new AbortController();
            const timeoutId = setTimeout(() => this.abortController.abort(), 30000); // 30秒超时

            // 根据当前模型选择对应的配置
            const config = this.currentModel === 'flux' ? this.fluxConfig : this.sdConfig;
            
            // 构建请求体
            const requestBody = {
                model: config.model,
                prompt: prompt,
                n: 1,
                size: "1024x1024",
                response_format: "url"
            };

            // 发送请求
            const response = await fetch(config.baseUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(requestBody),
                signal: this.abortController.signal
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`图像生成失败 (${response.status}): ${response.statusText}`);
            }

            const data = await response.json();
            
            if (!data.data || !data.data[0] || !data.data[0].url) {
                throw new Error('服务器返回的数据格式无效');
            }

            // 更新消息内容为生成的图片
            messageContent.innerHTML = '';
            const img = document.createElement('img');
            img.src = data.data[0].url;
            img.className = 'chat-image';
            img.title = '双击查看大图';
            
            // 添加图片加载错误处理
            img.onerror = () => {
                messageContent.innerHTML = '<div class="error-message">图片加载失败</div>';
            };
            
            // 添加图片点击事件
            img.addEventListener('dblclick', () => {
                this.showImageViewer(data.data[0].url);
            });
            
            messageContent.appendChild(img);

            // 保存对话历史
            this.conversationHistory.push({
                role: "user",
                content: prompt
            });

            this.conversationHistory.push({
                role: "assistant",
                content: `![Generated Image](${data.data[0].url})`
            });

        } catch (error) {
            console.error('图像生成错误:', error);
            
            // 显示友好的错误消息
            let errorMessage = '图像生成失败';
            if (error.name === 'AbortError') {
                errorMessage = '请求超时，请稍后重试';
            } else if (error.message.includes('504')) {
                errorMessage = '服务器响应超时，请稍后重试';
            } else if (error.message.includes('429')) {
                errorMessage = '请求过于频繁，请稍后重试';
            }
            
            this.addSystemMessage(errorMessage);
            throw error;
        } finally {
            this.sendBtn.classList.remove('loading');
            this.abortController = null;
        }
    }

    // 添加图片消息方法
    addImageMessage(sender, imageUrl) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('message', `${sender}-message`);
        
        // 添加头像
        const avatar = document.createElement('div');
        avatar.className = 'avatar';
        const avatarImg = document.createElement('img');
        avatarImg.src = sender === 'user' ? this.avatars.user : this.avatars.ai[this.currentModel];
        avatarImg.alt = `${sender} avatar`;
        avatar.appendChild(avatarImg);
        messageDiv.appendChild(avatar);
        
        // 添加图片内容
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.className = 'chat-image';
        img.title = '双击查看大图';
        
        // 添加图片点击事件
        img.addEventListener('dblclick', () => {
            this.showImageViewer(imageUrl);
        });
        
        messageContent.appendChild(img);
        messageDiv.appendChild(messageContent);
        this.chatHistory.appendChild(messageDiv);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }

    // 添加图片查看器方法
    showImageViewer(imageUrl) {
        const viewer = document.querySelector('.image-viewer');
        const viewerImg = viewer.querySelector('img');
        
        viewerImg.src = imageUrl;
        viewer.style.display = 'flex';
        
        // 添加关闭事件
        viewer.addEventListener('click', (e) => {
            if (e.target === viewer) {
                viewer.style.display = 'none';
            }
        });
        
        // ESC键关闭
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                viewer.style.display = 'none';
            }
        });
    }

    // 获取 GPT 模型选项
    getGPTModelOptions() {
        return `
            <optgroup label="GPT-4">
                <option value="gpt-4">GPT-4</option>
                <option value="gpt-4o">GPT-4 Turbo</option>
            </optgroup>
            <optgroup label="GPT-3.5">
                <option value="gpt-3.5-turbo-1106">GPT-3.5 Turbo (最新)</option>
                <option value="gpt-3.5">GPT-3.5</option>
            </optgroup>
        `;
    }

    // 获取智谱模型选项
    getZhipuModelOptions() {
        return `
            <option value="glm-4v-flash">glm-4v-flash</option>
            <option value="THUDM/glm-4-9b-chat">GLM-4-9B-Chat</option>
        `;
    }

    // 获取当前模型值
    getCurrentModelValue() {
        switch(this.currentModel) {
            case 'gpt':
                return this.gptConfig.model;
            case 'zhipu':
                return this.zhipuConfig.model;
            // ... 其他模型
            default:
                return '';
        }
    }
}

// 初始应用
document.addEventListener('DOMContentLoaded', () => {
    const app = new AIChatApp();
});