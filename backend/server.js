import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

// Define Note Schema
const NoteSchema = new mongoose.Schema({
    address: { type: String, required: true },
    note: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
});

const Note = mongoose.model('Note', NoteSchema);

// API to fetch user notes
app.get('/api/notes', async (req, res) => {
    const { address } = req.query;
    if (!address) return res.status(400).json({ error: 'Address is required' });

    try {
        const notes = await Note.find({ address });
        res.json({ notes });
    } catch (error) {
        res.status(500).json({ error: 'Error fetching notes' });
    }
});

// API to add a new note
app.post('/api/notes', async (req, res) => {
    const { address, note } = req.body;

    console.log(address, note);

    if (!address || !note) return res.status(400).json({ error: 'Missing data' });

    try {
        const newNote = await Note.create({ address, note });
        res.json({ note: newNote.note });
    } catch (error) {
        res.status(500).json({ error: 'Error saving note' });
    }
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
