(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/app/utils/jsonParser.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/hooks/useInstructionExecutor.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "useInstructionExecutor": (()=>useInstructionExecutor)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$jsonParser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/jsonParser.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
function useInstructionExecutor({ executeInstruction }) {
    _s();
    // 解析AI响应并执行指令
    const parseAndExecuteMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useInstructionExecutor.useCallback[parseAndExecuteMessage]": (aiMessage)=>{
            // 检查消息是否包含指令
            if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$jsonParser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["hasActionInMessage"])(aiMessage)) {
                return null;
            }
            // 解析JSON指令
            const parsedAction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$jsonParser$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["safeParseJSON"])(aiMessage);
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
        }
    }["useInstructionExecutor.useCallback[parseAndExecuteMessage]"], [
        executeInstruction
    ]);
    // 批量处理AI消息中的指令
    const processAIResponse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useInstructionExecutor.useCallback[processAIResponse]": (aiMessage)=>{
            const results = [];
            // 查找所有JSON指令
            const jsonMatches = aiMessage.match(/\{[^}]*"action"[^}]*\}/g);
            if (jsonMatches) {
                jsonMatches.forEach({
                    "useInstructionExecutor.useCallback[processAIResponse]": (jsonStr, index)=>{
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
                    }
                }["useInstructionExecutor.useCallback[processAIResponse]"]);
            }
            return results;
        }
    }["useInstructionExecutor.useCallback[processAIResponse]"], [
        executeInstruction
    ]);
    return {
        parseAndExecuteMessage,
        processAIResponse
    };
}
_s(useInstructionExecutor, "NeydXC1Qd0X+2jxzkQgpaZH1hcY=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/components/ChatSidebar.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>ChatSidebar)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ai$2f$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/ai/react/dist/index.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$hooks$2f$useInstructionExecutor$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/hooks/useInstructionExecutor.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
function ChatSidebar({ executeInstruction }) {
    _s();
    const [showContext, setShowContext] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    const [executionResults, setExecutionResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const messagesEndRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    // 使用指令执行器
    const { parseAndExecuteMessage } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$hooks$2f$useInstructionExecutor$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInstructionExecutor"])({
        executeInstruction
    });
    const { messages, input, handleInputChange, handleSubmit, isLoading } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ai$2f$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useChat"])({
        api: '/api/chat',
        onFinish: {
            "ChatSidebar.useChat": (message)=>{
                // 尝试执行AI回复中的指令
                const result = parseAndExecuteMessage(message.content);
                if (result) {
                    setExecutionResults({
                        "ChatSidebar.useChat": (prev)=>[
                                ...prev.slice(-9),
                                {
                                    id: `result_${Date.now()}`,
                                    message: result.message || '执行完成',
                                    success: result.success,
                                    timestamp: Date.now()
                                }
                            ]
                    }["ChatSidebar.useChat"]);
                }
            }
        }["ChatSidebar.useChat"]
    });
    // 自动滚动到底部
    const scrollToBottom = ()=>{
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth'
        });
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "ChatSidebar.useEffect": ()=>{
            scrollToBottom();
        }
    }["ChatSidebar.useEffect"], [
        messages,
        executionResults
    ]);
    // 从messages中提取上下文信息
    const getLastAddedTask = ()=>{
        // 从最近的消息中找到最后添加的任务
        for(let i = messages.length - 1; i >= 0; i--){
            const msg = messages[i];
            if (msg.role === 'assistant' && msg.content.includes('"action": "add"')) {
                const match = msg.content.match(/"task":\s*"([^"]+)"/);
                if (match) {
                    return match[1];
                }
            }
        }
        return null;
    };
    // 从messages中获取最近的操作
    const getRecentActions = ()=>{
        const actions = [];
        for(let i = messages.length - 1; i >= 0 && actions.length < 5; i--){
            const msg = messages[i];
            if (msg.role === 'assistant') {
                const actionMatch = msg.content.match(/"action":\s*"([^"]+)"/);
                const taskMatch = msg.content.match(/"task":\s*"([^"]+)"/);
                if (actionMatch) {
                    actions.unshift({
                        action: actionMatch[1],
                        task: taskMatch ? taskMatch[1] : '',
                        timestamp: Date.now() - (messages.length - 1 - i) * 60000 // 估算时间
                    });
                }
            }
        }
        return actions;
    };
    // 简单的上下文引用处理
    const enhanceUserInput = (userInput)=>{
        const lastTask = getLastAddedTask();
        let enhancedInput = userInput;
        // 处理"刚才"、"最后"等引用
        if (userInput.includes('刚才') || userInput.includes('最后') || userInput.includes('上个')) {
            if (lastTask) {
                enhancedInput += `\n(注：最近添加的任务是"${lastTask}")`;
            }
        }
        // 处理"再加"等重复操作
        if (userInput.includes('再加') || userInput.includes('再添加')) {
            if (lastTask) {
                enhancedInput += `\n(注：上次添加的是"${lastTask}"，请添加类似的任务)`;
            }
        }
        return enhancedInput;
    };
    // 处理表单提交
    const handleFormSubmit = (e)=>{
        e.preventDefault();
        if (!input.trim() || isLoading) return;
        // 增强用户输入
        const enhancedInput = enhanceUserInput(input.trim());
        // 如果输入被增强了，先更新input然后提交
        if (enhancedInput !== input.trim()) {
            handleInputChange({
                target: {
                    value: enhancedInput
                }
            });
            setTimeout(()=>{
                handleSubmit(e);
                handleInputChange({
                    target: {
                        value: ''
                    }
                });
            }, 0);
        } else {
            handleSubmit(e);
        }
    };
    const lastTask = getLastAddedTask();
    const recentActions = getRecentActions();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white dark:bg-gray-800 rounded-xl shadow-lg h-full flex flex-col",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-b border-gray-200 dark:border-gray-700",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex items-center justify-between",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                                className: "text-lg font-semibold text-gray-800 dark:text-white",
                                children: "🤖 AI 助手"
                            }, void 0, false, {
                                fileName: "[project]/app/components/ChatSidebar.tsx",
                                lineNumber: 132,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                onClick: ()=>setShowContext(!showContext),
                                className: `px-3 py-1 text-xs rounded-full transition-colors ${showContext ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'}`,
                                title: "切换上下文视图",
                                children: showContext ? '💬 对话' : '📋 上下文'
                            }, void 0, false, {
                                fileName: "[project]/app/components/ChatSidebar.tsx",
                                lineNumber: 135,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/ChatSidebar.tsx",
                        lineNumber: 131,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                        className: "text-xs text-gray-500 dark:text-gray-400 mt-1",
                        children: [
                            "支持上下文对话 | 消息: ",
                            messages.length
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/ChatSidebar.tsx",
                        lineNumber: 148,
                        columnNumber: 9
                    }, this),
                    lastTask && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "mt-2 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                            className: "text-blue-600 dark:text-blue-400",
                            children: [
                                "💡 最后添加: “",
                                lastTask,
                                "”"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/ChatSidebar.tsx",
                            lineNumber: 154,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/ChatSidebar.tsx",
                        lineNumber: 153,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/ChatSidebar.tsx",
                lineNumber: 130,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 p-4 overflow-y-auto",
                children: showContext ? // 上下文视图
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h3", {
                            className: "text-sm font-medium text-gray-700 dark:text-gray-300 mb-3",
                            children: "📋 对话上下文"
                        }, void 0, false, {
                            fileName: "[project]/app/components/ChatSidebar.tsx",
                            lineNumber: 166,
                            columnNumber: 13
                        }, this),
                        lastTask && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: "最后添加的任务:"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/ChatSidebar.tsx",
                                    lineNumber: 172,
                                    columnNumber: 17
                                }, this),
                                " ",
                                lastTask
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/ChatSidebar.tsx",
                            lineNumber: 171,
                            columnNumber: 15
                        }, this),
                        recentActions.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-2 bg-green-50 dark:bg-green-900/20 rounded-lg text-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: "最近操作:"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/ChatSidebar.tsx",
                                    lineNumber: 178,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                                    className: "mt-1 space-y-1",
                                    children: recentActions.map((action, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                                            className: "text-xs",
                                            children: [
                                                "• ",
                                                action.action,
                                                ": ",
                                                action.task
                                            ]
                                        }, index, true, {
                                            fileName: "[project]/app/components/ChatSidebar.tsx",
                                            lineNumber: 181,
                                            columnNumber: 21
                                        }, this))
                                }, void 0, false, {
                                    fileName: "[project]/app/components/ChatSidebar.tsx",
                                    lineNumber: 179,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/ChatSidebar.tsx",
                            lineNumber: 177,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "p-2 bg-gray-50 dark:bg-gray-900/20 rounded-lg text-sm",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                    children: "对话历史:"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/ChatSidebar.tsx",
                                    lineNumber: 190,
                                    columnNumber: 15
                                }, this),
                                " ",
                                messages.length,
                                " 条消息"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/ChatSidebar.tsx",
                            lineNumber: 189,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/ChatSidebar.tsx",
                    lineNumber: 165,
                    columnNumber: 11
                }, this) : // 对话视图
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "space-y-4",
                    children: [
                        messages.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "text-center text-gray-500 dark:text-gray-400 mt-8",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-2xl mb-2",
                                    children: "👋"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/ChatSidebar.tsx",
                                    lineNumber: 198,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    children: "你好！我是你的 AI 助手"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/ChatSidebar.tsx",
                                    lineNumber: 199,
                                    columnNumber: 17
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-sm mt-1",
                                    children: "支持上下文对话，试试说“再加一个任务”"
                                }, void 0, false, {
                                    fileName: "[project]/app/components/ChatSidebar.tsx",
                                    lineNumber: 200,
                                    columnNumber: 17
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/ChatSidebar.tsx",
                            lineNumber: 197,
                            columnNumber: 15
                        }, this),
                        messages.map((message)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `max-w-[85%] px-3 py-2 rounded-lg text-sm ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'}`,
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "whitespace-pre-wrap",
                                        children: message.content
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ChatSidebar.tsx",
                                        lineNumber: 216,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/ChatSidebar.tsx",
                                    lineNumber: 209,
                                    columnNumber: 17
                                }, this)
                            }, message.id, false, {
                                fileName: "[project]/app/components/ChatSidebar.tsx",
                                lineNumber: 205,
                                columnNumber: 15
                            }, this)),
                        executionResults.map((result)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex justify-center",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-300 px-3 py-2 rounded-lg text-sm max-w-[90%]",
                                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "flex items-center gap-2",
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "text-green-600",
                                                children: "⚡"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/ChatSidebar.tsx",
                                                lineNumber: 226,
                                                columnNumber: 21
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                children: [
                                                    "指令执行结果：",
                                                    result.success ? '✅' : '❌',
                                                    " ",
                                                    result.message
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/ChatSidebar.tsx",
                                                lineNumber: 227,
                                                columnNumber: 21
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/ChatSidebar.tsx",
                                        lineNumber: 225,
                                        columnNumber: 19
                                    }, this)
                                }, void 0, false, {
                                    fileName: "[project]/app/components/ChatSidebar.tsx",
                                    lineNumber: 224,
                                    columnNumber: 17
                                }, this)
                            }, result.id, false, {
                                fileName: "[project]/app/components/ChatSidebar.tsx",
                                lineNumber: 223,
                                columnNumber: 15
                            }, this)),
                        isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-start",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white px-3 py-2 rounded-lg text-sm",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center space-x-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            className: "animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ChatSidebar.tsx",
                                            lineNumber: 237,
                                            columnNumber: 21
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: "正在思考中..."
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ChatSidebar.tsx",
                                            lineNumber: 238,
                                            columnNumber: 21
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/ChatSidebar.tsx",
                                    lineNumber: 236,
                                    columnNumber: 19
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/ChatSidebar.tsx",
                                lineNumber: 235,
                                columnNumber: 17
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/components/ChatSidebar.tsx",
                            lineNumber: 234,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            ref: messagesEndRef
                        }, void 0, false, {
                            fileName: "[project]/app/components/ChatSidebar.tsx",
                            lineNumber: 244,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/ChatSidebar.tsx",
                    lineNumber: 195,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/ChatSidebar.tsx",
                lineNumber: 162,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-t border-gray-200 dark:border-gray-700 p-3",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleFormSubmit,
                    className: "flex gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            value: input,
                            onChange: handleInputChange,
                            placeholder: "输入消息，支持'再加一个'、'完成刚才的'等上下文指令...",
                            disabled: isLoading,
                            className: "flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                        }, void 0, false, {
                            fileName: "[project]/app/components/ChatSidebar.tsx",
                            lineNumber: 252,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "submit",
                            disabled: isLoading || !input.trim(),
                            className: "px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm",
                            children: "发送"
                        }, void 0, false, {
                            fileName: "[project]/app/components/ChatSidebar.tsx",
                            lineNumber: 259,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/ChatSidebar.tsx",
                    lineNumber: 251,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/ChatSidebar.tsx",
                lineNumber: 250,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/ChatSidebar.tsx",
        lineNumber: 128,
        columnNumber: 5
    }, this);
}
_s(ChatSidebar, "lijnJe67+S6mjDBP3VoiREywRlY=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$hooks$2f$useInstructionExecutor$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInstructionExecutor"],
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$ai$2f$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useChat"]
    ];
});
_c = ChatSidebar;
var _c;
__turbopack_context__.k.register(_c, "ChatSidebar");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/utils/instructionMapper.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
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
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/hooks/useInstructionMapping.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "useInstructionMapping": (()=>useInstructionMapping)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$instructionMapper$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/utils/instructionMapper.ts [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
;
function useInstructionMapping({ todos, setTodos, onActionExecuted }) {
    _s();
    // 添加待办事项函数
    const addTodoFunction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useInstructionMapping.useCallback[addTodoFunction]": (taskText)=>{
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
        }
    }["useInstructionMapping.useCallback[addTodoFunction]"], [
        todos,
        setTodos,
        onActionExecuted
    ]);
    // 完成待办事项函数
    const completeTodoFunction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useInstructionMapping.useCallback[completeTodoFunction]": (taskIdentifier)=>{
            if (!taskIdentifier) {
                return {
                    success: false,
                    message: '请指定要完成的任务'
                };
            }
            let targetTodo;
            if (typeof taskIdentifier === 'number') {
                targetTodo = todos.find({
                    "useInstructionMapping.useCallback[completeTodoFunction]": (todo)=>todo.id === taskIdentifier
                }["useInstructionMapping.useCallback[completeTodoFunction]"]);
            } else {
                targetTodo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$instructionMapper$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findTodoByText"])(todos, taskIdentifier);
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
            const updatedTodos = todos.map({
                "useInstructionMapping.useCallback[completeTodoFunction].updatedTodos": (todo)=>todo.id === targetTodo.id ? {
                        ...todo,
                        completed: true
                    } : todo
            }["useInstructionMapping.useCallback[completeTodoFunction].updatedTodos"]);
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
        }
    }["useInstructionMapping.useCallback[completeTodoFunction]"], [
        todos,
        setTodos,
        onActionExecuted
    ]);
    // 删除待办事项函数
    const deleteTodoFunction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useInstructionMapping.useCallback[deleteTodoFunction]": (taskIdentifier)=>{
            if (!taskIdentifier) {
                return {
                    success: false,
                    message: '请指定要删除的任务'
                };
            }
            let targetTodo;
            if (typeof taskIdentifier === 'number') {
                targetTodo = todos.find({
                    "useInstructionMapping.useCallback[deleteTodoFunction]": (todo)=>todo.id === taskIdentifier
                }["useInstructionMapping.useCallback[deleteTodoFunction]"]);
            } else {
                targetTodo = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$instructionMapper$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["findTodoByText"])(todos, taskIdentifier);
            }
            if (!targetTodo) {
                return {
                    success: false,
                    message: `未找到任务: ${taskIdentifier}`
                };
            }
            const updatedTodos = todos.filter({
                "useInstructionMapping.useCallback[deleteTodoFunction].updatedTodos": (todo)=>todo.id !== targetTodo.id
            }["useInstructionMapping.useCallback[deleteTodoFunction].updatedTodos"]);
            setTodos(updatedTodos);
            // 记录到记忆中
            onActionExecuted?.('delete', targetTodo.id, targetTodo.text);
            return {
                success: true,
                message: `已删除任务: ${targetTodo.text}`,
                data: targetTodo
            };
        }
    }["useInstructionMapping.useCallback[deleteTodoFunction]"], [
        todos,
        setTodos,
        onActionExecuted
    ]);
    // 列出所有待办事项函数
    const listTodosFunction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useInstructionMapping.useCallback[listTodosFunction]": ()=>{
            const completedCount = todos.filter({
                "useInstructionMapping.useCallback[listTodosFunction]": (todo)=>todo.completed
            }["useInstructionMapping.useCallback[listTodosFunction]"]).length;
            const pendingCount = todos.length - completedCount;
            // 记录到记忆中
            onActionExecuted?.('list');
            return {
                success: true,
                message: `共有 ${todos.length} 个任务，其中 ${completedCount} 个已完成，${pendingCount} 个待完成`,
                data: todos
            };
        }
    }["useInstructionMapping.useCallback[listTodosFunction]"], [
        todos,
        onActionExecuted
    ]);
    // 清除已完成任务函数
    const clearCompletedFunction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useInstructionMapping.useCallback[clearCompletedFunction]": ()=>{
            const completedTodos = todos.filter({
                "useInstructionMapping.useCallback[clearCompletedFunction].completedTodos": (todo)=>todo.completed
            }["useInstructionMapping.useCallback[clearCompletedFunction].completedTodos"]);
            if (completedTodos.length === 0) {
                return {
                    success: false,
                    message: '没有已完成的任务需要清除'
                };
            }
            const updatedTodos = todos.filter({
                "useInstructionMapping.useCallback[clearCompletedFunction].updatedTodos": (todo)=>!todo.completed
            }["useInstructionMapping.useCallback[clearCompletedFunction].updatedTodos"]);
            setTodos(updatedTodos);
            // 记录到记忆中
            onActionExecuted?.('clear_completed');
            return {
                success: true,
                message: `已清除 ${completedTodos.length} 个已完成的任务`,
                data: completedTodos
            };
        }
    }["useInstructionMapping.useCallback[clearCompletedFunction]"], [
        todos,
        setTodos,
        onActionExecuted
    ]);
    // 清除所有任务函数
    const clearAllFunction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useInstructionMapping.useCallback[clearAllFunction]": ()=>{
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
        }
    }["useInstructionMapping.useCallback[clearAllFunction]"], [
        todos,
        setTodos,
        onActionExecuted
    ]);
    // 注册所有函数到映射器
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "useInstructionMapping.useEffect": ()=>{
            __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$instructionMapper$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["instructionMapper"].registerFunction('add', addTodoFunction);
            __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$instructionMapper$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["instructionMapper"].registerFunction('complete', completeTodoFunction);
            __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$instructionMapper$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["instructionMapper"].registerFunction('delete', deleteTodoFunction);
            __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$instructionMapper$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["instructionMapper"].registerFunction('list', listTodosFunction);
            __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$instructionMapper$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["instructionMapper"].registerFunction('clear_completed', clearCompletedFunction);
            __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$instructionMapper$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["instructionMapper"].registerFunction('clear_all', clearAllFunction);
        }
    }["useInstructionMapping.useEffect"], [
        addTodoFunction,
        completeTodoFunction,
        deleteTodoFunction,
        listTodosFunction,
        clearCompletedFunction,
        clearAllFunction
    ]);
    // 执行指令的主函数
    const executeInstruction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useInstructionMapping.useCallback[executeInstruction]": (instruction)=>{
            console.log('执行指令:', instruction);
            const result = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$instructionMapper$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["instructionMapper"].executeInstruction(instruction);
            console.log('执行结果:', result);
            return result;
        }
    }["useInstructionMapping.useCallback[executeInstruction]"], []);
    // 获取支持的操作列表
    const getSupportedActions = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useInstructionMapping.useCallback[getSupportedActions]": ()=>{
            return __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$instructionMapper$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["instructionMapper"].getRegisteredActions();
        }
    }["useInstructionMapping.useCallback[getSupportedActions]"], []);
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
_s(useInstructionMapping, "74Otups7ocH3GrJx0eLrDe4bQfg=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/hooks/useMemory.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "useMemory": (()=>useMemory)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
;
function useMemory() {
    _s();
    const [memory, setMemory] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [context, setContext] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        recentActions: [],
        recentMessages: []
    });
    // 添加记忆条目
    const addMemoryEntry = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useMemory.useCallback[addMemoryEntry]": (entry)=>{
            const newEntry = {
                ...entry,
                id: `mem_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                timestamp: Date.now()
            };
            setMemory({
                "useMemory.useCallback[addMemoryEntry]": (prev)=>[
                        ...prev.slice(-49),
                        newEntry
                    ]
            }["useMemory.useCallback[addMemoryEntry]"]); // 保持最近50条记录
            return newEntry;
        }
    }["useMemory.useCallback[addMemoryEntry]"], []);
    // 记录用户消息
    const recordUserMessage = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useMemory.useCallback[recordUserMessage]": (message)=>{
            addMemoryEntry({
                type: 'user_message',
                content: message
            });
            // 更新上下文中的最近消息
            setContext({
                "useMemory.useCallback[recordUserMessage]": (prev)=>({
                        ...prev,
                        recentMessages: [
                            ...prev.recentMessages.slice(-9),
                            {
                                content: message,
                                timestamp: Date.now(),
                                type: 'user'
                            }
                        ]
                    })
            }["useMemory.useCallback[recordUserMessage]"]);
        }
    }["useMemory.useCallback[recordUserMessage]"], [
        addMemoryEntry
    ]);
    // 记录AI回复
    const recordAIResponse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useMemory.useCallback[recordAIResponse]": (response)=>{
            addMemoryEntry({
                type: 'ai_response',
                content: response
            });
            // 更新上下文中的最近消息
            setContext({
                "useMemory.useCallback[recordAIResponse]": (prev)=>({
                        ...prev,
                        recentMessages: [
                            ...prev.recentMessages.slice(-9),
                            {
                                content: response,
                                timestamp: Date.now(),
                                type: 'ai'
                            }
                        ]
                    })
            }["useMemory.useCallback[recordAIResponse]"]);
        }
    }["useMemory.useCallback[recordAIResponse]"], [
        addMemoryEntry
    ]);
    // 记录执行的动作
    const recordAction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useMemory.useCallback[recordAction]": (action, taskId, taskText)=>{
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
            setContext({
                "useMemory.useCallback[recordAction]": (prev)=>({
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
                    })
            }["useMemory.useCallback[recordAction]"]);
        }
    }["useMemory.useCallback[recordAction]"], [
        addMemoryEntry
    ]);
    // 记录上下文引用
    const recordContextReference = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useMemory.useCallback[recordContextReference]": (reference, content)=>{
            addMemoryEntry({
                type: 'context_reference',
                content,
                metadata: {
                    reference
                }
            });
        }
    }["useMemory.useCallback[recordContextReference]"], [
        addMemoryEntry
    ]);
    // 解析上下文引用（如"刚才那个"、"最后一个"等）
    const resolveContextReference = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useMemory.useCallback[resolveContextReference]": (userInput)=>{
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
                const lastAddAction = context.recentActions.slice().reverse().find({
                    "useMemory.useCallback[resolveContextReference].lastAddAction": (action)=>action.action === 'add'
                }["useMemory.useCallback[resolveContextReference].lastAddAction"]);
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
        }
    }["useMemory.useCallback[resolveContextReference]"], [
        context,
        recordContextReference
    ]);
    // 获取上下文摘要（用于发送给AI）
    const getContextSummary = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useMemory.useCallback[getContextSummary]": ()=>{
            const recentMessages = context.recentMessages.slice(-6); // 最近3轮对话
            const recentActions = context.recentActions.slice(-5); // 最近5个动作
            let summary = '';
            if (recentMessages.length > 0) {
                summary += '最近的对话:\n';
                recentMessages.forEach({
                    "useMemory.useCallback[getContextSummary]": (msg)=>{
                        summary += `${msg.type === 'user' ? '用户' : 'AI'}: ${msg.content}\n`;
                    }
                }["useMemory.useCallback[getContextSummary]"]);
                summary += '\n';
            }
            if (recentActions.length > 0) {
                summary += '最近的操作:\n';
                recentActions.forEach({
                    "useMemory.useCallback[getContextSummary]": (action)=>{
                        summary += `${action.action}: ${action.taskText || '无具体任务'}\n`;
                    }
                }["useMemory.useCallback[getContextSummary]"]);
                summary += '\n';
            }
            if (context.lastAddedTask) {
                summary += `最后添加的任务: "${context.lastAddedTask.text}" (ID: ${context.lastAddedTask.id})\n`;
            }
            return summary;
        }
    }["useMemory.useCallback[getContextSummary]"], [
        context
    ]);
    // 清除记忆（可选功能）
    const clearMemory = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
        "useMemory.useCallback[clearMemory]": ()=>{
            setMemory([]);
            setContext({
                recentActions: [],
                recentMessages: []
            });
        }
    }["useMemory.useCallback[clearMemory]"], []);
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
_s(useMemory, "aVm0Qj3bCRsXzC7kQbjXZw3gJRg=");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname, k: __turbopack_refresh__, m: module } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>TodoList)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$ChatSidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/components/ChatSidebar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$hooks$2f$useInstructionMapping$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/hooks/useInstructionMapping.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$hooks$2f$useMemory$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/hooks/useMemory.ts [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function TodoList() {
    _s();
    const [todos, setTodos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [inputValue, setInputValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    // 使用记忆hook
    const { recordAction } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$hooks$2f$useMemory$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemory"])();
    // 使用指令映射hook，传递记忆回调
    const { executeInstruction, getSupportedActions, addTodo: addTodoFunction, clearCompleted: clearCompletedFunction, clearAll: clearAllFunction } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$hooks$2f$useInstructionMapping$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInstructionMapping"])({
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
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "max-w-6xl mx-auto h-[calc(100vh-2rem)] flex flex-col lg:flex-row gap-6",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 overflow-y-auto",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-4",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h1", {
                                    className: "text-3xl font-bold text-center text-gray-800 dark:text-white mb-2",
                                    children: "📝 智能上下文记忆待办事项"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 96,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex gap-2 mb-6",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
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
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                        totalCount > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "space-y-2",
                            children: todos.length === 0 ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "text-center py-8",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-gray-500 dark:text-gray-400 text-lg",
                                        children: "暂无任务，添加一个新任务开始吧！"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 139,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-sm text-gray-400 dark:text-gray-500 mt-2",
                                        children: [
                                            "💡 你可以直接在此添加，或向",
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "lg:inline hidden",
                                                children: "右侧"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 143,
                                                columnNumber: 34
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-gray-400 dark:text-gray-500 mt-1",
                                        children: "例如：“帮我添加一个学习任务” 或 “添加买菜任务”"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 145,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
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
                            }, this) : todos.map((todo)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: `flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${todo.completed ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:shadow-md'}`,
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                                            type: "checkbox",
                                            checked: todo.completed,
                                            onChange: ()=>toggleTodo(todo.id),
                                            className: "w-5 h-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 162,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `flex-1 ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-white'}`,
                                            children: todo.text
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 168,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
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
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                        todos.length > 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "mt-6 flex gap-2 justify-center",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
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
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full lg:w-80 h-96 lg:h-full",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$ChatSidebar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"], {
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
_s(TodoList, "K3r0OndwpR4hQxiTBFLiq1uSt50=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$hooks$2f$useMemory$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemory"],
        __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$hooks$2f$useInstructionMapping$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useInstructionMapping"]
    ];
});
_c = TodoList;
var _c;
__turbopack_context__.k.register(_c, "TodoList");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
}]);

//# sourceMappingURL=app_9c63aac1._.js.map