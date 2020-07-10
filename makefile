dev:
	yarn dev
deploy-server:
	docker build -t booking-backend-image .
	docker-compose up -d
deploy-staging-server:
	docker build -t booking-backend-image-dev .
	docker-compose -f booking-compose-dev.yml up -d