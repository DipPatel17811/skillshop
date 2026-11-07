# Skillshop

A static, publishable learning site with detailed courses, local learner profiles, lesson progress, virtual badges, and a fixed certificate template.

## What is included

- **8 complete courses** across Technology, Productivity, and Communication.
- **120 lessons** with examples, code, tables, callouts, quick checks, and a final assessment.
- **Course folders** under topic folders, one folder per course.
- **Local learner profiles** saved in the browser (`localStorage`).
- **Progress tracking** for every lesson and final assessment.
- **Virtual badges** for course completion and learning milestones.
- **One shared certificate design** used for every course, with print / save-as-PDF support.
- Responsive layout for desktop, tablet, and mobile.

## Course map

| Topic | Course | Lessons |
| --- | --- | --- |
| Technology | Microcontrollers 101 | 15 |
| Technology | Python Foundations | 15 |
| Technology | Web Design Foundations | 15 |
| Productivity | Excel Essentials | 15 |
| Productivity | PowerPoint Storytelling | 15 |
| Productivity | Word Professional Documents | 15 |
| Productivity | Morph Magic in PowerPoint | 15 |
| Communication | Public Speaking with Confidence | 15 |

## Run locally

The site fetches course JSON files, so it must be served over HTTP rather than opened as a local `file://` page.

From this folder:

```powershell
python -m http.server 8000
```

Then open <http://localhost:8000>.

On Windows, you can also double-click `start-site.bat`, which starts the server and opens the site in your browser.

Alternatively, use the Live Server extension in VS Code, or any static file server.

## Publish on the internet

This is a static site with no build step. Any static host works.

### GitHub Pages

1. Create a GitHub repository.
2. Upload the contents of this `skillshop` folder to the repository root.
3. In the repository, open **Settings → Pages**.
4. Choose **Deploy from a branch**, select the main branch and `/ (root)`, and save.
5. GitHub will provide a `github.io` URL. No custom domain is required.

### Netlify

1. Sign in to Netlify.
2. Drag the `skillshop` folder onto the Netlify dashboard.
3. Netlify gives you a temporary URL immediately.

### Important

All paths are relative, so the site works from a subfolder such as `https://username.github.io/skillshop/`.

## Accounts: current status

The current version uses a **local preview profile**:

- Name, email, avatar colour, progress, badges, and certificates are stored with `localStorage` in the current browser.
- There is no password and no cloud authentication.
- Clearing browser site data removes the profile and progress.
- This is clearly labelled in the interface so users are not misled.

When you are ready for real accounts, the next phase needs a backend or a managed authentication service (for example Supabase, Firebase, or a custom API). The front-end data model is already separated from the UI, so progress can be moved to a server without rewriting the course pages.

## Folder structure

```text
skillshop/
├── index.html
├── courses.html
├── course.html
├── dashboard.html
├── account.html
├── certificate.html
├── assets/
│   ├── css/
│   │   ├── styles.css
│   │   └── certificate.css
│   ├── js/
│   │   ├── app.js
│   │   ├── catalog.js
│   │   ├── course.js
│   │   ├── dashboard.js
│   │   ├── account.js
│   │   └── certificate.js
│   ├── icons.svg
│   └── favicon.svg
└── courses/
    ├── catalog.json
    ├── technology/
    │   ├── microcontrollers-101/course.json
    │   ├── python-foundations/course.json
    │   └── web-design-foundations/course.json
    ├── productivity/
    │   ├── excel-essentials/course.json
    │   ├── powerpoint-storytelling/course.json
    │   ├── word-professional-documents/course.json
    │   └── powerpoint-morph/course.json
    └── communication/
        └── public-speaking/course.json
```

## Add a new course

1. Create a new folder under the relevant topic, for example:

   ```text
   courses/technology/sql-foundations/course.json
   ```

