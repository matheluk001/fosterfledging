# Summary of AI Interactions

## 1. Tools Used

- ChatGPT
- Postman Agent
- Claude AI 

---

## 2. Types of Assistance

### 2.1 Debugging Help

- Error explanation: File path problems: Resolving fatal: pathspec 'home_page.html' did not match any files
- Bug location: Used in general to find where we had bugs in the code. Used in app.py, visualizations, and basically everywhere.
- Runtime issue: Clarified overflow CSS property preventing page scrolling (overflow: hidden vs overflow-x: hidden)

### 2.2 Conceptual Clarification

- Clarifying what I could do with a makefile in our project. Also used the grades makefile for inspiration. 
- Clarification on what the gitlab-ci.yml does / what we could put in it.  
- Clarifying how to use the CSS box model, box-sizing: border-box, Bootstrap grid system (container, row, col-*), CSS specificity
- Clarifying what Bootstrap provides (responsive grid, pre-built components), how it handles mobile responsiveness, benefits for Phase II
- Clarification on the functions of different HTML tags; for example, which tag creates a table or how to create a hyperlink 
- Clarification on concepts like Recharts and D3 (which to use).
- Clarificaiton regarding how to implement endpoints properly, and also how searching shoul work.

### 2.3 Code Improvement

- Style: Improved compaction of .gitlab-ci.yml file by explaining how extending works in these files
- Efficiency: Explained how to efficiently have commits to gitlab show up on website
- Readability: Improvement to Style as described above also improved readability
- Testing: Explained how to preview HTML in browser (drag-and-drop, Live Server)

### 2.4 Alternative Approaches
- (e.g., “Is there a simpler way?” and what was suggested)
- Is there a way to optimize this code?

### 2.5 Other

- Postmans AI Agent gave us "RESTful API basics" which gave us a blueprint for what we could do with the API. It showed us GET, POST, UPDATE, and DELETE endpoints. It also described how to use them and gave tips. 

- Gave ChatGPT the tech-report guidelines, used to make a markdown template. Also used it to make suggestions on the formatting and what else we could put in a technical report.  

- When working on the unit tests, I needed a way to resize the window to test the hamburger menu. ChatGPT gave me the method to use which I implemented.

- Gave steps to follow regarding AWS deployment and database updates.

---

## 3. Reflection on Use

- What specific improvements to your code or understanding came from these AI interactions?
- How did you decide what to **keep** or **ignore** from the AI’s suggestions?
- Did the AI ever produce an incorrect or misleading suggestion? How did you detect that?
  - If yes, how did you detect that? 


- Was led on a rabbit trail to find out why make wasn't working, and ended up logging on to the cs machine, because they already have make installed. 
- This saved me time from Googling the correct method to resize the window in selenium.
- Rabbit trails can sometimes lead you too far down the line. Reverting things worked, but it was tedious.
---

## 4. Evidence of Independent Work

### 4.1 Before-and-After Snippet
Paste a **short code snippet** (3–5 lines) showing where you changed your own code based on AI guidance.

- check-repo:

  - stage: check
  
  - extends: .hidden-base


- AI explained how to have these "methods" extend each other

---

# 5. Integrity Statement
"I confirm that the AI was used only as a helper (explainer, debugger, reviewer) and not as a code generator. All code submitted is my own work."
