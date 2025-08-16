# How to use the YouTube to MP3 API on Render

1. Deploy this project to Render (as you did).
2. Send a POST request to `/api/download` with a JSON body like:

```
{
  "url": "https://www.youtube.com/watch?v=YOUR_VIDEO_ID"
}
```

3. The server will respond with the MP3 file as a download if successful.

Example using curl:

```
curl -X POST https://YOUR_RENDER_URL/api/download \
  -H "Content-Type: application/json" \
  -d '{"url": "https://www.youtube.com/watch?v=YOUR_VIDEO_ID"}' --output output.mp3
```

Replace `YOUR_RENDER_URL` with your actual Render web service URL.
