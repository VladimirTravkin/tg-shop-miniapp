.PHONY: run lint format test

run:
	uv run uvicorn src.app.main:app --reload --port 8000

lint:
	uv run ruff check src/

format:
	uv run ruff format src/

test:
	uv run pytest
