# LINE Talk Word Cloud API - Cloud Run 用
FROM python:3.11-slim

RUN apt-get update && apt-get install -y --no-install-recommends \
    mecab \
    libmecab-dev \
    mecab-ipadic-utf8 \
    fontconfig \
    curl \
    && mkdir -p /usr/share/fonts/truetype/rocknrollone \
    && curl -sL "https://github.com/google/fonts/raw/main/ofl/rocknrollone/RocknRollOne-Regular.ttf" -o /usr/share/fonts/truetype/rocknrollone/RocknRollOne-Regular.ttf \
    && fc-cache -f \
    && apt-get purge -y --auto-remove curl \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY pyproject.toml ./
COPY app ./app

RUN pip install uv && uv pip install --system .

# RocknRoll One をワードクラウドに使用
ENV FONT_PATH=/usr/share/fonts/truetype/rocknrollone/RocknRollOne-Regular.ttf

EXPOSE 8080
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