2. Copy an existing `course.json` and replace the metadata, modules, lessons, and final assessment.
3. Add an entry to `courses/catalog.json` with the same `id` and the relative `path`.
4. Add the course's badge name and icon to the entry.
5. Open the site. The course appears automatically in the catalog and gets the shared certificate template. No page needs to be created by hand.

### Minimal catalog entry

```json
{
  "id": "sql-foundations",
  "title": "SQL Foundations",
  "topic": "Technology",
  "topicSlug": "technology",
  "level": "Beginner",
  "duration": "3h 00m",
  "lessonCount": 12,
  "description": "Learn to query and shape data with SQL.",
  "icon": "table",
  "color": "#3F72C8",
  "accent": "#E2EDFF",
  "badge": { "name": "Query Builder", "icon": "table" },
  "skills": ["SQL", "Data"],
  "path": "courses/technology/sql-foundations/course.json",
  "featured": true
}
```

### Course JSON shape

```json
{
  "id": "course-id",
  "title": "Course title",
  "topic": "Technology",
  "topicSlug": "technology",
  "level": "Beginner",
  "duration": "3h 00m",
  "description": "Short catalog description.",
  "icon": "chip",
  "color": "#FF7A59",
  "accent": "#FFE7DE",
  "badge": { "name": "Badge name", "icon": "award", "description": "..." },
  "skills": ["Skill one", "Skill two"],
  "outcomes": ["Outcome one", "Outcome two"],
  "prerequisites": ["..."],
  "tools": ["..."],
  "modules": [
    {
      "id": "m1",
      "title": "Module title",
      "summary": "Module summary.",
      "lessons": [
        {
          "id": "m1l1",
          "title": "Lesson title",
          "minutes": 15,
          "content": [
            { "type": "lead", "text": "Opening sentence." },
            { "type": "p", "text": "Paragraph." },
            { "type": "list", "style": "bullet", "items": ["Point one", "Point two"] },
            { "type": "callout", "tone": "tip", "title": "Tip", "text": "Helpful note." },
            { "type": "quiz", "question": "Quick question?", "options": ["A", "B"], "answer": 1, "explanation": "Why B is correct." }
          ]
        }
      ]
    }
  ],
  "finalAssessment": {
    "title": "Final assessment",
    "intro": "Answer all questions. You need 80% to pass.",
    "passScore": 80,
    "questions": [
      {
        "question": "Question?",
        "options": ["A", "B", "C"],
        "answer": 1,
        "explanation": "Explanation."
      }
    ]
  }
}
```

### Supported content block types

- `lead` — larger opening paragraph
- `p` — paragraph
- `h` — section heading
- `h3` — subheading
- `list` — bullet, numbered, or check style
- `steps` — numbered steps with `title` and `text`
- `callout` — `tip`, `warning`, `note`, or `challenge`
- `code` — `language` and `code`
- `table` — `headers` and `rows`
- `quote` — `text` and optional `cite`
- `quiz` — inline knowledge check with `answer` index

## Certificate template

Every course uses the same certificate layout in `certificate.html` and `assets/js/certificate.js`:

- Skillshop branding and fixed ornamental border
- Learner name
- Course title
- Course skills
- Duration
- Badge name
- Final assessment score
- Date issued
- Credential ID
- Fixed seal and signature blocks

The design is intentionally **one template for every course**. Only the data changes.

Certificates can be printed or saved as PDF from the certificate page. The page includes a preview watermark until the course is complete and the certificate is earned.

## Testing notes

- Course JSON is validated against the catalog during development.
- The front end has no build step and no external JavaScript dependencies.
- Google Fonts are loaded from the network; the site falls back to system fonts if unavailable.
- Browsers need JavaScript enabled for the course reader, dashboard, and certificate generator.

## Next phase (recommended)

1. Add secure user accounts and cloud progress with a managed backend.
2. Move certificate issuance and verification to the server.
3. Add instructor authoring tools for new courses.
4. Add more courses such as SQL, Canva, cybersecurity basics, and data visualisation.
5. Add downloadable PDFs or course transcripts.
