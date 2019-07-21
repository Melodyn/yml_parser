# YML parser container

Читает конфиг с переменными окружения и создаёт env-файлы в директориях микросервисов. Директории должны существовать на хосте на момент запуска скрипта.

**build it:**
```shell
docker build -t yml_parser ./parser
```

**run it:**
```shell
docker run \
    --rm \
    --name yml_parser \
    -v $(pwd)/services:/usr/src/app/services \
    yml_parser
```

**config it:**
```shell
--env SERVICES_DIR = main directory with microservices (default: services),
--env YML_FILENAME = filename with extension (default: env.yml),
--env OUTPUT_FORMAT = output file format (default: .env),
--env MAIN_OUTPUT_DIR = service dir with envs (default: deployment),
```

**see it?**
```shell
docker run \
    --rm \
    --name yml_parser \
    -it \
    -v $(pwd)/services:/usr/src/app/services \
    yml_parser \
    /bin/bash
# in container:
cat ./src/index.js

# or edit it:
nano ./src/index.js
```
