module.exports = {

"[project]/.next-internal/server/app/api/chat/route/actions.js [app-rsc] (server actions loader, ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
}}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/@opentelemetry/api [external] (@opentelemetry/api, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("@opentelemetry/api", () => require("@opentelemetry/api"));

module.exports = mod;
}}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[project]/app/utils/jsonParser.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// 定义操作类型
__turbopack_context__.s({
    "hasActionInMessage": (()=>hasActionInMessage),
    "safeParseJSON": (()=>safeParseJSON)
});
function safeParseJSON(text) {
    try {
        // 使用正则表达式提取JSON部分
        const jsonMatch = text.match(/\{[^}]*\}/);
        if (!jsonMatch) {
            return null;
        }
        const jsonString = jsonMatch[0];
        const parsed = JSON.parse(jsonString);
        // 验证解析结果的结构
        if (typeof parsed === 'object' && parsed !== null && 'action' in parsed && [
            'add',
            'complete',
            'delete',
            'list'
        ].includes(parsed.action)) {
            // 对于需要task的操作，验证task字段
            if ((parsed.action === 'add' || parsed.action === 'complete' || parsed.action === 'delete') && (!parsed.task || typeof parsed.task !== 'string' || parsed.task.trim() === '')) {
                return null;
            }
            return {
                action: parsed.action,
                task: parsed.task?.trim()
            };
        }
        return null;
    } catch (error) {
        console.warn('JSON解析失败:', error);
        return null;
    }
}
function hasActionInMessage(message) {
    return /\{[^}]*"action"[^}]*\}/.test(message);
}
}}),
"[project]/app/api/chat/route.ts [app-route] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "POST": (()=>POST),
    "maxDuration": (()=>maxDuration)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/ai/dist/index.mjs [app-route] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ai$2d$sdk$2f$deepseek$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@ai-sdk/deepseek/dist/index.mjs [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$jsonParser$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/jsonParser.ts [app-route] (ecmascript)");
;
;
;
const maxDuration = 30;
async function POST(req) {
    const { messages } = await req.json();
    // 检查 DeepSeek API key
    if (!process.env.DEEPSEEK_API_KEY) {
        return new Response(JSON.stringify({
            error: 'DeepSeek API key 未配置。请在 .env.local 文件中设置 DEEPSEEK_API_KEY'
        }), {
            status: 500
        });
    }
    // 创建 DeepSeek provider 实例
    const deepseek = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ai$2d$sdk$2f$deepseek$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__["createDeepSeek"])({
        apiKey: process.env.DEEPSEEK_API_KEY
    });
    // 系统提示，引导模型输出结构化 JSON
    const systemPrompt = `你是一个待办事项助手。请根据用户的输入，输出结构化的 JSON 响应。

支持的操作类型：
- "add": 添加新的待办事项
- "complete": 完成待办事项
- "delete": 删除待办事项  
- "list": 列出所有待办事项
- "chat": 普通对话

输出格式：
{ "action": "操作类型", "task": "任务内容", "response": "回复内容" }


如果是普通对话，使用 action: "chat"，task 可以为空。

请确保输出的是有效的 JSON 格式。`;
    // 使用 DeepSeek API
    const result = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ai$2f$dist$2f$index$2e$mjs__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$locals$3e$__["streamText"])({
        model: deepseek('deepseek-chat'),
        system: systemPrompt,
        messages,
        onFinish: async (completion)=>{
            // 当流式响应完成后，解析 AI 返回的内容
            const aiResponse = completion.text;
            // 检查是否包含操作指令
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$jsonParser$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["hasActionInMessage"])(aiResponse)) {
                const parsedAction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$jsonParser$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["safeParseJSON"])(aiResponse);
                if (parsedAction) {
                    console.log('解析到的操作:', parsedAction);
                    // 根据操作类型执行相应的逻辑
                    switch(parsedAction.action){
                        case 'add':
                            console.log(`添加任务: ${parsedAction.task}`);
                            break;
                        case 'complete':
                            console.log(`完成任务: ${parsedAction.task}`);
                            break;
                        case 'delete':
                            console.log(`删除任务: ${parsedAction.task}`);
                            break;
                        case 'list':
                            console.log('列出所有任务');
                            break;
                        default:
                            console.log('普通对话');
                    }
                }
            }
        }
    });
    return result.toDataStreamResponse();
}
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__f6cb2b70._.js.map