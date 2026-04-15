import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useTeacherData() {
  const CACHE_KEY = 'ef_teacher_students';
  const cached    = (() => { try { return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null'); } catch { return null; } })();

  const [students, setStudents] = useState(cached ?? []);
  const [loading,  setLoading]  = useState(!cached);

  useEffect(() => { fetchStudents(); }, []);

  async function fetchStudents() {
    setLoading(true);
    const { data } = await supabase
      .from('profiles')
      .select(`
        *,
        contents(*),
        quizzes(*, questions(*)),
        tests(*, test_questions(*)),
        homework_results(*),
        test_results(*)
      `)
      .eq('role', 'student')
      .order('name');
    const normalized = normalize(data ?? []);
    setStudents(normalized);
    setLoading(false);
    localStorage.setItem(CACHE_KEY, JSON.stringify(normalized));
  }

  function normalize(data) {
    return data.map((s) => ({
      ...s,
      initials: s.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
      quizzes: (s.quizzes ?? []).map((q) => ({
        ...q,
        questions: (q.questions ?? []).sort((a, b) => a.position - b.position).map((q) => ({ ...q, options: q.options ?? [] })),
      })),
      tests: (s.tests ?? []).map((t) => ({
        ...t,
        questions: (t.test_questions ?? []).sort((a, b) => a.position - b.position).map((q) => ({ ...q, options: q.options ?? [] })),
      })),
    }));
  }

  function updateStudentLocal(studentId, updater) {
    setStudents((prev) => prev.map((s) => s.id === studentId ? updater(s) : s));
  }

  // ── Contents ──────────────────────────────────────────
  async function saveContent(studentId, content) {
    if (content.id) {
      updateStudentLocal(studentId, (s) => ({
        ...s, contents: s.contents.map((c) => c.id === content.id ? content : c),
      }));
      await supabase.from('contents')
        .update({ type: content.type, title: content.title, body: content.body })
        .eq('id', content.id);
    } else {
      const { data, error } = await supabase.from('contents')
        .insert({ student_id: studentId, type: content.type, title: content.title, body: content.body })
        .select().single();
      if (error) throw error;
      updateStudentLocal(studentId, (s) => ({ ...s, contents: [...s.contents, data] }));
    }
  }

  async function deleteContent(studentId, id) {
    updateStudentLocal(studentId, (s) => ({ ...s, contents: s.contents.filter((c) => c.id !== id) }));
    await supabase.from('contents').delete().eq('id', id);
  }

  // ── Homework (quizzes) ────────────────────────────────
  async function saveQuiz(studentId, quiz) {
    if (quiz.id) {
      await supabase.from('quizzes').update({ title: quiz.title }).eq('id', quiz.id);
      await supabase.from('questions').delete().eq('quiz_id', quiz.id);
      await insertQuestions('questions', 'quiz_id', quiz.id, quiz.questions);
      updateStudentLocal(studentId, (s) => ({
        ...s, quizzes: s.quizzes.map((q) => q.id === quiz.id ? { ...quiz } : q),
      }));
    } else {
      const { data, error } = await supabase.from('quizzes')
        .insert({ student_id: studentId, title: quiz.title }).select().single();
      if (error) throw error;
      await insertQuestions('questions', 'quiz_id', data.id, quiz.questions);
      updateStudentLocal(studentId, (s) => ({
        ...s, quizzes: [...s.quizzes, { ...data, questions: quiz.questions }],
      }));
    }
  }

  async function deleteQuiz(studentId, id) {
    updateStudentLocal(studentId, (s) => ({ ...s, quizzes: s.quizzes.filter((q) => q.id !== id) }));
    await supabase.from('quizzes').delete().eq('id', id);
  }

  // ── Tests ─────────────────────────────────────────────
  async function saveTest(studentId, test) {
    if (test.id) {
      await supabase.from('tests').update({ title: test.title }).eq('id', test.id);
      await supabase.from('test_questions').delete().eq('test_id', test.id);
      await insertQuestions('test_questions', 'test_id', test.id, test.questions);
      updateStudentLocal(studentId, (s) => ({
        ...s, tests: s.tests.map((t) => t.id === test.id ? { ...test } : t),
      }));
    } else {
      const { data, error } = await supabase.from('tests')
        .insert({ student_id: studentId, title: test.title }).select().single();
      if (error) throw error;
      await insertQuestions('test_questions', 'test_id', data.id, test.questions);
      updateStudentLocal(studentId, (s) => ({
        ...s, tests: [...(s.tests ?? []), { ...data, questions: test.questions }],
      }));
    }
  }

  async function deleteTest(studentId, id) {
    updateStudentLocal(studentId, (s) => ({ ...s, tests: s.tests.filter((t) => t.id !== id) }));
    await supabase.from('tests').delete().eq('id', id);
  }

  // ── Shared helpers ────────────────────────────────────
  async function insertQuestions(table, fkField, parentId, questions) {
    const rows = questions.map((q, i) => ({
      [fkField]:   parentId,
      type:        q.type,
      prompt:      q.prompt,
      options:     q.options,
      correct:     q.correct,
      explanation: q.explanation ?? '',
      position:    i,
    }));
    await supabase.from(table).insert(rows);
  }

  async function updateLevel(studentId, level) {
    updateStudentLocal(studentId, (s) => ({ ...s, level }));
    await supabase.from('profiles').update({ level }).eq('id', studentId);
  }

  return {
    students, loading,
    saveContent, deleteContent,
    saveQuiz, deleteQuiz,
    saveTest, deleteTest,
    updateLevel,
    refetch: fetchStudents,
  };
}