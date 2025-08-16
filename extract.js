
import express from 'express';
import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function sanitizeFilename(name) {
  return name.replace(/[\\/:*?"<>|]/g, '');
}

const app = express();
app.use(express.json());

app.post('/api/download', async (req, res) => {
  const url = req.body.url;
  if (!url || (!url.includes('youtube.com') && !url.includes('youtu.be'))) {
    return res.status(400).json({ error: 'Invalid YouTube URL.' });
  }
  const ytDlpCmd = 'yt-dlp';
  let title = 'youtube_audio';
  try {
    title = await new Promise((resolve, reject) => {
      const infoProcess = spawn(ytDlpCmd, [
        '--print', '%(title)s',
        '--no-playlist',
        url
      ]);
      let output = '';
      infoProcess.stdout.on('data', (data) => {
        output += data.toString();
      });
      infoProcess.on('close', (code) => {
        if (code === 0 && output.trim()) {
          resolve(output.trim());
        } else {
          resolve('youtube_audio');
        }
      });
      infoProcess.on('error', () => resolve('youtube_audio'));
    });
  } catch {}
  const safeTitle = sanitizeFilename(title);
  const output = path.resolve(__dirname, `${safeTitle}.mp3`);
  const ytdlp = spawn(ytDlpCmd, [
    '-x', '--audio-format', 'mp3',
    '-o', `${safeTitle}.%(ext)s`,
    '--no-playlist',
    url
  ], { cwd: __dirname });

  ytdlp.on('close', (code) => {
    if (code === 0 && fs.existsSync(output)) {
      res.download(output, `${safeTitle}.mp3`, (err) => {
        fs.unlinkSync(output);
      });
    } else {
      res.status(500).json({ error: 'Download failed.' });
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
