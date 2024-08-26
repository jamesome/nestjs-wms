# 프로젝트 소개

셀메이트 WMS 모듈 Back-end 프로젝트.

## 사용 된 것 <small><sub>(Built With)</sub></small>

- [Nest](https://nestjs.com/)

<details>
<summary>Add-ons / Plugins</summary>

- [TypeORM](https://typeorm.io/)
- [typeorm-extension](https://typeorm-extension.tada5hi.net/)
- [Nest.js Paginate](https://github.com/ppetzold/nestjs-paginate)
- [Jest](https://jestjs.io/)

</details>

# 시작하기 <small><sub>(Getting Started)</sub></small>

로컬 복사본을 실행하려면 다음의 간단한 예제 단계를 따르십시오.

## 사전 요구사항 <small><sub>(Prerequisites)</sub></small>

- [Node.js](https://nodejs.org/en/download/package-manager)
- [Yarn Package Manager](https://yarnpkg.com/)
- [Docker](https://www.docker.com/)

## 설치 / 설정 <small><sub>(Installation / Setup)</sub></small>

1. 저장소 클론

   ```shell
   > git clone git@gitlab.corp.sellmate.co.kr:sellmate/wms.git
   ```
2. yarn 패키지 설치

   ```shell
   > yarn install
   ```
3. 환경 구성 파일 `.env` 편집

   ```ini
   NODE_ENV=
   APP_PORT=
   HOST_DB_PORT=
   ...
   ```

## 실행 <small><sub>(Running)</sub></small>

### 로컬 node를 이용

```bash
# development
> yarn run start

# watch mode
> yarn run start:dev

# production mode
> yarn run start:prod
```

### Docker를 이용

```bash
> docker compose up
```

# 용법 <small><sub>(Usage)</sub></small>

## Test

```bash
# unit tests
$ yarn run test

# e2e tests
$ yarn run test:e2e

# test coverage
$ yarn run test:cov
```

# 참조자료 <small><sub>(References)</sub></small>

- [프로젝트 위키](https://gitlab.corp.sellmate.co.kr/sellmate/wms/-/wikis/home#develop)
