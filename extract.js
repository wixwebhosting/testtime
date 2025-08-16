const readline = require('readline');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function sanitizeFilename(name) {
  return name.replace(/[\\/:*?"<>|]/g, '');
}

function getVideoTitle(url, ytDlpPath) {
  return new Promise((resolve, reject) => {
    const infoProcess = spawn(ytDlpPath, [
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
        reject(new Error('Could not get video title'));
      }
    });
    infoProcess.on('error', (err) => reject(err));
  });
}

rl.question('Youtube Link: ', async (url) => {
  try {
    if (!url.includes('youtube.com') && !url.includes('youtu.be')) {
      console.log('Invalid YouTube URL.');
      rl.close();
      return;
    }
    const ytDlpCmd = 'yt-dlp';
    let title;
    try {
      title = await getVideoTitle(url, ytDlpCmd);
    } catch (e) {
      title = 'youtube_audio';
    }
    const safeTitle = sanitizeFilename(title);
    const output = path.resolve(__dirname, `${safeTitle}.mp3`);
    const ytdlp = spawn(ytDlpCmd, [
      '-x', '--audio-format', 'mp3',
      '-o', `${safeTitle}.%(ext)s`,
      '--no-playlist',
      url
    ], { cwd: __dirname });

    ytdlp.stdout.on('data', (data) => {
      process.stdout.write(data.toString());
    });
    ytdlp.stderr.on('data', (data) => {
      process.stderr.write(data.toString());
    });
    ytdlp.on('close', (code) => {
      if (code === 0) {
        console.log(`\n${safeTitle} downloaded to ${output}`);
      } else {
        console.log('Error: Download failed.');
      }
      rl.close();
    });
  } catch (err) {
    console.error('Error:', err.message);
    rl.close();
  }
});
