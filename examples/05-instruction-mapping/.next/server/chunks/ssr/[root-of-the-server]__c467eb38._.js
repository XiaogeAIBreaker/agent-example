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
            'list',
            'clear_completed',
            'clear_all'
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
"[project]/app/components/ChatSidebar.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>ChatSidebar)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ai$2d$sdk$2f$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@ai-sdk/react/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$hooks$2f$useInstructionExecutor$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/app/hooks/useInstructionExecutor.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function ChatSidebar({ executeInstruction, onInstructionExecuted }) {
    const [executionResults, setExecutionResults] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    // 指令执行器
    const { parseAndExecuteMessage } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$hooks$2f$useInstructionExecutor$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useInstructionExecutor"])({
        executeInstruction: executeInstruction || (()=>({
                success: false,
                message: '指令执行器未配置'
            }))
    });
    const { messages, input, handleInputChange, handleSubmit, status } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$ai$2d$sdk$2f$react$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useChat"])({
        api: '/api/chat',
        onFinish: (message)=>{
            // 当AI响应完成时，尝试执行指令
            if (executeInstruction) {
                const result = parseAndExecuteMessage(message.content);
                if (result) {
                    const resultText = result.success ? `✅ ${result.message}` : `❌ ${result.message}`;
                    setExecutionResults((prev)=>[
                            ...prev,
                            resultText
                        ]);
                    // 通知父组件
                    if (onInstructionExecuted) {
                        onInstructionExecuted({
                            success: result.success,
                            message: result.message
                        });
                    }
                }
            }
        }
    });
    const messagesEndRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useRef"])(null);
    const isLoading = status === 'submitted' || status === 'streaming';
    const scrollToBottom = ()=>{
        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth'
        });
    };
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        scrollToBottom();
    }, [
        messages,
        executionResults
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "bg-white dark:bg-gray-800 rounded-xl shadow-lg h-full flex flex-col",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "p-4 border-b border-gray-200 dark:border-gray-700",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-lg font-semibold text-gray-800 dark:text-white",
                            children: "🤖 AI 指令助手"
                        }, void 0, false, {
                            fileName: "[project]/app/components/ChatSidebar.tsx",
                            lineNumber: 64,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-gray-600 dark:text-gray-400",
                            children: "我可以通过指令映射直接操作你的待办事项"
                        }, void 0, false, {
                            fileName: "[project]/app/components/ChatSidebar.tsx",
                            lineNumber: 67,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-xs text-gray-500 dark:text-gray-500 mt-1",
                            children: "支持：添加、完成、删除、列表、清除等操作"
                        }, void 0, false, {
                            fileName: "[project]/app/components/ChatSidebar.tsx",
                            lineNumber: 70,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/ChatSidebar.tsx",
                    lineNumber: 63,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/ChatSidebar.tsx",
                lineNumber: 62,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex-1 overflow-y-auto p-4 space-y-4",
                children: [
                    messages.length === 0 && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "text-center text-gray-500 dark:text-gray-400 mt-8",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-2xl mb-2",
                                children: "🎯"
                            }, void 0, false, {
                                fileName: "[project]/app/components/ChatSidebar.tsx",
                                lineNumber: 80,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: "你好！我是你的 AI 指令助手"
                            }, void 0, false, {
                                fileName: "[project]/app/components/ChatSidebar.tsx",
                                lineNumber: 81,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                className: "text-sm mt-1",
                                children: "我可以直接执行待办事项操作"
                            }, void 0, false, {
                                fileName: "[project]/app/components/ChatSidebar.tsx",
                                lineNumber: 82,
                                columnNumber: 13
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "mt-3 text-xs text-gray-400 dark:text-gray-500 space-y-1",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "📝 “添加学习 Python 任务”"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ChatSidebar.tsx",
                                        lineNumber: 84,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "✅ “完成学习任务”"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ChatSidebar.tsx",
                                        lineNumber: 85,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "🗑️ “删除买菜任务”"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ChatSidebar.tsx",
                                        lineNumber: 86,
                                        columnNumber: 15
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "📋 “显示所有任务”"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ChatSidebar.tsx",
                                        lineNumber: 87,
                                        columnNumber: 15
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/ChatSidebar.tsx",
                                lineNumber: 83,
                                columnNumber: 13
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/ChatSidebar.tsx",
                        lineNumber: 79,
                        columnNumber: 11
                    }, this),
                    messages.map((message)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: `flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`,
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: `max-w-[85%] px-3 py-2 rounded-lg text-sm ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white'}`,
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "whitespace-pre-wrap",
                                    children: message.content
                                }, void 0, false, {
                                    fileName: "[project]/app/components/ChatSidebar.tsx",
                                    lineNumber: 104,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/ChatSidebar.tsx",
                                lineNumber: 97,
                                columnNumber: 13
                            }, this)
                        }, message.id, false, {
                            fileName: "[project]/app/components/ChatSidebar.tsx",
                            lineNumber: 93,
                            columnNumber: 11
                        }, this)),
                    executionResults.map((result, index)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-center",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "bg-green-100 dark:bg-green-900/30 border border-green-300 dark:border-green-700 text-green-800 dark:text-green-300 px-3 py-2 rounded-lg text-sm max-w-[90%]",
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                    className: "flex items-center gap-2",
                                    children: [
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: "text-green-600",
                                            children: "⚡"
                                        }, void 0, false, {
                                            fileName: "[project]/app/components/ChatSidebar.tsx",
                                            lineNumber: 114,
                                            columnNumber: 17
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            children: [
                                                "指令执行结果：",
                                                result
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/ChatSidebar.tsx",
                                            lineNumber: 115,
                                            columnNumber: 17
                                        }, this)
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/components/ChatSidebar.tsx",
                                    lineNumber: 113,
                                    columnNumber: 15
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/components/ChatSidebar.tsx",
                                lineNumber: 112,
                                columnNumber: 13
                            }, this)
                        }, `result-${index}`, false, {
                            fileName: "[project]/app/components/ChatSidebar.tsx",
                            lineNumber: 111,
                            columnNumber: 11
                        }, this)),
                    isLoading && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex justify-start",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white px-3 py-2 rounded-lg text-sm",
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex items-center space-x-2",
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        className: "animate-spin rounded-full h-3 w-3 border-b-2 border-blue-500"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ChatSidebar.tsx",
                                        lineNumber: 125,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                        children: "正在分析指令并执行中..."
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/ChatSidebar.tsx",
                                        lineNumber: 126,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/ChatSidebar.tsx",
                                lineNumber: 124,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/components/ChatSidebar.tsx",
                            lineNumber: 123,
                            columnNumber: 13
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/ChatSidebar.tsx",
                        lineNumber: 122,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        ref: messagesEndRef
                    }, void 0, false, {
                        fileName: "[project]/app/components/ChatSidebar.tsx",
                        lineNumber: 132,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/ChatSidebar.tsx",
                lineNumber: 77,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "border-t border-gray-200 dark:border-gray-700 p-3",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("form", {
                    onSubmit: handleSubmit,
                    className: "flex gap-2",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                            value: input,
                            onChange: handleInputChange,
                            placeholder: "输入指令，如：添加学习任务...",
                            disabled: isLoading,
                            className: "flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                        }, void 0, false, {
                            fileName: "[project]/app/components/ChatSidebar.tsx",
                            lineNumber: 138,
                            columnNumber: 11
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            type: "submit",
                            disabled: isLoading || !input.trim(),
                            className: "px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm",
                            children: "执行"
                        }, void 0, false, {
                            fileName: "[project]/app/components/ChatSidebar.tsx",
                            lineNumber: 145,
                            columnNumber: 11
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/ChatSidebar.tsx",
                    lineNumber: 137,
                    columnNumber: 9
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/ChatSidebar.tsx",
                lineNumber: 136,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/ChatSidebar.tsx",
        lineNumber: 60,
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
function useInstructionMapping({ todos, setTodos }) {
    // 添加待办事项函数
    const addTodoFunction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])((taskText)=>{
        if (!taskText || taskText.trim() === '') {
            return {
                success: false,
                message: '任务内容不能为空'
            };
        }
        const newTodo = {
            id: Date.now(),
            text: taskText.trim(),
            completed: false
        };
        setTodos([
            ...todos,
            newTodo
        ]);
        return {
            success: true,
            message: `已添加任务: ${taskText}`,
            data: newTodo
        };
    }, [
        todos,
        setTodos
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
        setTodos
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
        return {
            success: true,
            message: `已删除任务: ${targetTodo.text}`,
            data: targetTodo
        };
    }, [
        todos,
        setTodos
    ]);
    // 列出所有待办事项函数
    const listTodosFunction = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useCallback"])(()=>{
        const completedCount = todos.filter((todo)=>todo.completed).length;
        const pendingCount = todos.length - completedCount;
        return {
            success: true,
            message: `共有 ${todos.length} 个任务，其中 ${completedCount} 个已完成，${pendingCount} 个待完成`,
            data: todos
        };
    }, [
        todos
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
        return {
            success: true,
            message: `已清除 ${completedTodos.length} 个已完成的任务`,
            data: completedTodos
        };
    }, [
        todos,
        setTodos
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
        return {
            success: true,
            message: `已清除所有 ${clearedCount} 个任务`,
            data: todos
        };
    }, [
        todos,
        setTodos
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
'use client';
;
;
;
;
function TodoList() {
    const [todos, setTodos] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])([]);
    const [inputValue, setInputValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])('');
    // 使用指令映射hook
    const { executeInstruction, getSupportedActions, addTodo: addTodoFunction, clearCompleted: clearCompletedFunction, clearAll: clearAllFunction } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$hooks$2f$useInstructionMapping$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useInstructionMapping"])({
        todos,
        setTodos
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
                                    children: "📝 智能指令映射待办事项"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 88,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                    className: "text-center text-sm text-gray-600 dark:text-gray-400",
                                    children: [
                                        "AI 指令将映射到本地函数执行 | 支持操作: ",
                                        getSupportedActions().join(', ')
                                    ]
                                }, void 0, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 91,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 87,
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
                                    lineNumber: 98,
                                    columnNumber: 13
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: addTodo,
                                    className: "px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-200 font-medium",
                                    children: "添加"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 106,
                                    columnNumber: 13
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 97,
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
                                lineNumber: 117,
                                columnNumber: 15
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 116,
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
                                        lineNumber: 128,
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
                                                lineNumber: 132,
                                                columnNumber: 34
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                                className: "lg:hidden inline",
                                                children: "下方"
                                            }, void 0, false, {
                                                fileName: "[project]/app/page.tsx",
                                                lineNumber: 132,
                                                columnNumber: 78
                                            }, this),
                                            "的 AI 助手发送指令"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 131,
                                        columnNumber: 17
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        className: "text-xs text-gray-400 dark:text-gray-500 mt-1",
                                        children: "例如：“帮我添加一个学习任务” 或 “添加买菜任务”"
                                    }, void 0, false, {
                                        fileName: "[project]/app/page.tsx",
                                        lineNumber: 134,
                                        columnNumber: 17
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/page.tsx",
                                lineNumber: 127,
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
                                            lineNumber: 148,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                            className: `flex-1 ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : 'text-gray-800 dark:text-white'}`,
                                            children: todo.text
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 154,
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
                                            lineNumber: 163,
                                            columnNumber: 19
                                        }, this),
                                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                            onClick: ()=>deleteTodo(todo.id),
                                            className: "px-3 py-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors duration-200",
                                            title: "删除任务",
                                            children: "🗑️"
                                        }, void 0, false, {
                                            fileName: "[project]/app/page.tsx",
                                            lineNumber: 166,
                                            columnNumber: 19
                                        }, this)
                                    ]
                                }, todo.id, true, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 140,
                                    columnNumber: 17
                                }, this))
                        }, void 0, false, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 125,
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
                                    lineNumber: 181,
                                    columnNumber: 15
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                    onClick: clearAll,
                                    className: "px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors duration-200",
                                    children: "清除全部"
                                }, void 0, false, {
                                    fileName: "[project]/app/page.tsx",
                                    lineNumber: 188,
                                    columnNumber: 15
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/page.tsx",
                            lineNumber: 180,
                            columnNumber: 13
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 86,
                    columnNumber: 9
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "w-full lg:w-80 h-96 lg:h-full",
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$ChatSidebar$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["default"], {
                        executeInstruction: executeInstruction
                    }, void 0, false, {
                        fileName: "[project]/app/page.tsx",
                        lineNumber: 200,
                        columnNumber: 11
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/page.tsx",
                    lineNumber: 199,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/page.tsx",
            lineNumber: 84,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/page.tsx",
        lineNumber: 83,
        columnNumber: 5
    }, this);
}
}}),

};

//# sourceMappingURL=%5Broot-of-the-server%5D__c467eb38._.js.map