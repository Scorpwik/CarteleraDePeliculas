---
name: commit
description: Crear un commit del working tree tras revisar status, diff y log. No incluir secretos.
disable-model-invocation: true
---

# /commit

La persona invoca este skill. No lo dispares solo.

1. Corre `git status`, `git diff` (staged y unstaged) y `git log -8 --oneline`.
2. No agregues `.env`, `.env.local`, ni archivos con claves (`VITE_SUPABASE_*`, `VITE_TMDB_*`, `service_role`, JWT, `sb_secret_`).
3. No hagas `git add .`. Añade solo los archivos de este cambio.
4. Mensaje en español, 1–2 oraciones, centrado en el porqué. Si hay ticket, el asunto empieza con su id (`T1: …`).
5. Un documento o un ticket por commit. No mezclar harness, specs y código.
6. No `git commit --amend` salvo que lo pidan y el commit HEAD sea de esta sesión y no esté en el remoto.
7. No `git push` salvo que lo pidan. No `--no-verify`. No force-push.
8. Tras el commit, corre `git status` y confirma que `.env` sigue sin trackearse.
