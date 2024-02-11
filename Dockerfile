FROM denoland/deno:1.40.4

WORKDIR /app
COPY --chown=deno . .
RUN deno cache src/app.ts

CMD ["task", "start"]
