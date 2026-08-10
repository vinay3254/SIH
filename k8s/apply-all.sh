#!/bin/bash

kubectl apply -f namespace.yaml
kubectl apply -f configmap.yaml
kubectl apply -f secret.yaml
kubectl apply -f postgres.yaml
kubectl apply -f redis.yaml
kubectl apply -f minio.yaml
kubectl apply -f deployments/
kubectl apply -f ingress.yaml
