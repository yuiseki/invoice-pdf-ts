
all: build test

build:
	npm ci
	npm run build
	npm i -g .

test:
	invoice-pdf output.pdf 発行者名 1234567890123 2024-05-31 INV-20240531-001 宛先名 商品A 1 1000 false "hoge hoge hoge"
