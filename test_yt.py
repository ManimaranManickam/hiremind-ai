import urllib.request
import re
import urllib.parse
query = urllib.parse.quote("stock footage woman talking on video call")
url = f"https://www.youtube.com/results?search_query={query}"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
try:
    html = urllib.request.urlopen(req).read().decode('utf-8')
    video_ids = re.findall(r"watch\?v=(\S{11})", html)
    print("Found video IDs:", list(set(video_ids))[:5])
except Exception as e:
    print("Error:", e)
