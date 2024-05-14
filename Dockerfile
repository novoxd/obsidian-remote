FROM ghcr.io/sytone/obsidian-remote:latest

RUN   echo "/squashfs-root/obsidian --no-sandbox --no-xshm --disable-dev-shm-usage --disable-gpu --disable-software-rasterizer --remote-debugging-port=8315" > /defaults/autostart
