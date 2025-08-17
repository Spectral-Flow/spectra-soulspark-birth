FROM python:3.11-slim
WORKDIR /app
COPY scripts/llm_requirements.txt /app/
RUN pip install --no-cache-dir -r llm_requirements.txt
COPY scripts /app/scripts
ENV PYTHONUNBUFFERED=1
EXPOSE 5101
CMD ["python","scripts/llm_pipeline.py","--host","0.0.0.0","--port","5101"]
