#!/bin/bash
# Bloqueia edição/escrita em arquivos .env* neste projeto. Importante aqui
# porque o PostToolUse abaixo faz "git add -A && commit && push origin
# main" depois de TODA edição, sem perguntar — sem essa trava, um .env
# criado por engano iria pro GitHub na hora.
file_path=$(cat | python3 -c "import json,sys; print(json.load(sys.stdin).get('tool_input',{}).get('file_path',''))")

if [[ "$file_path" =~ \.env($|\.[^.]*$) ]] && [[ "$file_path" != *.env.example ]]; then
  echo "Bloqueado: edição em arquivo de segredo ($file_path). Peça pro João editar manualmente se precisar." >&2
  exit 2
fi

exit 0
