FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt ./

RUN pip install --no-cache-dir -r requirements.txt

COPY . .

RUN addgroup --system app && adduser --system --ingroup app app && chown -R app:app /app

EXPOSE 8085

USER app

CMD ["gunicorn", "--bind", "0.0.0.0:8085", "--workers", "2", "--timeout", "60", "app:app"]
