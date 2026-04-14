import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useStudentData(studentId) {
  const [contents,  setContents]  = useState([]);
  const [quizzes,   setQuizzes]   = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    if (!studentId) return;
    fetchAll();
  }, [studentId]);

  async function fetchAll() {
    setLoading(true);
    const [{ data: c }, { data: q }] = await Promise.all([
      supabase.from('contents').select('*').eq('student_id', studentId).order('created_at'),
      supabase.from('quizzes').select('*, questions(*)').eq('student_id', studentId).order('created_at'),
    ]);
    setContents(c ?? []);
    setQuizzes((q ?? []).map((quiz) => ({
      ...quiz,
      questions: (quiz.questions ?? [])
        .sort((a, b) => a.position - b.position)
        .map((q) => ({ ...q, options: q.options ?? [], correct: q.correct })),
    })));
    setLoading(false);
  }

  return { contents, quizzes, loading, refetch: fetchAll };
}