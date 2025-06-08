/**
 * 系统诊断脚本 - RAG+LangChain架构诊断
 * 
 * 这个脚本用于全面诊断RAG+LangChain智能代理系统的健康状况：
 * - 检查环境配置和依赖
 * - 验证各个组件的工作状态
 * - 测试完整的处理流程
 * - 提供性能和可用性报告
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// ES模块路径处理
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 加载环境变量
dotenv.config({ path: join(__dirname, '../.env.local') });

/**
 * 诊断结果收集器
 */
class DiagnosisCollector {
  constructor() {
    this.results = {
      environment: {},
      dependencies: {},
      services: {},
      performance: {},
      errors: []
    };
  }

  addResult(category, name, status, details = null, error = null) {
    this.results[category][name] = {
      status,
      details,
      error: error?.message || error,
      timestamp: new Date().toISOString()
    };

    if (error) {
      this.results.errors.push(`${category}.${name}: ${error?.message || error}`);
    }
  }

  getOverallStatus() {
    const allTests = Object.values(this.results).flatMap(category => 
      typeof category === 'object' && !Array.isArray(category) 
        ? Object.values(category) 
        : []
    );
    
    const passed = allTests.filter(test => test.status === 'pass').length;
    const failed = allTests.filter(test => test.status === 'fail').length;
    const warnings = allTests.filter(test => test.status === 'warning').length;
    
    return { passed, failed, warnings, total: allTests.length };
  }

  generateReport() {
    const status = this.getOverallStatus();
    
    console.log('\n' + '='.repeat(60));
    console.log('🔍 系统诊断报告');
    console.log('='.repeat(60));
    
    console.log(`📊 总体状况: ${status.passed}/${status.total} 通过`);
    if (status.failed > 0) console.log(`❌ 失败: ${status.failed}`);
    if (status.warnings > 0) console.log(`⚠️ 警告: ${status.warnings}`);
    
    // 详细结果
    for (const [category, tests] of Object.entries(this.results)) {
      if (typeof tests !== 'object' || Array.isArray(tests)) continue;
      
      console.log(`\n📋 ${category.toUpperCase()}:`);
      for (const [name, result] of Object.entries(tests)) {
        const icon = result.status === 'pass' ? '✅' : result.status === 'fail' ? '❌' : '⚠️';
        console.log(`  ${icon} ${name}: ${result.details || result.status}`);
        if (result.error) {
          console.log(`     错误: ${result.error}`);
        }
      }
    }
    
    // 错误总结
    if (this.results.errors.length > 0) {
      console.log('\n❌ 错误总结:');
      this.results.errors.forEach((error, i) => {
        console.log(`  ${i + 1}. ${error}`);
      });
    }
    
    // 建议
    this.generateRecommendations(status);
  }

  generateRecommendations(status) {
    console.log('\n💡 建议:');
    
    if (status.failed === 0 && status.warnings === 0) {
      console.log('  🎉 系统运行良好，所有组件正常工作！');
    } else {
      if (status.failed > 0) {
        console.log('  🔧 请优先修复失败的组件');
      }
      if (status.warnings > 0) {
        console.log('  ⚠️ 注意警告项，可能影响性能');
      }
      console.log('  📚 查看详细错误信息并参考文档进行修复');
    }
  }
}

/**
 * 环境配置检查
 */
async function checkEnvironment(collector) {
  console.log('🔧 检查环境配置...');
  
  // 检查Node.js版本
  const nodeVersion = process.version;
  const nodeMajor = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (nodeMajor >= 18) {
    collector.addResult('environment', 'nodejs_version', 'pass', `Node.js ${nodeVersion}`);
  } else {
    collector.addResult('environment', 'nodejs_version', 'fail', `Node.js ${nodeVersion}`, 'Node.js 18+ required');
  }
  
  // 检查环境变量
  const requiredEnvs = ['DEEPSEEK_API_KEY', 'SUPABASE_URL', 'SUPABASE_KEY'];
  for (const env of requiredEnvs) {
    if (process.env[env]) {
      collector.addResult('environment', env, 'pass', '已配置');
    } else {
      collector.addResult('environment', env, 'fail', '未配置', `Missing ${env}`);
    }
  }
  
  // 检查.env.local文件
  const envFile = join(__dirname, '../.env.local');
  if (fs.existsSync(envFile)) {
    collector.addResult('environment', 'env_file', 'pass', '.env.local存在');
  } else {
    collector.addResult('environment', 'env_file', 'warning', '.env.local不存在', 'Consider creating .env.local');
  }
}

