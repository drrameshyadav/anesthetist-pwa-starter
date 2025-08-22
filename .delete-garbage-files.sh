#!/bin/bash
# Remove broken or misformatted files that were accidentally committed

git rm -f --ignore-unmatch \
  "path blocks or a [file: path] line followed by a fenced code block) and comments clearly when no files are found." \
  "path/from/repo.root.ext\"," \
  "path/from/repo/root.ext\"," \
  "path\n<content>