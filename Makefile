VERSION := $$(cat package.json | grep version | sed 's/"/ /g' | awk {'print $$3'})

ENV := env.json

GCLOUD_PROJECT := $$(cat $(ENV) | grep GCLOUD_PROJECT | sed 's/"/ /g' | awk {'print $$3'})

SVC=pubSubToBigquery
PORT=8000

version v:
	@echo $(VERSION)

init i:
	@echo "[Dependencies] Installing dependencies"
	@npm install

deploy d:
	@echo "[Cloud Function Deployment] Deploying Function"
	@gcloud functions deploy checkDeviceOnline  --set-env-vars GCLOUD_PROJECT=$(GCLOUD_PROJECT) --trigger-topic connect-disconnect --runtime nodejs10

.PHONY: version v init i deploy d 
