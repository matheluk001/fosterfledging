# python/Variables.mk
.DEFAULT_GOAL := all
SHELL         := bash

ARCH := $(shell uname -p)

# get git config	npx htmlhint "**/*.html"

config:
	git config -l

# get git status
status:
	make --no-print-directory clean
	@echo
	git branch
	git remote -v
	git status

# download files from the code repo
pull:
	@echo
	git pull
	git status

# upload files to the code repo
push:
	@echo
	git add layout
	git add .gitignore
	git add .gitlab-ci.yml
	git add IDB.ai.md
	git add IDB.tr.md
	git add Makefile
	git add README.md
	git commit -m "another commit"
	git push
	git status
