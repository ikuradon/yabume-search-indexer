FROM denoland/deno:2.0.6

WORKDIR /app
COPY --chown=deno . .
RUN deno cache src/app.ts

USER deno
CMD ["task", "start"]
