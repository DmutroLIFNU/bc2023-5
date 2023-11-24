const express = require('express');
const fs = require('fs');
const multer = require('multer');

const app = express();
const PORT = 8000;
const notesFilePath = './notes.json';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, './static');
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

app.get('/notes', (req, res) => {
  try {
    const notes = getNotesFromFile();
    res.json(notes);
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/UploadForm.html', (req, res) => {
  try {
    res.sendFile('UploadForm.html', { root: './static' });
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.post('/upload', upload.single('note'), (req, res) => {
  try {
    const { note_name, note } = req.body;
    const notes = getNotesFromFile();

    if (!note_name || !note_name.trim()) { // Перевірка, чи є поле 'note' пустим або складається лише з пробілів
      res.status(400).send('Note name cannot be empty.');
    } else if (notes.hasOwnProperty(note_name)) {
      res.status(400).send('Note with this name already exists.');
    } else {
      const newNote = { note_name, note };
      notes[note_name] = newNote;
      saveNotesToFile(notes);
      res.status(201).send('Note uploaded successfully.');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.get('/notes/:noteName', (req, res) => {
  try {
    const notes = getNotesFromFile();
    const noteName = req.params.noteName;

    if (notes.hasOwnProperty(noteName)) {
      res.send(notes[noteName]);
    } else {
      res.status(404).send('Note not found.');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.put('/notes/:noteName', (req, res) => {
  try {
    const noteName = req.params.noteName;
    const newNoteText = req.body.note;
    const notes = getNotesFromFile();

    if (notes.hasOwnProperty(noteName)) {
      notes[noteName] = newNoteText;
      saveNotesToFile(notes);
      res.send('Note updated successfully.');
    } else {
      res.status(404).send('Note not found.');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

app.delete('/notes/:noteName', (req, res) => {
  try {
    const noteName = req.params.noteName;
    const notes = getNotesFromFile();

    if (notes.hasOwnProperty(noteName)) {
      delete notes[noteName];
      saveNotesToFile(notes);
      res.send('Note deleted successfully.');
    } else {
      res.status(404).send('Note not found.');
    }
  } catch (err) {
    res.status(500).send(err.message);
  }
});

function getNotesFromFile() {
  const data = fs.readFileSync(notesFilePath);
  return JSON.parse(data);
}

function saveNotesToFile(notes) {
  fs.writeFileSync(notesFilePath, JSON.stringify(notes, null, 2));
}

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
