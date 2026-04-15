import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useStudentData(studentId) {
  const cacheKey = studentId ? `ef_student_${studentId}` : null;
  const cached   = cacheKey ? (() => {
    try { return JSON.parse(localStorage.getItem(cacheKey) || 'null'); }
    catch { return null; }
  })() : null;

  const [contents,        setContents]        = useState(cached?.contents        ?? []);
  const [quizzes,         setQuizzes]         = useState(cached?.quizzes         ?? []);
  const [tests,           setTests]           = useState(cached?.tests           ?? []);
  const [homeworkResults, setHomeworkResults] = useState(cached?.homeworkResults ?? []);
  const [testResults,     setTestResults]     = useState(cached?.testResults     ?? []);
  const [loading,         setLoading]         = useState(!cached);

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

    const newContents = c ?? [];
    const newQuizzes  = (q ?? []).map((quiz) => ({
      ...quiz,
      questions: (quiz.questions ?? [])
        .sort((a, b) => a.position - b.position)
        .map((q) => ({ ...q, options: q.options ?? [] })),
    }));
    const newTests = (t ?? []).map((test) => ({
      ...test,
      questions: (test.test_questions ?? [])
        .sort((a, b) => a.position - b.position)
        .map((q) => ({ ...q, options: q.options ?? [] })),
    }));
    const newHw = hr ?? [];
    const newTr = tr ?? [];

    setContents(newContents);
    setQuizzes(newQuizzes);
    setTests(newTests);
    setHomeworkResults(newHw);
    setTestResults(newTr);
    setLoading(false);

    if (cacheKey) {
      localStorage.setItem(cacheKey, JSON.stringify({
        contents: newContents, quizzes: newQuizzes,
        tests: newTests, homeworkResults: newHw, testResults: newTr,
      }));
    }
  }

  async function saveHomeworkResult(quizId, score, total, answers = []) {
    const { data } = await supabase.from('homework_results')
      .insert({ student_id: studentId, quiz_id: quizId, score, total })
      .select().single();
    if (data) {
      setHomeworkResults((prev) => [data, ...prev]);
      if (answers.length > 0) {
        await supabase.from('result_answers').insert(
          answers.map((a) => ({ ...a, student_id: studentId, quiz_id: quizId }))
        );
      }
    }
  }

  async function saveTestResult(testId, score, total, answers = []) {
    const grade = parseFloat(((score / total) * 10).toFixed(1));
    const { data } = await supabase.from('test_results')
      .insert({ student_id: studentId, test_id: testId, score, total, grade })
      .select().single();
    if (data) {
      setTestResults((prev) => [data, ...prev]);
      if (answers.length > 0) {
        await supabase.from('result_answers').insert(
          answers.map((a) => ({ ...a, student_id: studentId, test_id: testId }))
        );
      }
    }
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