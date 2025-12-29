/**
 * OpenAI API 服务
 * 用于简历生成和优化
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

if (!OPENAI_API_KEY) {
  console.warn("警告: VITE_OPENAI_API_KEY 未配置，AI简历优化功能将无法使用");
}

export interface ResumeData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  education: Array<{
    school: string;
    degree: string;
    major: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  workExperience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    description: string;
    achievements: string[];
  }>;
  skills: string[];
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
  }>;
  summary: string;
}

/**
 * 使用AI优化简历内容
 */
export async function optimizeResumeWithAI(resumeData: ResumeData): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API Key 未配置，请在环境变量中设置 VITE_OPENAI_API_KEY");
  }

  try {
    // 构建简历原始文本
    const rawResume = buildRawResume(resumeData);

    // 构建AI提示词
    const prompt = buildOptimizationPrompt(resumeData, rawResume);

    // 调用OpenAI API
    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "你是一位专业的简历优化专家，擅长将求职者的简历内容优化得更加专业、简洁、有吸引力。请保持信息的真实性，只优化表达方式，不要添加虚假信息。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API请求失败: ${response.status}`);
    }

    const data = await response.json();
    const optimizedResume = data.choices[0]?.message?.content;

    if (!optimizedResume) {
      throw new Error("AI返回内容为空");
    }

    return optimizedResume;
  } catch (error: any) {
    console.error("AI优化简历失败:", error);
    throw new Error(`AI优化失败: ${error.message}`);
  }
}

/**
 * 构建原始简历文本
 */
function buildRawResume(resumeData: ResumeData): string {
  let text = `简历\n\n`;
  text += `个人信息\n`;
  text += `姓名：${resumeData.fullName}\n`;
  text += `邮箱：${resumeData.email}\n`;
  text += `电话：${resumeData.phone}\n`;
  text += `地址：${resumeData.location}\n\n`;

  if (resumeData.summary) {
    text += `自我评价\n${resumeData.summary}\n\n`;
  }

  if (resumeData.education.length > 0 && resumeData.education[0].school) {
    text += `教育背景\n`;
    resumeData.education.forEach(edu => {
      if (edu.school) {
        text += `${edu.school} - ${edu.degree} - ${edu.major}\n`;
        if (edu.startDate && edu.endDate) {
          text += `${edu.startDate} 至 ${edu.endDate}\n`;
        }
        if (edu.description) {
          text += `${edu.description}\n`;
        }
        text += `\n`;
      }
    });
  }

  if (resumeData.workExperience.length > 0 && resumeData.workExperience[0].company) {
    text += `工作经历\n`;
    resumeData.workExperience.forEach(work => {
      if (work.company) {
        text += `${work.position} - ${work.company}\n`;
        if (work.startDate && work.endDate) {
          text += `${work.startDate} 至 ${work.endDate}\n`;
        }
        if (work.description) {
          text += `${work.description}\n`;
        }
        if (work.achievements.length > 0) {
          text += `主要成就：\n`;
          work.achievements.forEach(ach => {
            if (ach) text += `• ${ach}\n`;
          });
        }
        text += `\n`;
      }
    });
  }

  if (resumeData.skills.length > 0) {
    text += `技能\n${resumeData.skills.join("、")}\n\n`;
  }

  if (resumeData.projects.length > 0 && resumeData.projects[0].name) {
    text += `项目经历\n`;
    resumeData.projects.forEach(project => {
      if (project.name) {
        text += `${project.name}\n`;
        if (project.description) {
          text += `${project.description}\n`;
        }
        if (project.technologies.length > 0) {
          text += `技术栈：${project.technologies.join("、")}\n`;
        }
        if (project.link) {
          text += `项目链接：${project.link}\n`;
        }
        text += `\n`;
      }
    });
  }

  return text;
}

/**
 * 构建AI优化提示词
 */
function buildOptimizationPrompt(resumeData: ResumeData, rawResume: string): string {
  return `请帮我优化以下简历内容，使其更加专业、简洁、有吸引力。要求：

1. **保持真实性**：不要添加任何虚假信息，只优化表达方式
2. **专业表达**：使用行业标准术语，突出关键成就和技能
3. **结构清晰**：保持简历的标准格式，包括个人信息、教育背景、工作经历、技能、项目经历等部分
4. **突出重点**：对于工作经历和项目经历，使用量化数据（如数字、百分比）来展示成果
5. **简洁有力**：删除冗余信息，使每句话都有价值
6. **格式规范**：使用清晰的标题和分段，便于阅读

原始简历内容：

${rawResume}

请输出优化后的完整简历内容，保持中文格式。`;
}

/**
 * 使用AI优化特定部分（如工作描述、自我评价等）
 */
export async function optimizeResumeSection(
  sectionType: "summary" | "work" | "education" | "project",
  content: string,
  context?: string
): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error("OpenAI API Key 未配置，请在环境变量中设置 VITE_OPENAI_API_KEY");
  }

  try {
    const sectionPrompts: Record<string, string> = {
      summary: "请优化以下自我评价，使其更加专业、有吸引力，突出核心优势和职业目标：",
      work: "请优化以下工作经历描述，使用更专业的表达，突出成就和贡献：",
      education: "请优化以下教育背景描述，使其更加专业：",
      project: "请优化以下项目描述，突出技术难点和项目价值：",
    };

    const prompt = `${sectionPrompts[sectionType]}\n\n${content}${context ? `\n\n上下文信息：${context}` : ""}`;

    const response = await fetch(OPENAI_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "你是一位专业的简历优化专家，擅长优化简历各个部分的表达方式。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API请求失败: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || content;
  } catch (error: any) {
    console.error(`AI优化${sectionType}失败:`, error);
    // 如果AI优化失败，返回原始内容
    return content;
  }
}

