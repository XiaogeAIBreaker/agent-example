import { useCallback } from 'react';
import { Instruction, ExecutionResult } from '../utils/instructionMapper';
import { TodoAction, safeParseJSON, hasActionInMessage } from '../utils/jsonParser';

interface UseInstructionExecutorProps {
  executeInstruction: (instruction: Instruction) => ExecutionResult;
}

export function useInstructionExecutor({ executeInstruction }: UseInstructionExecutorProps) {
  
  // 解析AI响应并执行指令
  const parseAndExecuteMessage = useCallback((aiMessage: string): ExecutionResult | null => {
    // 检查消息是否包含指令
    if (!hasActionInMessage(aiMessage)) {
      return null;
    }

    // 解析JSON指令
    const parsedAction: TodoAction | null = safeParseJSON(aiMessage);
    
    if (!parsedAction) {
      console.warn('无法解析AI返回的指令');
      return {
        success: false,
        message: '指令格式错误，无法解析'
      };
    }

    // 将TodoAction转换为Instruction格式
    const instruction: Instruction = {
      action: parsedAction.action,
      task: parsedAction.task
    };

    // 执行指令
    console.log('执行AI指令:', instruction);
    const result = executeInstruction(instruction);
    
    return result;
  }, [executeInstruction]);

  // 批量处理AI消息中的指令
  const processAIResponse = useCallback((aiMessage: string): ExecutionResult[] => {
    const results: ExecutionResult[] = [];
    
    // 查找所有JSON指令
    const jsonMatches = aiMessage.match(/\{[^}]*"action"[^}]*\}/g);
    
    if (jsonMatches) {
      jsonMatches.forEach((jsonStr, index) => {
        try {
          const parsed = JSON.parse(jsonStr);
          if (parsed.action && ['add', 'complete', 'delete', 'list', 'clear_completed', 'clear_all'].includes(parsed.action)) {
            const instruction: Instruction = {
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
  }, [executeInstruction]);

  return {
    parseAndExecuteMessage,
    processAIResponse
  };
} 