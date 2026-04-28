/**
 * Findme project page.
 */
export default {
  id: 'findme',
  folder: 'projects',
  order: 1,
  icon: 'search',
  iconColor: '#e86100',
  name: { en: 'Findme', de: 'Findme' },
  content: {
    en: `# Findme ![](/images/findme.png)
This project is not hosted anymore due to security vulnerabilites that require updating next-js which breaks the build process :/
It was coded together with friends, as a fun side project.

The source code can be found at [Findme](https://github.com/ganglem/findme)

## Project Scope

Find.me is a full-stack festival companion app built to solve a genuinely common problem: 
festivals are chaotic, lineups are large, and keeping track of acts, friends, and stages 
is harder than it should be. This project addresses that with a focused set of features 
built on a modern, production-ready stack.

---

### What's Included

**Timetable View**  
A structured, interactive schedule of all festival acts, browsable by day and stage. 
Users can filter acts and mark favourites, which surface in a dedicated personal view 
so each attendee can plan their own version of the weekend.

**Live Stage Tracker**  
A real-time overview of what's currently playing across all stages, without needing 
to dig through the full schedule.

**Authentication**  
Secure sign-up and login via Supabase Auth, with support for both email and username 
access so users aren't locked out if they forget which they registered with.

**Profile Management**  
Users can update their profile details and avatar, with preferences persisted across 
sessions.

---

### Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js (App Router) |
| UI | React + Tailwind CSS |
| Backend & Auth | Supabase |
| Language | TypeScript |

---

### Design Decisions

Festival data can be sourced from static files or live Supabase tables, making it 
straightforward to update lineups or add stages without touching application logic. 
The project structure is also laid out to accommodate future additions like push 
notifications or friend tracking without requiring architectural changes.
`,
    de: `# Findme ![](/images/findme.png)
Dieses Projekt wird aufgrund von Sicherheitslücken, die ein Update von next-js erfordern, nicht mehr gehostet, da ein Update den Build-Prozess stört :/
Das Projekt wurde zusammen mit Freunden als spaßiges Nebenprojekt gecodet.

Der Quellcode ist unter [Findme](https://github.com/ganglem/findme) zu finden.
## Projektumfang

Find.me ist eine Full-Stack-Festival-Begleit-App, die ein alltägliches Problem löst:
Festivals sind chaotisch, Lineups sind groß, und den Überblick über Acts, Freunde und
Bühnen zu behalten ist schwieriger als es sein sollte. Dieses Projekt begegnet dem mit
einem fokussierten Funktionsumfang, aufgebaut auf einem modernen, produktionsreifen Stack.

---

### Funktionsumfang

**Timetable-Ansicht**  
Ein strukturierter, interaktiver Spielplan aller Festival-Acts, filterbar nach Tag und
Bühne. Nutzer können Acts als Favoriten markieren, die in einer eigenen persönlichen
Ansicht erscheinen, sodass jeder Besucher sein eigenes Wochenende planen kann.

**Live-Bühnen-Tracker**  
Eine Echtzeitübersicht über das aktuelle Programm auf allen Bühnen, ohne den gesamten
Spielplan durchsuchen zu müssen.

**Authentifizierung**  
Sichere Registrierung und Anmeldung über Supabase Auth, mit Unterstützung für E-Mail-
und Benutzernamen-Zugang, damit Nutzer nicht ausgesperrt werden, falls sie vergessen
haben, womit sie sich registriert haben.

**Profilverwaltung**  
Nutzer können ihre Profilangaben und ihren Avatar aktualisieren, wobei Einstellungen
sitzungsübergreifend gespeichert werden.

---

### Tech-Stack

| Ebene | Technologie |
|---|---|
| Framework | Next.js (App Router) |
| UI | React + Tailwind CSS |
| Backend & Auth | Supabase |
| Sprache | TypeScript |

---

### Technische Entscheidungen

Festival-Daten können aus statischen Dateien oder live aus Supabase-Tabellen bezogen
werden, sodass Lineups aktualisiert oder Bühnen hinzugefügt werden können, ohne die
Anwendungslogik anzupassen. Die Projektstruktur ist zudem so angelegt, dass künftige
Erweiterungen wie Push-Benachrichtigungen oder Freunde-Tracking ohne grundlegende
Architekturänderungen integriert werden können.`,
  },
};
