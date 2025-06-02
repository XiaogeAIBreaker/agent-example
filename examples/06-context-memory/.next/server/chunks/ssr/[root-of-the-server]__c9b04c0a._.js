module.exports = {

"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}}),
"[project]/app/utils/jsonParser.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
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
        // 首先尝试提取markdown代码块中的JSON
        const codeBlockMatch = text.match(/```json\s*\n([\s\S]*?)\n```/);
        let jsonString = '';
        if (codeBlockMatch) {
            jsonString = codeBlockMatch[1].trim();
        } else {
            // 如果没有代码块，尝试直接提取JSON
            const jsonMatch = text.match(/\{[\s\S]*?\}/);
            if (!jsonMatch) {
                return null;
            }
            jsonString = jsonMatch[0];
        }
        console.log('提取的JSON字符串:', jsonString);
        const parsed = JSON.parse(jsonString);
        // 验证解析结果的结构
        if (typeof parsed === 'object' && parsed !== null && 'action' in parsed && [
            'add',
            'complete',
            'delete',
            'list',
            'clear_completed',
            'clear_all'
        ].includes(parsed.action)) {
            // 对于需要task的操作，验证task字段
            if ((parsed.action === 'add' || parsed.action === 'complete' || parsed.action === 'delete') && (!parsed.task || typeof parsed.task !== 'string' || parsed.task.trim() === '')) {
                console.warn('操作需要task字段但未提供或为空');
                return null;
            }
            return {
                action: parsed.action,
                task: parsed.task?.trim(),
                response: parsed.response
            };
        }
        console.warn('JSON结构验证失败:', parsed);
        return null;
    } catch (error) {
        console.warn('JSON解析失败:', error);
        return null;
    }
}
function hasActionInMessage(message) {
    // 检查是否包含markdown代码块或直接的JSON
    return /```json[\s\S]*?```/.test(message) || /\{[\s\S]*?"action"[\s\S]*?\}/.test(message);
}
}}),
"[project]/app/hooks/useInstructionExecutor.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "useInstructionExecutor": (()=>useInstructionExecutor)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$jsonParser$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/jsonParser.ts [app-ssr] (ecmascript)");
;
;
function useInstructionExecutor({ executeInstruction }) {
    // 解析AI响应并执行指令
    const parseAndExecuteMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((aiMessage)=>{
        // 检查消息是否包含指令
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$jsonParser$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["hasActionInMessage"])(aiMessage)) {
            return null;
        }
        // 解析JSON指令
        const parsedAction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$jsonParser$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["safeParseJSON"])(aiMessage);
        if (!parsedAction) {
            console.warn('无法解析AI返回的指令');
            return {
                success: false,
                message: '指令格式错误，无法解析'
            };
        }
        // 将TodoAction转换为Instruction格式
        const instruction = {
            action: parsedAction.action,
            task: parsedAction.task
        };
        // 执行指令
        console.log('执行AI指令:', instruction);
        const result = executeInstruction(instruction);
        return result;
    }, [
        executeInstruction
    ]);
    // 批量处理AI消息中的指令
    const processAIResponse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((aiMessage)=>{
        const results = [];
        // 查找所有JSON指令
        const jsonMatches = aiMessage.match(/\{[^}]*"action"[^}]*\}/g);
        if (jsonMatches) {
            jsonMatches.forEach((jsonStr, index)=>{
                try {
                    const parsed = JSON.parse(jsonStr);
                    if (parsed.action && [
                        'add',
                        'complete',
                        'delete',
                        'list',
                        'clear_completed',
                        'clear_all'
                    ].includes(parsed.action)) {
                        const instruction = {
                            action: parsed.action,
                            task: parsed.task
                        };
                        const result = executeInstruction(instruction);
                        results.push(result);
                        console.log(`执行第${index + 1}个指令:`, instruction, '结果:', result);
                    }
                } catch (error) {
                    console.warn('解析指令失败:', jsonStr, error);
                    results.push({
                        success: false,
                        message: `指令${index + 1}解析失败`
                    });
                }
            });
        }
        return results;
    }, [
        executeInstruction
    ]);
    return {
        parseAndExecuteMessage,
        processAIResponse
    };
}
}}),
"[project]/app/hooks/useMemory.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "useMemory": (()=>useMemory)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
;
function useMemory() {
    const [memory, setMemory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [context, setContext] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])({
        recentActions: [],
        recentMessages: []
    });
    // 添加记忆条目
    const addMemoryEntry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((entry)=>{
        const newEntry = {
            ...entry,
            id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now()
        };
        setMemory((prev)=>[
                ...prev.slice(-49),
                newEntry
            ]); // 保持最近50条记录
        return newEntry;
    }, []);
    // 记录用户消息
    const recordUserMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((message)=>{
        addMemoryEntry({
            type: 'user_message',
            content: message
        });
        // 更新上下文中的最近消息
        setContext((prev)=>({
                ...prev,
                recentMessages: [
                    ...prev.recentMessages.slice(-9),
                    {
                        content: message,
                        timestamp: Date.now(),
                        type: 'user'
                    }
                ]
            }));
    }, [
        addMemoryEntry
    ]);
    // 记录AI回复
    const recordAIResponse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((response)=>{
        addMemoryEntry({
            type: 'ai_response',
            content: response
        });
        // 更新上下文中的最近消息
        setContext((prev)=>({
                ...prev,
                recentMessages: [
                    ...prev.recentMessages.slice(-9),
                    {
                        content: response,
                        timestamp: Date.now(),
                        type: 'ai'
                    }
                ]
            }));
    }, [
        addMemoryEntry
    ]);
    // 记录执行的动作
    const recordAction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((action, taskId, taskText)=>{
        addMemoryEntry({
            type: 'action_executed',
            content: `执行动作: ${action}${taskText ? ` - ${taskText}` : ''}`,
            metadata: {
                action,
                taskId,
                taskText
            }
        });
        // 更新上下文中的最近动作
        setContext((prev)=>({
                ...prev,
                recentActions: [
                    ...prev.recentActions.slice(-9),
                    {
                        action,
                        taskId,
                        taskText,
                        timestamp: Date.now()
                    }
                ],
                // 如果是添加任务，更新最后添加的任务
                ...action === 'add' && taskId && taskText ? {
                    lastAddedTask: {
                        id: taskId,
                        text: taskText,
                        timestamp: Date.now()
                    }
                } : {}
            }));
    }, [
        addMemoryEntry
    ]);
    // 记录上下文引用
    const recordContextReference = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((reference, content)=>{
        addMemoryEntry({
            type: 'context_reference',
            content,
            metadata: {
                reference
            }
        });
    }, [
        addMemoryEntry
    ]);
    // 解析上下文引用（如"刚才那个"、"最后一个"等）
    const resolveContextReference = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((userInput)=>{
        const input = userInput.toLowerCase();
        let resolvedContext = '';
        // 检查是否引用了"刚才"、"最后"、"上一个"等
        if (input.includes('刚才') || input.includes('最后') || input.includes('上一个') || input.includes('上个')) {
            if (input.includes('添加') || input.includes('任务')) {
                // 引用最后添加的任务
                if (context.lastAddedTask) {
                    resolvedContext = `引用最后添加的任务: "${context.lastAddedTask.text}" (ID: ${context.lastAddedTask.id})`;
                    recordContextReference('last_added_task', resolvedContext);
                    return {
                        type: 'task_reference',
                        taskId: context.lastAddedTask.id,
                        taskText: context.lastAddedTask.text,
                        resolvedText: resolvedContext
                    };
                }
            } else {
                // 引用最后的动作
                const lastAction = context.recentActions[context.recentActions.length - 1];
                if (lastAction) {
                    resolvedContext = `引用最后的动作: ${lastAction.action}${lastAction.taskText ? ` - ${lastAction.taskText}` : ''}`;
                    recordContextReference('last_action', resolvedContext);
                    return {
                        type: 'action_reference',
                        action: lastAction.action,
                        taskId: lastAction.taskId,
                        taskText: lastAction.taskText,
                        resolvedText: resolvedContext
                    };
                }
            }
        }
        // 检查是否引用了"再"、"再加"等
        if (input.includes('再加') || input.includes('再添加')) {
            const lastAddAction = context.recentActions.slice().reverse().find((action)=>action.action === 'add');
            if (lastAddAction) {
                resolvedContext = `基于上次添加的任务模式: "${lastAddAction.taskText}"`;
                recordContextReference('repeat_add_pattern', resolvedContext);
                return {
                    type: 'repeat_pattern',
                    action: 'add',
                    referenceTask: lastAddAction.taskText,
                    resolvedText: resolvedContext
                };
            }
        }
        return null;
    }, [
        context,
        recordContextReference
    ]);
    // 获取上下文摘要（用于发送给AI）
    const getContextSummary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const recentMessages = context.recentMessages.slice(-6); // 最近3轮对话
        const recentActions = context.recentActions.slice(-5); // 最近5个动作
        let summary = '';
        if (recentMessages.length > 0) {
            summary += '最近的对话:\n';
            recentMessages.forEach((msg)=>{
                summary += `${msg.type === 'user' ? '用户' : 'AI'}: ${msg.content}\n`;
            });
            summary += '\n';
        }
        if (recentActions.length > 0) {
            summary += '最近的操作:\n';
            recentActions.forEach((action)=>{
                summary += `${action.action}: ${action.taskText || '无具体任务'}\n`;
            });
            summary += '\n';
        }
        if (context.lastAddedTask) {
            summary += `最后添加的任务: "${context.lastAddedTask.text}" (ID: ${context.lastAddedTask.id})\n`;
        }
        return summary;
    }, [
        context
    ]);
    // 清除记忆（可选功能）
    const clearMemory = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        setMemory([]);
        setContext({
            recentActions: [],
            recentMessages: []
        });
    }, []);
    return {
        memory,
        context,
        addMemoryEntry,
        recordUserMessage,
        recordAIResponse,
        recordAction,
        recordContextReference,
        resolveContextReference,
        getContextSummary,
        clearMemory
    };
}
}}),
"[project]/app/components/ChatSidebar.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>ChatSidebar)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ai$2f$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ai/react/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$hooks$2f$useInstructionExecutor$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/hooks/useInstructionExecutor.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$hooks$2f$useMemory$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/hooks/useMemory.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
function ChatSidebar({ executeInstruction }) {
    const [showMemory, setShowMemory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(false);
    const [executionResults, setExecutionResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const messagesEndRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    // 使用记忆hook
    const { memory, context, recordUserMessage, recordAIResponse, resolveContextReference, getContextSummary, clearMemory } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$hooks$2f$useMemory$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemory"])();
    // 使用指令执行器
    const { parseAndExecuteMessage } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$hooks$2f$useInstructionExecutor$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useInstructionExecutor"])({
        executeInstruction
    });
    // 自动滚动到底部
    const scrollToBottom = ()=>{
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth'
        });
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        scrollToBottom();
    }, [
        memory,
        executionResults
    ]);
    const { messages, input, handleInputChange, handleSubmit, isLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ai$2f$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useChat"])({
        api: '/api/chat',
        onFinish: (message)=>{
            console.log('AI 回复完成:', message.content);
            console.log('开始解析和执行指令...');
            // 记录AI回复
            recordAIResponse(message.content);
            // 尝试执行AI回复中的指令
            const result = parseAndExecuteMessage(message.content);
            if (result) {
                console.log('指令执行结果:', result);
                // 添加执行结果到状态
                setExecutionResults((prev)=>[
                        ...prev.slice(-9),
                        {
                            id: `result_${Date.now()}`,
                            message: result.message || '执行完成',
                            success: result.success,
                            timestamp: Date.now()
                        }
                    ]);
            } else {
                console.log('没有找到可执行的指令');
            }
        }
    });
    // 处理表单提交，添加上下文信息
    const handleFormSubmit = (e)=>{
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        const userInput = input.trim();
        // 记录用户消息
        recordUserMessage(userInput);
        // 解析上下文引用
        const contextRef = resolveContextReference(userInput);
        // 获取上下文摘要
        const contextSummary = getContextSummary();
        // 构建增强的提示词
        let enhancedPrompt = userInput;
        if (contextRef) {
            enhancedPrompt = `用户消息: ${userInput}\n\n上下文解析: ${contextRef.resolvedText}\n`;
            // 如果是任务引用，添加具体信息
            if (contextRef.type === 'task_reference' && contextRef.taskId) {
                enhancedPrompt += `引用的任务ID: ${contextRef.taskId}\n`;
            }
        }
        if (contextSummary) {
            enhancedPrompt += `\n历史上下文:\n${contextSummary}`;
        }
        enhancedPrompt += `\n请基于以上上下文理解用户的真实意图，并生成相应的操作指令。`;
        // 调用原始的handleSubmit，但先修改input值
        handleInputChange({
            target: {
                value: enhancedPrompt
            }
        });
        // 立即提交表单
        setTimeout(()=>{
            handleSubmit(e);
            // 恢复显示原始输入
            handleInputChange({
                target: {
                    value: ''
                }
            });
        }, 0);
    };
    const formatTimestamp = (timestamp)=>{
        return new Date(timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };
    const getMemoryTypeLabel = (type)=>{
        switch(type){
            case 'user_message':
                return '💬 用户';
            case 'ai_response':
                return '🤖 AI';
            case 'action_executed':
                return '⚡ 执行';
            case 'context_reference':
                return '🔗 引用';
            default:
                return '📝';
        }
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white dark:bg-gray-800 rounded-xl shadow-lg h-full flex flex-col",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-b border-gray-200 dark:border-gray-700",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-lg font-semibold text-gray-800 dark:text-white",
                                children: "🤖 AI 助手"
                            }, void 0, false, {
                                fileName: "[project]/app/components/ChatSidebar.tsx",
                                lineNumber: 137,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex gap-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: ()=>setShowMemory(!showMemory),
                                        className: `px-3 py-1 text-xs rounded-full transition-colors ${showMemory ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`,
                                        title: "切换记忆视图",
                                        children: showMemory ? '💬 对话' : '🧠 记忆'
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ChatSidebar.tsx",
                                        lineNumber: 141,
                                        columnNumber: 13
                                    }, this),
                                    memory.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        onClick: clearMemory,
                                        className: "px-3 py-1 text-xs bg-red-100 text-red-600 rounded-full hover:bg-red-200 transition-colors",
                                        title: "清除记忆",
                                        children: "🗑️"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ChatSidebar.tsx",
                                        lineNumber: 153,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/ChatSidebar.tsx",
                                lineNumber: 140,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/ChatSidebar.tsx",
                        lineNumber: 136,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-gray-500 dark:text-gray-400 mt-1",
                        children: [
                            "支持上下文对话 | 记忆条目: ",
                            memory.length
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/ChatSidebar.tsx",
                        lineNumber: 164,
                        columnNumber: 9
                    }, this),
                    context.lastAddedTask && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-blue-600 dark:text-blue-400",
                            children: [
                                "💡 最后添加: “",
                                context.lastAddedTask.text,
                                "”"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/ChatSidebar.tsx",
                            lineNumber: 170,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/ChatSidebar.tsx",
                        lineNumber: 169,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/ChatSidebar.tsx",
                lineNumber: 135,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 p-4 overflow-y-auto",
                children: showMemory ? // 记忆视图
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-sm font-medium text-gray-700 dark:text-gray-300 mb-3",
                            children: "📝 对话记忆"
                        }, void 0, false, {
                            fileName: "[project]/app/components/ChatSidebar.tsx",
                            lineNumber: 182,
                            columnNumber: 13
                        }, this),
                        memory.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-gray-500 dark:text-gray-400 text-sm text-center py-4",
                            children: "暂无记忆记录"
                        }, void 0, false, {
                            fileName: "[project]/app/components/ChatSidebar.tsx",
                            lineNumber: 186,
                            columnNumber: 15
                        }, this) : memory.map((entry)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `p-2 rounded-lg text-xs ${entry.type === 'user_message' ? 'bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-300' : entry.type === 'ai_response' ? 'bg-green-50 dark:bg-green-900/20 border-l-2 border-green-300' : entry.type === 'action_executed' ? 'bg-yellow-50 dark:bg-yellow-900/20 border-l-2 border-yellow-300' : 'bg-purple-50 dark:bg-purple-900/20 border-l-2 border-purple-300'}`,
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center justify-between mb-1",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-medium",
                                                children: getMemoryTypeLabel(entry.type)
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/ChatSidebar.tsx",
                                                lineNumber: 204,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-gray-400",
                                                children: formatTimestamp(entry.timestamp)
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/ChatSidebar.tsx",
                                                lineNumber: 207,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/ChatSidebar.tsx",
                                        lineNumber: 203,
                                        columnNumber: 19
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-700 dark:text-gray-300",
                                        children: entry.content
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ChatSidebar.tsx",
                                        lineNumber: 211,
                                        columnNumber: 19
                                    }, this),
                                    entry.metadata && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "mt-1 text-gray-500",
                                        children: [
                                            entry.metadata.action && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    "动作: ",
                                                    entry.metadata.action
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/ChatSidebar.tsx",
                                                lineNumber: 217,
                                                columnNumber: 25
                                            }, this),
                                            entry.metadata.taskId && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    " | ID: ",
                                                    entry.metadata.taskId
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/ChatSidebar.tsx",
                                                lineNumber: 220,
                                                columnNumber: 25
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/ChatSidebar.tsx",
                                        lineNumber: 215,
                                        columnNumber: 21
                                    }, this)
                                ]
                            }, entry.id, true, {
                                fileName: "[project]/app/components/ChatSidebar.tsx",
                                lineNumber: 191,
                                columnNumber: 17
                            }, this))
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/ChatSidebar.tsx",
                    lineNumber: 181,
                    columnNumber: 11
                }, this) : // 对话视图
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-4",
                    children: [
                        messages.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center py-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-gray-500 dark:text-gray-400 text-sm mb-2",
                                    children: "👋 你好！我是你的AI助手"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/ChatSidebar.tsx",
                                    lineNumber: 233,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-xs text-gray-400 dark:text-gray-500",
                                    children: "我可以帮你管理待办事项，支持以下功能："
                                }, void 0, false, {
                                    fileName: "[project]/app/components/ChatSidebar.tsx",
                                    lineNumber: 236,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "mt-2 text-xs text-gray-400 space-y-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            children: "✅ “帮我添加一个学习任务”"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ChatSidebar.tsx",
                                            lineNumber: 240,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            children: "🔄 “再加一个类似的任务”"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ChatSidebar.tsx",
                                            lineNumber: 241,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            children: "✅ “完成刚才那个任务”"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ChatSidebar.tsx",
                                            lineNumber: 242,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            children: "🗑️ “把最后添加的删了”"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ChatSidebar.tsx",
                                            lineNumber: 243,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                            children: "📋 “显示所有任务”"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ChatSidebar.tsx",
                                            lineNumber: 244,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/ChatSidebar.tsx",
                                    lineNumber: 239,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/ChatSidebar.tsx",
                            lineNumber: 232,
                            columnNumber: 15
                        }, this) : messages.map((message)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `max-w-[80%] p-3 rounded-lg text-sm ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'}`,
                                    children: message.role === 'user' ? message.content.split('\n')[0].replace('用户消息: ', '') : message.content
                                }, void 0, false, {
                                    fileName: "[project]/app/components/ChatSidebar.tsx",
                                    lineNumber: 255,
                                    columnNumber: 19
                                }, this)
                            }, message.id, false, {
                                fileName: "[project]/app/components/ChatSidebar.tsx",
                                lineNumber: 249,
                                columnNumber: 17
                            }, this)),
                        executionResults.map((result)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `max-w-[90%] px-3 py-2 rounded-lg text-sm border ${result.success ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700 text-green-800 dark:text-green-300' : 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-700 text-red-800 dark:text-red-300'}`,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: result.success ? '✅' : '❌'
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/ChatSidebar.tsx",
                                                lineNumber: 282,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "font-medium",
                                                children: "指令执行:"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/ChatSidebar.tsx",
                                                lineNumber: 283,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: result.message
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/ChatSidebar.tsx",
                                                lineNumber: 284,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/ChatSidebar.tsx",
                                        lineNumber: 281,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/ChatSidebar.tsx",
                                    lineNumber: 276,
                                    columnNumber: 17
                                }, this)
                            }, result.id, false, {
                                fileName: "[project]/app/components/ChatSidebar.tsx",
                                lineNumber: 275,
                                columnNumber: 15
                            }, this)),
                        isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-start",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white p-3 rounded-lg text-sm",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center space-x-1",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ChatSidebar.tsx",
                                            lineNumber: 294,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce",
                                            style: {
                                                animationDelay: '0.1s'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ChatSidebar.tsx",
                                            lineNumber: 295,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "w-2 h-2 bg-gray-400 rounded-full animate-bounce",
                                            style: {
                                                animationDelay: '0.2s'
                                            }
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ChatSidebar.tsx",
                                            lineNumber: 296,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/ChatSidebar.tsx",
                                    lineNumber: 293,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/ChatSidebar.tsx",
                                lineNumber: 292,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/components/ChatSidebar.tsx",
                            lineNumber: 291,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            ref: messagesEndRef
                        }, void 0, false, {
                            fileName: "[project]/app/components/ChatSidebar.tsx",
                            lineNumber: 302,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/ChatSidebar.tsx",
                    lineNumber: 230,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/ChatSidebar.tsx",
                lineNumber: 178,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-t border-gray-200 dark:border-gray-700",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleFormSubmit,
                    className: "space-y-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-2",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    value: input,
                                    onChange: handleInputChange,
                                    placeholder: "输入消息，支持上下文引用...",
                                    className: "flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white",
                                    disabled: isLoading
                                }, void 0, false, {
                                    fileName: "[project]/app/components/ChatSidebar.tsx",
                                    lineNumber: 311,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "submit",
                                    disabled: isLoading || !input.trim(),
                                    className: "px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors text-sm font-medium",
                                    children: isLoading ? '⏳' : '发送'
                                }, void 0, false, {
                                    fileName: "[project]/app/components/ChatSidebar.tsx",
                                    lineNumber: 318,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/ChatSidebar.tsx",
                            lineNumber: 310,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex flex-wrap gap-1",
                            children: [
                                '再加一个任务',
                                '完成刚才那个',
                                '删除最后一个',
                                '显示所有任务'
                            ].map((suggestion)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    type: "button",
                                    onClick: ()=>{
                                        handleInputChange({
                                            target: {
                                                value: suggestion
                                            }
                                        });
                                    },
                                    className: "px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded transition-colors",
                                    disabled: isLoading,
                                    children: suggestion
                                }, suggestion, false, {
                                    fileName: "[project]/app/components/ChatSidebar.tsx",
                                    lineNumber: 335,
                                    columnNumber: 15
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/app/components/ChatSidebar.tsx",
                            lineNumber: 328,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/ChatSidebar.tsx",
                    lineNumber: 309,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/ChatSidebar.tsx",
                lineNumber: 308,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/ChatSidebar.tsx",
        lineNumber: 133,
        columnNumber: 5
    }, this);
}
}}),
"[project]/app/utils/instructionMapper.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// 定义指令类型
__turbopack_context__.s({
    "InstructionMapper": (()=>InstructionMapper),
    "findTodoById": (()=>findTodoById),
    "findTodoByText": (()=>findTodoByText),
    "instructionMapper": (()=>instructionMapper)
});
class InstructionMapper {
    functionMap;
    constructor(){
        this.functionMap = new Map();
    }
    // 注册函数到映射表
    registerFunction(action, func) {
        this.functionMap.set(action, func);
    }
    // 执行指令映射的函数
    executeInstruction(instruction) {
        const func = this.functionMap.get(instruction.action);
        if (!func) {
            console.warn(`未找到操作 "${instruction.action}" 对应的函数`);
            return {
                success: false,
                message: `不支持的操作: ${instruction.action}`
            };
        }
        try {
            // 根据不同的操作类型传递不同的参数
            let result;
            switch(instruction.action){
                case 'add':
                    result = func(instruction.task);
                    break;
                case 'complete':
                case 'delete':
                    result = func(instruction.id || instruction.task);
                    break;
                case 'list':
                case 'clear_completed':
                case 'clear_all':
                    result = func();
                    break;
                default:
                    result = func();
            }
            // 标准化返回结果
            if (typeof result === 'object' && result !== null && 'success' in result) {
                return result;
            } else {
                return {
                    success: true,
                    message: `操作 "${instruction.action}" 执行成功`,
                    data: result
                };
            }
        } catch (error) {
            console.error('执行指令时发生错误:', error);
            return {
                success: false,
                message: `执行操作 "${instruction.action}" 时发生错误`
            };
        }
    }
    // 获取所有注册的函数
    getRegisteredActions() {
        return Array.from(this.functionMap.keys());
    }
    // 检查是否支持某个操作
    supportsAction(action) {
        return this.functionMap.has(action);
    }
}
const instructionMapper = new InstructionMapper();
function findTodoByText(todos, taskText) {
    return todos.find((todo)=>todo.text.toLowerCase().includes(taskText.toLowerCase()) || taskText.toLowerCase().includes(todo.text.toLowerCase()));
}
function findTodoById(todos, id) {
    return todos.find((todo)=>todo.id === id);
}
}}),
"[project]/app/hooks/useInstructionMapping.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "useInstructionMapping": (()=>useInstructionMapping)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$instructionMapper$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/instructionMapper.ts [app-ssr] (ecmascript)");
;
;
function useInstructionMapping({ todos, setTodos, onActionExecuted }) {
    // 添加待办事项函数
    const addTodoFunction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((taskText)=>{
        const task = typeof taskText === 'string' ? taskText : String(taskText || '');
        if (!task || task.trim() === '') {
            return {
                success: false,
                message: '任务内容不能为空'
            };
        }
        const newTodo = {
            id: Date.now(),
            text: task.trim(),
            completed: false
        };
        setTodos([
            ...todos,
            newTodo
        ]);
        // 记录到记忆中
        onActionExecuted?.('add', newTodo.id, newTodo.text);
        return {
            success: true,
            message: `已添加任务: ${task}`,
            data: newTodo
        };
    }, [
        todos,
        setTodos,
        onActionExecuted
    ]);
    // 完成待办事项函数
    const completeTodoFunction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((taskIdentifier)=>{
        if (!taskIdentifier) {
            return {
                success: false,
                message: '请指定要完成的任务'
            };
        }
        let targetTodo;
        if (typeof taskIdentifier === 'number') {
            targetTodo = todos.find((todo)=>todo.id === taskIdentifier);
        } else {
            targetTodo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$instructionMapper$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findTodoByText"])(todos, taskIdentifier);
        }
        if (!targetTodo) {
            return {
                success: false,
                message: `未找到任务: ${taskIdentifier}`
            };
        }
        if (targetTodo.completed) {
            return {
                success: false,
                message: `任务 "${targetTodo.text}" 已经完成了`
            };
        }
        const updatedTodos = todos.map((todo)=>todo.id === targetTodo.id ? {
                ...todo,
                completed: true
            } : todo);
        setTodos(updatedTodos);
        // 记录到记忆中
        onActionExecuted?.('complete', targetTodo.id, targetTodo.text);
        return {
            success: true,
            message: `已完成任务: ${targetTodo.text}`,
            data: {
                ...targetTodo,
                completed: true
            }
        };
    }, [
        todos,
        setTodos,
        onActionExecuted
    ]);
    // 删除待办事项函数
    const deleteTodoFunction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((taskIdentifier)=>{
        if (!taskIdentifier) {
            return {
                success: false,
                message: '请指定要删除的任务'
            };
        }
        let targetTodo;
        if (typeof taskIdentifier === 'number') {
            targetTodo = todos.find((todo)=>todo.id === taskIdentifier);
        } else {
            targetTodo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$instructionMapper$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["findTodoByText"])(todos, taskIdentifier);
        }
        if (!targetTodo) {
            return {
                success: false,
                message: `未找到任务: ${taskIdentifier}`
            };
        }
        const updatedTodos = todos.filter((todo)=>todo.id !== targetTodo.id);
        setTodos(updatedTodos);
        // 记录到记忆中
        onActionExecuted?.('delete', targetTodo.id, targetTodo.text);
        return {
            success: true,
            message: `已删除任务: ${targetTodo.text}`,
            data: targetTodo
        };
    }, [
        todos,
        setTodos,
        onActionExecuted
    ]);
    // 列出所有待办事项函数
    const listTodosFunction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const completedCount = todos.filter((todo)=>todo.completed).length;
        const pendingCount = todos.length - completedCount;
        // 记录到记忆中
        onActionExecuted?.('list');
        return {
            success: true,
            message: `共有 ${todos.length} 个任务，其中 ${completedCount} 个已完成，${pendingCount} 个待完成`,
            data: todos
        };
    }, [
        todos,
        onActionExecuted
    ]);
    // 清除已完成任务函数
    const clearCompletedFunction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const completedTodos = todos.filter((todo)=>todo.completed);
        if (completedTodos.length === 0) {
            return {
                success: false,
                message: '没有已完成的任务需要清除'
            };
        }
        const updatedTodos = todos.filter((todo)=>!todo.completed);
        setTodos(updatedTodos);
        // 记录到记忆中
        onActionExecuted?.('clear_completed');
        return {
            success: true,
            message: `已清除 ${completedTodos.length} 个已完成的任务`,
            data: completedTodos
        };
    }, [
        todos,
        setTodos,
        onActionExecuted
    ]);
    // 清除所有任务函数
    const clearAllFunction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        if (todos.length === 0) {
            return {
                success: false,
                message: '没有任务需要清除'
            };
        }
        const clearedCount = todos.length;
        setTodos([]);
        // 记录到记忆中
        onActionExecuted?.('clear_all');
        return {
            success: true,
            message: `已清除所有 ${clearedCount} 个任务`,
            data: todos
        };
    }, [
        todos,
        setTodos,
        onActionExecuted
    ]);
    // 注册所有函数到映射器
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$instructionMapper$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["instructionMapper"].registerFunction('add', addTodoFunction);
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$instructionMapper$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["instructionMapper"].registerFunction('complete', completeTodoFunction);
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$instructionMapper$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["instructionMapper"].registerFunction('delete', deleteTodoFunction);
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$instructionMapper$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["instructionMapper"].registerFunction('list', listTodosFunction);
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$instructionMapper$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["instructionMapper"].registerFunction('clear_completed', clearCompletedFunction);
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$instructionMapper$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["instructionMapper"].registerFunction('clear_all', clearAllFunction);
    }, [
        addTodoFunction,
        completeTodoFunction,
        deleteTodoFunction,
        listTodosFunction,
        clearCompletedFunction,
        clearAllFunction
    ]);
    // 执行指令的主函数
    const executeInstruction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((instruction)=>{
        console.log('执行指令:', instruction);
        const result = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$instructionMapper$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["instructionMapper"].executeInstruction(instruction);
        console.log('执行结果:', result);
        return result;
    }, []);
    // 获取支持的操作列表
    const getSupportedActions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$instructionMapper$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["instructionMapper"].getRegisteredActions();
    }, []);
    return {
        executeInstruction,
        getSupportedActions,
        // 直接导出各个函数，以便组件可以直接调用
        addTodo: addTodoFunction,
        completeTodo: completeTodoFunction,
        deleteTodo: deleteTodoFunction,
        listTodos: listTodosFunction,
        clearCompleted: clearCompletedFunction,
        clearAll: clearAllFunction
    };
}
}}),
"[project]/app/page.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>TodoList)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$ChatSidebar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/ChatSidebar.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$hooks$2f$useInstructionMapping$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/hooks/useInstructionMapping.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$hooks$2f$useMemory$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/hooks/useMemory.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
function TodoList() {
    const [todos, setTodos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [inputValue, setInputValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    // 使用记忆hook
    const { recordAction } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$hooks$2f$useMemory$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useMemory"])();
    // 使用指令映射hook，传递记忆回调
    const { executeInstruction, getSupportedActions, addTodo: addTodoFunction, clearCompleted: clearCompletedFunction, clearAll: clearAllFunction } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$hooks$2f$useInstructionMapping$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useInstructionMapping"])({
        todos,
        setTodos,
        onActionExecuted: recordAction
    });
    // 本地添加任务（通过UI直接操作）
    const addTodo = ()=>{
        if (inputValue.trim() !== '') {
            const result = addTodoFunction(inputValue.trim());
            if (result.success) {
                setInputValue('');
            } else {
                console.error('添加任务失败:', result.message);
            }
        }
    };
    // 本地删除任务（通过UI直接操作）
    const deleteTodo = (id)=>{
        const result = executeInstruction({
            action: 'delete',
            id: id
        });
        if (!result.success) {
            console.error('删除任务失败:', result.message);
        }
    };
    // 本地切换任务状态（通过UI直接操作）
    const toggleTodo = (id)=>{
        const todo = todos.find((t)=>t.id === id);
        if (todo && !todo.completed) {
            const result = executeInstruction({
                action: 'complete',
                id: id
            });
            if (!result.success) {
                console.error('完成任务失败:', result.message);
            }
        } else if (todo && todo.completed) {
            // 对于已完成的任务，我们可以取消完成状态
            setTodos(todos.map((t)=>t.id === id ? {
                    ...t,
                    completed: false
                } : t));
        }
    };
    // 通过映射系统清除已完成任务
    const clearCompleted = ()=>{
        const result = clearCompletedFunction();
        if (!result.success) {
            console.error('清除已完成任务失败:', result.message);
        }
    };
    // 通过映射系统清除所有任务
    const clearAll = ()=>{
        const result = clearAllFunction();
        if (!result.success) {
            console.error('清除所有任务失败:', result.message);
        }
    };
    const completedCount = todos.filter((todo)=>todo.completed).length;
    const totalCount = todos.length;
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-6xl mx-auto h-[calc(100vh-2rem)] flex flex-col lg:flex-row gap-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 overflow-y-auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-3xl font-bold text-center text-gray-800 dark:text-white mb-2",
                                    children: "📝 智能上下文记忆待办事项"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 96,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-center text-sm text-gray-600 dark:text-gray-400",
                                    children: [
                                        "AI 指令映射 + 上下文记忆 | 支持操作: ",
                                        getSupportedActions().join(', ')
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 99,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-center text-xs text-gray-500 dark:text-gray-500 mt-1",
                                    children: "💡 支持上下文引用：“再加一个任务”、“完成刚才那个”、“删除最后添加的”"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 102,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 95,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-2 mb-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                    type: "text",
                                    value: inputValue,
                                    onChange: (e)=>setInputValue(e.target.value),
                                    onKeyPress: (e)=>e.key === 'Enter' && addTodo(),
                                    placeholder: "添加新任务...",
                                    className: "flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 109,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: addTodo,
                                    className: "px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium",
                                    children: "添加"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 117,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 108,
                            columnNumber: 11
                        }, this),
                        totalCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm text-gray-600 dark:text-gray-300 text-center",
                                children: [
                                    "总计: ",
                                    totalCount,
                                    " 任务 | 已完成: ",
                                    completedCount,
                                    " 任务 | 剩余: ",
                                    totalCount - completedCount,
                                    " 任务"
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 128,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 127,
                            columnNumber: 13
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-2",
                            children: todos.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center py-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-500 dark:text-gray-400 text-lg",
                                        children: "暂无任务，添加一个新任务开始吧！"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 139,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-400 dark:text-gray-500 mt-2",
                                        children: [
                                            "💡 你可以直接在此添加，或向",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "lg:inline hidden",
                                                children: "右侧"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 143,
                                                columnNumber: 34
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "lg:hidden inline",
                                                children: "下方"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 143,
                                                columnNumber: 78
                                            }, this),
                                            "的 AI 助手发送指令"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 142,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-gray-400 dark:text-gray-500 mt-1",
                                        children: "例如：“帮我添加一个学习任务” 或 “添加买菜任务”"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 145,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-gray-400 dark:text-gray-500 mt-1",
                                        children: "🔗 支持上下文：“再加一个类似的” 或 “完成刚才那个”"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 148,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 138,
                                columnNumber: 15
                            }, this) : todos.map((todo)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${todo.completed ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:shadow-md'}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "checkbox",
                                            checked: todo.completed,
                                            onChange: ()=>toggleTodo(todo.id),
                                            className: "w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 162,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `flex-1 ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-white'}`,
                                            children: todo.text
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 168,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-xs text-gray-400 dark:text-gray-500",
                                            children: [
                                                "ID: ",
                                                todo.id
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 177,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>deleteTodo(todo.id),
                                            className: "px-3 py-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors duration-200",
                                            title: "删除任务",
                                            children: "🗑️"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 180,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, todo.id, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 154,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 136,
                            columnNumber: 11
                        }, this),
                        todos.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-6 flex gap-2 justify-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: clearCompleted,
                                    className: "px-4 py-2 text-sm bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors duration-200",
                                    disabled: completedCount === 0,
                                    children: [
                                        "清除已完成 (",
                                        completedCount,
                                        ")"
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 195,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: clearAll,
                                    className: "px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200",
                                    children: "清除全部"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 202,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 194,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 94,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full lg:w-80 h-96 lg:h-full",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$ChatSidebar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        executeInstruction: executeInstruction
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 214,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 213,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 92,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 91,
        columnNumber: 5
    }, this);
}
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__c9b04c0a._.js.map