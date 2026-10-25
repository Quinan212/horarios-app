/* Transcripción de HISTORIA 2026 Horarios.xlsx, actualizado el 19/10/2026.\n * Los docentes se omiten deliberadamente. Conservamos las divergencias entre comisiones.\n */
const RAW = {
  "1-1": [
    [
      "Pueblos originarios",
      ".",
      ".",
      "Pedagogía",
      "Conocimiento histórico"
    ],
    [
      "Pueblos originarios",
      ".",
      ".",
      "Pedagogía",
      "Conocimiento histórico"
    ],
    [
      "Pueblos originarios",
      "Antigüedad",
      "Historia de las ideas I",
      "Pedagogía",
      "Didáctica general"
    ],
    [
      "Corporeidad y lenguajes artísticos",
      "Antigüedad",
      "Historia de las ideas I",
      ".",
      "Didáctica general"
    ],
    [
      "Corporeidad y lenguajes artísticos",
      "Conocimiento histórico",
      "Práctica docente II",
      "Antigüedad",
      "Oralidad, lectura, escritura y TIC"
    ],
    [
      ".",
      "Conocimiento histórico",
      "Práctica docente II",
      "Antigüedad",
      "Oralidad, lectura, escritura y TIC"
    ]
  ],
  "1-2": [
    [
      ".",
      "Práctica docente II",
      "Pueblos originarios",
      "Corporeidad y lenguajes artísticos",
      "Antigüedad"
    ],
    [
      "Pedagogía",
      "Práctica docente II",
      "Pueblos originarios",
      "Corporeidad y lenguajes artísticos",
      "Antigüedad"
    ],
    [
      "Conocimiento histórico",
      "Antigüedad",
      "Pedagogía",
      "Conocimiento histórico",
      "Oralidad, lectura, escritura y TIC"
    ],
    [
      "Conocimiento histórico",
      "Antigüedad",
      "Pedagogía",
      "Conocimiento histórico",
      "Oralidad, lectura, escritura y TIC"
    ],
    [
      "Pueblos originarios",
      "Didáctica general",
      ".",
      "Historia de las ideas I",
      "."
    ],
    [
      "Pueblos originarios",
      "Didáctica general",
      ".",
      "Historia de las ideas I",
      "."
    ]
  ],
  "2-1": [
    [
      "Feudalismo y modernidad",
      "Historia de las ideas II",
      "Didáctica de las ciencias sociales",
      "Americanos I",
      "Filosofía"
    ],
    [
      "Feudalismo y modernidad",
      "Práctica docente II",
      "Didáctica de las ciencias sociales",
      "Americanos I",
      "Filosofía"
    ],
    [
      "Economía política",
      "Práctica docente II",
      "Sujetos de la educación secundaria",
      "Educación sexual integral",
      "Mundo y nuevas territorialidades"
    ],
    [
      "Economía política",
      "Psicología educacional",
      "Sujetos de la educación secundaria",
      "Educación sexual integral",
      "Mundo y nuevas territorialidades"
    ],
    [
      "Historia de las ideas II",
      "Psicología educacional",
      ".",
      ".",
      "Feudalismo y modernidad"
    ],
    [
      "Historia de las ideas II",
      "Psicología educacional",
      ".",
      ".",
      "Feudalismo y modernidad"
    ]
  ],
  "2-2": [
    [
      "Mundo y nuevas territorialidades",
      "Americanos I",
      "Filosofía",
      "Historia de las ideas II",
      "Práctica docente II"
    ],
    [
      "Mundo y nuevas territorialidades",
      "Americanos I",
      "Filosofía",
      "Historia de las ideas II",
      "Práctica docente II"
    ],
    [
      "Mundo y nuevas territorialidades",
      "Didáctica de las ciencias sociales",
      "Feudalismo y modernidad",
      "Sujetos de la educación secundaria",
      "Feudalismo y modernidad"
    ],
    [
      "Psicología educacional",
      "Didáctica de las ciencias sociales",
      "Feudalismo y modernidad",
      "Sujetos de la educación secundaria",
      "Feudalismo y modernidad"
    ],
    [
      "Psicología educacional",
      ".",
      "Economía política",
      ".",
      "Educación sexual integral"
    ],
    [
      "Psicología educacional",
      ".",
      "Economía política",
      ".",
      "Educación sexual integral"
    ]
  ],
  "3-1": [
    [
      ".",
      "UDI I",
      ".",
      ".",
      "Análisis institucional"
    ],
    [
      "Argentinos I",
      "UDI I",
      "Contemporáneos I",
      "UDI I",
      "Análisis institucional"
    ],
    [
      "Práctica docente III",
      "Americanos II",
      "Historia de la educación argentina",
      "Didáctica de la historia",
      "Epistemología de la historia"
    ],
    [
      "Práctica docente III",
      "Americanos II",
      "Historia de la educación argentina",
      "Didáctica de la historia",
      "Epistemología de la historia"
    ],
    [
      "Argentinos I",
      "Americanos II",
      "Contemporáneos I",
      "Sociología de la educación",
      "Epistemología de la historia"
    ],
    [
      "Argentinos I",
      ".",
      "Contemporáneos I",
      "Sociología de la educación",
      "."
    ]
  ],
  "3-2": [
    [
      "UDI I",
      "Americanos II",
      "Historia de la educación argentina",
      "Análisis institucional",
      "Argentinos I"
    ],
    [
      "UDI I",
      ".",
      "Historia de la educación argentina",
      "Análisis institucional",
      "Argentinos I"
    ],
    [
      "Contemporáneos I",
      "Didáctica de la historia",
      "UDI I",
      "Contemporáneos I",
      "Americanos II"
    ],
    [
      "Contemporáneos I",
      "Didáctica de la historia",
      "Sociología de la educación",
      "Argentinos I",
      "Americanos II"
    ],
    [
      "Práctica docente III",
      "Epistemología de la historia",
      "Sociología de la educación",
      ".",
      "."
    ],
    [
      "Práctica docente III",
      "Epistemología de la historia",
      ".",
      ".",
      "."
    ]
  ],
  "4-1": [
    [
      "Práctica docente IV",
      "UDI II",
      "Práctica docente IV",
      "Americanos III",
      "."
    ],
    [
      "Práctica docente IV",
      "Argentinos II",
      "Práctica docente IV",
      "Americanos III",
      "."
    ],
    [
      "Problemáticas regionales y locales",
      "Argentinos II",
      "Contemporáneos III",
      "Americanos III",
      "."
    ],
    [
      "Problemáticas regionales y locales",
      "Argentinos II",
      "Contemporáneos III",
      "Derechos humanos y ciudadanía",
      "."
    ],
    [
      "UDI II",
      "Argentinos II",
      "Contemporáneos III",
      ".",
      "."
    ],
    [
      "UDI II",
      "Problemáticas regionales y locales",
      "Derechos humanos y ciudadanía",
      ".",
      "."
    ]
  ],
  "4-2": [
    [
      "UDI II",
      ".",
      "Argentinos II",
      "Contemporáneos II",
      "."
    ],
    [
      "UDI II",
      "Práctica docente IV",
      "Argentinos II",
      "Contemporáneos II",
      "."
    ],
    [
      "UDI II",
      "Práctica docente IV",
      "Práctica docente IV",
      "Contemporáneos II",
      "."
    ],
    [
      "Argentinos II",
      "Americanos III",
      "Práctica docente IV",
      "Derechos humanos y ciudadanía",
      "."
    ],
    [
      "Derechos humanos y ciudadanía",
      "Americanos III",
      "Problemáticas regionales y locales",
      ".",
      "."
    ],
    [
      "Derechos humanos y ciudadanía",
      "Americanos III",
      "Problemáticas regionales y locales",
      ".",
      "."
    ]
  ]
};
const SLOTS = [['18:30','19:10'],['19:10','19:40'],['19:50','20:20'],['20:20','21:00'],['21:10','21:50'],['21:50','22:20']];
const DAYS = ['Lunes','Martes','Miércoles','Jueves','Viernes'];
const BASE = Object.entries(RAW).flatMap(([key,rows])=>{let [year,commission]=key.split('-').map(Number);return rows.flatMap((columns,slot)=>columns.flatMap((name,day)=>name==='.'?[]:[{id:`${key}-${day}-${slot}`,year,commission,day,slot,name}]));});
