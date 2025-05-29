FROM redis:8-alpine

RUN addgroup -S app && \
    adduser -S -G app redisuser && \
    mkdir -p /data && \
    chown -R redisuser:app /data

USER redisuser

WORKDIR /data

EXPOSE 6379

CMD ["redis-server", "--protected-mode", "no", "--dir", "/data", "--appendonly", "yes"]