/**
 * 依赖检查
 */
async function checkDependencies(collector) {
  console.log('📦 检查依赖包...');
  
  const criticalDeps = [
    '@tensorflow/tfjs-node',
    '@tensorflow-models/universal-sentence-encoder',
    'langchain',
    '@supabase/supabase-js',
    'ai',
    '@ai-sdk/deepseek'
  ];
  
  const packageJsonPath = join(__dirname, '../package.json');
  
  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
    const allDeps = { ...packageJson.dependencies, ...packageJson.devDependencies };
    
    for (const dep of criticalDeps) {
      if (allDeps[dep]) {
        try {
          // 尝试导入依赖
          await import(dep);
          collector.addResult('dependencies', dep, 'pass', `版本 ${allDeps[dep]}`);
        } catch (error) {
          collector.addResult('dependencies', dep, 'fail', '导入失败', error);
        }
      } else {
        collector.addResult('dependencies', dep, 'fail', '未安装', `${dep} not found in package.json`);
      }
    }
  } catch (error) {
    collector.addResult('dependencies', 'package_json', 'fail', '读取失败', error);
  }
}

/**
 * TensorFlow向量化服务检查
 */
async function checkVectorService(collector) {
  console.log('🤖 检查向量化服务...');
  
  try {
    // 检查TensorFlow后端
    const tf = await import('@tensorflow/tfjs-node');
    collector.addResult('services', 'tensorflow_backend', 'pass', 'TensorFlow后端可用');
    
    // 检查Universal Sentence Encoder
    const use = await import('@tensorflow-models/universal-sentence-encoder');
    const model = await use.load();
    collector.addResult('services', 'use_model', 'pass', '模型加载成功');
    
    // 测试向量化
    const testText = '测试向量化功能';
    const embeddings = await model.embed([testText]);
    const vector = Array.from(await embeddings.data());
    
    if (vector.length >= 384) {
      collector.addResult('services', 'vectorization', 'pass', `生成${vector.length}维向量`);
    } else {
      collector.addResult('services', 'vectorization', 'warning', `向量维度${vector.length}`, 'Vector dimension may be insufficient');
    }
    
  } catch (error) {
    collector.addResult('services', 'vector_service', 'fail', '向量化服务不可用', error);
  }
}

/**
 * Supabase连接检查
 */
async function checkSupabase(collector) {
  console.log('🗄️ 检查Supabase连接...');
  
  try {
    const { createClient } = await import('@supabase/supabase-js');
    
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
      collector.addResult('services', 'supabase_config', 'fail', '配置缺失', 'Missing Supabase credentials');
      return;
    }
    
    const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
    
    // 测试连接
    const { data, error } = await supabase.from('knowledge_vectors').select('*', { count: 'exact', head: true });
    
    if (error) {
      collector.addResult('services', 'supabase_connection', 'fail', '连接失败', error);
    } else {
      collector.addResult('services', 'supabase_connection', 'pass', '连接成功');
      
      // 检查knowledge_vectors表
      if (data !== null) {
        collector.addResult('services', 'knowledge_table', 'pass', '数据表可访问');
      } else {
        collector.addResult('services', 'knowledge_table', 'warning', '数据表为空或不存在', 'Table may not exist');
      }
    }
    
  } catch (error) {
    collector.addResult('services', 'supabase_import', 'fail', '导入失败', error);
  }
}

/**
 * DeepSeek API检查
 */
async function checkDeepSeekAPI(collector) {
  console.log('🤖 检查DeepSeek API...');
  
  try {
    if (!process.env.DEEPSEEK_API_KEY) {
      collector.addResult('services', 'deepseek_config', 'fail', 'API密钥未配置', 'Missing DEEPSEEK_API_KEY');
      return;
    }
    
    const { createDeepSeek } = await import('@ai-sdk/deepseek');
    const deepseek = createDeepSeek({ apiKey: process.env.DEEPSEEK_API_KEY });
    
    collector.addResult('services', 'deepseek_init', 'pass', 'DeepSeek客户端初始化成功');
    
    // 注意：这里不进行实际API调用以避免费用，只检查初始化
    collector.addResult('services', 'deepseek_api', 'warning', '未测试实际API调用', 'Skipped to avoid charges');
    
  } catch (error) {
    collector.addResult('services', 'deepseek_import', 'fail', '导入失败', error);
  }
}

/**
 * LangChain组件检查
 */
