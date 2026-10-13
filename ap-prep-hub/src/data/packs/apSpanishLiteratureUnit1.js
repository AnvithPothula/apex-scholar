/**
 * AP Spanish Literature and Culture Unit 1: La época medieval — study pack.
 *
 * Written against the AP Spanish Literature and Culture CED effective Fall
 * 2023 (the current edition). Covers the unit's two required works, Don Juan
 * Manuel's Conde Lucanor, Exemplo XXXV, and the anonymous "Romance de la
 * pérdida de Alhama", with their CED themes, comparative works and literary
 * terms. Both works are medieval and public domain; quotations are short.
 * Written mainly in Spanish (the exam is entirely in Spanish) with English
 * glosses. The CED gives no unit weighting. Activity: a literary-terms sort.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const pack = {
  slug: 'ap-spanish-literature-and-culture/unit-1',
  subject: 'AP Spanish Literature and Culture',
  unit: 'Unit 1: La época medieval',
  examWeight: 'no unit weighting (works from every unit can appear)',
  intro:
    'La Edad Media en la Península Ibérica: cristianos, musulmanes y judíos en contacto, la Reconquista y una literatura que circulaba ' +
    'sobre todo de forma oral. Dos obras obligatorias: el Exemplo XXXV de El conde Lucanor y el "Romance de la pérdida de Alhama". ' +
    '(Medieval Iberia and the unit\'s two required works, taught mostly in Spanish with English help.)',
  sections: [
    {
      id: 'Contexto',
      ced: 'Unit 1 overview; 2.A, 2.B',
      title: 'El contexto de la época medieval',
      minutes: 6,
      summary:
        'La literatura medieval refleja una península donde convivían y chocaban cristianos, musulmanes y judíos, durante la Reconquista ' +
        '(718–1492). Pocos sabían leer, así que juglares y trovadores difundían noticias y relatos en verso. El castellano medieval es muy ' +
        'distinto del actual. Para cada obra hay que saber explicar temas, términos literarios, género, período y contexto.',
      body: String.raw`### Preguntas esenciales del CED
- ¿Cómo se representan las diversas culturas y religiones de la época en las obras literarias?
- ¿De qué manera la perspectiva o el punto de vista afecta la representación de eventos históricos?
- ¿Qué aspectos de la literatura medieval todavía se reflejan en la literatura y la vida de hoy en día?

### El contexto
| Elemento | Qué significa |
|---|---|
| **Al-Ándalus** | Territorio de la península bajo dominio musulmán desde 711 |
| **La Reconquista** | Avance de los reinos cristianos hacia el sur, que termina con la toma de **Granada en 1492** |
| **Sociedades en contacto** | Cristianos, musulmanes y judíos convivían, comerciaban y se enfrentaban; esto aparece en los textos |
| **Tradición oral** | Pocos sabían leer: **juglares** y **trovadores** iban de pueblo en pueblo cantando noticias y relatos épicos |
| **El castellano medieval** | Ortografía y formas antiguas (*non* = no, *fasta* = hasta, *cient* = cien) |

(English: medieval Iberia mixed Christian, Muslim and Jewish cultures during the Reconquest, which ended with the fall of Granada in 1492; most literature circulated orally through minstrels.)

### Las cinco tareas para cada obra
Al final del curso debes poder, para cada obra obligatoria:
1. Explicar sus **temas** y compararlos con otros.
2. Identificar **términos literarios** y analizar su efecto.
3. Definir las características de su **género**.
4. Examinar cómo refleja su **período o movimiento**.
5. Comentar los **contextos** que influyeron en su creación.

En esta primera unidad, lo esencial es **comprender**: resumir y parafrasear (personajes, escenario, trama).`,
      blocks: [],
      precheck: {
        question: '¿Por qué floreció la tradición oral en la época medieval?',
        choices: [
          'Porque pocas personas sabían leer.',
          'Porque estaba prohibido escribir en castellano.',
          'Porque la imprenta producía demasiados libros.',
          'Porque los juglares no sabían cantar.',
        ],
        answer: 0,
        explanations: [
          'Correct. Con poca alfabetización, los juglares difundían las historias cantando. (Few could read.)',
          'Incorrect. Se escribía en castellano, por ejemplo El conde Lucanor.',
          'Incorrect. La imprenta llega a España a finales del siglo XV.',
          'Incorrect. Los juglares cantaban y recitaban.',
        ],
      },
      checkpoints: [
        {
          question: '¿Con qué acontecimiento termina la Reconquista?',
          choices: ['La toma de Granada en 1492', 'La llegada de los musulmanes en 711', 'La pérdida de Alhama en 1482', 'La publicación de El conde Lucanor'],
          answer: 0,
          explanations: [
            'Correct. Los Reyes Católicos toman Granada, el último reino musulmán, en 1492.',
            'Incorrect. 711 es el comienzo de al-Ándalus.',
            'Incorrect. Alhama cae diez años antes; es un paso de la guerra de Granada.',
            'Incorrect. Es una obra del siglo XIV, no un acontecimiento político.',
          ],
        },
        {
          question: '¿Qué tema recomendado por el CED comparten las dos obras de la unidad?',
          choices: ['Las sociedades en contacto', 'El amor cortés', 'La ciencia y la tecnología', 'La vida urbana moderna'],
          answer: 0,
          explanations: [
            'Correct. Ambas obras presentan el contacto entre culturas (y también las relaciones de poder).',
            'Incorrect. No es un tema recomendado para estas obras.',
            'Incorrect. No aparece en estas obras.',
            'Incorrect. Son obras medievales.',
          ],
        },
      ],
      revisit:
        'Contexto: al-Ándalus (711), Reconquista hasta Granada (1492), sociedades en contacto, tradición oral (juglares, trovadores), ' +
        'castellano medieval. Cinco tareas por obra: temas, términos, género, período, contexto.',
    },
    {
      id: 'Lucanor',
      ced: '1.A, 1.C, 2.A–2.B',
      title: 'El conde Lucanor, Exemplo XXXV (Don Juan Manuel)',
      minutes: 9,
      summary:
        'En el Exemplo XXXV, Patronio cuenta al conde Lucanor la historia de un mozo que se casa con una mujer "muy fuerte y muy brava": en la ' +
        'noche de bodas mata a un perro, un gato y su caballo por no obedecerle, y la mujer se vuelve sumisa. El suegro intenta lo mismo, pero ' +
        'ya es tarde. Moraleja: hay que mostrar quién eres desde el principio. Temas: sociedades en contacto, relaciones de poder, machismo.',
      body: String.raw`### La obra
**Don Juan Manuel** (1282–1348), noble castellano, escribió *El conde Lucanor* (c. 1335): una colección de cuentos didácticos (*exemplos*).

### La estructura de cada exemplo (el marco)
1. El **conde Lucanor** tiene un problema y pide consejo a su consejero **Patronio**.
2. Patronio responde contando una **historia**.
3. El conde sigue el consejo y le va bien.
4. Don Juan Manuel cierra con una **moraleja** en verso.

Un cuento dentro de otro cuento es un **metacuento** (relato enmarcado).

### Exemplo XXXV: resumen
- Un mozo, hijo de un hombre honrado pero sin dinero, quiere casarse con la hija de un hombre rico. Ella es "muy fuerte y muy brava" y nadie quiere casarse con ella.
- En la noche de bodas, el mozo le pide agua a su **perro**; como el perro no obedece, lo mata. Hace lo mismo con un **gato** y luego con su **caballo**.
- La esposa, aterrorizada, obedece todo lo que él dice. Al día siguiente la familia se sorprende de la paz en la casa.
- El **suegro** intenta lo mismo matando un **gallo**, pero su mujer le responde que **ya es tarde**: se conocen desde hace demasiado tiempo.
- **Moraleja** (en castellano medieval): *"Si al comienço non muestras qui eres, / nunca podrás después quando quisieres."* (If you don't show who you are at the start, you'll never be able to later.)

### Temas (CED)
| Tema | En el texto |
|---|---|
| **Las sociedades en contacto** | El relato tiene raíces en la tradición árabe; los personajes son moros, y Don Juan Manuel lo transmite a lectores cristianos |
| **Las relaciones de poder** | El poder dentro del matrimonio se establece con violencia y miedo |
| **El machismo** | La obediencia de la mujer se presenta como el resultado deseado; un lector moderno puede criticar esta perspectiva |

### Términos literarios
**Metacuento**, **moraleja**, **hipérbole** (la exageración de matar a los animales), **fábula** (relato breve con lección).

**Obra comparativa**: "La tortuga y la liebre" de Esopo, otra fábula con moraleja.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Metacuento', back: 'Un cuento dentro de otro cuento: Patronio cuenta una historia al conde Lucanor.' },
            { front: 'Moraleja', back: 'La lección final; en el Exemplo XXXV: hay que mostrar quién eres desde el principio.' },
            { front: 'Hipérbole', back: 'Exageración; el mozo mata a un perro, un gato y su caballo por no traerle agua.' },
            { front: 'Fábula', back: 'Relato breve, a menudo con animales o tipos, que enseña una lección.' },
          ],
        },
      ],
      precheck: {
        question: '¿Quién cuenta la historia del mozo en el Exemplo XXXV?',
        choices: ['Patronio, el consejero del conde', 'El conde Lucanor', 'El suegro', 'La esposa'],
        answer: 0,
        explanations: [
          'Correct. Patronio responde al conde con un cuento: el marco del metacuento.',
          'Incorrect. El conde pide el consejo.',
          'Incorrect. El suegro es un personaje del cuento.',
          'Incorrect. La esposa es un personaje del cuento.',
        ],
      },
      checkpoints: [
        {
          question: '¿Por qué fracasa el suegro cuando imita al mozo?',
          choices: [
            'Porque ya es tarde: su esposa lo conoce desde hace muchos años.',
            'Porque no tiene animales en casa.',
            'Porque su esposa no lo oye.',
            'Porque el mozo le prohíbe hacerlo.',
          ],
          answer: 0,
          explanations: [
            'Correct. La esposa le dice que ya es tarde; refuerza la moraleja.',
            'Incorrect. Mata un gallo.',
            'Incorrect. Ella responde directamente.',
            'Incorrect. El mozo no interviene.',
          ],
        },
        {
          question: '¿Qué término describe la exageración de matar a tres animales por no traer agua?',
          choices: ['Hipérbole', 'Estribillo', 'In medias res', 'Rima asonante'],
          answer: 0,
          explanations: [
            'Correct. La violencia exagerada es una hipérbole que dramatiza la lección.',
            'Incorrect. El estribillo es un verso que se repite, como en el romance.',
            'Incorrect. In medias res es empezar en medio de la acción.',
            'Incorrect. Es un tipo de rima en poesía.',
          ],
        },
      ],
      revisit:
        'Don Juan Manuel, c. 1335. Marco: el conde pide consejo, Patronio cuenta, moraleja en verso (metacuento). El mozo mata perro, gato ' +
        'y caballo; el suegro llega tarde. Temas: sociedades en contacto, relaciones de poder, machismo. Comparar con Esopo.',
    },
    {
      id: 'Alhama',
      ced: '1.A, 1.C, 2.A–2.B',
      title: '"Romance de la pérdida de Alhama" (Anónimo)',
      minutes: 9,
      summary:
        'Romance viejo anónimo sobre la caída de Alhama (1482), ciudad musulmana tomada por los cristianos. El rey moro de Granada recibe la ' +
        'noticia, quema las cartas y mata al mensajero; un alfaquí le reprocha sus errores. Empieza in medias res, usa octosílabos con rima ' +
        'asonante en los versos pares, versos impares sin rima y el estribillo "¡Ay de mi Alhama!". Temas: sociedades en contacto, poder, imperialismo.',
      body: String.raw`### Contexto
En **1482**, tropas cristianas tomaron **Alhama**, una ciudad clave del reino musulmán de **Granada**. Fue un paso decisivo hacia la caída de Granada en 1492. El poema es un **romance viejo**: anónimo, de **tradición oral**, cantado por juglares y transmitido de memoria (por eso existen varias versiones).

### Resumen
- El **rey moro** pasea por Granada cuando le llegan cartas: **Alhama ha caído**. Las **arroja al fuego** y **mata al mensajero**.
- Llama a los moros a reunirse con trompetas y tambores.
- Un **alfaquí** (sabio religioso) le dice que se lo merece: por haber matado a los **Abencerrajes** (una familia noble de Granada) y acogido a los **tornadizos** (conversos) de Córdoba.
- El poema transmite el **dolor** y la **culpa** desde la perspectiva de los vencidos.

### La forma del romance
*"Paseábase el rey moro / por la ciudad de Granada, / desde la puerta de Elvira / hasta la de Vivarrambla. / ¡Ay de mi Alhama!"*

| Rasgo | Ejemplo |
|---|---|
| **In medias res** | Empieza en plena acción: el rey ya está paseando cuando llegan las cartas |
| **Verso octosílabo** | Pa-se-á-ba-se el-rey-mo-ro: 8 sílabas (se + el se unen en una sinalefa) |
| **Rima asonante en los versos pares** | Gra**na**da / Viva**rram**bla: misma vocal acentuada y final (á-a) |
| **Verso blanco** | Los versos impares no riman |
| **Estribillo** | "¡Ay de mi Alhama!" se repite y subraya el lamento |
| **Voz poética / polifonía** | Hablan varias voces: el narrador, el rey, el alfaquí |
| **Tradición oral** | Repetición y ritmo para memorizar y cantar |

### Temas (CED) y obras comparativas
- **Las sociedades en contacto**, **las relaciones de poder**, **el imperialismo** (la expansión cristiana sobre Granada).
- Comparar con: *La rendición de Granada* (pintura de Francisco Pradilla y Ortiz, 1882), "Abenámar y el rey don Juan" (romance anónimo) y "Prendimiento de Antoñito el Camborio en el camino de Sevilla" de **Federico García Lorca**, que retoma la forma del romance en el siglo XX.`,
      blocks: [
        {
          type: 'sim',
          sim: 'sort-buckets',
          props: {
            title: 'Relaciona cada ejemplo con el término literario.',
            buckets: ['Estribillo', 'In medias res', 'Metacuento', 'Moraleja', 'Rima asonante', 'Verso octosílabo'],
            items: [
              { label: '"¡Ay de mi Alhama!" se repite después de cada estrofa', bucket: 0, why: 'Un verso que se repite es un estribillo.' },
              { label: 'El romance empieza con el rey ya paseando por Granada', bucket: 1, why: 'Comienza en medio de la acción.' },
              { label: 'Patronio cuenta una historia dentro de su conversación con el conde', bucket: 2, why: 'Un cuento dentro de otro cuento.' },
              { label: '"Si al comienço non muestras qui eres..."', bucket: 3, why: 'La lección final en verso.' },
              { label: 'Granada / Vivarrambla comparten las vocales á-a', bucket: 4, why: 'Solo coinciden las vocales desde la última acentuada.' },
              { label: '"Paseábase el rey moro" cuenta ocho sílabas', bucket: 5, why: 'Ocho sílabas métricas (con sinalefa).' },
            ],
          },
        },
      ],
      precheck: {
        question: '¿Qué hace el rey moro al recibir la noticia de la pérdida de Alhama?',
        choices: [
          'Arroja las cartas al fuego y mata al mensajero.',
          'Se rinde inmediatamente a los cristianos.',
          'Escribe una carta al rey de Castilla.',
          'Celebra una fiesta en la Alhambra.',
        ],
        answer: 0,
        explanations: [
          'Correct. Su reacción violenta muestra su furia y negación.',
          'Incorrect. Convoca a los moros; no se rinde.',
          'Incorrect. No escribe a Castilla.',
          'Incorrect. No hay celebración: es un lamento.',
        ],
      },
      checkpoints: [
        {
          question: '¿Qué efecto tiene el estribillo "¡Ay de mi Alhama!"?',
          choices: [
            'Repite el lamento y refuerza el tono de dolor por la pérdida.',
            'Introduce a un nuevo personaje.',
            'Cambia la rima a consonante.',
            'Da la moraleja del poema.',
          ],
          answer: 0,
          explanations: [
            'Correct. La repetición intensifica el dolor y facilita la memoria oral.',
            'Incorrect. No es un personaje.',
            'Incorrect. El romance usa rima asonante.',
            'Incorrect. El romance no tiene moraleja como el exemplo.',
          ],
        },
        {
          question: '¿Por qué el alfaquí dice que el rey merece la pérdida?',
          choices: [
            'Por haber matado a los Abencerrajes y acogido a los tornadizos de Córdoba.',
            'Por haber conquistado Córdoba.',
            'Por no saber leer las cartas.',
            'Por haberse casado con una cristiana.',
          ],
          answer: 0,
          explanations: [
            'Correct. El alfaquí le atribuye la culpa a sus propias decisiones.',
            'Incorrect. No es la acusación del poema.',
            'Incorrect. El rey lee las cartas y las quema.',
            'Incorrect. No aparece en el poema.',
          ],
        },
      ],
      revisit:
        'Romance viejo anónimo, Alhama 1482. Rey quema cartas, mata al mensajero; el alfaquí culpa al rey (Abencerrajes, tornadizos). ' +
        'In medias res, octosílabos, asonancia en pares, versos impares sueltos, estribillo, polifonía, tradición oral. Comparar con Pradilla y Lorca.',
    },
    {
      id: 'Análisis',
      ced: '1.A.i–iii, 5.A–5.B, 6.A, 6.C',
      title: 'Cómo analizar las obras en el examen',
      minutes: 6,
      summary:
        'Empieza por comprender: parafrasea y resume. Después analiza: tema con ejemplos del texto, efecto de los términos literarios, rasgos ' +
        'del género y del período. En la explicación de texto y en el ensayo, plantea una tesis y apóyala con ejemplos específicos.',
      body: String.raw`### De la comprensión al análisis
1. **Parafrasear** (1.A.i): decir con tus palabras lo que dice un pasaje.
2. **Resumir** (1.A.ii): la trama en pocas oraciones.
3. **Explicar con detalles** (1.A.iii): cada idea apoyada por el texto.

### Vocabulario útil
| Para… | Usa |
|---|---|
| Presentar una tesis | *En este texto, el autor sugiere que…* |
| Introducir un ejemplo | *Por ejemplo, cuando…*; *Esto se ve en…* |
| Analizar el efecto | *Este recurso enfatiza…*; *Así se subraya…* |
| Relacionar con el contexto | *Esto refleja la época medieval porque…* |
| Comparar | *Al igual que…*; *A diferencia de…* |

### Ejemplo de párrafo
> En el Exemplo XXXV, Don Juan Manuel presenta el poder dentro del matrimonio como algo que se impone desde el primer momento. La hipérbole de matar al perro, al gato y al caballo dramatiza esta idea, y el fracaso del suegro, a quien su esposa le dice que ya es tarde, refuerza la moraleja final. Así, el exemplo refleja una perspectiva medieval sobre las relaciones de poder que hoy se puede leer como machista.

Tesis → ejemplo específico → efecto del recurso → relación con el contexto.

### Comparar las dos obras
| | Exemplo XXXV | Romance de Alhama |
|---|---|---|
| Género | Prosa didáctica (exemplo) | Poesía narrativa oral (romance) |
| Autor | Don Juan Manuel | Anónimo |
| Propósito | Enseñar una lección | Narrar y lamentar un acontecimiento |
| Relaciones de poder | En la familia | Entre reinos y dentro de la corte |`,
      blocks: [],
      precheck: {
        question: '¿Cuál es la mejor tesis para un ensayo sobre el "Romance de la pérdida de Alhama"?',
        choices: [
          'El romance usa el estribillo y la voz del alfaquí para presentar la pérdida de Alhama como un castigo por los errores del rey.',
          'El romance tiene versos.',
          'Alhama es una ciudad de España.',
          'El poema es anónimo.',
        ],
        answer: 0,
        explanations: [
          'Correct. Es una interpretación defendible que se puede apoyar con ejemplos.',
          'Incorrect. Es un dato obvio, no una tesis.',
          'Incorrect. Es un dato, no una interpretación.',
          'Incorrect. Es un dato, no una tesis.',
        ],
      },
      checkpoints: [
        {
          question: '¿Qué diferencia de género hay entre las dos obras de la unidad?',
          choices: [
            'El exemplo es prosa didáctica; el romance es poesía narrativa de tradición oral.',
            'Las dos son novelas.',
            'El romance es una obra de teatro.',
            'El exemplo está escrito en octosílabos con estribillo.',
          ],
          answer: 0,
          explanations: [
            'Correct. Esa es la diferencia principal de género.',
            'Incorrect. Ninguna es novela.',
            'Incorrect. Es poesía narrativa.',
            'Incorrect. Eso describe el romance; el exemplo es prosa con moraleja en verso.',
          ],
        },
        {
          question: '¿Qué debe seguir a un ejemplo del texto en un buen párrafo de análisis?',
          choices: [
            'Una explicación del efecto del recurso y su relación con la tesis.',
            'Otro resumen completo de la trama.',
            'Una lista de términos sin explicación.',
            'La biografía completa del autor.',
          ],
          answer: 0,
          explanations: [
            'Correct. El análisis explica cómo el ejemplo apoya la tesis.',
            'Incorrect. El resumen no sustituye el análisis.',
            'Incorrect. Hay que explicar el efecto.',
            'Incorrect. El contexto debe ser breve y relevante.',
          ],
        },
      ],
      revisit:
        'Parafrasear, resumir, explicar con detalles. Párrafo: tesis → ejemplo → efecto → contexto. Exemplo = prosa didáctica; romance = ' +
        'poesía narrativa oral.',
    },
  ],
};

export default pack;
