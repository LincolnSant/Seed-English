export const STUDENTS = [
  {
    id: 1,
    name: 'Ana Martins',
    initials: 'AM',
    email: 'ana@demo.com',
    level: 'Intermediário',
    contents: [
      {
        id: 101,
        type: 'text',
        title: 'Present Perfect — quando usar?',
        body: 'O Present Perfect é usado para falar de experiências de vida, ações que acabaram de acontecer ou ações que começaram no passado e continuam no presente. Ex: "I have visited Paris twice."',
      },
      {
        id: 102,
        type: 'music',
        title: 'Yesterday — The Beatles (análise)',
        body: 'A música "Yesterday" usa o Simple Past para falar de algo que aconteceu no passado. "Yesterday, all my troubles seemed so far away." Perceba o uso do "seemed" — passado simples de "seem".',
      },
    ],
    quizzes: [
      {
        id: 201,
        title: 'Quiz — Present Perfect',
        questions: [
          {
            type: 'multiple-choice',
            prompt: 'She ___ to London twice this year.',
            options: ['went', 'has been', 'goes', 'had gone'],
            correct: 1,
            explanation: 'Usamos o Present Perfect para falar de experiências até o momento presente. "Has been" é a forma correta aqui.',
          },
          {
            type: 'true-false',
            prompt: '"I have saw that movie" é uma frase correta em inglês.',
            options: ['Verdadeiro', 'Falso'],
            correct: 1,
            explanation: 'A frase está errada. O correto é "I have seen that movie" — o particípio passado de "see" é "seen", não "saw".',
          },
        ],
      },
    ],
  },
  {
    id: 2,
    name: 'Bruno Costa',
    initials: 'BC',
    email: 'bruno@demo.com',
    level: 'Básico',
    contents: [
      {
        id: 103,
        type: 'text',
        title: 'Verb To Be — presente',
        body: 'O verbo "to be" no presente tem três formas: am (I), is (he/she/it) e are (you/we/they). Ex: "I am a student." / "She is a teacher."',
      },
    ],
    quizzes: [],
  },
  {
    id: 3,
    name: 'Carla Souza',
    initials: 'CS',
    email: 'carla@demo.com',
    level: 'Avançado',
    contents: [
      {
        id: 104,
        type: 'history',
        title: 'A história do inglês moderno',
        body: 'O inglês moderno surgiu após a invasão normanda em 1066, que misturou o anglo-saxônico com o francês medieval. Isso explica por que o inglês tem tantos sinônimos de origens diferentes.',
      },
      {
        id: 105,
        type: 'video',
        title: 'Subjunctive Mood explicado',
        body: 'https://www.youtube.com/watch?v=example',
      },
    ],
    quizzes: [
      {
        id: 202,
        title: 'Quiz — Subjunctive',
        questions: [
          {
            type: 'fill-blank',
            prompt: 'I suggest that he ___ (study) harder.',
            options: [],
            correct: 'study',
            explanation: 'No subjuntivo, usamos a forma base do verbo sem o "s" da terceira pessoa. O correto é "study", não "studies".',
          },
        ],
      },
    ],
  },
  {
    id: 4,
    name: 'Diego Lima',
    initials: 'DL',
    email: 'diego@demo.com',
    level: 'Intermediário',
    contents: [],
    quizzes: [],
  },
];