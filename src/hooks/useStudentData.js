import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useStudentData(studentId) {
  const [contents,         setContents]         = useState([]);
  const [quizzes,          setQuizzes]           = useState([]);
  const [tests,            setTests]             = useState([]);
  const [homeworkResults,  setHomeworkResults]   = useState([]);
  const [testResults,      setTestResults]       = useState([]);
  const [loading,          setLoading]           = useState(true);

  useEffect(() => { if (studentId) fetchAll(); }, [studentId]);

  async function fetchAll() {
    setLoading(true);
    const [
      { data: c },
      { data: q },
      { data: t },
      { data: hr },
      { data: tr },
    ] = await Promise.all([
      supabase.from('contents').select('*').eq('student_id', studentId).order('created_at'),
      supabase.from('quizzes').select('*, questions(*)').eq('student_id', studentId).order('created_at'),
      supabase.from('tests').select('*, test_questions(*)').eq('student_id', studentId).order('created_at'),
      supabase.from('homework_results').select('*').eq('student_id', studentId).order('completed_at', { ascending: false }),
      supabase.from('test_results').select('*').eq('student_id', studentId).order('completed_at', { ascending: false }),
    ]);

    setContents(c ?? []);
    setQuizzes((q ?? []).map((quiz) => ({
      ...quiz,
      questions: (quiz.questions ?? []).sort((a, b) => a.position - b.position).map((q) => ({ ...q, options: q.options ?? [] })),
    })));
    setTests((t ?? []).map((test) => ({
      ...test,
      questions: (test.test_questions ?? []).sort((a, b) => a.position - b.position).map((q) => ({ ...q, options: q.options ?? [] })),
    })));
    setHomeworkResults(hr ?? []);
    setTestResults(tr ?? []);
    setLoading(false);
  }

  async function saveHomeworkResult(quizId, score, total) {
    const { data } = await supabase.from('homework_results')
      .insert({ student_id: studentId, quiz_id: quizId, score, total })
      .select().single();
    if (data) setHomeworkResults((prev) => [data, ...prev]);
  }

  async function saveTestResult(testId, score, total) {
    const grade = parseFloat(((score / total) * 10).toFixed(1));
    const { data } = await supabase.from('test_results')
      .insert({ student_id: studentId, test_id: testId, score, total, grade })
      .select().single();
    if (data) setTestResults((prev) => [data, ...prev]);
  }

  function hasCompletedTest(testId) {
    return testResults.some((r) => r.test_id === testId);
  }

  function getTestResult(testId) {
    return testResults.find((r) => r.test_id === testId);
  }

  return {
    contents, quizzes, tests,
    homeworkResults, testResults,
    loading, refetch: fetchAll,
    saveHomeworkResult, saveTestResult,
    hasCompletedTest, getTestResult,
  };
}