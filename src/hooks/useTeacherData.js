import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useTeacherData() {
  const [students, setStudents] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { fetchStudents(); }, []);

  async function fetchStudents() {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select('*, contents(*), quizzes(*, questions(*))')
      .eq('role', 'student')
      .order('name');
    setStudents((data ?? []).map((s) => ({
      ...s,
      initials: s.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
      quizzes: (s.quizzes ?? []).map((q) => ({
        ...q,
        questions: (q.questions ?? [])
          .sort((a, b) => a.position - b.position)
          .map((q) => ({ ...q, options: q.options ?? [] })),
      })),
    })));
    setLoading(false);
  }

  // ── Contents ──────────────────────────────────────────
  async function saveContent(studentId, content) {
    if (content.id) {
      const { error } = await supabase
        .from('contents')
        .update({ type: content.type, title: content.title, body: content.body })
        .eq('id', content.id);
      if (error) throw error;
    } else {
      const { error } = await supabase
        .from('contents')
        .insert({ student_id: studentId, type: content.type, title: content.title, body: content.body });
      if (error) throw error;
    }
    await fetchStudents();
  }

  async function deleteContent(id) {
    await supabase.from('contents').delete().eq('id', id);
    await fetchStudents();
  }

  // ── Quizzes ───────────────────────────────────────────
  async function saveQuiz(studentId, quiz) {
    if (quiz.id) {
      // Update quiz title
      await supabase.from('quizzes').update({ title: quiz.title }).eq('id', quiz.id);
      // Delete old questions and re-insert
      await supabase.from('questions').delete().eq('quiz_id', quiz.id);
      await insertQuestions(quiz.id, quiz.questions);
    } else {
      const { data, error } = await supabase
        .from('quizzes')
        .insert({ student_id: studentId, title: quiz.title })
        .select()
        .single();
      if (error) throw error;
      await insertQuestions(data.id, quiz.questions);
    }
    await fetchStudents();
  }

  async function insertQuestions(quizId, questions) {
    const rows = questions.map((q, i) => ({
      quiz_id:     quizId,
      type:        q.type,
      prompt:      q.prompt,
      options:     q.options,
      correct:     q.correct,
      explanation: q.explanation ?? '',
      position:    i,
    }));
    await supabase.from('questions').insert(rows);
  }

  async function deleteQuiz(id) {
    await supabase.from('quizzes').delete().eq('id', id);
    await fetchStudents();
  }

  // ── Level ─────────────────────────────────────────────
  async function updateLevel(studentId, level) {
    await supabase.from('profiles').update({ level }).eq('id', studentId);
    await fetchStudents();
  }

  return { students, loading, saveContent, deleteContent, saveQuiz, deleteQuiz, updateLevel, refetch: fetchStudents };
}