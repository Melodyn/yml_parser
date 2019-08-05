# YML parser container

Читает конфиг с переменными окружения и создаёт env-файлы в директориях микросервисов. Директории должны существовать на хосте на момент запуска скрипта.

**build it:**
```shell
docker build -t yml_parser:1 ./yml_parser
```

**run it:**
```shell
docker run \
    --rm \
    --name yml_parser \
    -u $(id -u ${USER}):$(id -g ${USER}) \
    -v $(pwd):/usr/src/app/kari-recruiting \
    --env SERVICES_DIR=./kari-recruiting/packages/backend \
    --env YML_FILEPATH=./kari-recruiting/envs.yml \
    yml_parser:1
```

**config it:**
```
--env SERVICES_DIR = main directory with microservices (default: services),
--env YML_FILEPATH = path to yml file on container (default: services/env.yml),
--env OUTPUT_FORMAT = output file format (default: .env),
--env MAIN_OUTPUT_DIR = service dir with envs (default: deployment),
```

**see it?**
```shell
docker run \
    --rm \
    -it \
    --name yml_parser \
    -u $(id -u ${USER}):$(id -g ${USER}) \
    -v $(pwd):/usr/src/app/kari-recruiting \
    --env SERVICES_DIR=./kari-recruiting/packages/backend \
    --env YML_FILEPATH=./kari-recruiting/envs.yml \
    yml_parser:1 \
    /bin/bash
# in container:
cat ./src/index.js

# or edit it:
nano ./src/index.js
```