async function checkLangChainComponents(collector) {
  console.log('🔗 检查LangChain组件...');
  
  try {
    // 检查LangChain核心
    await import('langchain/chains');
    collector.addResult('services', 'langchain_core', 'pass', 'LangChain核心可用');
    
    // 检查项目组件
    const componentsToCheck = [
      '../app/lib/langchain/agent/AgentManager.ts',
      '../app/lib/langchain/chains/TaskChain.ts',
      '../app/lib/langchain/memory/ConversationManager.ts',
      '../app/lib/langchain/prompts/PromptTemplates.ts'
    ];
    
    for (const component of componentsToCheck) {
      const fullPath = join(__dirname, component);
      if (fs.existsSync(fullPath)) {
        collector.addResult('services', `component_${path.basename(component, '.ts')}`, 'pass', '组件文件存在');
      } else {
        collector.addResult('services', `component_${path.basename(component, '.ts')}`, 'fail', '组件文件缺失', `File not found: ${component}`);
      }
    }
    
  } catch (error) {
    collector.addResult('services', 'langchain_import', 'fail', 'LangChain导入失败', error);
  }
}

/**
 * 性能基准测试
 */
async function performanceBenchmark(collector) {
  console.log('⚡ 执行性能基准测试...');
  
  try {
    // 向量化性能测试
    const tf = await import('@tensorflow/tfjs-node');
    const use = await import('@tensorflow-models/universal-sentence-encoder');
    
    const model = await use.load();
    const testText = '这是一个性能测试文本，用来测量向量化的速度和效率。';
    
    const iterations = 5;
    const times = [];
    
    for (let i = 0; i < iterations; i++) {
      const start = Date.now();
      await model.embed([testText]);
      times.push(Date.now() - start);
    }
    
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    
    if (avgTime < 1000) {
      collector.addResult('performance', 'vectorization_speed', 'pass', `平均${avgTime.toFixed(1)}ms`);
    } else if (avgTime < 3000) {
      collector.addResult('performance', 'vectorization_speed', 'warning', `平均${avgTime.toFixed(1)}ms`, 'Vectorization is slow');
    } else {
      collector.addResult('performance', 'vectorization_speed', 'fail', `平均${avgTime.toFixed(1)}ms`, 'Vectorization is too slow');
    }
    
    collector.addResult('performance', 'vectorization_consistency', 'pass', 
      `范围${minTime}-${maxTime}ms (差异${maxTime - minTime}ms)`);
    
  } catch (error) {
    collector.addResult('performance', 'vectorization_benchmark', 'fail', '性能测试失败', error);
  }
}

/**
 * 系统文件检查
 */
async function checkSystemFiles(collector) {
  console.log('📁 检查系统文件...');
  
  const criticalFiles = [
    '../app/api/chat/route.ts',
    '../app/page.tsx',
    '../next.config.js',
    '../package.json',
    '../data/knowledge-base.json'
  ];
  
  for (const file of criticalFiles) {
    const fullPath = join(__dirname, file);
    const fileName = path.basename(file);
    
    if (fs.existsSync(fullPath)) {
      const stats = fs.statSync(fullPath);
      collector.addResult('environment', `file_${fileName}`, 'pass', `${Math.round(stats.size / 1024)}KB`);
    } else {
      const isOptional = file.includes('knowledge-base.json');
      collector.addResult('environment', `file_${fileName}`, isOptional ? 'warning' : 'fail', 
        '文件不存在', `Missing ${fileName}`);
    }
  }
}

/**
 * 主诊断流程
 */
async function runSystemDiagnosis() {
  console.log('🔍 RAG+LangChain 系统诊断开始...\n');
  
  const collector = new DiagnosisCollector();
  
  try {
    await checkEnvironment(collector);
    await checkSystemFiles(collector);
    await checkDependencies(collector);
    await checkVectorService(collector);
    await checkSupabase(collector);
    await checkDeepSeekAPI(collector);
    await checkLangChainComponents(collector);
    await performanceBenchmark(collector);
    
    collector.generateReport();
    
  } catch (error) {
    console.error('❌ 诊断过程失败:', error);
    collector.addResult('environment', 'diagnosis_process', 'fail', '诊断失败', error);
    collector.generateReport();
  }
}

/**
 * 错误处理
 */
process.on('unhandledRejection', (error) => {
  console.error('❌ 未处理的Promise拒绝:', error);
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log('\n⚠️ 用户中断诊断');
  process.exit(0);
});

// 执行系统诊断
runSystemDiagnosis(); 