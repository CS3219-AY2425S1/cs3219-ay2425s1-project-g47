FROM node:14

# Install PeerServer
RUN npm install -g peer

# Copy configuration file
COPY config.json /config.json

# Expose PeerServer port
EXPOSE 9000

# Start PeerServer with custom configuration
CMD ["peerjs", "--port", "9000", "--path", "/", "--config", "/config.json"]
