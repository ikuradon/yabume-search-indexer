FROM denoland/deno:2.1.2

WORKDIR /app
COPY --chown=deno . .
RUN deno cache src/app.ts

USER deno
CMD ["task", "start"]
