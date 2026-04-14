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
    setStudents(normalize(data ?? []));
    setLoading(false);
  }

  function normalize(data) {
    return data.map((s) => ({
      ...s,
      initials: s.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
      quizzes: (s.quizzes ?? []).map((q) => ({
        ...q,
        questions: (q.questions ?? [])
          .sort((a, b) => a.position - b.position)
          .map((q) => ({ ...q, options: q.options ?? [] })),
      })),
    }));
  }

  // ── Optimistic update helper ──────────────────────────
  function updateStudentLocal(studentId, updater) {
    setStudents((prev) =>
      prev.map((s) => s.id === studentId ? updater(s) : s)
    );
  }

  // ── Contents ──────────────────────────────────────────
  async function saveContent(studentId, content) {
    if (content.id) {
      // Optimistic update
      updateStudentLocal(studentId, (s) => ({
        ...s,
        contents: s.contents.map((c) => c.id === content.id ? content : c),
      }));
      await supabase.from('contents')
        .update({ type: content.type, title: content.title, body: content.body })
        .eq('id', content.id);
    } else {
      const { data, error } = await supabase.from('contents')
        .insert({ student_id: studentId, type: content.type, title: content.title, body: content.body })
        .select()
        .single();
      if (error) throw error;
      // Optimistic: add new content with real id
      updateStudentLocal(studentId, (s) => ({
        ...s,
        contents: [...s.contents, data],
      }));
    }
  }

  async function deleteContent(studentId, id) {
    updateStudentLocal(studentId, (s) => ({
      ...s,
      contents: s.contents.filter((c) => c.id !== id),
    }));
    await supabase.from('contents').delete().eq('id', id);
  }

  // ── Quizzes ───────────────────────────────────────────
  async function saveQuiz(studentId, quiz) {
    if (quiz.id) {
      await supabase.from('quizzes').update({ title: quiz.title }).eq('id', quiz.id);
      await supabase.from('questions').delete().eq('quiz_id', quiz.id);
      await insertQuestions(quiz.id, quiz.questions);
      updateStudentLocal(studentId, (s) => ({
        ...s,
        quizzes: s.quizzes.map((q) => q.id === quiz.id ? { ...quiz } : q),
      }));
    } else {
      const { data, error } = await supabase.from('quizzes')
        .insert({ student_id: studentId, title: quiz.title })
        .select()
        .single();
      if (error) throw error;
      await insertQuestions(data.id, quiz.questions);
      updateStudentLocal(studentId, (s) => ({
        ...s,
        quizzes: [...s.quizzes, { ...data, questions: quiz.questions }],
      }));
    }
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

  async function deleteQuiz(studentId, id) {
    updateStudentLocal(studentId, (s) => ({
      ...s,
      quizzes: s.quizzes.filter((q) => q.id !== id),
    }));
    await supabase.from('quizzes').delete().eq('id', id);
  }

  // ── Level ─────────────────────────────────────────────
  async function updateLevel(studentId, level) {
    updateStudentLocal(studentId, (s) => ({ ...s, level }));
    await supabase.from('profiles').update({ level }).eq('id', studentId);
  }

  return { students, loading, saveContent, deleteContent, saveQuiz, deleteQuiz, updateLevel, refetch: fetchStudents };
}