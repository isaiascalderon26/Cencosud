
config:
	curl https://releases.hashicorp.com/consul-template/0.25.0/consul-template_0.25.0_linux_amd64.zip -o consul-template.zip
	unzip consul-template.zip
	ENVIRONMENT=$(e) consul-template -log-level info -once -config "./consul/config.hcl" -consul-addr https://consul.tools.cencox.xyz -consul-token $(t)
	rm -f consul-template
	rm -f consul-template.zip
	rm -f consul-template.pid
	
run:
	npm run start

device:
	export LANG=en_US.UTF-8
	npx cap sync
	npm run build
	npx cap copy ios
	npx cap copy android

run-ios:
	npx cap open ios

device-debug:
	ionic cap run ios  -l --external --host <ip>

run-android:
	npx cap open android

launch-android:
	ionic capacitor run android -l --external --source-map

launch-ios:
	ionic capacitor run ios -l --external --source-map

-include .env
export NPM_TOKEN

install:	
	npm ci --quiet --legacy-peer-deps

install-darwin:
	npm ci --quiet --legacy-peer-deps --platform=darwin --arch=x64 sharp

build:
	npm run build
