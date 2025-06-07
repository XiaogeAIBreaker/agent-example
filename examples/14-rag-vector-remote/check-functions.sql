-- 查看函数的详细信息
SELECT 
    routine_name,
    routine_type,
    data_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_name = 'match_todo_vector' 
AND routine_schema = 'public'; 