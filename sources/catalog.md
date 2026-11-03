# sources/catalog.md

**权威索引已迁至仓库根目录 [`../catalog.json`](../catalog.json)。**

本文件不再维护逐条长列表，避免与 JSON 双源漂移。请用：

```bash
jq '.figures[] | {id, category, tags, file, license}' ../catalog.json
```

字段说明见根目录 `README.md`。
