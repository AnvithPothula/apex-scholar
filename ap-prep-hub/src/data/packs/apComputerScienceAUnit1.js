/**
 * AP Computer Science A Unit 1: Using Objects and Methods — study pack.
 *
 * Written against the AP Computer Science A CED effective Fall 2025 (the
 * current edition; topics 1.1–1.15 in nine sections). Follows the CED's
 * exclusions: only int, double and boolean; no negative % operands; no prefix
 * ++ or increments inside expressions; no overriding toString. Two
 * simulations: int vs. double arithmetic, and the Java Quick Reference String
 * methods with real out-of-bounds behavior.
 *
 * Import-free so scripts/prerender.mjs can load it.
 */

const java = (code) => '\n```java\n' + code + '\n```\n';

const pack = {
  slug: 'ap-computer-science-a/unit-1',
  subject: 'AP Computer Science A',
  unit: 'Unit 1: Using Objects and Methods',
  examWeight: '15–25% of the exam',
  intro:
    'The building blocks of Java: how code gets compiled and run, the three kinds of errors, int, double and boolean variables, ' +
    'arithmetic (including the integer-division trap), casting and overflow, calling methods, the Math class, creating objects, ' +
    'and the String methods on the Java Quick Reference.',
  sections: [
    {
      id: '1.1',
      ced: '1.1.A–C',
      title: 'Algorithms, Programming, and Compilers',
      minutes: 5,
      summary:
        'An algorithm is a step-by-step process, written in words or diagrams, done in sequence. Programmers write code in an IDE; ' +
        'the compiler checks it and catches syntax errors before it can run. Logic errors give wrong results and are found by testing. ' +
        'Run-time errors, including exceptions, stop a running program.',
      body: String.raw`### Algorithms
An **algorithm** is a step-by-step process for a task, written in plain language or a diagram (like a flowchart). **Sequencing** means the steps happen in order, one at a time.

### From code to running program
1. Write code in a text editor, usually an **IDE** (integrated development environment) with tools to write, compile and run.
2. The **compiler** checks the code for some errors and translates it. Errors it finds must be fixed before the program can run.
3. The program **runs** (executes).

### Three kinds of errors
| Error | What it is | Who finds it | Example |
|---|---|---|---|
| **Syntax** | Breaks the rules of the language | The **compiler** | Missing semicolon; ` + "`int x = 3.5;`" + String.raw` |
| **Logic** | Program runs but gives the wrong result | **Testing** with known inputs | Averaging with integer division |
| **Run-time** | Something goes wrong while running; usually ends the program abnormally | Shows up at run time | Dividing an int by 0 |

An **exception** is a run-time error the compiler couldn't detect; it interrupts the normal flow (e.g., ` + "`ArithmeticException`, `NullPointerException`" + String.raw`).`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Syntax error', back: 'Breaks the language\'s rules; caught by the compiler before the program runs.' },
            { front: 'Logic error', back: 'Program runs but behaves incorrectly; found by testing with specific data.' },
            { front: 'Run-time error', back: 'Occurs while the program runs and usually ends it abnormally.' },
            { front: 'Exception', back: 'A run-time error not caught by the compiler that interrupts normal execution (e.g., ArithmeticException).' },
          ],
        },
      ],
      precheck: {
        question: 'A program compiles and runs, but it prints an average of 3 when the correct average is 3.5. What kind of error is this?',
        choices: ['Logic error', 'Syntax error', 'Run-time error', 'Compiler error'],
        answer: 0,
        explanations: [
          'Correct. It runs but gives the wrong result; testing reveals it.',
          'Incorrect. A syntax error would stop it from compiling.',
          'Incorrect. Nothing crashed while running.',
          'Incorrect. It compiled successfully.',
        ],
      },
      checkpoints: [
        {
          question: 'Which error is detected by the compiler?',
          choices: [
            'A missing semicolon at the end of a statement',
            'Dividing an int by zero while the program runs',
            'Using the wrong formula for an area',
            'Calling a method on a null reference',
          ],
          answer: 0,
          explanations: [
            'Correct. That breaks Java\'s syntax rules.',
            'Incorrect. That is a run-time exception.',
            'Incorrect. That is a logic error.',
            'Incorrect. That throws a NullPointerException at run time.',
          ],
        },
        {
          question: 'What is an exception?',
          choices: [
            'A run-time error not detected by the compiler that interrupts normal execution',
            'A syntax error found by the compiler',
            'A comment ignored by the compiler',
            'A method that returns no value',
          ],
          answer: 0,
          explanations: [
            'Correct. That is the CED\'s definition.',
            'Incorrect. Exceptions happen at run time.',
            'Incorrect. Comments aren\'t errors.',
            'Incorrect. That is a void method.',
          ],
        },
      ],
      revisit:
        'Algorithm = ordered steps. IDE → compiler (catches syntax errors) → run. Logic errors found by testing; run-time errors ' +
        'and exceptions stop a running program.',
    },
    {
      id: '1.2–1.3',
      ced: '1.2.A–B, 1.3.A–C',
      title: 'Variables, Data Types, Expressions, and Output',
      minutes: 9,
      summary:
        'Data types are primitive (int, double, boolean) or reference (objects). A variable has a name and a type. println moves to a ' +
        'new line; print doesn\'t. String literals use double quotes and escape sequences `\\"`, `\\\\` and `\\n`. An int op int gives an int, ' +
        'so 7 / 2 is 3; any double makes the result a double. % gives the remainder; *, / and % come before + and -.',
      body: String.raw`### Types
| Type | Holds | Example |
|---|---|---|
| ` + "`int`" + String.raw` | Integers | ` + "`int count = 7;`" + String.raw` |
| ` + "`double`" + String.raw` | Real numbers | ` + "`double price = 2.5;`" + String.raw` |
| ` + "`boolean`" + String.raw` | ` + "`true` or `false`" + String.raw` | ` + "`boolean done = false;`" + String.raw` |

These are **primitive** types. Everything else (like ` + "`String`" + String.raw`) is a **reference** type that refers to an object. A **variable** is a named storage location with a type; its value can change. (The other primitives, like ` + "`long` and `char`" + String.raw`, aren't on the exam.)

### Output
` + java(String.raw`System.out.print("AP ");
System.out.println("CSA");   // moves to a new line after printing
System.out.println("Line 2");`) + String.raw`
Prints ` + "`AP CSA`" + String.raw` then ` + "`Line 2`" + String.raw` on the next line.

**Escape sequences** inside a string literal: ` + "`\\\"`" + String.raw` (double quote), ` + "`\\\\`" + String.raw` (backslash), ` + "`\\n`" + String.raw` (new line).

### Arithmetic
Operators: ` + "`+ - * / %`" + String.raw`.
- **int op int → int.** Division keeps only the integer part: ` + "`7 / 2`" + String.raw` is ` + "`3`" + String.raw`.
- **If either operand is a double, the result is a double:** ` + "`7.0 / 2`" + String.raw` is ` + "`3.5`" + String.raw`.
- ` + "`%`" + String.raw` is the **remainder**: ` + "`7 % 2`" + String.raw` is ` + "`1`" + String.raw`; ` + "`10 % 5`" + String.raw` is ` + "`0`" + String.raw`.
- **Precedence**: ` + "`* / %`" + String.raw` before ` + "`+ -`" + String.raw`; ties go left to right; parentheses override. ` + "`2 + 3 * 4`" + String.raw` is ` + "`14`" + String.raw`; ` + "`(2 + 3) * 4`" + String.raw` is ` + "`20`" + String.raw`.
- An int divided by the int ` + "`0`" + String.raw` throws an ` + "`ArithmeticException`" + String.raw`.`,
      blocks: [{ type: 'sim', sim: 'java-arithmetic' }],
      precheck: {
        question: 'What is the value of 17 / 5 in Java?',
        choices: ['3', '3.4', '4', '2'],
        answer: 0,
        explanations: [
          'Correct. Both are ints, so the decimal part is dropped.',
          'Incorrect. That would need at least one double operand.',
          'Incorrect. Java truncates; it doesn\'t round.',
          'Incorrect. 2 is the remainder (17 % 5), not the quotient.',
        ],
      },
      checkpoints: [
        {
          question: 'What does this print?\n\n```java\nSystem.out.print("A");\nSystem.out.println("B");\nSystem.out.print("C");\n```',
          choices: ['AB on one line, then C on the next', 'A, B and C on three lines', 'ABC on one line', 'A on one line, then BC'],
          answer: 0,
          explanations: [
            'Correct. print stays on the line; println ends the line after B.',
            'Incorrect. print doesn\'t add a new line.',
            'Incorrect. println("B") moves to a new line before C.',
            'Incorrect. A and B print on the same line.',
          ],
        },
        {
          question: 'What is the value of 4 + 10 % 4 * 2?',
          choices: ['8', '12', '16', '6'],
          answer: 0,
          explanations: [
            'Correct. 10 % 4 is 2, times 2 is 4, plus 4 is 8.',
            'Incorrect. Check precedence: % and * go before +.',
            'Incorrect. That ignores precedence.',
            'Incorrect. 10 % 4 * 2 is 4, not 2.',
          ],
        },
      ],
      revisit:
        'Primitives: int, double, boolean; everything else is a reference type. println adds a new line. int op int → int (7 / 2 = 3); ' +
        'any double → double. % is remainder. * / % before + -. int ÷ 0 → ArithmeticException.',
    },
    {
      id: '1.4–1.6',
      ced: '1.4.A–B, 1.5.A–C, 1.6.A',
      title: 'Assignment, Casting, Range, and Compound Operators',
      minutes: 8,
      summary:
        'The value on the right of = is stored in the variable on the left; a variable must be initialized before use, and reference ' +
        'variables can hold null. Scanner reads input. (int) truncates a double; (double) widens an int. ints are limited to ' +
        'Integer.MIN_VALUE…MAX_VALUE, and going past overflows. Doubles have round-off error. +=, -=, *=, /=, %=, ++ and -- update a variable.',
      body: String.raw`### Assignment
` + java(String.raw`int score = 10;      // initialized
score = score + 5;    // right side evaluated first: 15
String name = null;   // a reference with no object yet`) + String.raw`
Every variable needs a value (of a compatible type) before it's used. The **Scanner** class is one way to read text input from the keyboard.

### Casting
| Code | Value | Why |
|---|---|---|
| ` + "`(int) 3.99`" + String.raw` | ` + "`3`" + String.raw` | Casting to int **truncates** |
| ` + "`(double) 7 / 2`" + String.raw` | ` + "`3.5`" + String.raw` | 7 becomes 7.0 first, so the division is double |
| ` + "`(double) (7 / 2)`" + String.raw` | ` + "`3.0`" + String.raw` | The int division happens first |
| ` + "`(int) (2.6 + 0.5)`" + String.raw` | ` + "`3`" + String.raw` | Rounding a non-negative double |
| ` + "`(int) (-2.6 - 0.5)`" + String.raw` | ` + "`-3`" + String.raw` | Rounding a negative double |

Java automatically **widens** an int to a double when needed (` + "`double d = 5;`" + String.raw` stores ` + "`5.0`" + String.raw`).

### Range and accuracy
- An int uses 4 bytes, so it must be between ` + "`Integer.MIN_VALUE`" + String.raw` (−2,147,483,648) and ` + "`Integer.MAX_VALUE`" + String.raw` (2,147,483,647).
- Going past either end is **integer overflow**: the result wraps to a valid int that isn't the expected value. ` + "`Integer.MAX_VALUE + 1`" + String.raw` gives ` + "`Integer.MIN_VALUE`" + String.raw`.
- Doubles can't store every real number exactly, so you can get **round-off error** (` + "`0.1 + 0.2`" + String.raw` prints ` + "`0.30000000000000004`" + String.raw`). Use ints (e.g., cents) when exactness matters.

### Compound assignment
` + java(String.raw`int x = 10;
x += 3;   // 13
x *= 2;   // 26
x %= 7;   // 5
x++;      // 6
x--;      // 5`) + String.raw`
On the exam, ` + "`++` and `--`" + String.raw` appear only after the variable and only as their own statements.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: '(int) 9.8', back: '9: casting a double to int truncates.' },
            { front: '(double) 9 / 2 vs. (double) (9 / 2)', back: '4.5 vs. 4.0: cast before the division or after it.' },
            { front: 'Integer overflow', back: 'An int result past MAX_VALUE or MIN_VALUE wraps to a valid but unexpected int.' },
            { front: 'Rounding a non-negative double x', back: '(int) (x + 0.5)' },
            { front: 'null', back: 'A literal meaning a reference variable refers to no object.' },
          ],
        },
      ],
      precheck: {
        question: 'What is the value of (double) (11 / 4)?',
        choices: ['2.0', '2.75', '3.0', '2'],
        answer: 0,
        explanations: [
          'Correct. 11 / 4 is int division (2), then it\'s cast to 2.0.',
          'Incorrect. That would be (double) 11 / 4, casting before dividing.',
          'Incorrect. Casting truncates rather than rounding, and here the int division already gave 2.',
          'Incorrect. The cast makes it a double, which prints as 2.0.',
        ],
      },
      checkpoints: [
        {
          question: 'After this code, what is the value of n?\n\n```java\nint n = 7;\nn *= 3;\nn %= 4;\nn++;\n```',
          choices: ['2', '1', '21', '6'],
          answer: 0,
          explanations: [
            'Correct. 7 × 3 = 21; 21 % 4 = 1; then n++ makes 2.',
            'Incorrect. That forgets the n++.',
            'Incorrect. That stops after n *= 3.',
            'Incorrect. Recheck 21 % 4, which is 1.',
          ],
        },
        {
          question: 'What happens when 1 is added to Integer.MAX_VALUE in an int expression?',
          choices: [
            'Integer overflow: the result is a valid int, but not the expected value',
            'The result automatically becomes a double',
            'The compiler reports a syntax error',
            'The result is exactly 2,147,483,648',
          ],
          answer: 0,
          explanations: [
            'Correct. It wraps around to Integer.MIN_VALUE.',
            'Incorrect. Java doesn\'t convert int results to double on overflow.',
            'Incorrect. It compiles; the problem appears in the value.',
            'Incorrect. That value can\'t be stored in an int.',
          ],
        },
      ],
      revisit:
        '= stores the right side in the left variable; initialize before use; null = no object. (int) truncates; cast placement ' +
        'matters; (int)(x + 0.5) rounds. int range MIN_VALUE…MAX_VALUE, overflow wraps; doubles have round-off. +=, -=, *=, /=, %=, ++, --.',
    },
    {
      id: '1.7–1.8',
      ced: '1.7.A, 1.8.A',
      title: 'APIs, Libraries, and Documentation',
      minutes: 4,
      summary:
        'Libraries are collections of classes grouped into packages, and an API specification tells you how to use them. A class ' +
        'defines a reference type: attributes (data, in variables) and behaviors (methods). Comments (//, /* */, /** */) are ignored by ' +
        'the compiler. Preconditions must be true before a method runs; postconditions are true after.',
      body: String.raw`### Libraries and APIs
- A **library** is a collection of classes; classes are grouped into **packages** (e.g., ` + "`java.lang`" + String.raw`, available by default).
- An **API** (application programming interface) **specification** documents how to use those classes, so you can use code you didn't write.
- A **class** defines a reference type with **attributes** (data stored in variables) and **behaviors** (what objects can do, defined by **methods**).

### Comments
` + java(String.raw`// single-line comment
/* multi-line
   comment */
/** Javadoc comment: documents a class or method */`) + String.raw`
Comments help people understand code; the compiler ignores them.

### Preconditions and postconditions
- **Precondition**: must be true **before** a method is called for it to work as expected. The method isn't required to check it.
- **Postcondition**: must be true **after** the method runs, describing what's returned or the object's new state.
` + java(String.raw`/** Precondition: n > 0
 *  Postcondition: returns the sum 1 + 2 + ... + n */
public static int sumTo(int n)`),
      blocks: [],
      precheck: {
        question: 'A method\'s documentation says "Precondition: list is not empty." What does this mean?',
        choices: [
          'Callers must make sure the list isn\'t empty before calling; the method may not check',
          'The method will always check and fix an empty list',
          'The list will be empty after the method runs',
          'The compiler will reject calls with an empty list',
        ],
        answer: 0,
        explanations: [
          'Correct. Preconditions are the caller\'s responsibility.',
          'Incorrect. There\'s no expectation the method checks preconditions.',
          'Incorrect. That would be a postcondition, and it\'s not what this says.',
          'Incorrect. The compiler can\'t check this.',
        ],
      },
      checkpoints: [
        {
          question: 'In a class, attributes and behaviors are defined by:',
          choices: ['Variables and methods, respectively', 'Methods and variables, respectively', 'Comments and packages', 'Preconditions and postconditions'],
          answer: 0,
          explanations: [
            'Correct. Attributes are data in variables; behaviors are methods.',
            'Incorrect. That reverses them.',
            'Incorrect. Comments and packages don\'t define an object\'s data or actions.',
            'Incorrect. Those describe how methods should be used.',
          ],
        },
        {
          question: 'Which statement about comments is true?',
          choices: [
            'They are ignored by the compiler and not executed',
            'They are checked for syntax errors',
            'They run before the main method',
            'Only /** */ comments are allowed in Java',
          ],
          answer: 0,
          explanations: [
            'Correct. They exist for people, not the computer.',
            'Incorrect. The compiler skips them.',
            'Incorrect. Comments never run.',
            'Incorrect. Java has //, /* */ and /** */ comments.',
          ],
        },
      ],
      revisit:
        'Library = classes in packages; API specification = how to use them. Class: attributes (variables) + behaviors (methods). ' +
        'Comments //, /* */, /** */ are ignored. Precondition before, postcondition after.',
    },
    {
      id: '1.9–1.10',
      ced: '1.9.A–B, 1.10.A',
      title: 'Method Signatures and Calling Class Methods',
      minutes: 7,
      summary:
        'A method is a named block of code that runs when called; procedural abstraction lets you use it without knowing how it works. ' +
        'A signature is the name plus the ordered parameter types. Void methods return nothing; non-void return values must be stored ' +
        'or used. Arguments are passed by value. Overloaded methods share a name with different signatures. Class (static) methods are called with the class name.',
      body: String.raw`### Anatomy of a method
` + java(String.raw`public static double average(int a, int b)
//            ^return  ^name   ^parameters
{
    return (a + b) / 2.0;
}`) + String.raw`
- **Signature** = name + ordered list of parameter types: ` + "`average(int, int)`" + String.raw`.
- **Parameters** are variables declared in the header; **arguments** are the values passed in a call.
- **Procedural abstraction**: you can call ` + "`average`" + String.raw` knowing only what it does.

### void vs. non-void
| | Returns | How to call |
|---|---|---|
| **void** | Nothing | As its own statement: ` + "`printBanner();`" + String.raw` |
| **non-void** | A value of the return type | Store or use it: ` + "`double m = average(3, 4);`" + String.raw` |

### How calls work
- **Call by value**: parameters get **copies** of the arguments.
- Arguments must match the parameter list in **number, order and type**.
- A call **pauses** the current code, runs the method, then returns to just after the call.
- **Overloading**: same name, different signatures, such as ` + "`abs(int)` and `abs(double)`" + String.raw`.

### Class methods
**Class methods** have ` + "`static`" + String.raw` in the header and belong to the class, not an object. Call them with the class name and the dot operator (` + "`Math.sqrt(16)`" + String.raw`); inside their own class the class name is optional.`,
      blocks: [],
      precheck: {
        question: 'What is the signature of the method public static int max(int a, int b)?',
        choices: ['max(int, int)', 'int max', 'public static int max', 'max(a, b)'],
        answer: 0,
        explanations: [
          'Correct. Name plus ordered parameter types.',
          'Incorrect. The return type isn\'t part of the signature.',
          'Incorrect. Modifiers aren\'t part of the signature.',
          'Incorrect. The signature lists types, not parameter names.',
        ],
      },
      checkpoints: [
        {
          question: 'Given public static void greet(String name), which call is valid?',
          choices: ['greet("Ana");', 'String s = greet("Ana");', 'greet(5);', 'greet("Ana", "Bo");'],
          answer: 0,
          explanations: [
            'Correct. A void method is called as its own statement with one String.',
            'Incorrect. A void method returns nothing to store.',
            'Incorrect. 5 isn\'t a String.',
            'Incorrect. There\'s only one parameter.',
          ],
        },
        {
          question: 'A class has methods area(int) and area(int, int). This is an example of:',
          choices: ['Overloading', 'Overflow', 'Casting', 'Call by reference'],
          answer: 0,
          explanations: [
            'Correct. Same name, different signatures.',
            'Incorrect. Overflow is about int range.',
            'Incorrect. Casting converts types.',
            'Incorrect. Java passes arguments by value.',
          ],
        },
      ],
      revisit:
        'Signature = name + parameter types. void: call as a statement; non-void: store or use the value. Arguments match in number, ' +
        'order, type; passed by value. Overloading = same name, different signatures. Static methods: ClassName.method().',
    },
    {
      id: '1.11',
      ced: '1.11.A',
      title: 'Math Class',
      minutes: 5,
      summary:
        'Math is in java.lang and has only class methods: abs, pow, sqrt and random. Math.random() returns a double from 0.0 up to ' +
        'but not including 1.0; multiply, add and cast to get random ints or doubles in a range.',
      body: String.raw`### On the Java Quick Reference
| Method | Returns |
|---|---|
| ` + "`Math.abs(int x)` / `Math.abs(double x)`" + String.raw` | Absolute value (same type as x) |
| ` + "`Math.pow(double base, double exp)`" + String.raw` | base^exp as a double: ` + "`Math.pow(2, 3)`" + String.raw` is ` + "`8.0`" + String.raw` |
| ` + "`Math.sqrt(double x)`" + String.raw` | Non-negative square root: ` + "`Math.sqrt(25)`" + String.raw` is ` + "`5.0`" + String.raw` |
| ` + "`Math.random()`" + String.raw` | A double ≥ 0.0 and < 1.0 |

### Random numbers in a range
` + java(String.raw`// random int from min to max, inclusive
int r = (int) (Math.random() * (max - min + 1)) + min;

// a die roll, 1 to 6
int die = (int) (Math.random() * 6) + 1;

// random double from 5.0 (inclusive) to 10.0 (exclusive)
double d = Math.random() * 5 + 5;`) + String.raw`
Check the endpoints: ` + "`Math.random() * 6`" + String.raw` is in [0, 6), the cast gives 0–5, and +1 gives 1–6.`,
      blocks: [],
      precheck: {
        question: 'Which expression gives a random int from 1 to 10, inclusive?',
        choices: [
          '(int) (Math.random() * 10) + 1',
          '(int) (Math.random() * 10)',
          '(int) Math.random() * 10 + 1',
          '(int) (Math.random() * 11)',
        ],
        answer: 0,
        explanations: [
          'Correct. 0–9 after the cast, plus 1 gives 1–10.',
          'Incorrect. That gives 0–9.',
          'Incorrect. (int) Math.random() is always 0, so this is always 1.',
          'Incorrect. That gives 0–10.',
        ],
      },
      checkpoints: [
        {
          question: 'What is the value of Math.pow(3, 2) + Math.abs(-4)?',
          choices: ['13.0', '13', '5.0', '10.0'],
          answer: 0,
          explanations: [
            'Correct. pow returns 9.0; 9.0 + 4 is the double 13.0.',
            'Incorrect. pow returns a double, so the sum is a double.',
            'Incorrect. 3 squared is 9, not 1.',
            'Incorrect. Check |−4| = 4 and 3² = 9.',
          ],
        },
        {
          question: 'What range of values can (int) (Math.random() * 5) + 3 produce?',
          choices: ['3 to 7', '3 to 8', '0 to 5', '5 to 8'],
          answer: 0,
          explanations: [
            'Correct. The cast gives 0–4; adding 3 gives 3–7.',
            'Incorrect. Math.random() never reaches 1.0, so the cast never reaches 5.',
            'Incorrect. That ignores the + 3.',
            'Incorrect. The minimum is 3.',
          ],
        },
      ],
      revisit:
        'Math methods are static: abs, pow (double), sqrt (double), random in [0.0, 1.0). Random int in [min, max]: ' +
        '(int) (Math.random() * (max - min + 1)) + min.',
    },
    {
      id: '1.12–1.13',
      ced: '1.12.A–B, 1.13.A–C',
      title: 'Objects and Object Creation',
      minutes: 7,
      summary:
        'A class is the blueprint; an object is a specific instance with its own attributes. Subclasses inherit from superclasses, ' +
        'and every class is a subclass of Object. A reference variable holds an object\'s address or null. Objects are created with new ' +
        'and a constructor, which has the class\'s name; constructors can be overloaded and receive arguments by value.',
      body: String.raw`### Classes and objects
- **Class** = blueprint for attributes and behaviors. **Object** = one specific **instance** of it.
- Classes can form a **hierarchy**: a **subclass** extends a **superclass** and inherits its attributes and behaviors. Every class is a subclass of ` + "`Object`" + String.raw`. (Designing your own inheritance isn't on the exam.)
- A reference-type variable holds an **object reference**, essentially the object's memory address, or ` + "`null`" + String.raw`.

### Creating objects
` + java(String.raw`// Constructors of a Point class:  Point()   and   Point(int x, int y)
Point origin = new Point();       // calls Point()
Point p = new Point(3, 4);        // calls Point(int, int)
Point q = null;                   // no object yet`) + String.raw`
- **Constructors** have the **same name as the class** and set up a new object's attributes.
- A **constructor signature** is the class name plus the ordered parameter types; constructors are **overloaded** when there are several signatures.
- Arguments must match in number, order and type, and are passed **by value**.
- Like a method call, a constructor call runs its code, then control returns to just after the call.`,
      blocks: [
        {
          type: 'flashcards',
          cards: [
            { front: 'Class vs. object', back: 'Class: the blueprint. Object: a specific instance with its own attribute values.' },
            { front: 'Constructor', back: 'Has the class\'s name; called with new to create and initialize an object.' },
            { front: 'Reference variable', back: 'Holds the address of an object, or null if there is no object.' },
            { front: 'Object class', back: 'The superclass of every Java class.' },
          ],
        },
      ],
      precheck: {
        question: 'Which statement creates a new object of class Dog using a constructor that takes a String?',
        choices: ['Dog d = new Dog("Rex");', 'Dog d = Dog("Rex");', 'Dog d = new Dog;', 'new Dog d = "Rex";'],
        answer: 0,
        explanations: [
          'Correct. new plus a constructor call with a String argument.',
          'Incorrect. Creating an object requires new.',
          'Incorrect. The constructor call needs parentheses and the argument.',
          'Incorrect. That isn\'t valid Java syntax.',
        ],
      },
      checkpoints: [
        {
          question: 'A class Book has constructors Book() and Book(String title, int pages). Which call is invalid?',
          choices: ['new Book(300, "Dune")', 'new Book()', 'new Book("Dune", 300)', 'new Book("Emma", 0)'],
          answer: 0,
          explanations: [
            'Correct. The arguments are in the wrong order for (String, int).',
            'Incorrect. That matches Book().',
            'Incorrect. That matches Book(String, int).',
            'Incorrect. That also matches Book(String, int).',
          ],
        },
        {
          question: 'What does a variable of a reference type store?',
          choices: [
            'A reference to an object (or null)',
            'A copy of every attribute of the object',
            'Only int values',
            'The class\'s source code',
          ],
          answer: 0,
          explanations: [
            'Correct. Think of it as the object\'s memory address.',
            'Incorrect. The object\'s data lives in the object, not the variable.',
            'Incorrect. That is a primitive int variable.',
            'Incorrect. Variables hold values or references, not code.',
          ],
        },
      ],
      revisit:
        'Class = blueprint, object = instance. Subclasses inherit; every class extends Object. Reference variables hold an address ' +
        'or null. new + constructor (same name as class); overloaded constructors; arguments match number, order, type.',
    },
    {
      id: '1.14',
      ced: '1.14.A',
      title: 'Calling Instance Methods',
      minutes: 3,
      summary:
        'Instance methods are called on an object with the dot operator. Calling a method on a null reference throws a NullPointerException.',
      body: String.raw`**Instance methods** belong to objects (no ` + "`static`" + String.raw`). Call them with the object's name, a dot and the method:
` + java(String.raw`String word = "apple";
int n = word.length();     // 5: called on the object word

String missing = null;
int m = missing.length();  // NullPointerException at run time`) + String.raw`
| | Class method | Instance method |
|---|---|---|
| Header | Has ` + "`static`" + String.raw` | No ` + "`static`" + String.raw` |
| Called on | The class: ` + "`Math.sqrt(9)`" + String.raw` | An object: ` + "`word.length()`" + String.raw` |`,
      blocks: [],
      precheck: {
        question: 'What happens when a method is called on a reference variable that holds null?',
        choices: [
          'A NullPointerException is thrown',
          'The method returns 0',
          'The compiler reports a syntax error',
          'A new object is created automatically',
        ],
        answer: 0,
        explanations: [
          'Correct. There\'s no object to call the method on.',
          'Incorrect. Nothing is returned; the program throws an exception.',
          'Incorrect. It compiles; it fails at run time.',
          'Incorrect. Java never creates the object for you.',
        ],
      },
      checkpoints: [
        {
          question: 'Which call is an instance method call?',
          choices: ['name.length()', 'Math.abs(-3)', 'Math.random()', 'Integer.MAX_VALUE'],
          answer: 0,
          explanations: [
            'Correct. It is called on the object name.',
            'Incorrect. abs is a static Math method.',
            'Incorrect. random is a static Math method.',
            'Incorrect. That is a constant, not a method call.',
          ],
        },
        {
          question: 'String s; is declared and later s = null; then System.out.println(s.length()); runs. What is the result?',
          choices: ['NullPointerException', '0', 'null', 'An empty line'],
          answer: 0,
          explanations: [
            'Correct. length() is called on a null reference.',
            'Incorrect. There is no string whose length could be 0.',
            'Incorrect. The call fails before anything prints.',
            'Incorrect. The exception stops the program first.',
          ],
        },
      ],
      revisit: 'Instance methods: object.method(). Calling a method on null → NullPointerException.',
    },
    {
      id: '1.15',
      ced: '1.15.A–B',
      title: 'String Manipulation',
      minutes: 9,
      summary:
        'Strings are immutable objects in java.lang. + and += concatenate, converting primitives (and objects, via toString) to text. ' +
        'Indices run from 0 to length() − 1; going outside throws StringIndexOutOfBoundsException. Quick Reference methods: length, ' +
        'substring (two forms), indexOf (−1 if missing), equals and compareTo.',
      body: String.raw`### Creating and combining
` + java(String.raw`String a = "AP";                 // string literal
String b = new String("CSA");     // constructor
String c = a + " " + b;           // "AP CSA"
c += "!";                         // "AP CSA!" (a new String)
String d = "Score: " + 4 + 1;     // "Score: 41"  (left to right, string first)
String e = 4 + 1 + " points";     // "5 points"   (adds first, then concatenates)`) + String.raw`
- Strings are **immutable**: methods never change a String; they return a new one.
- Concatenating a primitive converts it to text; concatenating an object calls its ` + "`toString`" + String.raw` method.

### Indices
For ` + "`\"computer\"`" + String.raw`, indices go 0 to 7 (length 8). An index outside 0 to ` + "`length() - 1`" + String.raw` throws a ` + "`StringIndexOutOfBoundsException`" + String.raw`.

### Quick Reference methods
Examples use ` + "`s = \"computer\"`" + String.raw`.

| Method | Returns |
|---|---|
| ` + "`length()`" + String.raw` | Number of characters: ` + "`s.length()`" + String.raw` is 8 |
| ` + "`substring(from, to)`" + String.raw` | Characters from index ` + "`from`" + String.raw` up to ` + "`to - 1`" + String.raw`: ` + "`s.substring(3, 6)`" + String.raw` is "put" |
| ` + "`substring(from)`" + String.raw` | From ` + "`from`" + String.raw` to the end: ` + "`s.substring(5)`" + String.raw` is "ter" |
| ` + "`indexOf(str)`" + String.raw` | Index of the first occurrence, or −1: ` + "`s.indexOf(\"put\")`" + String.raw` is 3 |
| ` + "`equals(other)`" + String.raw` | true if the characters match exactly: ` + "`s.equals(\"Computer\")`" + String.raw` is false |
| ` + "`compareTo(other)`" + String.raw` | Negative, 0 or positive by alphabetical order: ` + "`s.compareTo(\"apple\")`" + String.raw` is positive |

Use ` + "`equals`" + String.raw`, not ` + "`==`" + String.raw`, to compare String contents. A one-character string at index i is ` + "`s.substring(i, i + 1)`" + String.raw`.`,
      blocks: [{ type: 'sim', sim: 'string-lab' }],
      precheck: {
        question: 'What is "lighthouse".substring(5, 8)?',
        choices: ['"hou"', '"hous"', '"thou"', '"ouse"'],
        answer: 0,
        explanations: [
          'Correct. Indices 5, 6, 7 are h, o, u.',
          'Incorrect. substring stops before index 8.',
          'Incorrect. Index 4 is t, but the substring starts at 5.',
          'Incorrect. That starts at 6 and runs to the end.',
        ],
      },
      checkpoints: [
        {
          question: 'What is printed?\n\n```java\nString s = "banana";\nSystem.out.println(s.indexOf("an") + s.indexOf("x"));\n```',
          choices: ['0', '1', '-1', '2'],
          answer: 0,
          explanations: [
            'Correct. indexOf("an") is 1 and indexOf("x") is −1, so 1 + (−1) = 0.',
            'Incorrect. That forgets that a missing string gives −1.',
            'Incorrect. "an" is found at index 1.',
            'Incorrect. The first "an" starts at index 1, not 3.',
          ],
        },
        {
          question: 'What is the value of 1 + 2 + "3" + 4 + 5?',
          choices: ['"3345"', '"12345"', '"15"', '"339"'],
          answer: 0,
          explanations: [
            'Correct. 1 + 2 is 3, then "3" + "3" + "4" + "5" concatenates left to right.',
            'Incorrect. The first + adds two ints before any string appears.',
            'Incorrect. Once a String is involved, + concatenates.',
            'Incorrect. 4 and 5 are concatenated, not added, after the string.',
          ],
        },
      ],
      revisit:
        'Strings are immutable; + concatenates left to right. Indices 0 to length() − 1, else StringIndexOutOfBoundsException. ' +
        'substring(from, to) excludes to; indexOf returns −1 if missing; compare with equals, not ==; compareTo < 0, 0, > 0.',
    },
  ],
};

export default pack;
